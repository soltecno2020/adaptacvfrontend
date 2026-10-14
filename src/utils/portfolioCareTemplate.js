function createElement(document, tag, className, text = '') {
  const element = document.createElement(tag)
  element.className = className
  if (text) element.textContent = text
  return element
}

function findAndMark(document, selector, marker, predicate) {
  const existing = document.querySelector(`[data-care-template="${marker}"]`)
  if (existing) return existing
  const element = Array.from(document.querySelectorAll(selector)).find(predicate)
  if (element) element.dataset.careTemplate = marker
  return element || null
}

function setText(element, value) {
  if (element && value !== undefined && value !== null) element.textContent = value
}

function setCareField(document, field, value) {
  const element = document.querySelector(`[data-care-template-field="${field}"]`)
  setText(element, value)
  if (element && ['registry', 'legal-first', 'legal-second', 'rate'].includes(field)) element.hidden = !String(value || '').trim()
}

function replaceOptions(select, options) {
  if (!select || !Array.isArray(options)) return
  const document = select.ownerDocument
  select.replaceChildren(...options.map((option) => {
    const element = document.createElement('option')
    element.value = option.value || option.label || ''
    element.textContent = option.label || ''
    return element
  }))
}

function populateCareMenu(document, blocks, ownerName) {
  const link = document.querySelector('header a[data-path="dossier-&-bio"]')
  if (!link) return
  link.href = '#dossier-bio'

  link.querySelector('img')?.remove()
  let logo = link.querySelector('[data-care-template-field="menu-logo"]')
  if (!logo) {
    logo = createElement(document, 'span', 'font-headline-sm text-headline-sm text-primary tracking-tight group-hover:text-tertiary transition-colors')
    logo.dataset.careTemplateField = 'menu-logo'
    logo.dataset.portfolioBlock = 'logo'
    link.prepend(logo)
  }

  const getBlock = (role) => blocks.find((block) => block.data?.role === role)?.data || {}
  const logoData = getBlock('logo')
  const identity = getBlock('identity')
  const intro = getBlock('intro')
  setCareText(logo, 'menu-logo', logoData.text || 'Portfolio')
  const identityWrapper = link.querySelector('div.flex.flex-col')
  if (identityWrapper) identityWrapper.dataset.portfolioBlock = 'identity'
  setCareText(identityWrapper?.querySelector('span:first-child'), 'menu-name', identity.text || intro.name || ownerName || '')
  setCareText(identityWrapper?.querySelector('span:last-child'), 'menu-subtitle', identity.subtitle || '')
}

function wireCareMenuLinks(document) {
  const hero = document.querySelector('[data-portfolio-field="hero-headline"]')?.closest('.max-w-7xl')
  if (hero) hero.id = 'dossier-bio'

  const certifications = document.querySelector('[data-care-template="certifications-section"]')
  if (certifications) certifications.id = 'trust-certifications'
  const testimonial = document.querySelector('[data-portfolio-block="care-testimonial"]')
  if (testimonial && !testimonial.hidden) testimonial.id = 'family-endorsements'

  const destinations = {
    'dossier-&-bio': 'dossier-bio',
    'services-&-practice': 'practice-domains',
    'trust-&-certifications': 'trust-certifications',
    'family-endorsements': testimonial && !testimonial.hidden ? 'family-endorsements' : '',
  }
  document.querySelectorAll('header a[data-path]').forEach((link) => {
    const target = destinations[link.getAttribute('data-path')]
    if (!target || !document.getElementById(target)) {
      if (link.getAttribute('data-path') === 'family-endorsements') link.hidden = true
      return
    }
    link.href = `#${target}`
  })

  document.querySelectorAll('header a[href="#"]').forEach((link) => {
    const label = link.textContent.toLowerCase()
    if (label.includes('concierge')) {
      link.href = '#dossier-request'
      link.dataset.portfolioAction = 'conversation-open'
      return
    }
    if (label.includes('consultation')) {
      link.href = '#dossier-request'
      delete link.dataset.portfolioAction
    }
  })
}

