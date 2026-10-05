# Piano di lavoro

Consegna: **martedì 6 ottobre 2026, ore 23:59:59**. Il piano prevede 3 giorni di sviluppo e 2 di margine per provare tutto, sistemare e consegnare.

## Come usarlo

- Apri Claude Code nella radice del repository, dove c'è `CLAUDE.md`.
- Una fase alla volta: scrivi `/fase 3` (il comando legge la fase indicata qui sotto).
- A fine fase: `/verifica`, poi controlla tu stesso il risultato (browser, Postman, Mailpit) e fai `/clear` prima della fase successiva. Le regole stanno in `CLAUDE.md`, non nella chat, quindi puoi azzerare il contesto senza perdere nulla.
- Se cambi una scelta del progetto, aggiorna `docs/specifiche.md`: è la fonte di verità.
- A casa, nel tuo `.env`, lascia `COMPOSE_PROFILES=` vuoto per non avviare Ollama. Il modello si scarica e si prova solo sul PC di lavoro.

## Calendario

| Giorno | Fasi       | A fine giornata deve funzionare                                               |
| ------ | ---------- | ----------------------------------------------------------------------------- |
| 1      | 0, 1, 2, 3 | Tutto il backend, testato, con dati demo                                      |
| 2      | 4, 5, 6, 7 | API documentata e collection Postman; frontend completo tranne chat e profilo |
| 3      | 8, 9       | Chat AI, profilo, README e clone pulita funzionante                           |
| 4-5    | margine    | Prove complete, correzioni, screenshot, consegna                              |

## Fasi

### Fase 0 - Scheletro del monorepo e Docker

