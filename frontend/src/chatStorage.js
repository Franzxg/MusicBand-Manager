// Cronologie della chat AI nel sessionStorage, una per band
export const CHAT_STORAGE_PREFIX = 'chat:'

// Al logout si cancellano tutte, così un altro utente sullo stesso browser non le vede
export function clearChats() {
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(CHAT_STORAGE_PREFIX))
      .forEach((key) => sessionStorage.removeItem(key))
  } catch {
    // sessionStorage non disponibile: niente da cancellare
  }
}
