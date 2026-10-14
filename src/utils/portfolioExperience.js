function createElement(document, tag, className, text = '') {
  const element = document.createElement(tag)
  element.className = className
  if (text) element.textContent = text
  return element
}

function setText(document, field, value) {
  const element = document.querySelector(`[data-portfolio-field="${field}"]`)
  if (element && value) element.textContent = value
}

function createCapability(document, capability) {
  const card = createElement(document, 'article', 'p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow')
  const icon = createElement(document, 'div', 'w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary mb-space-sm')
  icon.append(createElement(document, 'span', 'material-symbols-outlined text-xl', capability.icon || 'code_blocks'))
  const technologies = createElement(document, 'div', 'flex flex-wrap gap-space-2xs')
  const items = Array.isArray(capability.technologies) ? capability.technologies : String(capability.technologies || '').split(',')
  items.map((item) => String(item).trim()).filter(Boolean).forEach((item) => {
    technologies.append(createElement(document, 'span', 'font-mono-code text-label-technical text-primary font-medium px-space-xs py-space-3xs bg-secondary-fixed/20 rounded', item))
  })
  card.append(
    icon,
    createElement(document, 'h4', 'font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-2xs', capability.title || ''),
    createElement(document, 'p', 'font-body-sm text-body-sm text-on-surface-variant mb-space-sm', capability.description || ''),
    technologies,
  )
  return card
}

function createExperience(document, experience) {
  const card = createElement(document, 'article', 'p-space-lg rounded-xl bg-surface-container-lowest shadow-sm relative overflow-hidden')
  card.append(createElement(document, 'div', 'absolute left-0 top-0 bottom-0 w-1.5 bg-primary'))
  const heading = createElement(document, 'div', 'flex flex-col sm:flex-row sm:items-center justify-between gap-space-2xs mb-space-xs')
  const title = createElement(document, 'div', 'flex items-center gap-space-xs')
  title.append(createElement(document, 'span', 'font-headline-sm text-headline-sm text-on-surface font-semibold', experience.position || ''))
  if (experience.currentLabel) title.append(createElement(document, 'span', 'px-space-xs py-space-3xs bg-secondary-fixed/30 rounded font-label-technical text-label-technical text-primary font-medium', experience.currentLabel))
  heading.append(title, createElement(document, 'span', 'font-mono-code text-mono-code text-on-surface-variant', experience.period || ''))
  card.append(
    heading,
    createElement(document, 'p', 'font-body-md text-body-md text-primary font-medium mb-space-xs', experience.company || ''),
    createElement(document, 'p', 'font-body-sm text-body-sm text-on-surface-variant', experience.description || ''),
  )
  return card
}

function createCareService(document, capability) {
  const card = createElement(document, 'article', 'bg-surface-container-low rounded-2xl p-8 flex flex-col justify-between hover:bg-surface-container transition-colors shadow-sm')
  const icon = createElement(document, 'div', 'w-12 h-12 rounded-xl bg-secondary-container/50 flex items-center justify-center text-secondary mb-6')
  icon.append(createElement(document, 'span', 'material-symbols-outlined text-2xl', capability.icon || 'favorite'))
  const technologies = Array.isArray(capability.technologies) ? capability.technologies : String(capability.technologies || '').split(',')
  const tag = capability.category || technologies.map((item) => String(item).trim()).filter(Boolean).at(0) || ''
  const body = document.createElement('div')
  body.append(
    icon,
    createElement(document, 'span', 'font-label-caps text-label-caps uppercase tracking-wider text-outline', tag),
    createElement(document, 'h3', 'font-headline-md text-headline-md text-primary mt-1 mb-3', capability.title || ''),
    createElement(document, 'p', 'font-body-md text-body-md text-on-surface-variant leading-relaxed', capability.description || ''),
  )
  const footer = createElement(document, 'div', 'mt-8 pt-4 flex items-center justify-between')
  footer.append(createElement(document, 'span', 'font-label-sm text-label-sm text-secondary font-medium', capability.tagline || technologies.join(' · ')))
  footer.append(createElement(document, 'span', 'material-symbols-outlined text-outline text-lg', 'check_circle'))
  card.append(body, footer)
  return card
}

