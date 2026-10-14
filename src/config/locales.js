import mexicoFlag from 'flag-icons/flags/4x3/mx.svg'
import irelandFlag from 'flag-icons/flags/4x3/ie.svg'
import brazilFlag from 'flag-icons/flags/4x3/br.svg'

export const supportedLocales = [
  { code: 'es', label: 'Español', flagUrl: mexicoFlag },
  { code: 'en', label: 'English', flagUrl: irelandFlag },
  { code: 'pt-BR', label: 'Português (Brasil)', flagUrl: brazilFlag },
]

export const dateLocales = {
  es: 'es-CL',
  en: 'en-US',
  'pt-BR': 'pt-BR',
}

export const messages = {
  es: {
    nav: { howItWorks: 'Como funciona', destinations: 'Destinos', login: 'Iniciar sesion', signup: 'Crear cuenta', logout: 'Cerrar sesion', openMenu: 'Abrir menu' },
    hero: {
      eyebrow: 'Tu proximo trabajo empieza aqui',
      title: 'Tu experiencia merece cruzar fronteras.',
      description: 'Crea un CV que habla el idioma del mercado laboral al que llegas. Manten tu perfil listo para el mundo.',
      primaryCta: 'Crear mi CV gratis',
      secondaryCta: 'Ver el editor',
      noCard: 'Sin tarjeta de credito',
      countryRules: 'Reglas por pais',
    },
    preview: { cvForAnywhere: 'CV para cualquier destino', validated: 'CV validado', profile: 'Perfil profesional', experience: 'Experiencia', ready: 'Preparado para aplicar', localFormat: 'Formato local aplicado' },
    benefits: {
      eyebrow: 'Construido para moverte',
      title: 'Un perfil profesional que entiende tu contexto.',
      items: [
        { title: 'Hecho para cada destino', description: 'Tu CV se adapta a las normas y expectativas del mercado laboral que elijas.' },
        { title: 'Listo para ATS', description: 'Estructura clara y contenido enfocado para que tu perfil llegue a lectura humana.' },
        { title: 'Privado por defecto', description: 'Las reglas de cada mercado ayudan a evitar datos personales innecesarios.' },
      ],
    },
    finalCta: { eyebrow: 'Empieza hoy', title: 'Tu proximo destino no deberia obligarte a empezar de cero.', button: 'Crear cuenta' },
    donations: {
      eyebrow: 'Un pequeño gesto, una gran ayuda',
      title: '¿Nos invitas un café o un almuerzo?',
      description: 'adaptaCV es gratis y lo construimos con mucho cariño. Si te ha servido, puedes invitarnos a un café o a un almuerzo para ayudarnos a seguir mejorándolo.',
      caption: 'Tu aporte es voluntario. ¡Gracias por acompañarnos!',
      chooseAmount: 'Elige cuánto quieres aportar',
      customAmount: 'Otro',
      customAmountLabel: 'Monto en dólares (USD)',
      customAmountPlaceholder: 'Por ejemplo, 15',
      amountLimit: 'Desde $1 hasta $500 USD.',
      loading: 'Preparando PayPal...',
      unavailable: 'Las donaciones por PayPal no están disponibles por el momento.',
      processing: 'Confirmando tu aporte con PayPal...',
      thankYou: '¡Muchas gracias por invitarnos {amount}! Tu aporte quedó confirmado.',
      invalidAmount: 'Elige un monto entre $1 y $500 USD.',
      cancelled: 'La donación fue cancelada. Puedes intentarlo de nuevo cuando quieras.',
      error: 'No fue posible procesar la donación. Inténtalo nuevamente.',
    },
    workspace: { navigation: 'Navegacion de cuenta', profile: 'Mi perfil', cvs: 'CVs', portfolios: 'Portafolios', coverLetter: 'Cover letter' },
    cvPreview: { profile: 'Perfil', visa: 'Visa', education: 'Educacion', experience: 'Experiencia', skills: 'Skills', languagesAndInterests: 'Idiomas e intereses' },
    editor: { title: 'Editor de CV', saving: 'Guardando cambios...', downloadPdf: 'Descargar PDF', generatingPdf: 'Generando PDF...', downloadLanguageTitle: 'Idioma del PDF', downloadLanguageText: 'Selecciona el idioma de los encabezados del CV.', confirmDownload: 'Descargar', portfolios: 'Portafolios', destinationCountry: 'Pais de destino', loadingCountries: 'Cargando paises...', professionalProfile: 'Perfil profesional', professionalProfileText: 'Campos compartidos por mercados globales.', photoUrl: 'URL de foto profesional', includePhoto: 'Incluir foto en el CV', photoOptionalHint: 'La foto es opcional y se recomienda solo si el mercado lo permite.', photoOptionalWarning: 'La foto puede agregarse si tú lo eliges, pero evita incluirla si el mercado lo desaconseja.', fullName: 'Nombre completo', targetRole: 'Rol objetivo', email: 'Email', phone: 'Telefono', city: 'Ciudad', country: 'Pais', availability: 'Disponibilidad', professionalSummary: 'Resumen profesional', migration: 'Estatus Migratorio / Visa', migrationOptions: 'Opciones cargadas desde la configuracion de {country}.', currentStatus: 'Estatus actual', workAvailability: 'Disponibilidad laboral', loadingStatuses: 'Cargando estatus...', education: 'Educacion', educationText: 'Mapeo local para filtros ATS y reclutadores.', addEducation: 'Agregar estudio', originalCredential: 'Credencial original', localLevel: 'Nivel local equivalente', from: 'Desde', until: 'Hasta', institution: 'Institucion', loadingLevels: 'Cargando niveles...', experience: 'Experiencia', addExperience: 'Agregar experiencia', role: 'Cargo', company: 'Empresa', impactSummary: 'Resumen de impacto', skillsText: 'Tecnologias y competencias relevantes para este CV.', languagesAndInterests: 'Idiomas e intereses', languages: 'Idiomas', interests: 'Intereses', skillPlaceholder: 'Buscar o agregar skill', languagePlaceholder: 'Ej. Ingles - Avanzado C1', interestPlaceholder: 'Ej. Fotografia urbana', credentialPlaceholder: 'Ej. Master en Ingenieria', yearPlaceholder: 'Año', endYearPlaceholder: 'Actualidad o año', institutionPlaceholder: 'Ej. Universidad de Chile', rolePlaceholder: 'Ej. Desarrollador Full Stack', companyPlaceholder: 'Ej. adaptacv', impactPlaceholder: 'Describe responsabilidades, resultados y herramientas utilizadas.', cancel: 'Cancelar', delete: 'Eliminar', close: 'Cerrar' },
    profile: {
      eyebrow: 'Espacio de carrera', greeting: 'Hola, {name}', subtitle: 'Tu perfil está tomando forma y listo para cada idioma y destino.', createCv: 'Crear CV', editCv: 'Editar CV', logout: 'Cerrar sesion',
      completion: 'Perfil preparado', completionText: 'Tu CV ya contiene la informacion clave para empezar a aplicar.',
      experience: 'Experiencia laboral', experienceText: 'Convierte tus responsabilidades en evidencia de impacto.', addExperience: 'Agregar experiencia', role: 'Cargo', company: 'Empresa', period: 'Periodo', impact: 'Logro o impacto',
      documents: 'Tus documentos', documentsText: 'Genera versiones listas para tu proxima aplicacion.', downloadCv: 'Descargar CV', coverLetter: 'Cover letter', generateLetter: 'Generar carta',
      letterTitle: 'Cover letter', recipient: 'Empresa o reclutador', recipientPlaceholder: 'Ej. Acme Ireland', generate: 'Generar', copy: 'Copiar texto', copied: 'Copiado',
      letterBody: 'Estimado equipo de {company},\n\nMe gustaria postularme para oportunidades de {role}. Mi experiencia en {skills} y mi perfil internacional me permiten aportar una perspectiva orientada al cliente desde el primer dia.\n\nMe encantaria conversar sobre como puedo contribuir a su equipo.\n\nSaludos cordiales,\n{name}',
      security: 'Seguridad de la cuenta', emailVerified: 'Correo verificado', currentPassword: 'Contrasena actual', newPassword: 'Nueva contrasena', confirmPassword: 'Confirmar nueva contrasena', updatePassword: 'Actualizar contrasena', passwordUpdated: 'Contrasena actualizada.', logoutAll: 'Cerrar sesion en todos los dispositivos', processing: 'Procesando...', securityError: 'No fue posible actualizar la contrasena.',
    },
    footer: { motto: 'Carreras sin fronteras', destination: 'Un perfil. Cada destino.', sponsoredBy: 'Patrocinado por', createdBy: 'Creado por', creatorRole: 'Fullstack Developer' },
    auth: {
      signupTitle: 'Crea tu cuenta', loginTitle: 'Que bueno verte de nuevo', signupDescription: 'Empieza a preparar tu perfil para el mercado que elegiste.', loginDescription: 'Accede a tu CV y a tus aplicaciones.',
      close: 'Cerrar', name: 'Nombre completo', namePlaceholder: 'Tu nombre', email: 'Email', emailPlaceholder: 'tu@email.com', password: 'Contrasena', passwordPlaceholder: 'Minimo 8 caracteres', confirmPassword: 'Confirmar contrasena', confirmPasswordPlaceholder: 'Repite tu contrasena',
      signupButton: 'Crear cuenta gratis', loginButton: 'Iniciar sesion', hasAccount: 'Ya tienes una cuenta?', noAccount: 'Aun no tienes cuenta?', switchToLogin: 'Inicia sesion', switchToSignup: 'Creala gratis',
      submitting: 'Procesando...', error: 'No fue posible autenticarte. Intentalo nuevamente.', verificationSent: 'Revisa tu correo para verificar tu cuenta antes de iniciar sesion.', forgotPasswordTitle: 'Recupera tu contrasena', forgotPasswordDescription: 'Ingresa tu email y te enviaremos un enlace seguro para restablecerla.', forgotPassword: 'Olvide mi contrasena', forgotPasswordButton: 'Enviar enlace de recuperacion', passwordResetSent: 'Si existe una cuenta con este email, recibiras un enlace para restablecer tu contrasena.', backToLogin: 'Volver a iniciar sesion',
    },
  },
  en: {
    nav: { howItWorks: 'How it works', destinations: 'Destinations', login: 'Log in', signup: 'Create account', logout: 'Log out', openMenu: 'Open menu' },
    hero: {
      eyebrow: 'Your next job starts here',
      title: 'Your experience deserves to cross borders.',
      description: 'Build a CV that speaks the language of your new job market. Keep your profile ready for the world.',
      primaryCta: 'Create my CV for free',
      secondaryCta: 'Explore the editor',
      noCard: 'No credit card required',
      countryRules: 'Country-specific guidance',
    },
    preview: { cvForAnywhere: 'CV for anywhere', validated: 'CV validated', profile: 'Professional profile', experience: 'Experience', ready: 'Ready to apply', localFormat: 'Local format applied' },
    benefits: {
      eyebrow: 'Built for your move',
      title: 'A professional profile that understands your context.',
      items: [
        { title: 'Built for every destination', description: 'Your CV adapts to the standards and expectations of your chosen job market.' },
        { title: 'ATS-ready', description: 'A clear structure and focused content so your profile reaches a human reader.' },
        { title: 'Private by default', description: 'Country rules help you avoid unnecessary personal information.' },
      ],
    },
    finalCta: { eyebrow: 'Start today', title: 'Your next destination should not mean starting from zero.', button: 'Create account' },
    donations: {
      eyebrow: 'A little gesture goes a long way',
      title: 'Will you treat us to a coffee or lunch?',
      description: 'adaptaCV is free, and we build it with care. If it has helped you, you can treat us to a coffee or lunch and help us keep making it better.',
      caption: 'Your contribution is optional. Thanks for being here!',
      chooseAmount: 'Choose how much you would like to give',
      customAmount: 'Other',
      customAmountLabel: 'Amount in US dollars (USD)',
      customAmountPlaceholder: 'For example, 15',
      amountLimit: 'From $1 to $500 USD.',
      loading: 'Getting PayPal ready...',
      unavailable: 'PayPal donations are not available right now.',
      processing: 'Confirming your contribution with PayPal...',
      thankYou: 'Thanks so much for treating us to {amount}! Your contribution is confirmed.',
      invalidAmount: 'Choose an amount between $1 and $500 USD.',
      cancelled: 'The donation was cancelled. You can try again whenever you like.',
      error: 'We could not process the donation. Please try again.',
    },
    workspace: { navigation: 'Account navigation', profile: 'My profile', cvs: 'CVs', portfolios: 'Portfolios', coverLetter: 'Cover letter' },
    cvPreview: { profile: 'Profile', visa: 'Visa', education: 'Education', experience: 'Experience', skills: 'Skills', languagesAndInterests: 'Languages and interests' },
    editor: { title: 'CV editor', saving: 'Saving changes...', downloadPdf: 'Download PDF', generatingPdf: 'Generating PDF...', downloadLanguageTitle: 'PDF language', downloadLanguageText: 'Select the language for the CV headings.', confirmDownload: 'Download', portfolios: 'Portfolios', destinationCountry: 'Destination country', loadingCountries: 'Loading countries...', professionalProfile: 'Professional profile', professionalProfileText: 'Fields shared across global markets.', photoUrl: 'Professional photo URL', includePhoto: 'Include photo in the CV', photoOptionalHint: 'The photo is optional and recommended only when the market allows it.', photoOptionalWarning: 'The photo can be added if you choose, but avoid it when the market discourages it.', fullName: 'Full name', targetRole: 'Target role', email: 'Email', phone: 'Phone', city: 'City', country: 'Country', availability: 'Availability', professionalSummary: 'Professional summary', migration: 'Immigration status / Visa', migrationOptions: 'Options loaded from the {country} configuration.', currentStatus: 'Current status', workAvailability: 'Work availability', loadingStatuses: 'Loading statuses...', education: 'Education', educationText: 'Local mapping for ATS and recruiter filters.', addEducation: 'Add education', originalCredential: 'Original credential', localLevel: 'Local equivalent level', from: 'From', until: 'To', institution: 'Institution', loadingLevels: 'Loading levels...', experience: 'Experience', addExperience: 'Add experience', role: 'Role', company: 'Company', impactSummary: 'Impact summary', skillsText: 'Relevant technologies and skills for this CV.', languagesAndInterests: 'Languages and interests', languages: 'Languages', interests: 'Interests', skillPlaceholder: 'Search or add a skill', languagePlaceholder: 'E.g. English - Advanced C1', interestPlaceholder: 'E.g. Urban photography', credentialPlaceholder: 'E.g. Master of Engineering', yearPlaceholder: 'Year', endYearPlaceholder: 'Present or year', institutionPlaceholder: 'E.g. University of Chile', rolePlaceholder: 'E.g. Full Stack Developer', companyPlaceholder: 'E.g. adaptacv', impactPlaceholder: 'Describe responsibilities, outcomes, and tools used.', cancel: 'Cancel', delete: 'Delete', close: 'Close' },
    profile: {
      eyebrow: 'Career space', greeting: 'Hello, {name}', subtitle: 'Your profile is taking shape and ready for every language and destination.', createCv: 'Create CV', editCv: 'Edit CV', logout: 'Log out',
      completion: 'Profile ready', completionText: 'Your CV already contains the key information to start applying.',
      experience: 'Work experience', experienceText: 'Turn your responsibilities into impact evidence.', addExperience: 'Add experience', role: 'Role', company: 'Company', period: 'Period', impact: 'Achievement or impact',
      documents: 'Your documents', documentsText: 'Generate versions ready for your next application.', downloadCv: 'Download CV', coverLetter: 'Cover letter', generateLetter: 'Generate letter',
      letterTitle: 'Cover letter', recipient: 'Company or recruiter', recipientPlaceholder: 'E.g. Acme Ireland', generate: 'Generate', copy: 'Copy text', copied: 'Copied',
      letterBody: 'Dear {company} team,\n\nI would like to apply for {role} opportunities. My experience in {skills} and international profile allow me to bring a customer-focused perspective from day one.\n\nI would welcome the opportunity to discuss how I can contribute to your team.\n\nKind regards,\n{name}',
      security: 'Account security', emailVerified: 'Email verified', currentPassword: 'Current password', newPassword: 'New password', confirmPassword: 'Confirm new password', updatePassword: 'Update password', passwordUpdated: 'Password updated.', logoutAll: 'Log out from all devices', processing: 'Processing...', securityError: 'We could not update your password.',
    },
    footer: { motto: 'Careers without borders', destination: 'One profile. Every destination.', sponsoredBy: 'Sponsored by', createdBy: 'Created by', creatorRole: 'Fullstack Developer' },
    auth: {
      signupTitle: 'Create your account', loginTitle: 'Welcome back', signupDescription: 'Start preparing your profile for the market you chose.', loginDescription: 'Access your CV and applications.',
      close: 'Close', name: 'Full name', namePlaceholder: 'Your name', email: 'Email', emailPlaceholder: 'you@email.com', password: 'Password', passwordPlaceholder: 'At least 8 characters', confirmPassword: 'Confirm password', confirmPasswordPlaceholder: 'Repeat your password',
      signupButton: 'Create account for free', loginButton: 'Log in', hasAccount: 'Already have an account?', noAccount: 'Do not have an account yet?', switchToLogin: 'Log in', switchToSignup: 'Create one for free',
      submitting: 'Processing...', error: 'We could not authenticate you. Please try again.', verificationSent: 'Check your email to verify your account before logging in.', forgotPasswordTitle: 'Reset your password', forgotPasswordDescription: 'Enter your email and we will send you a secure reset link.', forgotPassword: 'Forgot my password', forgotPasswordButton: 'Send reset link', passwordResetSent: 'If an account exists for this email, you will receive a password reset link.', backToLogin: 'Back to log in',
    },
  },
  'pt-BR': {
    nav: { howItWorks: 'Como funciona', destinations: 'Destinos', login: 'Entrar', signup: 'Criar conta', logout: 'Sair', openMenu: 'Abrir menu' },
    hero: {
      eyebrow: 'Seu próximo emprego começa aqui',
      title: 'Sua experiência merece cruzar fronteiras.',
      description: 'Crie um CV que fala a língua do mercado de trabalho para onde você vai. Mantenha seu perfil pronto para o mundo.',
      primaryCta: 'Criar meu CV grátis', secondaryCta: 'Ver o editor', noCard: 'Sem cartão de crédito', countryRules: 'Regras por país',
    },
    preview: { cvForAnywhere: 'CV para qualquer destino', validated: 'CV validado', profile: 'Perfil profissional', experience: 'Experiência', ready: 'Pronto para se candidatar', localFormat: 'Formato local aplicado' },
    benefits: {
      eyebrow: 'Feito para sua mudança', title: 'Um perfil profissional que entende seu contexto.',
      items: [
        { title: 'Feito para cada destino', description: 'Seu CV se adapta às normas e expectativas do mercado de trabalho escolhido.' },
        { title: 'Pronto para ATS', description: 'Estrutura clara e conteúdo focado para que seu perfil chegue à leitura humana.' },
        { title: 'Privado por padrão', description: 'As regras de cada mercado ajudam a evitar dados pessoais desnecessários.' },
      ],
    },
    finalCta: { eyebrow: 'Comece hoje', title: 'Seu próximo destino não deve obrigar você a começar do zero.', button: 'Criar conta' },
    donations: {
      eyebrow: 'Um pequeno gesto faz diferença',
      title: 'Que tal nos pagar um café ou almoço?',
      description: 'O adaptaCV é gratuito e feito com muito carinho. Se ele ajudou você, que tal nos pagar um café ou almoço para nos ajudar a continuar melhorando?',
      caption: 'Sua contribuição é opcional. Obrigado por estar com a gente!',
      chooseAmount: 'Escolha quanto deseja contribuir',
      customAmount: 'Outro',
      customAmountLabel: 'Valor em dólares (USD)',
      customAmountPlaceholder: 'Por exemplo, 15',
      amountLimit: 'De US$ 1 a US$ 500.',
      loading: 'Preparando o PayPal...',
      unavailable: 'As doações pelo PayPal não estão disponíveis no momento.',
      processing: 'Confirmando sua contribuição com o PayPal...',
      thankYou: 'Muito obrigado pelo {amount}! Sua contribuição foi confirmada.',
      invalidAmount: 'Escolha um valor entre US$ 1 e US$ 500.',
      cancelled: 'A doação foi cancelada. Você pode tentar novamente quando quiser.',
      error: 'Não foi possível processar a doação. Tente novamente.',
    },
    workspace: { navigation: 'Navegação da conta', profile: 'Meu perfil', cvs: 'CVs', portfolios: 'Portfólios', coverLetter: 'Carta de apresentação' },
    cvPreview: { profile: 'Perfil', visa: 'Visto', education: 'Formação', experience: 'Experiência', skills: 'Competências', languagesAndInterests: 'Idiomas e interesses', employmentRecommendations: 'Recomendações profissionais' },
    editor: {
      title: 'Editor de CV', saving: 'Salvando alterações...', downloadPdf: 'Baixar PDF', generatingPdf: 'Gerando PDF...', downloadLanguageTitle: 'Idioma do PDF', downloadLanguageText: 'Selecione o idioma dos títulos do CV.', confirmDownload: 'Baixar', portfolios: 'Portfólios', destinationCountry: 'País de destino', loadingCountries: 'Carregando países...', professionalProfile: 'Perfil profissional', professionalProfileText: 'Campos compartilhados por mercados globais.', photoUrl: 'URL da foto profissional', includePhoto: 'Incluir foto no CV', photoOptionalHint: 'A foto é opcional e recomendada apenas quando o mercado permite.', photoOptionalWarning: 'A foto pode ser adicionada se você quiser, mas evite-a quando o mercado não a recomenda.', fullName: 'Nome completo', targetRole: 'Cargo desejado', email: 'E-mail', phone: 'Telefone', city: 'Cidade', country: 'País', availability: 'Disponibilidade', professionalSummary: 'Resumo profissional', migration: 'Status migratório / Visto', migrationOptions: 'Opções carregadas da configuração de {country}.', currentStatus: 'Status atual', workAvailability: 'Disponibilidade para trabalhar', loadingStatuses: 'Carregando status...', education: 'Formação', educationText: 'Mapeamento local para filtros ATS e recrutadores.', addEducation: 'Adicionar formação', originalCredential: 'Formação original', localLevel: 'Nível local equivalente', from: 'De', until: 'Até', institution: 'Instituição', loadingLevels: 'Carregando níveis...', experience: 'Experiência', addExperience: 'Adicionar experiência', role: 'Cargo', company: 'Empresa', impactSummary: 'Resumo de impacto', skillsText: 'Tecnologias e competências relevantes para este CV.', languagesAndInterests: 'Idiomas e interesses', languages: 'Idiomas', interests: 'Interesses', skillPlaceholder: 'Buscar ou adicionar competência', languagePlaceholder: 'Ex.: Inglês - Avançado C1', interestPlaceholder: 'Ex.: Fotografia urbana', credentialPlaceholder: 'Ex.: Mestrado em Engenharia', yearPlaceholder: 'Ano', endYearPlaceholder: 'Atual ou ano', institutionPlaceholder: 'Ex.: Universidade de São Paulo', rolePlaceholder: 'Ex.: Desenvolvedor Full Stack', companyPlaceholder: 'Ex.: adaptacv', impactPlaceholder: 'Descreva responsabilidades, resultados e ferramentas utilizadas.', cancel: 'Cancelar', delete: 'Excluir', close: 'Fechar',
      sendEmail: 'Enviar por e-mail', sendingEmail: 'Enviando...', emailTitle: 'Enviar CV por e-mail', recipientEmail: 'Destinatário', emailSubject: 'Assunto', emailMessage: 'Mensagem', emailLanguage: 'Idioma do PDF', sendEmailConfirm: 'Enviar e-mail', emailBody: 'Em anexo você encontrará meu CV para sua consideração.', emailSubjectDefault: 'CV - {name}', emailSent: 'CV enviado com sucesso por e-mail.', completeEmailFields: 'Preencha destinatário, assunto e mensagem.', emailFailed: 'Não foi possível enviar o CV por e-mail.',
      recommendations: 'Recomendações profissionais', recommendationsText: 'Anexe uma carta de recomendação para apoiar sua experiência.', addRecommendation: 'Adicionar recomendação', uploadingRecommendation: 'Enviando recomendação...', recommendationRequirements: 'Somente PDF. Máximo de 1 arquivo por envio e 5 MB por arquivo.', recommendationPdfOnly: 'Você só pode anexar arquivos PDF.', recommendationMaxSize: 'O arquivo não pode exceder 5 MB.', recommendationFailed: 'Não foi possível enviar a recomendação.', deleteRecommendation: 'Excluir recomendação', recommendationDeleteFailed: 'Não foi possível excluir a recomendação.', openRecommendation: 'Abrir recomendação', openingRecommendation: 'Abrindo recomendação...', recommendationOpenFailed: 'Não foi possível abrir a recomendação.', deleteConfirmationTitle: 'Excluir este item?', deleteConfirmationText: 'Isto removerá', deleteConfirmationWarning: 'Esta ação não pode ser desfeita.',
    },
    profile: {
      eyebrow: 'Espaço de carreira', greeting: 'Olá, {name}', subtitle: 'Seu perfil está tomando forma e pronto para cada idioma e destino.', createCv: 'Criar CV', editCv: 'Editar CV', logout: 'Sair', completion: 'Perfil pronto', completionText: 'Seu CV já contém as informações essenciais para começar a se candidatar.', experience: 'Experiência profissional', experienceText: 'Transforme suas responsabilidades em evidências de impacto.', addExperience: 'Adicionar experiência', role: 'Cargo', company: 'Empresa', period: 'Período', impact: 'Resultado ou impacto', documents: 'Seus documentos', documentsText: 'Gere versões prontas para sua próxima candidatura.', downloadCv: 'Baixar CV', coverLetter: 'Carta de apresentação', generateLetter: 'Gerar carta', letterTitle: 'Carta de apresentação', recipient: 'Empresa ou recrutador', recipientPlaceholder: 'Ex.: Acme Ireland', generate: 'Gerar', copy: 'Copiar texto', copied: 'Copiado', letterBody: 'Prezada equipe da {company},\n\nGostaria de me candidatar às oportunidades para {role}. Minha experiência em {skills} e meu perfil internacional me permitem trazer uma perspectiva focada no cliente desde o primeiro dia.\n\nGostaria de conversar sobre como posso contribuir com sua equipe.\n\nAtenciosamente,\n{name}', security: 'Segurança da conta', emailVerified: 'E-mail verificado', currentPassword: 'Senha atual', newPassword: 'Nova senha', confirmPassword: 'Confirmar nova senha', updatePassword: 'Atualizar senha', passwordUpdated: 'Senha atualizada.', logoutAll: 'Sair de todos os dispositivos', processing: 'Processando...', securityError: 'Não foi possível atualizar a senha.',
    },
    footer: { motto: 'Carreiras sem fronteiras', destination: 'Um perfil. Todos os destinos.', sponsoredBy: 'Patrocinado por', createdBy: 'Criado por', creatorRole: 'Fullstack Developer' },
    auth: {
      signupTitle: 'Crie sua conta', loginTitle: 'Que bom ver você novamente', signupDescription: 'Comece a preparar seu perfil para o mercado escolhido.', loginDescription: 'Acesse seu CV e suas candidaturas.', close: 'Fechar', name: 'Nome completo', namePlaceholder: 'Seu nome', email: 'E-mail', emailPlaceholder: 'voce@email.com', password: 'Senha', passwordPlaceholder: 'Pelo menos 8 caracteres', confirmPassword: 'Confirmar senha', confirmPasswordPlaceholder: 'Repita sua senha', signupButton: 'Criar conta grátis', loginButton: 'Entrar', hasAccount: 'Já tem uma conta?', noAccount: 'Ainda não tem uma conta?', switchToLogin: 'Entrar', switchToSignup: 'Crie uma grátis', submitting: 'Processando...', error: 'Não foi possível autenticar. Tente novamente.', verificationSent: 'Verifique seu e-mail para confirmar sua conta antes de entrar.', forgotPasswordTitle: 'Recupere sua senha', forgotPasswordDescription: 'Informe seu e-mail e enviaremos um link seguro para redefinir sua senha.', forgotPassword: 'Esqueci minha senha', forgotPasswordButton: 'Enviar link de recuperação', passwordResetSent: 'Se existir uma conta com este e-mail, você receberá um link para redefinir sua senha.', backToLogin: 'Voltar para entrar',
    },
  },
}