function populateOverview(document, overview) {
  setCareField(document, 'registry', overview.registry)
  setCareField(document, 'availability-label', overview.availabilityLabel)
  setCareField(document, 'legal-first', overview.legalFirst)
  setCareField(document, 'legal-second', overview.legalSecond)
  setCareField(document, 'rate', overview.rate)
  setCareField(document, 'domain-eyebrow', overview.domainEyebrow)
  setCareField(document, 'domain-title', overview.domainTitle)
  setCareField(document, 'domain-description', overview.domainDescription)
  setCareField(document, 'childcare-label', overview.childcareLabel)
  setCareField(document, 'housekeeping-label', overview.housekeepingLabel)

    const registry = findAndMark(document, 'div.inline-flex', 'registry', (element) => element.textContent.includes('Swiss Domestic Guild'))
    if (registry) {
      registry.dataset.careTemplateField = 'registry'
      registry.hidden = !String(overview.registry || '').trim()
    }
  setText(registry, overview.registry)
    const headerVerification = findAndMark(document, 'span', 'header-verification', (element) => element.textContent.includes('Vetted European Care'))
    setCareText(headerVerification, 'header-verification', overview.registry)
    if (headerVerification) headerVerification.hidden = !String(overview.registry || '').trim()

  const status = document.querySelector('[data-portfolio-field="hero-profile-status"]')
  const statusLabel = status?.parentElement?.querySelector('span:first-child')
  if (statusLabel) statusLabel.dataset.careTemplateField = 'availability-label'
  setText(statusLabel, overview.availabilityLabel)
  const statusBanner = status?.closest('[data-portfolio-block="profile"]')
  if (statusBanner) {
    const badges = [
      statusBanner.querySelector('[data-care-template-field="legal-first"]') || Array.from(statusBanner.querySelectorAll('span')).find((element) => element.textContent.includes('Schengen')),
      statusBanner.querySelector('[data-care-template-field="legal-second"]') || Array.from(statusBanner.querySelectorAll('span')).find((element) => element.textContent.includes('Swiss LAMal')),
    ]
    if (badges[0]) badges[0].dataset.careTemplateField = 'legal-first'
    if (badges[1]) badges[1].dataset.careTemplateField = 'legal-second'
    if (badges[0]) badges[0].hidden = !String(overview.legalFirst || '').trim()
    if (badges[1]) badges[1].hidden = !String(overview.legalSecond || '').trim()
    setText(badges[0], overview.legalFirst)
    setText(badges[1], overview.legalSecond)
    const rate = Array.from(statusBanner.querySelectorAll('span')).find((element) => /€|\$|£|\/\s*hr/i.test(element.textContent))
    if (rate) {
      rate.dataset.careTemplateField = 'rate'
      rate.hidden = !overview.rate
    }
    setText(rate, overview.rate)
  }

  const heading = document.querySelector('#practice-domains .text-center')
  if (heading) {
    heading.dataset.portfolioBlock = 'care-overview'
    const [eyebrow, title, description] = heading.children
    const capabilities = document.querySelector('[data-care-service-data="capabilities"]')
    setText(eyebrow, capabilities?.dataset.eyebrow)
    setText(title, capabilities?.dataset.title)
    setText(description, overview.domainDescription)
  }
  const capabilitiesBlock = document.querySelector('[data-care-template-capabilities]')
  setText(document.getElementById('btn-childcare'), capabilitiesBlock?.dataset.childcareTitle)
  setText(document.getElementById('btn-estate'), capabilitiesBlock?.dataset.housekeepingTitle)

  const metricsGrid = document.querySelector('[data-portfolio-field="hero-metric-first-value"]')?.parentElement?.parentElement
  const fourthMetric = metricsGrid?.children?.[3]
  if (fourthMetric) {
    const value = fourthMetric.querySelector('span:first-child')
    const label = fourthMetric.querySelector('span:last-child')
    if (value) value.dataset.careTemplateField = 'metric-fourth-value'
    if (label) label.dataset.careTemplateField = 'metric-fourth-label'
  }
}

