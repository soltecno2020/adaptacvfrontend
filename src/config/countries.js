export const countryConfigs = {
  ireland: {
    id: 'ireland',
    name: 'Irlanda',
    marketLabel: 'Mercado Irlandes',
    currency: 'EUR',
    atsRules: {
      allowPhoto: false,
      hiddenFields: ['age', 'maritalStatus'],
      warning:
        'Mercado Irlandes: No incluyas foto, edad ni estado civil para cumplir con las leyes de discriminacion.',
    },
    advice: {
      es: ['Evita incluir foto, edad, estado civil o datos personales que no sean necesarios para el proceso.', 'Enfoca el CV en resultados medibles, experiencia relevante y habilidades que respondan al rol.', 'Muestra solo permisos de trabajo o visa si la oferta lo solicita explícitamente.'],
      en: ['Avoid photos, age, marital status, and personal information not needed for the application.', 'Focus your CV on measurable results, relevant experience, and skills that match the role.', 'Include work permission or visa details only when the job posting explicitly requests them.'],
      'pt-BR': ['Evite incluir foto, idade, estado civil ou dados pessoais que não sejam necessários para o processo.', 'Foque o CV em resultados mensuráveis, experiência relevante e habilidades alinhadas à vaga.', 'Mostre autorização de trabalho ou visto apenas quando a vaga solicitar explicitamente.'],
    },
    educationLevels: [
      { value: 'nfq-7', label: 'NFQ Level 7 - Ordinary Bachelor Degree' },
      { value: 'nfq-8', label: 'NFQ Level 8 - Honours Bachelor Degree' },
      { value: 'nfq-9', label: 'NFQ Level 9 - Masters Degree' },
    ],
    visaOptions: [
      { value: 'stamp-2', label: 'Stamp 2' },
      { value: 'stamp-4', label: 'Stamp 4' },
      { value: 'working-holiday', label: 'Working Holiday' },
    ],
  },
  spain: {
    id: 'spain',
    name: 'Espana',
    marketLabel: 'Mercado Espanol',
    currency: 'EUR',
    atsRules: {
      allowPhoto: true,
      hiddenFields: [],
      warning: '',
    },
    advice: {
      es: ['Usa una foto profesional si quieres reforzar tu presentación, pero mantenla sobria y alineada al mercado local.', 'Prioriza experiencia, proyectos y resultados en español o con lenguaje claro para recruiters locales.', 'Mantén el resumen y la experiencia centrados en el rol objetivo y en logros cuantificables.'],
      en: ['Use a professional photo only if you want to reinforce your presentation, keeping it understated and aligned with the local market.', 'Prioritize experience, projects, and results in Spanish or clear language for local recruiters.', 'Keep the summary and experience focused on the target role and measurable achievements.'],
      'pt-BR': ['Use uma foto profissional se quiser reforçar sua apresentação, mantendo-a discreta e adequada ao mercado local.', 'Priorize experiência, projetos e resultados em espanhol ou linguagem clara para recrutadores locais.', 'Mantenha o resumo e a experiência focados no cargo desejado e em conquistas mensuráveis.'],
    },
    educationLevels: [
      { value: 'grado', label: 'Grado universitario' },
      { value: 'master', label: 'Master universitario' },
      { value: 'fp-superior', label: 'Formacion Profesional Superior' },
    ],
    visaOptions: [
      { value: 'student-visa', label: 'Visado de estudiante' },
      { value: 'work-residence', label: 'Residencia y trabajo' },
      { value: 'eu-family', label: 'Familiar comunitario' },
    ],
  },
  germany: {
    id: 'germany',
    name: 'Alemania',
    marketLabel: 'Mercado Aleman',
    currency: 'EUR',
    atsRules: {
      allowPhoto: true,
      hiddenFields: ['maritalStatus'],
      warning: 'Mercado Aleman: evita datos personales no requeridos salvo que una oferta los solicite.',
    },
    advice: {
      es: ['Evita datos personales extra como estado civil o detalles no solicitados por la vacante.', 'Si agregas foto, que sea profesional y opcional, sin distraer la lectura del CV.', 'Destaca formación, idiomas y experiencia con métricas claras y un lenguaje directo.'],
      en: ['Avoid extra personal information such as marital status or details not requested in the job posting.', 'If you add a photo, keep it professional and optional, without distracting from the CV.', 'Highlight education, languages, and experience with clear metrics and direct language.'],
      'pt-BR': ['Evite dados pessoais extras, como estado civil ou detalhes não solicitados pela vaga.', 'Se incluir uma foto, que seja profissional e opcional, sem distrair da leitura do CV.', 'Destaque formação, idiomas e experiência com métricas claras e linguagem direta.'],
    },
    educationLevels: [
      { value: 'ausbildung', label: 'Ausbildung' },
      { value: 'bachelor', label: 'Bachelor' },
      { value: 'master', label: 'Master' },
    ],
    visaOptions: [
      { value: 'blue-card', label: 'EU Blue Card' },
      { value: 'job-seeker', label: 'Job Seeker Visa' },
      { value: 'student', label: 'Student Visa' },
    ],
  },
}

export const defaultCountryId = 'ireland'

export const availableCountries = Object.values(countryConfigs).map(({ id, name }) => ({ id, name }))