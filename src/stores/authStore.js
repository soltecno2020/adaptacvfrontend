import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const sessionKey = 'adaptacv-session'

function getStoredSession() {
  if (import.meta.server) return null

  try {
    const storedSession = localStorage.getItem(sessionKey)
    return storedSession ? JSON.parse(storedSession) : null
  } catch {
    localStorage.removeItem(sessionKey)
    return null
  }
}

function getApiUrl(path) {
  const { public: { apiBaseUrl } } = useRuntimeConfig()
  return `${apiBaseUrl.replace(/\/$/, '')}${path}`
}

function normalizeResponse(response) {
  if (response?.success === true) return response.data

  const error = new Error(response?.message || 'No fue posible completar la solicitud.')
  error.data = response
  error.errors = response?.errors || null
  throw error
}

function getRequestOptions(options = {}) {
  return {
    headers: {
      Accept: 'application/json',
      ...(options.body && !(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
  }
}

async function request(path, options) {
  try {
    const response = await $fetch(getApiUrl(path), getRequestOptions(options))
    return normalizeResponse(response)
  } catch (error) {
    if (error.data?.success === false) return normalizeResponse(error.data)
    throw error
  }
}

function createStoredSession(user, token) {
  const sessionUser = user?.user || user?.data?.user || user
  const role = typeof sessionUser?.role === 'object'
    ? sessionUser.role?.glosa || sessionUser.role?.name || sessionUser.role?.value
    : sessionUser?.role
  const normalizedRole = typeof role === 'string' ? role.trim().toLowerCase() : null

  return {
    token,
    name: sessionUser?.name?.trim() || sessionUser?.email?.split('@')[0] || '',
    email: sessionUser?.email?.trim() || '',
    photoUrl: sessionUser?.photo_url || sessionUser?.profile_photo_url || sessionUser?.photo?.url || null,
    language: sessionUser?.language?.code || sessionUser?.language_code || null,
    languageId: sessionUser?.language_id || sessionUser?.language?.id || null,
    role: normalizedRole,
    isSuperAdmin: sessionUser?.is_super_admin === true || normalizedRole === 'superadmin',
      requiresCurrentPassword: sessionUser?.requires_current_password !== false,
  }
}

export const useAuthStore = defineStore('auth', () => {
  const session = ref(null)
  const isInitializing = ref(true)
  const isAuthenticated = computed(() => Boolean(session.value?.token))

  async function initialize() {
    session.value = getStoredSession()
    try {
      if (session.value?.token) await fetchCurrentUser()
    } catch {
      // fetchCurrentUser clears an invalid or expired local session.
    } finally {
      isInitializing.value = false
    }
  }

  function saveSession(user, token) {
    session.value = createStoredSession(user, token)
    if (import.meta.client) localStorage.setItem(sessionKey, JSON.stringify(session.value))
  }

  async function authenticate(path, payload) {
    const data = await request(path, {
      method: 'POST',
      body: payload,
    })
    const token = data?.token || data?.access_token

    if (!token) throw new Error('La respuesta de autenticacion no incluye un token.')

    saveSession(data?.user, token)
    return session.value
  }

  async function register({ name, email, password, passwordConfirmation, captchaToken }) {
    return request('/v1/auth/register', {
      method: 'POST',
      body: { name, email, password, password_confirmation: passwordConfirmation, captcha_token: captchaToken },
    })
  }

  function login({ email, password, captchaToken }) {
    return authenticate('/v1/auth/login', { email, password, captcha_token: captchaToken })
  }

  function loginWithGoogle(credential) {
    return authenticate('/v1/auth/google', { credential })
  }

  function requestPasswordReset(email, captchaToken) {
    return request('/v1/auth/forgot-password', {
      method: 'POST',
      body: { email, captcha_token: captchaToken },
    })
  }

  function resetPassword({ token, email, password, passwordConfirmation }) {
    return request('/v1/auth/reset-password', {
      method: 'POST',
      body: {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      },
    })
  }

  async function fetchCurrentUser() {
    if (!session.value?.token) return null

    try {
      const user = await request('/v1/auth/me', {
        headers: { Authorization: `Bearer ${session.value.token}` },
      })
      saveSession(user, session.value.token)
      return user
    } catch (error) {
      destroySession()
      throw error
    }
  }

  async function logout() {
    const token = session.value?.token

    try {
      if (token) {
        await request('/v1/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    } finally {
      destroySession()
    }
  }

  async function logoutAll() {
    const token = session.value?.token

    try {
      if (token) {
        await request('/v1/auth/logout-all', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    } finally {
      destroySession()
    }
  }

  async function updatePassword({ currentPassword, password, passwordConfirmation }) {
    const token = session.value?.token
    if (!token) throw new Error('Debes iniciar sesion para cambiar tu contrasena.')

    return request('/v1/auth/password', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        ...(currentPassword && { current_password: currentPassword }),
        password,
        password_confirmation: passwordConfirmation,
      },
    })
  }

  async function updateLanguage(languageId) {
    const token = session.value?.token
    if (!token) return null

    const user = await request('/v1/auth/language', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: { language_id: languageId },
    })

    session.value = {
      ...session.value,
      name: user?.name?.trim() || session.value.name,
      email: user?.email?.trim() || session.value.email,
      languageId: user?.language_id || user?.language?.id || session.value.languageId,
    }
    if (import.meta.client) localStorage.setItem(sessionKey, JSON.stringify(session.value))
    return user
  }

  async function updateProfilePhoto(photo) {
    const token = session.value?.token
    if (!token) throw new Error('Debes iniciar sesion para actualizar tu foto.')

    const formData = new FormData()
    formData.append('photo', photo, photo.name)
    const user = await request('/v1/auth/profile-photo', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    session.value = {
      ...session.value,
      name: user?.name?.trim() || session.value.name,
      email: user?.email?.trim() || session.value.email,
      photoUrl: user?.photo_url || user?.profile_photo_url || user?.photo?.url || session.value.photoUrl,
    }
    if (import.meta.client) localStorage.setItem(sessionKey, JSON.stringify(session.value))
    return user
  }

  function destroySession() {
    session.value = null
    if (import.meta.client) localStorage.removeItem(sessionKey)
  }

  return { session, isInitializing, isAuthenticated, initialize, register, login, loginWithGoogle, requestPasswordReset, resetPassword, fetchCurrentUser, logout, logoutAll, updatePassword, updateLanguage, updateProfilePhoto, destroySession }
})