function populateTestimonial(document, data) {
  const quote = findAndMark(document, 'p', 'testimonial-quote', (element) => element.textContent.trim().startsWith('“'))
  setText(quote, `“${data.quote || ''}”`)
  const card = quote?.closest('div.absolute')
  if (!card) return
  card.dataset.portfolioBlock = 'care-testimonial'
  card.hidden = !String(data.quote || '').trim()
  const location = card.querySelector('span.font-label-sm')
  if (location) location.dataset.careTemplateField = 'testimonial-location'
  setText(location, data.location)
  const stars = card.querySelectorAll('.text-on-tertiary-container span')
  stars.forEach((star, index) => { star.hidden = index >= Math.min(5, Math.max(0, Number(data.rating) || 0)) })
}

function populateCertifications(document, data) {
  const section = findAndMark(document, 'section', 'certifications-section', (element) => element.querySelector('h2')?.textContent.includes('Uncompromising Security Protocols'))
  if (!section) return
  section.dataset.portfolioBlock = 'care-certifications'
  const content = Array.from(section.querySelectorAll('div')).find((element) => element.classList.contains('lg:col-span-4') && element.classList.contains('space-y-4'))
  if (content) {
    setCareText(content.children[0], 'certifications-eyebrow', data.eyebrow)
    setCareText(content.children[1], 'certifications-title', data.title)
    setCareText(content.children[2], 'certifications-description', data.description)
    const vault = content.querySelector('.inline-flex.items-center.gap-2')
    const vaultText = vault?.querySelector('span:last-child')
    setCareText(vaultText, 'certifications-vault', data.vaultText)
    if (vault) vault.hidden = !String(data.vaultText || '').trim()
  }

  const cards = Array.from(section.querySelectorAll('div')).find((element) => element.classList.contains('lg:col-span-8') && element.classList.contains('grid'))
  if (cards) {
    cards.replaceChildren(...(data.certificates || []).map((certificate) => {
      const card = createElement(document, 'div', 'bg-surface rounded-xl p-5 shadow-sm flex items-start gap-4')
      const iconBox = createElement(document, 'div', 'p-2.5 rounded-lg bg-surface-container text-secondary shrink-0')
      iconBox.append(createElement(document, 'span', 'material-symbols-outlined text-xl', certificate.icon || 'workspace_premium'))
      const copy = document.createElement('div')
      copy.append(
        createElement(document, 'p', 'font-headline-sm text-headline-sm text-primary text-[16px]', certificate.title),
        createElement(document, 'p', 'font-body-sm text-body-sm text-on-surface-variant mt-0.5', certificate.description),
      )
      card.append(iconBox, copy)
      return card
    }))
  }
}

function setCareText(element, field, value) {
  if (!element) return
  element.dataset.careTemplateField = field
  element.textContent = value ?? ''
}

