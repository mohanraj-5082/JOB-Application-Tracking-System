export function getApiErrorMessage(error, fallback) {
  const responseData = error?.response?.data

  if (error?.code === 'API_BASE_URL_MISSING') {
    return 'The frontend API URL is not configured. Set VITE_API_BASE_URL and restart the app.'
  }

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData.trim()
  }

  if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
    const messages = Object.values(responseData).filter(
      (value) => typeof value === 'string' && value.trim(),
    )
    if (messages.length > 0) return messages.join(' ')
  }

  if (error?.response?.status === 404) {
    return 'The job could not be found. It may have already been removed.'
  }

  if (error?.response?.status === 401) {
    return 'Your session has expired. Please sign in again.'
  }

  if (error?.response?.status === 400) {
    return 'The request could not be completed. Please check the entered values.'
  }

  if (error?.response?.status >= 500) {
    return 'The server is unavailable right now. Please try again later.'
  }

  if (!error?.response) {
    return 'Unable to reach the server. Check that the backend is running and try again.'
  }

  return fallback
}