Object.assign(messages.es, {
  cookies: {
    languageLabel: 'Idioma', title: 'Tu privacidad', description: 'Usamos almacenamiento esencial para el funcionamiento del sitio. Con tu permiso, Google Analytics nos ayuda a entender el uso de adaptaCV.', analyticsTitle: 'Analítica', analyticsDescription: 'Nos permite medir visitas y mejorar el servicio. No se activa sin tu consentimiento.', reject: 'Rechazar', configure: 'Configurar', save: 'Guardar elección', acceptAll: 'Aceptar todo', manage: 'Cookies',
  },
})

Object.assign(messages.en, {
  cookies: {
    languageLabel: 'Language', title: 'Your privacy', description: 'We use essential storage for the website to work. With your permission, Google Analytics helps us understand how adaptaCV is used.', analyticsTitle: 'Analytics', analyticsDescription: 'This helps us measure visits and improve the service. It is not enabled without your consent.', reject: 'Reject', configure: 'Customize', save: 'Save choice', acceptAll: 'Accept all', manage: 'Cookies',
  },
})

Object.assign(messages['pt-BR'], {
  cookies: {
    languageLabel: 'Idioma', title: 'Sua privacidade', description: 'Usamos armazenamento essencial para o funcionamento do site. Com sua permissão, o Google Analytics nos ajuda a entender o uso do adaptaCV.', analyticsTitle: 'Análises', analyticsDescription: 'Isso nos permite medir visitas e melhorar o serviço. Não é ativado sem o seu consentimento.', reject: 'Recusar', configure: 'Configurar', save: 'Salvar escolha', acceptAll: 'Aceitar tudo', manage: 'Cookies',
  },
})

