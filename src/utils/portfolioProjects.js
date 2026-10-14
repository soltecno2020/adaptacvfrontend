function setText(element, value) {
  element.textContent = value || ''
}

function createElement(document, tag, className, text = '') {
  const element = document.createElement(tag)
  element.className = className
  if (text) element.textContent = text
  return element
}

function createTag(document, text) {
  return createElement(document, 'span', 'px-space-xs py-space-3xs bg-surface-container rounded font-mono-code text-label-technical text-on-surface-variant', text)
}

function isPortfolioAssetUrl(value, assetOrigin) {
  const url = String(value || '')
  if (/^\/?storage\/portfolio-assets\//.test(url)) return true
  try {
    const parsed = new URL(url)
    return /^\/storage\/portfolio-assets\//.test(parsed.pathname)
  } catch {
    return false
  }
}

function getPortfolioAssetUrl(value, assetOrigin) {
  if (!isPortfolioAssetUrl(value, assetOrigin)) return ''
  const path = String(value).replace(/^https?:\/\/[^/]+/i, '')
  return new URL(path, assetOrigin).href
}

function createProjectCard(document, project, copy, openModal, assetOrigin) {
  const card = createElement(document, 'article', 'group relative flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_-8px_rgba(15,23,42,0.1)]')
  card.dataset.portfolioBlockId = project.id || ''
  card.dataset.portfolioBlock = 'project'
  const media = createElement(document, 'div', 'relative h-56 w-full overflow-hidden bg-surface-container-high')
  if (isPortfolioAssetUrl(project.imageUrl, assetOrigin)) {
    const image = document.createElement('img')
    image.className = 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
    image.src = getPortfolioAssetUrl(project.imageUrl, assetOrigin)
    image.alt = project.imageAlt || project.title || ''
    media.append(image)
  }
  media.append(createElement(document, 'div', 'absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent'))

  const badges = String(project.badges || '').split(',').map((badge) => badge.trim()).filter(Boolean)
  if (badges.length) {
    const badgeList = createElement(document, 'div', 'absolute left-space-sm top-space-sm flex flex-wrap gap-space-xs')
    badges.slice(0, 2).forEach((badge) => badgeList.append(createElement(document, 'span', 'rounded bg-surface-container-lowest/90 px-space-xs py-space-3xs font-label-technical text-label-technical font-semibold text-primary shadow-sm backdrop-blur-md', badge)))
    media.append(badgeList)
  }

  const content = createElement(document, 'div', 'flex flex-1 flex-col justify-between gap-space-md p-space-lg')
  const intro = createElement(document, 'div', 'flex flex-col gap-space-xs')
  const heading = createElement(document, 'div', 'flex items-center justify-between gap-space-sm')
  heading.append(createElement(document, 'h3', 'font-headline-md text-headline-sm font-semibold text-on-surface transition-colors group-hover:text-primary', project.title || copy.untitled))
  heading.append(createElement(document, 'span', 'material-symbols-outlined text-primary', 'north_east'))
  intro.append(heading, createElement(document, 'p', 'line-clamp-2 font-body-md text-body-sm text-on-surface-variant', project.summary || project.description || ''))
  const footer = createElement(document, 'div', 'flex flex-col gap-space-md')
  const tags = createElement(document, 'div', 'flex flex-wrap gap-space-2xs')
  String(project.stack || '').split(',').map((tag) => tag.trim()).filter(Boolean).forEach((tag) => tags.append(createTag(document, tag)))
  const button = createElement(document, 'button', 'flex w-full items-center justify-center gap-space-xs rounded-lg bg-surface-container-low px-space-md py-2.5 font-body-sm text-body-sm font-medium text-on-surface transition-colors hover:bg-primary hover:text-on-primary', copy.explore)
  button.type = 'button'
  button.append(createElement(document, 'span', 'material-symbols-outlined text-base', 'open_in_new'))
  button.addEventListener('click', () => openModal(project))
  footer.append(tags, button)
  content.append(intro, footer)
  card.append(media, content)
  return card
}

function renderModal(document, project, copy, assetOrigin) {
  const modal = document.getElementById('project-modal')
  const content = document.getElementById('modal-content')
  if (!modal || !content) return
  modal.dataset.portfolioProjectId = project.id || ''
  modal.dataset.portfolioBlockId = project.id || ''
  content.replaceChildren()

  const header = createElement(document, 'div', 'flex flex-col gap-space-2xs')
  header.append(createElement(document, 'h2', 'font-headline-lg text-headline-lg font-semibold tracking-tight text-on-surface', project.title || copy.untitled))
  header.append(createElement(document, 'p', 'font-headline-sm text-body-lg text-on-surface-variant', project.tagline || ''))
  const image = document.createElement(isPortfolioAssetUrl(project.imageUrl, assetOrigin) ? 'img' : 'div')
  image.className = 'h-64 w-full rounded-xl bg-surface-container-high object-cover md:h-80'
  if (isPortfolioAssetUrl(project.imageUrl, assetOrigin)) {
    image.src = getPortfolioAssetUrl(project.imageUrl, assetOrigin)
    image.alt = project.imageAlt || project.title || ''
  }
  const metrics = createElement(document, 'div', 'grid grid-cols-3 gap-space-sm rounded-xl bg-surface-container-low p-space-md text-center')
  ;['first', 'second', 'third'].forEach((key) => {
    const metric = createElement(document, 'div')
    metric.append(createElement(document, 'div', 'font-headline-md text-headline-sm font-bold text-primary', project[`${key}MetricValue`] || ''))
    metric.append(createElement(document, 'div', 'mt-1 font-label-technical text-label-technical uppercase text-on-surface-variant', project[`${key}MetricLabel`] || ''))
    metrics.append(metric)
  })
  const detail = (title, value) => {
    const section = createElement(document, 'div', 'flex flex-col gap-space-xs')
    section.append(createElement(document, 'h3', 'font-headline-sm text-headline-sm font-semibold text-on-surface', title))
    section.append(createElement(document, 'p', 'font-body-md text-body-md leading-relaxed text-on-surface-variant', value || ''))
    return section
  }
  const stack = createElement(document, 'div', 'flex flex-col gap-space-xs')
  stack.append(createElement(document, 'h3', 'font-headline-sm text-headline-sm font-semibold text-on-surface', copy.stack))
  const tags = createElement(document, 'div', 'flex flex-wrap gap-space-xs')
  String(project.stack || '').split(',').map((tag) => tag.trim()).filter(Boolean).forEach((tag) => tags.append(createTag(document, tag)))
  stack.append(tags)
  const credentials = createElement(document, 'div', 'flex flex-col gap-space-xs rounded-xl bg-surface-container-low p-space-md')
  const credentialItems = [
    [copy.demoUsername, project.demoUsername, project.showDemoUsername],
    [copy.demoPassword, project.demoPassword, project.showDemoPassword],
  ].filter(([, value, isVisible]) => isVisible === true && value)
  if (credentialItems.length) {
    credentials.append(createElement(document, 'h3', 'font-headline-sm text-headline-sm font-semibold text-on-surface', copy.demoAccess))
    credentialItems.forEach(([label, value]) => credentials.append(createElement(document, 'p', 'font-mono-code text-body-sm text-on-surface-variant', `${label}: ${value}`)))
  }
  const links = createElement(document, 'div', 'flex flex-wrap items-center gap-space-md pt-space-md')
  if (project.showDemoButton !== false && project.demoUrl) {
    const demo = createElement(document, 'a', 'inline-flex flex-1 items-center justify-center gap-space-xs rounded-lg bg-primary px-space-lg py-3 font-body-md text-body-md font-medium text-on-primary shadow-md transition-colors hover:bg-primary-container', copy.liveDemo)
    demo.href = project.demoUrl
    demo.target = '_blank'
    demo.rel = 'noopener noreferrer'
    links.append(demo)
  }
  if (project.showSourceButton !== false && project.githubUrl) {
    const github = createElement(document, 'a', 'inline-flex items-center justify-center gap-space-xs rounded-lg bg-surface-container px-space-lg py-3 font-body-md text-body-md font-medium text-on-surface transition-colors hover:bg-surface-container-high', copy.sourceCode)
    github.href = project.githubUrl
    github.target = '_blank'
    github.rel = 'noopener noreferrer'
    links.append(github)
  }
  content.append(header, image, metrics, detail(copy.description, project.description), detail(copy.architecture, project.architecture), stack)
  if (credentialItems.length) content.append(credentials)
  content.append(links)
  modal.classList.remove('hidden')
  modal.classList.add('flex')
  document.body.style.overflow = 'hidden'
}

export function populatePortfolioProjects(document, projects, copy, assetOrigin = '', shouldShowProjects = true) {
  const grid = document.getElementById('projects-grid')
  const controls = document.getElementById('project-carousel-controls')
  const visibleProjects = projects.filter((project) => project.enabled !== false)
  const modal = document.getElementById('project-modal')
  if (!grid || !shouldShowProjects) {
    if (controls) controls.hidden = true
    return
  }
  if (!visibleProjects.length) {
    grid.replaceChildren()
    if (controls) controls.hidden = true
    return
  }

  const closeModal = () => {
    const modal = document.getElementById('project-modal')
    if (!modal) return
    modal.classList.add('hidden')
    modal.classList.remove('flex')
    document.body.style.overflow = ''
  }
  const openModal = (project) => renderModal(document, project, copy, assetOrigin)
  const toProjectData = (project) => ({ ...(project.data || project), id: project.id || project.data?.id })
  const cards = visibleProjects.map((project) => createProjectCard(document, toProjectData(project), copy, openModal, assetOrigin))
  grid.replaceChildren(...cards)
  grid.className = 'flex gap-space-lg overflow-x-auto scroll-smooth pb-space-sm snap-x snap-mandatory'
  cards.forEach((card) => {
    card.classList.add('w-full', 'shrink-0', 'snap-start', 'md:w-[calc(50%-0.75rem)]', 'lg:w-[calc((100%-2rem)/3)]')
  })

  const indicator = document.getElementById('carousel-current')
  const updateIndicator = (index) => {
    if (indicator) indicator.textContent = String(index + 1).padStart(2, '0')
  }
  updateIndicator(0)
  if (indicator?.parentElement) indicator.parentElement.lastChild.textContent = ` / ${String(cards.length).padStart(2, '0')}`

  if (controls) controls.hidden = cards.length < 2
  const previous = document.getElementById('carousel-prev')
  const next = document.getElementById('carousel-next')
  let activeIndex = 0
  const navigate = (direction) => {
    activeIndex = (activeIndex + direction + cards.length) % cards.length
    grid.scrollTo({
      left: cards[activeIndex].offsetLeft - cards[0].offsetLeft,
      behavior: 'smooth',
    })
    updateIndicator(activeIndex)
  }
  if (previous) previous.onclick = () => navigate(-1)
  if (next) next.onclick = () => navigate(1)
  const closeButton = document.querySelector('#project-modal button[onclick="closeModal()"]')
  if (closeButton) closeButton.onclick = closeModal

  const openProjectId = modal?.dataset.portfolioProjectId
  const openProject = visibleProjects.find((project) => String(project.id) === openProjectId)
  if (openProject && !modal.classList.contains('hidden')) {
    renderModal(document, toProjectData(openProject), copy, assetOrigin)
  }
}