function populateCareServices(document, capabilities) {
  const childcareGrid = document.querySelector('[data-care-services-grid="childcare"]')
  const housekeepingGrid = document.querySelector('[data-care-services-grid="housekeeping"]')
  if (!childcareGrid && !housekeepingGrid) return false

  const visibleCapabilities = capabilities.filter((capability) => capability.enabled !== false)
  const section = document.querySelector('[data-portfolio-section="experience-capabilities"]')
  const heading = section?.querySelector('#practice-domains .text-center')
  if (heading) heading.dataset.portfolioBlock = 'capabilities-heading'
  childcareGrid?.setAttribute('data-portfolio-block', 'capabilities-heading')
  housekeepingGrid?.setAttribute('data-portfolio-block', 'capabilities-heading')
  if (childcareGrid) childcareGrid.replaceChildren(...visibleCapabilities.slice(0, 3).map((capability) => createCareService(document, capability)))
  if (housekeepingGrid) housekeepingGrid.replaceChildren(...visibleCapabilities.slice(3, 6).map((capability) => createCareService(document, capability)))
  return true
}

export function populatePortfolioExperience(document, blocks, copy, cvDownload = {}) {
  const byRole = (role) => blocks.find((block) => block.data?.role === role)
  const intro = byRole('experience-intro')?.data || {}
  const capabilitiesHeading = byRole('capabilities-heading')?.data || {}
  const experienceHeading = byRole('experience-heading')?.data || {}
  const cvCard = byRole('experience-cv')?.data || {}
  const capabilities = capabilitiesHeading.enabled === false ? [] : (capabilitiesHeading.skills || [])
  const experiences = experienceHeading.experiences || []

  setText(document, 'experience-eyebrow', intro.eyebrow)
  setText(document, 'experience-title', intro.title)
  setText(document, 'capabilities-title', capabilitiesHeading.title)
  setText(document, 'capabilities-count', capabilitiesHeading.count)
  setText(document, 'experience-list-title', experienceHeading.title)
  setText(document, 'experience-list-label', experienceHeading.label)
  setText(document, 'experience-cv-eyebrow', cvCard.eyebrow)
  setText(document, 'experience-cv-title', cvCard.title)
  setText(document, 'experience-cv-meta', cvCard.meta)
  setText(document, 'experience-cv-action', cvCard.actionLabel)

  for (const block of blocks.filter((item) => item.data?.role && item.data.role !== 'capability' && item.data.role !== 'experience')) {
    document.querySelectorAll(`[data-portfolio-block="${block.data.role}"]`).forEach((element) => {
      element.hidden = block.enabled === false
    })
  }

  const usesCareServices = populateCareServices(document, capabilities)
  const capabilitiesGrid = document.getElementById('capabilities-grid')
  if (capabilitiesGrid && !usesCareServices) capabilitiesGrid.replaceChildren(...capabilities.map((skill) => createCapability(document, skill)))
  const experienceList = document.getElementById('experience-list')
  if (experienceList) experienceList.replaceChildren(...experiences.map((experience) => createExperience(document, experience)))

  const cvLink = document.querySelector('[data-portfolio-action="experience-cv-download"]')
  if (cvLink) {
    if (cvDownload.url) {
      cvLink.href = cvDownload.url
      cvLink.download = cvDownload.name || ''
      cvLink.removeAttribute('aria-disabled')
    } else {
      cvLink.removeAttribute('href')
      cvLink.setAttribute('aria-disabled', 'true')
    }
  }

  const linkedinLink = document.querySelector('[data-portfolio-action="experience-linkedin"]')
  if (linkedinLink) {
    if (cvCard.linkedinUrl) {
      linkedinLink.href = cvCard.linkedinUrl
      linkedinLink.removeAttribute('aria-disabled')
    } else {
      linkedinLink.removeAttribute('href')
      linkedinLink.setAttribute('aria-disabled', 'true')
    }
  }
}