Object.assign(messages.es.editor, {
  mobileViewLabel: 'Vista del editor', editMode: 'Editar contenido', previewMode: 'Vista previa', previewHint: 'Hoja A4 a escala',
  sendEmail: 'Enviar por correo', sendingEmail: 'Enviando...', emailTitle: 'Enviar CV por correo', recipientEmail: 'Destinatario', emailSubject: 'Asunto', emailMessage: 'Mensaje', emailLanguage: 'Idioma del PDF', sendEmailConfirm: 'Enviar correo', emailBody: 'Adjunto encontrarás mi CV para tu consideración.', emailSubjectDefault: 'CV - {name}', emailSent: 'CV enviado correctamente por correo electrónico.', completeEmailFields: 'Completa el destinatario, asunto y mensaje.', emailFailed: 'No fue posible enviar el CV por correo.',
  recommendations: 'Recomendaciones laborales', recommendationsText: 'Adjunta una carta de recomendación para respaldar tu experiencia.', addRecommendation: 'Agregar recomendación', uploadingRecommendation: 'Subiendo recomendación...', recommendationRequirements: 'Solo PDF. Máximo 1 archivo por carga y 5 MB por archivo.', recommendationPdfOnly: 'Solo puedes adjuntar archivos PDF.', recommendationMaxSize: 'El archivo no puede superar los 5 MB.', recommendationFailed: 'No fue posible subir la recomendación.',
  deleteRecommendation: 'Eliminar recomendación', recommendationDeleteFailed: 'No fue posible eliminar la recomendación.',
  openRecommendation: 'Abrir recomendación', openingRecommendation: 'Abriendo recomendación...', recommendationOpenFailed: 'No fue posible abrir la recomendación.',
  deleteConfirmationTitle: '¿Eliminar este elemento?', deleteConfirmationText: 'Se eliminará', deleteConfirmationWarning: 'Esta acción no se puede deshacer.',
})