function populateInquiry(document, data) {
  const section = document.getElementById('dossier-request')
  if (!section) return
  section.dataset.portfolioBlock = 'care-inquiry'
  const form = section.querySelector('#inquiry-form')
  form?.removeAttribute('onsubmit')
  const labels = form ? Array.from(form.querySelectorAll('label')) : []
  const inputs = form ? Array.from(form.querySelectorAll('input')) : []
  const selects = form ? Array.from(form.querySelectorAll('select')) : []
  const buttonLabel = form?.querySelector('button[type="submit"] span:first-child')
  const confirmation = section.querySelector('#confirmation-banner')
  const contactMeta = Array.from(section.querySelectorAll('.flex.items-center.gap-4')).find((element) => element.textContent.includes('End-to-End Encrypted'))

  const heading = section.querySelector('.relative.z-10')
  if (heading) {
    setCareText(heading.children[0], 'inquiry-eyebrow', data.eyebrow)
    setCareText(heading.children[1], 'inquiry-title', data.title)
    setCareText(heading.children[2], 'inquiry-description', data.description)
  }
  setCareText(labels[0], 'inquiry-name-label', data.nameLabel)
  setCareText(labels[1], 'inquiry-email-label', data.emailLabel)
  setCareText(labels[2], 'inquiry-region-label', data.regionLabel)
  setCareText(labels[3], 'inquiry-scope-label', data.scopeLabel)
  if (inputs[0]) inputs[0].placeholder = data.namePlaceholder || ''
  if (inputs[1]) inputs[1].placeholder = data.emailPlaceholder || ''
  replaceOptions(selects[0], data.regions)
  replaceOptions(selects[1], data.scopes)
  setCareText(buttonLabel, 'inquiry-submit-label', data.submitLabel)
  if (confirmation) {
    setCareText(confirmation.querySelector('p:first-child'), 'inquiry-confirm-title', data.confirmationTitle)
    setCareText(confirmation.querySelector('p:last-child'), 'inquiry-confirm-description', data.confirmationDescription)
  }
  const contactSpans = contactMeta?.querySelectorAll(':scope > span')
  setCareText(contactSpans?.[0], 'inquiry-security-label', data.securityLabel)
  setCareText(contactSpans?.[2], 'inquiry-direct-line', data.directLine)
  if (contactMeta) contactMeta.hidden = !String(data.securityLabel || '').trim() && !String(data.directLine || '').trim()
}

