// Errori di validazione 422: { campo: "primo messaggio" }
export function getFieldErrors(error) {
  if (error?.response?.status !== 422) return {}
  const errors = error.response.data?.errors ?? {}
  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [field, messages[0]]),
  )
}

export const isValidationError = (error) => error?.response?.status === 422

// Nessuna risposta dal server (rete assente, API spenta)
export const isNetworkError = (error) => Boolean(error?.request) && !error?.response