Object.assign(messages.en.editor, {
  mobileViewLabel: 'Editor view', editMode: 'Edit content', previewMode: 'Preview', previewHint: 'Scaled A4 page',
  sendEmail: 'Send by email', sendingEmail: 'Sending...', emailTitle: 'Send CV by email', recipientEmail: 'Recipient', emailSubject: 'Subject', emailMessage: 'Message', emailLanguage: 'PDF language', sendEmailConfirm: 'Send email', emailBody: 'Please find my CV attached for your consideration.', emailSubjectDefault: 'CV - {name}', emailSent: 'CV sent successfully by email.', completeEmailFields: 'Complete the recipient, subject, and message.', emailFailed: 'We could not send the CV by email.',
  recommendations: 'Employment recommendations', recommendationsText: 'Attach a recommendation letter to support your experience.', addRecommendation: 'Add recommendation', uploadingRecommendation: 'Uploading recommendation...', recommendationRequirements: 'PDF only. Maximum 1 file per upload and 5 MB per file.', recommendationPdfOnly: 'You can only attach PDF files.', recommendationMaxSize: 'The file cannot exceed 5 MB.', recommendationFailed: 'We could not upload the recommendation.',
  deleteRecommendation: 'Delete recommendation', recommendationDeleteFailed: 'We could not delete the recommendation.',
  openRecommendation: 'Open recommendation', openingRecommendation: 'Opening recommendation...', recommendationOpenFailed: 'We could not open the recommendation.',
  deleteConfirmationTitle: 'Delete this item?', deleteConfirmationText: 'This will remove', deleteConfirmationWarning: 'This action cannot be undone.',
})

