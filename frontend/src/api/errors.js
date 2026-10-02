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

// Primo errore su un campo array o su un suo elemento (es. "instruments" o "instruments.0")
export function arrayFieldError(fieldErrors, field) {
  if (fieldErrors[field]) return fieldErrors[field]
  const key = Object.keys(fieldErrors).find((name) => name.startsWith(`${field}.`))
  return key ? fieldErrors[key] : undefined
}
