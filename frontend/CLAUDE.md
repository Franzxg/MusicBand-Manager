# Frontend (React + Material UI)

Valgono anche le regole del `CLAUDE.md` nella radice. Specifiche: `docs/specifiche.md`, sezione "Frontend" e, per la chat, "Integrazione AI (Ollama)". Dal momento in cui esiste `docs/API.md`, i dati dell'API si leggono da lì.

## Impostazione

- Vite, React e JavaScript (JSX), senza TypeScript. ESLint attivo. Nessun test frontend richiesto: devono passare `npm run lint` e `npm run build`.
- Librerie ammesse: `@mui/material`, `@mui/icons-material`, MUI X Date Pickers (community) con `dayjs`, `@fullcalendar/react` (daygrid, list, interaction), `@dnd-kit/core` e `@dnd-kit/sortable`, `react-i18next`, `axios`, `react-router-dom`, `@fontsource/atkinson-hyperlegible`. Nessun'altra libreria senza chiedere.
- Struttura di `src/`: `api/` (client axios e funzioni per risorsa), `context/` (auth, tema, lingua), `hooks/` (es. `useBands`), `pages/`, `components/`, `locales/` (`it.json`, `en.json`), `theme/`.
- Stato globale solo con Context API. I dati del server si leggono con axios dentro hook dedicati.

## Regole da rispettare

- **Route** come nella tabella "Route" delle specifiche. Pagine protette: senza token vanno a `/login`; una risposta 401 esegue il logout e riporta a `/login`.
- **Client API**: istanza axios con `baseURL = import.meta.env.VITE_API_URL`. Un interceptor aggiunge `Authorization: Bearer <token>` e `Accept-Language`.
- **i18n**: nessun testo scritto nei componenti. Ogni chiave va in `it.json` e in `en.json`. Lingua iniziale: quella del browser se è it o en, altrimenti italiano; scelta salvata nel browser.
- **Tema**: scuro di default (non segue il sistema), chiaro e scuro con interruttore, scelta salvata in localStorage. Colori solo dalla palette `#0D1B2A`, `#1B263B`, `#415A77`, `#778DA9`, `#FFFFFF`, definiti una volta nel tema (nessun codice colore sparso nei componenti). Unica eccezione: il rosso di errore di MUI per errori ed eliminazioni.
- **Font**: Atkinson Hyperlegible (pesi 400 e 700) dal pacchetto `@fontsource`, nessuna richiesta a Google Fonts.
- **Accessibilità**: stati delle canzoni distinti da icona ed etichetta, non solo dal colore. Etichette sui campi, `aria-label` sui pulsanti con sola icona, riordino della scaletta usabile anche da tastiera. Testo con contrasto almeno 4.5:1; `#778DA9` come testo solo su `#0D1B2A`.
- **Responsive**: l'app deve funzionare su smartphone (da 360 px), tablet e PC. Parti dallo smartphone (mobile-first) con i breakpoint di MUI, nessuno scorrimento orizzontale della pagina, target tattili di almeno 44 px, niente funzioni solo al passaggio del mouse. Navbar a cassetto su `xs`/`sm`; dashboard a una colonna su smartphone; calendario in vista elenco (`listMonth`) su smartphone; tab scorrevoli; canzoni come righe impilate su smartphone invece di tabelle larghe; finestre di dialogo a schermo intero su `xs`; riordino della scaletta al tocco con maniglia e pulsanti "sposta su/giù"; chat a tutta altezza (`100dvh`). Dettagli nella sezione "Responsive" delle specifiche.
- **Date**: dayjs. L'orario inserito è locale e va inviato in UTC (ISO 8601); le date ricevute si mostrano nel fuso del browser e nella lingua scelta.
- **Stati dell'interfaccia**: ogni elenco ha caricamento, stato vuoto con invito ad agire ed errore. Gli errori 422 compaiono sotto il campo; gli errori di rete in una Snackbar. Le eliminazioni chiedono conferma.
- **Progresso e durata** della scaletta si mostrano così come arrivano dall'API (`progress_percent`, `total_duration_seconds` in mm:ss): il frontend non li ricalcola.

## Docker

- `frontend/Dockerfile` multi-stage: `node` LTS (`npm ci`, `npm run build`, con `VITE_API_URL` come build arg) e poi `nginx:alpine` con fallback su `index.html`.
- Porta 3000 sull'host. Se cambia l'URL dell'API serve `docker compose up --build`.

## Prima di ogni commit

1. `npm --prefix frontend run lint` e `npm --prefix frontend run build` senza errori.
2. Nessun testo fisso nei componenti e nessuna chiave mancante in uno dei due file di lingua.
3. Prova nel browser il flusso toccato a 360, 768 e 1280 px, in tema chiaro e scuro e nelle due lingue.