Object.assign(messages['pt-BR'].editor, {
  mobileViewLabel: 'Visualização do editor', editMode: 'Editar conteúdo', previewMode: 'Prévia', previewHint: 'Página A4 em escala',
  sendEmail: 'Enviar por email', sendingEmail: 'Enviando...', emailTitle: 'Enviar CV por email', recipientEmail: 'Destinatário', emailSubject: 'Assunto', emailMessage: 'Mensagem', emailLanguage: 'Idioma do PDF', sendEmailConfirm: 'Enviar email', emailBody: 'Segue em anexo o meu CV para sua consideração.', emailSubjectDefault: 'CV - {name}', emailSent: 'CV enviado com sucesso por email.', completeEmailFields: 'Complete o destinatário, assunto e mensagem.', emailFailed: 'Não foi possível enviar o CV por email.',
  recommendations: 'Recomendações de emprego', recommendationsText: 'Anexe uma carta de recomendação para apoiar sua experiência.', addRecommendation: 'Adicionar recomendação', uploadingRecommendation: 'Enviando recomendação...', recommendationRequirements: 'Apenas PDF. Máximo de 1 arquivo por envio e 5 MB por arquivo.', recommendationPdfOnly: 'Você só pode anexar arquivos PDF.', recommendationMaxSize: 'O arquivo não pode exceder 5 MB.', recommendationFailed: 'Não foi possível enviar a recomendação.',
  deleteRecommendation: 'Excluir recomendação', recommendationDeleteFailed: 'Não foi possível excluir a recomendação.',
  openRecommendation: 'Abrir recomendação', openingRecommendation: 'Abrindo recomendação...', recommendationOpenFailed: 'Não foi possível abrir a recomendação.',
  deleteConfirmationTitle: 'Excluir este item?', deleteConfirmationText: 'Isso removerá', deleteConfirmationWarning: 'Esta ação não pode ser desfeita.',
})