function populateFooter(document, certifications, identityData, contactData, ownerEmail) {
  const footer = document.querySelector('footer')
  if (!footer) return
  const columns = footer.querySelector('.grid.grid-cols-1')
  const identity = columns?.children?.[0]
  if (identity) {
    const spans = identity.querySelectorAll(':scope > div:first-child > span')
    const summary = identity.querySelector(':scope > p')
    const privacy = identity.querySelectorAll(':scope > div:last-child > span')
    const heroName = document.querySelector('[data-portfolio-field="hero-name"]')?.textContent
    setCareText(spans[0], 'footer-name', identityData.name || heroName)
    setCareText(spans[1], 'footer-regions', identityData.location)
    const sampleSummary = 'Private governess, bilingual infant care, and confidential residence governance for distinguished international estates across Western Europe.'
    const sampleLocation = 'Paris • Genève • London • Monaco'
    setCareText(summary, 'footer-summary', identityData.summary === sampleSummary ? '' : identityData.summary)
    if (spans[1] && identityData.location === sampleLocation) spans[1].textContent = ''
    setCareText(privacy[0], 'footer-privacy-first', certifications.privacyFirst)
    setCareText(privacy[2], 'footer-privacy-second', certifications.privacySecond)
    if (privacy[0]) privacy[0].hidden = !privacy[0].textContent.trim()
    if (privacy[2]) privacy[2].hidden = !privacy[2].textContent.trim()
    if (privacy[1]) privacy[1].hidden = privacy[0]?.hidden && privacy[2]?.hidden
  }
  const accreditationColumn = columns?.children?.[1]
  if (accreditationColumn) {
    const heading = accreditationColumn.querySelector(':scope > span')
    setCareText(heading, 'accreditations-title', certifications.accreditationsTitle)
    const list = accreditationColumn.querySelector('ul')
    if (list) {
      list.replaceChildren(...(certifications.accreditations || []).map((item) => {
        const row = createElement(document, 'li', 'flex items-center gap-1.5')
        row.append(createElement(document, 'span', 'material-symbols-outlined text-[14px] text-secondary', 'workspace_premium'))
        row.append(document.createTextNode(item))
        return row
      }))
    }
  }
  const contactColumn = columns?.children?.[2]
  if (contactColumn) {
    setCareText(contactColumn.querySelector(':scope > span'), 'footer-contact-title', contactData.title)
    const contactLines = contactColumn.querySelectorAll(':scope > p')
    const values = [
      [contactData.phoneLabel, contactData.phone],
      [contactData.whatsappLabel, contactData.whatsapp],
      [contactData.emailLabel, ownerEmail],
    ]
    contactLines.forEach((line, index) => {
      const [label, value] = values[index] || []
      line.textContent = label && value ? `${label}: ${value}` : ''
      line.hidden = !line.textContent
    })
  }
  const bottom = footer.querySelector('.pt-space-lg')
  const bottomIdentity = bottom?.querySelector(':scope > div:first-child')
  const copyright = bottomIdentity?.querySelector(':scope > span')
  setCareText(copyright, 'footer-copyright', identityData.copyright)
  if (copyright) copyright.hidden = !String(identityData.copyright || '').trim()
  const legalLinks = bottomIdentity?.querySelectorAll(':scope > a') || []
  setCareText(legalLinks[0], 'footer-legal-one', identityData.legalLinkOne)
  setCareText(legalLinks[1], 'footer-legal-two', identityData.legalLinkTwo)
  if (legalLinks[0] && /^https?:\/\//i.test(identityData.legalUrlOne || '')) legalLinks[0].href = identityData.legalUrlOne
  if (legalLinks[1] && /^https?:\/\//i.test(identityData.legalUrlTwo || '')) legalLinks[1].href = identityData.legalUrlTwo
  legalLinks.forEach((link) => { link.hidden = !link.textContent.trim() })
  const languageSelector = bottom?.querySelector(':scope > div:last-child')
  if (languageSelector) languageSelector.hidden = true
}

export function populatePortfolioCareTemplate(document, blocks, ownerEmail = '', ownerName = '') {
  if (!document || !document.querySelector('#practice-domains')) return
  const byRole = (role) => blocks.find((block) => block.data?.role === role)?.data || {}
  const overview = byRole('care-overview')
  const intro = byRole('intro')
  const metrics = byRole('metrics')
  const profile = byRole('profile')
  const capabilitiesBlock = blocks.find((block) => block.data?.role === 'capabilities-heading')
  if (capabilitiesBlock?.data) {
    const heading = document.querySelector('#practice-domains .text-center')
    if (heading) {
      heading.dataset.careServiceData = 'capabilities'
      heading.dataset.title = capabilitiesBlock.data.title || ''
      heading.dataset.eyebrow = capabilitiesBlock.data.count || ''
    }
    const tabBlock = document.getElementById('btn-childcare')?.parentElement
    if (tabBlock) {
      tabBlock.dataset.careTemplateCapabilities = 'true'
      tabBlock.dataset.childcareTitle = capabilitiesBlock.data.childcareTitle || ''
      tabBlock.dataset.housekeepingTitle = capabilitiesBlock.data.housekeepingTitle || ''
    }
  }
  const testimonial = byRole('care-testimonial')
  const certifications = byRole('care-certifications')
  const inquiry = byRole('care-inquiry')

  populateCareMenu(document, blocks, ownerName)
  setCareText(document.querySelector('[data-portfolio-field="hero-headline"]'), 'hero-headline', intro.headline || '')
  setCareText(document.querySelector('[data-portfolio-field="hero-summary"]'), 'hero-summary', intro.summary || intro.body || '')
  populateOverview(document, overview)
  const fourthMetric = document.querySelector('[data-care-template-field="metric-fourth-value"]')?.parentElement
  setCareText(fourthMetric?.querySelector('span:first-child'), 'metric-fourth-value', metrics.fourthValue)
  setCareText(fourthMetric?.querySelector('span:last-child'), 'metric-fourth-label', metrics.fourthLabel)
  const profileBadge = findAndMark(document, 'span', 'profile-badge', (element) => element.textContent.includes('Vetted European Care 2025'))
  if (profileBadge) profileBadge.dataset.portfolioField = 'hero-profile-performance'
  setText(profileBadge, profile.performance)
  if (profileBadge) profileBadge.hidden = !String(profile.performance || '').trim()
  populateTestimonial(document, testimonial)
  populateCertifications(document, certifications)
  populateInquiry(document, inquiry)
  populateFooter(document, certifications, byRole('footer-identity'), byRole('footer-contact'), ownerEmail)
  wireCareMenuLinks(document)
}