- **Leggi**: "Panoramica", "Docker & deployment" (struttura, servizi, dettagli, variabili).
- **Fai**:
  - Verifica che `.gitignore` e `.gitattributes` esistano e siano completi (a capo LF per script e configurazioni) e crea `.env.example`.
  - `backend/` con Laravel in modalità API (Sanctum, CORS, driver come da `backend/CLAUDE.md`).
  - `frontend/` con Vite, React e MUI (solo una pagina segnaposto).
  - Attenzione: `backend/` e `frontend/` contengono già un `CLAUDE.md`, quindi i generatori (`composer create-project`, `npm create vite`) non accettano la cartella. Genera ogni progetto in una cartella temporanea (fuori dal repository o in `_tmp/`), copia i file dentro `backend/` o `frontend/` senza sovrascrivere il `CLAUDE.md` e cancella la cartella temporanea.
  - PHP e Composer non servono sul PC: Laravel si crea con l'immagine Docker `composer:2` e poi gira nei container.
  - `docker/nginx/default.conf`, entrypoint del backend (migrazioni e seeder all'avvio) e `docker-compose.yml` con `db`, `backend`, `nginx`, `mailpit`, `frontend`.
  - Nessuna logica applicativa.
- **Fatto quando**: da cartella pulita `cp .env.example .env && docker compose up --build` avvia tutto; `http://localhost:8000/up` risponde 200 e `http://localhost:3000` mostra la pagina segnaposto; nessuna cartella `.git` dentro `backend/` o `frontend/`.

### Fase 1 - Database e autenticazione

- **Leggi**: "Database" (tutta), "Backend & API" (principi generali, endpoint di Auth e Profilo, regole di Reset password e Password, Profilo e dati personali, Regole di validazione).
- **Fai**:
  - Le migration delle 8 tabelle applicative con vincoli, indici e `ON DELETE CASCADE`, e i modelli con le relazioni.
  - Registrazione, login, logout, `me`, modifica profilo, cambio password, eliminazione account.
  - Reset password via Mailpit con link verso il frontend.
  - Middleware della lingua con `lang/it` e `lang/en`.
  - Feature test.
- **Fatto quando**: i test passano, `migrate:fresh` funziona e l'email di reset compare in Mailpit (`http://localhost:8025`) con il link giusto.

### Fase 2 - Band, membri e strumenti

- **Leggi**: "Backend & API" (endpoint Band e membri, regole di Codice di invito, Creazione band, Uscita e rimozione, Strumenti, Regole di validazione).
- **Fai**:
  - Controller, Form Request, Resource e Policy delle band.
  - Codice di invito con ingresso (`join`) e limite di tentativi.
  - Strumenti multipli per membro.
  - Rimozione di un membro e uscita dalla band.
  - Eliminazione automatica della band quando esce l'ultimo membro.
  - Test.
- **Fatto quando**: i test coprono creazione, ingresso con codice, strumenti, rimozione, uscita dell'ultimo membro e accesso negato a chi non è membro (403).

### Fase 3 - Repertorio, live, scaletta, prove e calendario

- **Leggi**: "Backend & API" (endpoint di Repertorio, Live, Prove, Calendario, regole della Scaletta, Valori calcolati), "Database" (Indici, vincoli e regole).
- **Fai**:
  - CRUD di canzoni, live e prove, con il vincolo anti-duplicati sulle canzoni.
  - Scaletta: aggiunta (da repertorio o con brano nuovo creato nel repertorio), riordino, sostituzione (`PUT .../setlist`), rimozione, copia da un altro live.
  - Calcolo di durata e progresso con query aggregata.
  - Endpoint del calendario.
  - Seeder dimostrativo come da specifiche (account demo, band, ~15 canzoni, live, prove).
  - Test.
- **Fatto quando**: i test passano e `migrate:fresh --seed` produce i dati demo. Il file `docs/API.md` non esiste ancora.

### Fase 4 - API.md e collection Postman

- **Leggi**: "Backend & API" (Endpoint, Collection Postman).
- **Fai**:
  - `docs/API.md` con richiesta e risposta di esempio di ogni endpoint (risposte reali ottenute dall'API, non inventate). Il frontend si baserà su questo file.
  - `docs/postman/music-band-manager.postman_collection.json` e `docs/postman/local.postman_environment.json`, come da specifiche (token e id salvati dagli script, test di base).
  - Se possibile, verifica la collection con `npx newman run`.
  - La richiesta della chat si segna come "da completare nella fase 8".
- **Fatto quando**: ogni endpoint della tabella ha il suo esempio e la sua richiesta Postman.

### Fase 5 - Frontend: base

- **Leggi**: "Frontend" (Route, Autenticazione, Tema lingue e font, Responsive, Note tecniche, Guida), `docs/API.md`.
- **Fai**:
  - Tema MUI chiaro e scuro con la palette, font, `react-i18next` (it/en), router con pagine protette, client axios con interceptor, Context (auth, tema, lingua).
  - Navbar e layout.
  - Pagine: login, registrazione, password dimenticata, reset, 404 e Guida.
  - Dockerfile del frontend con `VITE_API_URL` come build arg.
- **Fatto quando**: da `http://localhost:3000` si registra, si accede, si esce e si reimposta la password (link da Mailpit); tema e lingua si cambiano e restano salvati; navbar e form si usano bene a 360, 768 e 1280 px.

### Fase 6 - Frontend: dashboard, calendario e band

- **Leggi**: "Frontend" (Dashboard, Moduli e azioni, Dettaglio Band: intestazione e Membri), `docs/API.md`.
- **Fai**:
  - Lista delle band con creazione e ingresso con codice.
  - Calendario aggregato con FullCalendar (live pieni, prove con contorno, click sull'evento).
  - Pagina della band con i tab e il tab Membri: strumenti modificabili solo per sé, codice di invito copiabile e rigenerabile, rimozione, uscita, eliminazione della band con conferma.
- **Fatto quando**: con i dati demo il flusso funziona nelle due lingue e nei due temi; dashboard e calendario si usano bene a 360, 768 e 1280 px.

### Fase 7 - Frontend: repertorio, live e scaletta

- **Leggi**: "Frontend" (Repertorio, Live, Prove, Dettaglio Live e scaletta, Modello Canzone, Moduli e azioni), `docs/API.md`.
- **Fai**:
  - Tab Repertorio: elenco, ricerca, filtro per stato, aggiunta, modifica, eliminazione con conferma, cambio rapido dello stato.
  - Tab Live e Prove: elenchi e form con DateTimePicker.
  - Pagina del live: scaletta riordinabile con dnd-kit (anche da tastiera), aggiunta da repertorio o con brano nuovo, note del live e della scaletta, barra di progresso e durata totale dall'API, copia da un altro live.
- **Fatto quando**: si costruisce una scaletta completa e progresso e durata cambiano al variare degli stati; elenchi e riordino (anche al tocco) funzionano a 360, 768 e 1280 px.

### Fase 8 - Chat AI (Ollama)

- **Leggi**: "Integrazione AI (Ollama)" (tutta), "Docker & deployment" (ollama, Avvio senza Ollama).
- **Fai**:
  - Backend: `AiChatService`, `BandContextBuilder`, `OllamaClient`, `OpenRouterClient` (fallback, spento di default), schema JSON con `enum` degli id, endpoint della chat, test con `Http::fake`.
  - Docker: servizi `ollama` e `ollama-pull` nel profilo `ai`, `COMPOSE_PROFILES=ai` nel `.env.example`, timeout FastCGI a 180 secondi.
  - Frontend: `ChatWindow` con suggerimenti, card della proposta di scaletta e salvataggio.
  - Aggiungi la richiesta della chat alla collection Postman e a `docs/API.md`.
- **Fatto quando**: con Ollama attivo la chat risponde e propone una scaletta che si salva; senza Ollama la chat mostra "AI non disponibile" e il resto dell'app funziona.
- **Nota**: scarica il modello solo sul PC di lavoro.

### Fase 9 - Profilo, rifiniture, README e consegna

- **Leggi**: "Frontend" (Profilo utente, Tema, lingue e font), "Docker & deployment" (Requisiti del README).
- **Fai**:
  - Pagina Profilo (dati, password, eliminazione account).
  - Band corrente nella Navbar (vedi "Decisioni di implementazione (fase 7)" nelle specifiche).
  - Revisione di stati vuoti, errori, traduzioni complete, contrasti e responsive (360, 768 e 1280 px).
  - README completo come da specifiche e dalle richieste del docente.
  - Poi `/consegna`.
- **Fatto quando**: da una clone pulita, con `cp .env.example .env` e `docker compose up --build`, tutto funziona seguendo solo il README.

## Se il tempo stringe

Tagliare in quest'ordine (dal meno al più importante):

1. `docker-compose.dev.yml` (hot reload): non farlo.
2. Fallback OpenRouter: lasciare solo `OllamaClient`.
3. Pagina Guida: versione breve.
4. Copia della scaletta da un altro live.
5. Ricerca e filtro del repertorio.

Da non tagliare: Docker che parte da zero, README, backend completo e testato, chat AI base, monorepo ordinato.

## Consegna (a mano)

- [ ] Repository su GitHub con tutto pushato, nessun `.env` committato.
- [ ] Docente invitato al repository (il suo username è nel documento degli appunti).
- [ ] Form di consegna compilato entro martedì 6 ottobre 2026, ore 23:59:59.
- [ ] Prova su clone pulita (comando `/consegna`).
- [ ] `git log` senza `Co-Authored-By` né altre firme di Claude.
- [ ] Screenshot in `docs/screenshots/` (anche da smartphone) e riferiti nel README.