Object.assign(messages.es.cvPreview, {
  employmentRecommendations: 'Recomendaciones laborales',
})

Object.assign(messages.en.cvPreview, {
  employmentRecommendations: 'Employment recommendations',
})

Object.assign(messages['pt-BR'].cvPreview, {
  employmentRecommendations: 'Recomendações de emprego',
})

messages.es.cvLibrary = {
  eyebrow: 'Biblioteca personal', title: 'Tus CVs, listos para cada oportunidad.', description: 'Crea una versión específica para cada rol y mantén tu experiencia enfocada en lo que cada aplicación necesita.', addCv: 'Agregar CV', countOne: 'CV creado', countMany: 'CVs creados', chooseCv: 'Elige un CV para continuar editándolo.', duplicateCv: 'Duplicar CV', duplicatingCv: 'Duplicando CV...', duplicateName: 'Copia de {name}', duplicateFailed: 'No fue posible duplicar el CV.', deleteCv: 'Eliminar CV', customCv: 'CV personalizado', undefinedSector: 'Rubro sin definir', openEditor: 'Abrir editor', loadingCvs: 'Cargando tus CVs...', createAnother: 'Crear otro CV', createAnotherDescription: 'Para gastronomía, mecánica o el próximo rol que estés buscando.', close: 'Cerrar', createTitle: 'Crea un CV enfocado', createDescription: 'Define el nombre y el rubro para organizar cada versión de tu perfil.', cvName: 'Nombre del CV', cvNamePlaceholder: 'Ej. Gastronomía internacional', sector: 'Rubro', sectorPlaceholder: 'Busca un rubro', loadingSectors: 'Cargando rubros...', noSectors: 'No encontramos ese rubro.', creating: 'Creando...', createAndEdit: 'Crear y editar', deleteTitle: '¿Eliminar este CV?', deletePrefix: 'Se eliminará', deleteWarning: 'Esta acción no se puede deshacer.', cancel: 'Cancelar', deleting: 'Eliminando...', delete: 'Eliminar', nameRequired: 'Ingresa un nombre para el CV.', sectorRequired: 'Selecciona un rubro.', createFailed: 'No fue posible crear el CV.', deleteFailed: 'No fue posible eliminar el CV.', industriesFailed: 'No fue posible obtener las industrias.',
}

messages.en.cvLibrary = {
  eyebrow: 'Personal library', title: 'Your CVs, ready for every opportunity.', description: 'Create a tailored version for each role and keep your experience focused on what every application needs.', addCv: 'Add CV', countOne: 'CV created', countMany: 'CVs created', chooseCv: 'Choose a CV to continue editing.', duplicateCv: 'Duplicate CV', duplicatingCv: 'Duplicating CV...', duplicateName: 'Copy of {name}', duplicateFailed: 'We could not duplicate the CV.', deleteCv: 'Delete CV', customCv: 'Tailored CV', undefinedSector: 'Sector not specified', openEditor: 'Open editor', loadingCvs: 'Loading your CVs...', createAnother: 'Create another CV', createAnotherDescription: 'For hospitality, engineering, or the next role you are pursuing.', close: 'Close', createTitle: 'Create a focused CV', createDescription: 'Choose a name and sector to organize each version of your profile.', cvName: 'CV name', cvNamePlaceholder: 'E.g. International hospitality', sector: 'Sector', sectorPlaceholder: 'Search for a sector', loadingSectors: 'Loading sectors...', noSectors: 'No matching sector found.', creating: 'Creating...', createAndEdit: 'Create and edit', deleteTitle: 'Delete this CV?', deletePrefix: 'This will delete', deleteWarning: 'This action cannot be undone.', cancel: 'Cancel', deleting: 'Deleting...', delete: 'Delete', nameRequired: 'Enter a name for the CV.', sectorRequired: 'Select a sector.', createFailed: 'We could not create the CV.', deleteFailed: 'We could not delete the CV.', industriesFailed: 'We could not load the sectors.',
}

