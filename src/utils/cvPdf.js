const pdfMessages = {
  es: { profile: 'Perfil profesional', experience: 'Experiencia', education: 'Educación', skills: 'Habilidades', additional: 'Información adicional', languages: 'Idiomas', interests: 'Intereses' },
  en: { profile: 'Professional profile', experience: 'Experience', education: 'Education', skills: 'Skills', additional: 'Additional information', languages: 'Languages', interests: 'Interests' },
  'pt-BR': { profile: 'Perfil profissional', experience: 'Experiência', education: 'Formação', skills: 'Competências', additional: 'Informações adicionais', languages: 'Idiomas', interests: 'Interesses' },
}

function normalizeCv(cv) {
  if (cv.data) return { name: cv.name, ...cv.data }

  return {
    name: cv.name,
    profile: {
      fullName: cv.full_name || '',
      role: cv.role || '',
      email: cv.email || '',
      phone: cv.phone || '',
      city: cv.city || '',
      country: cv.country || '',
      linkedIn: cv.linkedin_url || '',
      professionalSummary: cv.professional_summary || '',
    },
    experience: (cv.experiences || []).map((item) => ({
      role: item.position || '',
      company: item.company || '',
      startDate: item.started_at || '',
      endDate: item.ended_at || '',
      summary: item.impact_summary || '',
    })),
    educations: (cv.educations || []).map((item) => ({
      credential: item.original_credential || '',
      institution: item.institution || '',
      startYear: String(item.started_at || '').slice(0, 4),
      endYear: String(item.ended_at || '').slice(0, 4),
    })),
    skills: (cv.skills || []).map((item) => item.name || item).filter(Boolean),
    languages: (cv.languages || []).map((item) => item.name || item).filter(Boolean),
    interests: (cv.interests || []).map((item) => item.name || item).filter(Boolean),
  }
}

export function getCvPdfFileName(cv) {
  const data = normalizeCv(cv)
  const name = data.profile?.fullName?.trim() || data.name || 'cv'
  const safeName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${safeName || 'cv'}.pdf`
}

export async function createCvPdfBlob(cv, locale = 'es') {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const data = normalizeCv(cv)
  const copy = pdfMessages[locale] || pdfMessages.es
  const profile = data.profile || {}
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 18
  const contentWidth = pageWidth - (margin * 2)
  let cursorY = 20

  const addPageIfNeeded = (height = 8) => {
    if (cursorY + height <= pageHeight - margin) return
    pdf.addPage()
    cursorY = margin
  }
  const addText = (text, options = {}) => {
    if (!text) return
    const { size = 10, style = 'normal', color = [28, 25, 23], align = 'left', spacing = 5 } = options
    pdf.setFont('helvetica', style)
    pdf.setFontSize(size)
    pdf.setTextColor(...color)
    const lines = pdf.splitTextToSize(String(text), contentWidth)
    addPageIfNeeded(lines.length * spacing)
    pdf.text(lines, align === 'center' ? pageWidth / 2 : margin, cursorY, { align })
    cursorY += lines.length * spacing
  }
  const addSection = (title) => {
    cursorY += 5
    addPageIfNeeded(13)
    pdf.setDrawColor(214, 211, 209)
    pdf.line(margin, cursorY, pageWidth - margin, cursorY)
    cursorY += 7
    addText(title.toUpperCase(), { size: 10, style: 'bold', color: [87, 83, 78] })
    cursorY += 2
  }
  const formatDate = (value) => String(value || '').slice(0, 7)

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(22)
  pdf.setTextColor(28, 25, 23)
  pdf.text(profile.fullName || data.name || 'Curriculum Vitae', pageWidth / 2, cursorY, { align: 'center' })
  cursorY += 9
  addText(profile.role, { size: 14, style: 'bold', color: [68, 64, 60], align: 'center', spacing: 6 })
  addText([profile.city, profile.country, profile.email, profile.phone].filter(Boolean).join(' | '), { size: 9, color: [87, 83, 78], align: 'center', spacing: 4.5 })
  addText(profile.linkedIn, { size: 9, style: 'bold', color: [4, 120, 87], align: 'center', spacing: 4.5 })

  if (profile.professionalSummary) {
    addSection(copy.profile)
    addText(profile.professionalSummary)
  }
  if (data.experience?.length) {
    addSection(copy.experience)
    data.experience.forEach((item) => {
      addText([item.role, item.company].filter(Boolean).join(' | '), { size: 11, style: 'bold' })
      addText([formatDate(item.startDate), formatDate(item.endDate)].filter(Boolean).join(' - '), { size: 9, color: [87, 83, 78], spacing: 4.5 })
      addText(item.summary)
      cursorY += 3
    })
  }
  if (data.educations?.length) {
    addSection(copy.education)
    data.educations.forEach((item) => {
      addText(item.credential, { size: 11, style: 'bold' })
      addText([item.institution, [item.startYear, item.endYear].filter(Boolean).join(' - ')].filter(Boolean).join(' | '), { size: 9, color: [87, 83, 78], spacing: 4.5 })
      cursorY += 3
    })
  }
  if (data.skills?.length) {
    addSection(copy.skills)
    addText(data.skills.join(' | '))
  }
  if (data.languages?.length || data.interests?.length) {
    addSection(copy.additional)
    addText(data.languages?.length ? `${copy.languages}: ${data.languages.join(' | ')}` : '')
    addText(data.interests?.length ? `${copy.interests}: ${data.interests.join(' | ')}` : '')
  }

  return pdf.output('blob')
}