messages['pt-BR'].cvLibrary = {
  eyebrow: 'Biblioteca pessoal', title: 'Seus CVs, prontos para cada oportunidade.', description: 'Crie uma versão específica para cada cargo e mantenha sua experiência focada no que cada candidatura precisa.', addCv: 'Adicionar CV', countOne: 'CV criado', countMany: 'CVs criados', chooseCv: 'Escolha um CV para continuar editando.', duplicateCv: 'Duplicar CV', duplicatingCv: 'Duplicando CV...', duplicateName: 'Cópia de {name}', duplicateFailed: 'Não foi possível duplicar o CV.', deleteCv: 'Excluir CV', customCv: 'CV personalizado', undefinedSector: 'Setor não definido', openEditor: 'Abrir editor', loadingCvs: 'Carregando seus CVs...', createAnother: 'Criar outro CV', createAnotherDescription: 'Para gastronomia, mecânica ou o próximo cargo que você procura.', close: 'Fechar', createTitle: 'Crie um CV focado', createDescription: 'Defina o nome e o setor para organizar cada versão do seu perfil.', cvName: 'Nome do CV', cvNamePlaceholder: 'Ex.: Gastronomia internacional', sector: 'Setor', sectorPlaceholder: 'Busque um setor', loadingSectors: 'Carregando setores...', noSectors: 'Nenhum setor correspondente encontrado.', creating: 'Criando...', createAndEdit: 'Criar e editar', deleteTitle: 'Excluir este CV?', deletePrefix: 'Será excluído', deleteWarning: 'Esta ação não pode ser desfeita.', cancel: 'Cancelar', deleting: 'Excluindo...', delete: 'Excluir', nameRequired: 'Informe um nome para o CV.', sectorRequired: 'Selecione um setor.', createFailed: 'Não foi possível criar o CV.', deleteFailed: 'Não foi possível excluir o CV.', industriesFailed: 'Não foi possível carregar os setores.',
}

Object.assign(messages.es, {
  wikimigration: {
    homeSection: { title: 'Lo que nadie te cuenta lo encuentras aquí.', description: 'Una comunidad para compartir información práctica sobre requisitos laborales, permisos, idiomas, CVs y pasos previos a una postulación internacional.', supportingText: 'Cada experiencia ayuda a construir una guía más útil y clara para quienes preparan su próximo paso.', action: 'Explorar Wikimigration' },
    home: 'Inicio', community: 'Comunidad colaborativa', tagline: 'Lo que nadie te cuenta lo encuentras aquí. Consulta, contrasta y comparte información útil para tu proyecto migratorio.', communityGuide: 'Una guía construida entre personas.', officialNotice: 'Revisa siempre los requisitos oficiales antes de tomar decisiones migratorias, laborales o de visado.', building: 'Wikimigration está en construcción.', buildingText: 'Pronto podrás compartir experiencias, correcciones y fuentes para ayudar a mejorar las guías.', communityAdaptacv: 'Comunidad adaptacv', search: 'Buscar destino', loading: 'Cargando destinos disponibles...', retry: 'Reintentar', noResults: 'No encontramos destinos con esos filtros.', initialGuide: 'Guía inicial', internationalDestination: 'Destino internacional', initialOverview: 'Información inicial para preparar tu búsqueda laboral y tu CV.', viewGuide: 'Ver guía', nextStep: 'Siguiente paso', readyCv: 'Convierte la información del destino en un CV listo para postular.', createCv: 'Crear mi CV', guide: 'Guía de destino', workIn: 'Trabajar en {name}', guideIntro: 'Una base práctica para ordenar tu CV, tu búsqueda laboral y los documentos que debes verificar antes de avanzar.', back: 'Volver', backToWiki: 'Volver a Wikimigration', sections: { overview: 'Resumen', cv: 'CV y postulación', work: 'Permisos', checklist: 'Checklist' }, beforeStart: 'Antes de comenzar', beforeStartText: 'Los procesos laborales y migratorios cambian según tu perfil, nacionalidad y oferta. Usa esta guía para preparar tu candidatura, y valida los requisitos actuales directamente con las autoridades competentes.', jobOffer: 'Prioriza una oferta concreta', jobOfferText: 'Los requisitos se entienden mejor desde el rol, sector y condiciones de una vacante real.', officialSources: 'Verifica fuentes oficiales', officialSourcesText: 'No tomes decisiones de visado o residencia basándote únicamente en resúmenes de terceros.', cvSearch: 'CV y búsqueda laboral', cvSearchText: 'Adapta el CV al idioma de la oferta y usa un formato claro. Destaca resultados, herramientas y experiencia relevante antes que una lista extensa de responsabilidades.', cvTips: ['Alinea el título profesional con la vacante.', 'Incluye resultados cuantificables y competencias relevantes.', 'Revisa que los datos de contacto y disponibilidad sean actuales.'], permits: 'Permisos y condiciones', permitsText: 'Antes de aceptar una oportunidad, confirma cuál es la autorización necesaria para trabajar, los plazos, requisitos documentales y si el empleador participa en el proceso.', permitsNotice: 'Consulta siempre las fuentes oficiales de inmigración y empleo. Las reglas pueden cambiar y dependen de tus circunstancias personales.', checklistTitle: 'Checklist para avanzar', checklistItems: ['Definir el rol objetivo.', 'Actualizar CV y perfil profesional.', 'Reunir títulos, certificados y referencias.', 'Verificar permisos de trabajo aplicables.', 'Preparar postulaciones adaptadas.', 'Revisar fuentes oficiales antes de tomar decisiones.'], contribute: 'Contribuir a esta sección', contributeTo: 'Contribuir a {section}', contributionBuilding: 'El envío de aportes está en construcción. Pronto podrás compartir experiencias, correcciones y fuentes para mejorar esta guía.', close: 'Cerrar', understood: 'Entendido', prepareCv: 'Prepara tu CV', prepareCvText: 'Crea una versión enfocada en la oportunidad que quieres postular.', goToEditor: 'Ir al editor', notFound: 'Destino no encontrado.', loadFailed: 'No fue posible cargar el destino.', listLoadFailed: 'No fue posible cargar los destinos.',
  },
})

Object.assign(messages.en, {
  wikimigration: {
    homeSection: { title: 'What nobody tells you, you can find here.', description: 'A community for sharing practical information about employment requirements, permits, languages, CVs, and steps before an international application.', supportingText: 'Every experience helps build a more useful, clearer guide for people preparing their next step.', action: 'Explore Wikimigration' },
    home: 'Home', community: 'Collaborative community', tagline: 'What nobody tells you, you can find here. Read, compare, and share useful information for your migration project.', communityGuide: 'A guide built by people.', officialNotice: 'Always check official requirements before making immigration, employment, or visa decisions.', building: 'Wikimigration is under construction.', buildingText: 'Soon you will be able to share experiences, corrections, and sources to help improve the guides.', communityAdaptacv: 'adaptacv community', search: 'Search destination', loading: 'Loading available destinations...', retry: 'Retry', noResults: 'No destinations match those filters.', initialGuide: 'Starter guide', internationalDestination: 'International destination', initialOverview: 'Starter information to prepare your job search and CV.', viewGuide: 'View guide', nextStep: 'Next step', readyCv: 'Turn destination information into a CV ready to apply.', createCv: 'Create my CV', guide: 'Destination guide', workIn: 'Working in {name}', guideIntro: 'A practical foundation to organize your CV, job search, and the documents you need to check before moving forward.', back: 'Back', backToWiki: 'Back to Wikimigration', sections: { overview: 'Overview', cv: 'CV and application', work: 'Permits', checklist: 'Checklist' }, beforeStart: 'Before you start', beforeStartText: 'Employment and immigration processes change depending on your profile, nationality, and offer. Use this guide to prepare your application and confirm current requirements with the appropriate authorities.', jobOffer: 'Prioritize a specific job offer', jobOfferText: 'Requirements are clearer when assessed from the role, sector, and conditions of a real vacancy.', officialSources: 'Check official sources', officialSourcesText: 'Do not make visa or residence decisions based only on third-party summaries.', cvSearch: 'CV and job search', cvSearchText: 'Adapt your CV to the job posting language and use a clear format. Highlight results, tools, and relevant experience rather than a long list of responsibilities.', cvTips: ['Align your professional title with the vacancy.', 'Include measurable results and relevant skills.', 'Make sure your contact details and availability are current.'], permits: 'Permits and conditions', permitsText: 'Before accepting an opportunity, confirm the authorization needed to work, timelines, documentation requirements, and whether the employer takes part in the process.', permitsNotice: 'Always consult official immigration and employment sources. Rules may change and depend on your personal circumstances.', checklistTitle: 'Checklist to move forward', checklistItems: ['Define your target role.', 'Update your CV and professional profile.', 'Gather degrees, certificates, and references.', 'Check applicable work permits.', 'Prepare tailored applications.', 'Review official sources before making decisions.'], contribute: 'Contribute to this section', contributeTo: 'Contribute to {section}', contributionBuilding: 'Contributions are under construction. Soon you will be able to share experiences, corrections, and sources to improve this guide.', close: 'Close', understood: 'Got it', prepareCv: 'Prepare your CV', prepareCvText: 'Create a version focused on the opportunity you want to apply for.', goToEditor: 'Open editor', notFound: 'Destination not found.', loadFailed: 'We could not load the destination.', listLoadFailed: 'We could not load the destinations.',
  },
})

Object.assign(messages['pt-BR'], {
  wikimigration: {
    homeSection: { title: 'O que ninguém te conta você encontra aqui.', description: 'Uma comunidade para compartilhar informações práticas sobre requisitos trabalhistas, permissões, idiomas, CVs e etapas antes de uma candidatura internacional.', supportingText: 'Cada experiência ajuda a construir um guia mais útil e claro para quem prepara seu próximo passo.', action: 'Explorar Wikimigration' },
    home: 'Início', community: 'Comunidade colaborativa', tagline: 'O que ninguém te conta você encontra aqui. Consulte, compare e compartilhe informações úteis para seu projeto migratório.', communityGuide: 'Um guia construído por pessoas.', officialNotice: 'Sempre verifique os requisitos oficiais antes de tomar decisões migratórias, trabalhistas ou de visto.', building: 'Wikimigration está em construção.', buildingText: 'Em breve você poderá compartilhar experiências, correções e fontes para ajudar a melhorar os guias.', communityAdaptacv: 'Comunidade adaptacv', search: 'Buscar destino', loading: 'Carregando destinos disponíveis...', retry: 'Tentar novamente', noResults: 'Não encontramos destinos com esses filtros.', initialGuide: 'Guia inicial', internationalDestination: 'Destino internacional', initialOverview: 'Informações iniciais para preparar sua busca de emprego e seu CV.', viewGuide: 'Ver guia', nextStep: 'Próximo passo', readyCv: 'Transforme as informações do destino em um CV pronto para se candidatar.', createCv: 'Criar meu CV', guide: 'Guia do destino', workIn: 'Trabalhar em {name}', guideIntro: 'Uma base prática para organizar seu CV, sua busca de emprego e os documentos que você precisa verificar antes de avançar.', back: 'Voltar', backToWiki: 'Voltar para Wikimigration', sections: { overview: 'Resumo', cv: 'CV e candidatura', work: 'Permissões', checklist: 'Checklist' }, beforeStart: 'Antes de começar', beforeStartText: 'Os processos trabalhistas e migratórios mudam conforme seu perfil, nacionalidade e oferta. Use este guia para preparar sua candidatura e confirme os requisitos atuais com as autoridades competentes.', jobOffer: 'Priorize uma oferta concreta', jobOfferText: 'Os requisitos ficam mais claros a partir do cargo, setor e condições de uma vaga real.', officialSources: 'Verifique fontes oficiais', officialSourcesText: 'Não tome decisões sobre visto ou residência com base apenas em resumos de terceiros.', cvSearch: 'CV e busca de emprego', cvSearchText: 'Adapte o CV ao idioma da vaga e use um formato claro. Destaque resultados, ferramentas e experiência relevante em vez de uma longa lista de responsabilidades.', cvTips: ['Alinhe seu título profissional à vaga.', 'Inclua resultados mensuráveis e competências relevantes.', 'Verifique se seus dados de contato e disponibilidade estão atualizados.'], permits: 'Permissões e condições', permitsText: 'Antes de aceitar uma oportunidade, confirme a autorização necessária para trabalhar, prazos, documentos e se o empregador participa do processo.', permitsNotice: 'Sempre consulte fontes oficiais de imigração e emprego. As regras podem mudar e dependem das suas circunstâncias pessoais.', checklistTitle: 'Checklist para avançar', checklistItems: ['Definir o cargo desejado.', 'Atualizar o CV e o perfil profissional.', 'Reunir diplomas, certificados e referências.', 'Verificar permissões de trabalho aplicáveis.', 'Preparar candidaturas personalizadas.', 'Revisar fontes oficiais antes de tomar decisões.'], contribute: 'Contribuir para esta seção', contributeTo: 'Contribuir para {section}', contributionBuilding: 'O envio de contribuições está em construção. Em breve você poderá compartilhar experiências, correções e fontes para melhorar este guia.', close: 'Fechar', understood: 'Entendi', prepareCv: 'Prepare seu CV', prepareCvText: 'Crie uma versão focada na oportunidade para a qual deseja se candidatar.', goToEditor: 'Ir para o editor', notFound: 'Destino não encontrado.', loadFailed: 'Não foi possível carregar o destino.', listLoadFailed: 'Não foi possível carregar os destinos.',
  },
})