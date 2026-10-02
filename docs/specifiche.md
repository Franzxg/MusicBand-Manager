# Rehearsal & Setlist Manager — Specifiche di progetto

Sep 30, 2026

## Panoramica del progetto

Rehearsal & Setlist Manager è una web app fullstack per band musicali: gestisce membri, repertorio, prove, live e scalette, con un assistente AI (Ollama) integrato per rispondere a domande sul gruppo.

**Stack tecnologico**

- Frontend: React + Material UI (MUI), tema chiaro/scuro, interfaccia in italiano e inglese
- Backend: Laravel (API REST)
- Database: MySQL
- AI: Ollama, modello containerizzato in locale
- Containerizzazione: Docker / docker-compose per l'avvio di tutti i servizi

**Utenti**: musicisti che suonano in una o più band contemporaneamente; ogni utente vede solo le band a cui appartiene, con gli strumenti associati.

## Frontend

Pagine e flussi, React + Material UI.

### Route

| Route | Pagina | Accesso |
| --- | --- | --- |
| `/login` | Login | pubblica |
| `/register` | Registrazione | pubblica |
| `/forgot-password` | Password dimenticata | pubblica |
| `/reset-password` | Reset password (`token` ed `email` nella query string) | pubblica |
| `/guide` | Guida | pubblica |
| `/` | Dashboard | login |
| `/bands/:bandId` | Dettaglio Band, con il tab scelto in `?tab=` | login |
| `/bands/:bandId/lives/:liveId` | Dettaglio Live e scaletta | login |
| `/profile` | Profilo | login |
| `*` | Pagina 404 con link alla Dashboard | pubblica |

Senza token le pagine protette portano a `/login`. Una risposta 401 dell'API esegue il logout automatico e riporta a `/login`. Con il token già presente, le pagine di login e registrazione portano alla Dashboard.

### 1. Autenticazione

- **Login**: email + password, con link "Password dimenticata?" e "Come funziona"
- **Registrazione**: nome, email, password + conferma
- **Password dimenticata**: form con la sola email; dopo l'invio mostra una conferma generica
- **Reset password**: pagina raggiunta dal link ricevuto via email (`token` ed `email` nell'URL), con nuova password + conferma
- Se il token è già presente → redirect automatico alla Dashboard

### 2. Dashboard (dopo il login)

- **Lista band** dell'utente: card con nome band, strumenti dell'utente in quella band
- **Crea band** (nome, genere, propri strumenti) e **Unisciti a una band** (codice di invito + propri strumenti)
- **Calendario aggregato**: un'unica vista con le prove e i live di tutte le band dell'utente, distinti per stile (live = pieno, prova = contorno) e per etichetta con il nome della band, usando solo i toni della palette
- Click su un evento del calendario → apre il Dettaglio Live (se è un live) o una finestra di dialogo con modifica ed eliminazione (se è una prova)
- Click su una band della lista → pagina Dettaglio Band

### 3. Dettaglio Band

Intestazione con nome band e pulsante "Elimina band" (con conferma, disponibile a tutti i membri). Sezioni (tab) per:

- **Membri**: nome e strumenti (anche più di uno, con campo a suggerimenti e testo libero, modificabili solo dal diretto interessato); mostra il codice di invito (copiabile, con pulsante per rigenerarlo) e permette di rimuovere un membro o di uscire dalla band
- **Repertorio**: tutte le canzoni del gruppo (campi del modello Canzone), con ricerca per titolo, filtro per stato, aggiunta, modifica ed eliminazione (con conferma) e cambio rapido dello stato
- **Live in programma**: elenco data/luogo con pulsante "Aggiungi live"; click → Dettaglio Live con la sua scaletta
- **Prove in programma**: elenco data/luogo con pulsante "Aggiungi prova"; click → finestra di dialogo con modifica ed eliminazione
- **Chat AI**: interfaccia per interrogare Ollama nel contesto della band (dettagli nella sezione Integrazione AI)

### 4. Dettaglio Live → Scaletta

- **Lista canzoni scelte**, in ordine (riordinabili drag & drop); si può aggiungere un brano del repertorio oppure inserirne uno nuovo, che viene creato anche nel repertorio
- **Note del live** e **note della scaletta**: due campi di testo libero separati (`notes` e `setlist_notes`)
- **Barra di progresso**: percentuale di canzoni completate in scaletta, ricevuta dall'API (`progress_percent`)
- **Durata totale**: somma delle durate delle canzoni scelte, ricevuta dall'API (`total_duration_seconds`) e mostrata come mm:ss
- **Altre azioni**: modifica di luogo e data/ora del live, eliminazione del live, "Copia scaletta da un altro live" (con conferma se la scaletta esiste già)

### 5. Profilo utente

- Raggiungibile dal menu utente nella Navbar
- **Dati personali**: modifica di nome ed email
- **Cambio password**: password attuale + nuova password + conferma
- **Elimina account**: pulsante con finestra di conferma e inserimento della password; avvisa che le band rimaste senza altri membri verranno eliminate

### 6. Guida: come funziona l'app

- **Pagina statica** su `/guide`, pubblica (senza login) e senza chiamate all'API. Ci si arriva dal link "Come funziona" nella pagina di login e dalla Navbar.
- **Intestazione**: se l'utente è loggato mostra la Navbar, altrimenti solo un'intestazione con selettore lingua, tema e link al login.
- **Testi** in `it.json` e `en.json`, organizzati in sezioni ad accordion (MUI) con un indice per saltare a una sezione.
- **Sezioni**: cos'è l'app e a chi serve; iniziare (registrazione, login, creare una band o entrare con il codice di invito); band e membri (strumenti, codice di invito, uscire o rimuovere un membro); repertorio (campi delle canzoni e stati di studio); live e scalette (come si costruisce una scaletta, durata totale e progresso); prove e calendario; chat AI (cosa sa fare e i suoi limiti: modello locale, risposte lente, può sbagliare, cronologia non salvata); profilo, tema chiaro/scuro e lingua.

### Modello "Canzone" mostrato in UI

| Campo | Descrizione |
| --- | --- |
| Titolo | Nome del brano |
| Artista | Autore o interprete originale |
| Versione | Testo breve opzionale per distinguere versioni dello stesso brano (es. acustica, live 2024) |
| Link | URL opzionale (Spotify, YouTube…); mostrato come icona che si apre in una nuova scheda |
| Durata | mm:ss, usata per il calcolo del totale scaletta |
| Tonalità | Es. Am, C#, ecc. |
| Energia | Opzionale, da 1 a 5 (componente MUI Rating); indica l'intensità del brano e aiuta la chat AI a proporre scalette per mood |
| BPM | Opzionale, numero da 30 a 300 |
| Stato | Da studiare / In studio / Completata (valori dell'API: to\_study, studying, completed) |
| Note | Testo libero opzionale |

Nel form di aggiunta e modifica il link deve essere un URL http(s) valido. Se titolo, artista e versione esistono già nel repertorio della band, il form mostra l'errore 422 restituito dal backend.

### Moduli e azioni

- **Band**: creazione (nome, genere, strumenti) o ingresso con codice; modifica di nome e genere dall'intestazione; eliminazione con conferma.
- **Canzone**: form con i campi del modello. L'eliminazione chiede conferma e avvisa che il brano sparisce anche dalle scalette. Lo stato si cambia rapidamente dal badge.
- **Live e prova**: form con luogo e data/ora (MUI DateTimePicker). L'orario inserito è locale e viene inviato all'API in UTC (ISO 8601); le note sono facoltative.
- **Strumenti**: campo Autocomplete multiplo con suggerimenti.
- **Errori**: i 422 dell'API compaiono sotto il campo corrispondente; gli errori di rete in una notifica (Snackbar).
- **Stati vuoti e di caricamento**: ogni elenco mostra un indicatore di caricamento e, se vuoto, un invito ad agire (es. "Aggiungi la prima canzone").

### Componenti riutilizzabili

- Calendario (es. FullCalendar o vista custom su MUI)
- SongRow/SongCard (titolo, tonalità, durata, badge di stato)
- ProgressBar (mostra la percentuale ricevuta dall'API)
- ChatWindow (bolle utente/AI, input, invio)
- Navbar con band corrente, link alla Guida, selettore lingua, interruttore tema chiaro/scuro e logout

### Note tecniche

- Routing: react-router-dom (vedi Route).
- Strumenti: Vite, React e JavaScript (JSX), senza TypeScript; ESLint. Nessun test frontend richiesto: bastano `npm run build` e `npm run lint` senza errori.
- Librerie: MUI e MUI X Date Pickers (versione community) con dayjs; FullCalendar (`@fullcalendar/react` con i plugin daygrid, list e interaction) per il calendario; `@dnd-kit/core` e `@dnd-kit/sortable` per il riordino; `react-i18next`; `axios`; `@fontsource/atkinson-hyperlegible`.
- Stato globale: Context API (utente loggato, token, tema, lingua). I dati del server si leggono con axios dentro hook dedicati (es. `useBands`), senza altre librerie di stato.
- Chiamate API: axios verso gli endpoint REST Laravel, con il token Sanctum inviato come Bearer da un interceptor; una risposta 401 esegue il logout (dettaglio nella sezione Backend).
- Tema MUI dedicato, con modalità scura e chiara (vedi Tema, lingue e font).

### Tema, lingue e font

**Tema chiaro e scuro**

- Modalità scura di default al primo accesso, senza seguire le impostazioni del sistema. Interruttore nella Navbar; la scelta è salvata nel browser (localStorage).
- Tema MUI creato con `createTheme` e `ThemeProvider`, in due varianti che usano solo la palette [Coolors](https://coolors.co/0d1b2a-1b263b-415a77-778da9-ffffff) qui sotto.

| Colore | Hex | Tema scuro | Tema chiaro |
| --- | --- | --- | --- |
| Blu notte | #0D1B2A | Sfondo della pagina | Testo principale |
| Blu inchiostro | #1B263B | Superfici (card, tab, dialog) | Navbar e intestazioni, con testo bianco |
| Blu acciaio | #415A77 | Bordi, elementi selezionati, chip "in studio" | Colore primario (bottoni, link), testo secondario |
| Blu polvere | #778DA9 | Colore primario (bottoni, link), icone, barra di progresso | Bordi, divisori, superfici alternate (con trasparenza) |
| Bianco | #FFFFFF | Testo principale | Sfondo della pagina e delle card |

- **Contrasto**: il testo deve avere almeno 4.5:1 (WCAG AA). #778DA9 su #1B263B è al limite (circa 4.4:1): come testo va usato su #0D1B2A, altrimenti per icone ed elementi grandi.
- **Stati delle canzoni**: distinti da icona ed etichetta, non solo dal colore, con i toni della palette (da studiare: contorno; in studio: pieno #415A77; completata: pieno con spunta).
- **Eccezione**: solo per errori e conferme di eliminazione si usa il rosso di errore di MUI, perché la palette non ha un colore semantico.
- I colori sono definiti una volta sola nel tema, senza codici colore sparsi nei componenti.

**Font**

- Atkinson Hyperlegible, dal pacchetto npm `@fontsource/atkinson-hyperlegible` (pesi 400 e 700): nessuna richiesta a Google Fonts, quindi funziona anche offline.
- Impostato in `typography.fontFamily` del tema, con fallback `system-ui, sans-serif`.

**Lingue**

- Italiano e inglese con `react-i18next`; testi in `src/locales/it.json` e `src/locales/en.json`, nessun testo scritto direttamente nei componenti.
- Lingua iniziale: quella del browser se è italiano o inglese, altrimenti italiano. Selettore nella Navbar e nella pagina di login; la scelta è salvata nel browser.
- Date e orari formattati secondo la lingua (dayjs con locale it/en e localizzazione MUI X per calendario e date picker).
- Ogni richiesta all'API invia l'header `Accept-Language`, così messaggi di validazione ed email di reset arrivano nella lingua scelta.

### Responsive (PC, tablet e smartphone)

L'app deve funzionare bene su smartphone (da 360 px di larghezza), tablet (verticale e orizzontale) e PC. Si progetta partendo dallo smartphone (mobile-first), con i breakpoint di MUI: `xs` sotto 600 px, `sm` da 600, `md` da 900, `lg` da 1200.

- **Pagina**: tag `viewport` nel documento e nessuno scorrimento orizzontale della pagina a 360 px. Dimensioni in `rem` e campi di testo da almeno 16 px, per evitare lo zoom automatico su iPhone.
- **Navbar**: su `xs` e `sm` un menu compatto (cassetto) con link, selettore lingua, interruttore tema e profilo; da `md` la barra completa.
- **Dashboard**: su smartphone una colonna (prima le band, poi il calendario); da `md` due colonne affiancate.
- **Calendario**: su smartphone la vista a elenco del mese (FullCalendar `listMonth`) con barra degli strumenti compatta; da `sm` la vista a griglia mensile.
- **Dettaglio Band**: i tab scorrono in orizzontale (`variant="scrollable"`) su schermi stretti.
- **Elenchi di canzoni**: tabella da `md` in su; su smartphone righe impilate con i campi principali (titolo, artista, durata, stato) e gli altri campi in un dettaglio espandibile. Mai tabelle larghe con scorrimento orizzontale.
- **Scaletta**: il riordino con dnd-kit funziona al tocco (maniglia dedicata di almeno 44 px, con un breve ritardo per non confliggere con lo scorrimento) e da tastiera. Su ogni brano ci sono anche i pulsanti "sposta su" e "sposta giù" come alternativa.
- **Form e finestre di dialogo**: a schermo intero su `xs` (`fullScreen` con `useMediaQuery`), campi a tutta larghezza e tipo di tastiera adatto (`type="email"`, `inputMode`). I picker di data e ora di MUI X usano la versione per touch sui dispositivi mobili.
- **Chat AI**: l'altezza si adatta allo schermo (`100dvh` meno le intestazioni), il campo di scrittura resta in basso e resta visibile con la tastiera aperta.
- **Touch**: pulsanti e icone cliccabili di almeno 44 × 44 px, nessuna funzione disponibile solo al passaggio del mouse, zoom della pagina non bloccato, funzionamento in verticale e in orizzontale.
- **Verifica**: ogni pagina si controlla a 360, 768 e 1280 px (strumenti del browser), in tema chiaro e scuro e nelle due lingue. I testi in italiano, più lunghi, non devono nascondere informazioni. Nessun test automatico richiesto; gli screenshot del README includono almeno una schermata da smartphone.

### Decisioni di implementazione (fase 5)

Scelte prese durante lo sviluppo del frontend. Valgono come il resto delle specifiche.

**Struttura**

- Versioni: MUI 9, React Router 7, i18next 26 con react-i18next 17 (`i18next` è la dipendenza richiesta da `react-i18next`).
- Gli oggetti Context sono in `src/context/contexts.js`, i Provider in `src/context/*Provider.jsx` e gli hook (`useAuth`, `useThemeMode`, `useLanguage`, `useNotification`) in `src/hooks/`: la regola `react-refresh` di ESLint non vuole componenti e altro nello stesso file.
- Oltre ad auth, tema e lingua c'è un quarto Context per le notifiche (`NotificationProvider`), che mostra la Snackbar globale per errori di rete e conferme.
- `src/i18n.js` inizializza i18next; la Guida legge le sezioni da `guide.sections` (array in `it.json` ed `en.json`, con `returnObjects`).
- `useApiErrorHandler` gestisce gli errori delle richieste: un 422 va sotto i campi (primo messaggio di ogni campo); errori di rete e altri errori vanno nella Snackbar; il 401 lo gestisce il client axios.
- In `@mui/icons-material` 9 alcune icone hanno nomi diversi dalla documentazione più vecchia (es. `HelpOutlined`, non `HelpOutline`): se la build non trova un'icona, controlla il nome in `node_modules/@mui/icons-material`.

**Autenticazione e navigazione**

- Il token è salvato in `localStorage` (chiave `token`); le altre chiavi sono `themeMode` e `language`.
- Al caricamento, con un token salvato, il frontend legge l'utente con `GET /me` senza bloccare la pagina (il nome in Navbar compare appena arriva).
- Un 401 con token presente cancella il token, avvisa l'`AuthProvider` con l'evento `auth:unauthorized` e mostra "Sessione scaduta"; la route protetta riporta a `/login`.
- Dopo il login si torna alla pagina protetta richiesta prima (`location.state.from`), altrimenti alla Dashboard.
- Con il token presente solo `/login` e `/register` portano alla Dashboard; `/forgot-password` e `/reset-password` restano raggiungibili.
- Reset password: se il link non ha `token` o `email` la pagina invita a chiederne uno nuovo; un token scaduto o non valido (errore 422 sul campo `email`) compare in un avviso sopra il form, con il link per un nuovo invio; dopo il reset si va al login con una notifica di conferma.
- Guida e 404 mostrano la Navbar se l'utente è loggato, altrimenti l'intestazione pubblica con lingua, tema e "Accedi".
- Il Profilo è un segnaposto fino alla fase 9.

**Tema e accessibilità**

- Tema scuro: testo secondario bianco all'80% di opacità; link e pulsanti di testo o con contorno sono bianchi, perché `#778DA9` sulle superfici `#1B263B` non raggiunge 4.5:1. I pulsanti pieni usano `#778DA9` con testo `#0D1B2A`.
- Tema chiaro: divisori e bordi in `#778DA9` al 50% di opacità; navbar `#1B263B` con testo bianco in entrambi i temi.
- Il tema impone un'altezza minima di 44 px a `Button`, `IconButton`, `ListItemButton` e `MenuItem`.
- La build segnala un bundle sopra i 500 kB (soprattutto MUI): è solo un avviso, accettato.
- L'override che rende bianchi i pulsanti di testo e con contorno nel tema scuro vale solo per il colore `primary`: i pulsanti `color="error"` restano rossi.

### Decisioni di implementazione (fase 6)

**Librerie e date**

- FullCalendar 6.1 (`@fullcalendar/react`, `daygrid`, `list`, `interaction`, più `@fullcalendar/core`, dipendenza richiesta dai plugin). La 7 non ha ancora i plugin allineati.
- MUI X Date Pickers 9 e dayjs si installano già nella fase 6, per la finestra della prova aperta dal calendario.
- `src/dates.js` tiene la lingua di dayjs allineata a i18next e converte il valore del DateTimePicker in ISO UTC (`toApiDate`); `DatesProvider` imposta `LocalizationProvider` di MUI X con lingua e testi it/en.

**Dashboard e calendario**

- Dopo "Crea band" o "Unisciti" si apre la pagina della nuova band, con una notifica di conferma.
- Il calendario chiede a `GET /calendar` l'intervallo visibile. Su `xs` vista `listMonth`, da `sm` griglia mensile con i pulsanti Mese/Elenco.
- Colori degli eventi con classi CSS (`event-live`, `event-rehearsal`) e variabili di FullCalendar prese dal tema: live pieno, prova con il solo contorno (anche il pallino nella vista elenco è vuoto). Il titolo inizia con "Live:" o "Prova:", quindi il tipo non dipende solo dal colore. Nella griglia: ora e "Tipo: band"; nell'elenco si aggiunge il luogo.
- L'evento del calendario non contiene le note della prova: al click il frontend legge `GET /bands/{band}/rehearsals?from=<starts_at>` e cerca la prova per id. Dopo modifica o eliminazione il calendario si ricarica.
- Click su un live: `/bands/:bandId/lives/:liveId` (Dettaglio Live).

**Dettaglio Band e Membri**

- Tab in `?tab=` (`members`, `songs`, `lives`, `rehearsals`, `chat`; valore assente o sconosciuto: `members`). La Chat arriva nella fase 8.
- Band inesistente (404) o di cui non si è membri (403): stesso messaggio, con link alla Dashboard.
- Strumenti: Autocomplete multiplo con testo libero; i suggerimenti sono in `instruments.suggestions` dei file di lingua. Il testo scritto si aggiunge con Invio o uscendo dal campo; il frontend toglie spazi, doppioni (senza distinguere maiuscole) e oltre 10 valori.
- Codice di invito: copia con `navigator.clipboard` (in caso di errore una notifica invita a copiarlo a mano); "Rigenera" chiede conferma.
- Uscire dalla band chiede conferma e, se si è l'ultimo membro, avvisa che la band verrà eliminata; dopo l'uscita si torna alla Dashboard.
- Finestre comuni: `FormDialog` (form con Annulla e Salva) e `ConfirmDialog` (conferma, rossa per le eliminazioni), entrambe a schermo intero su `xs`.

### Decisioni di implementazione (fase 7)

**Struttura**

- `useApiData(fetcher)` è l'hook comune per leggere dati (caricamento, errore, ricarica); `useBands`, `useBand`, `useSongs` e `useLive` lo usano.
- `formatDateTime` in `src/dates.js` mostra data e ora nel fuso del browser e nella lingua scelta, con il formato dayjs `ddd LL, LT` (es. "mer 14 ottobre 2026, 21:30" / "Wed October 14, 2026, 9:30 PM").
- La "band corrente" nella Navbar (vedi Componenti riutilizzabili) non è ancora fatta: è rinviata alla fase 9. Il nome della band compare per ora nell'intestazione della pagina della band e nel pulsante "indietro" della pagina del live.
- `src/songs.js`: stati, formato della durata (`m:ss`, anche oltre l'ora, es. `75:30`) e conversione tra form e body dell'API.
- `EventDialog` serve sia ai live sia alle prove, in creazione e modifica (sostituisce la finestra della prova della fase 6). Elenchi dei tab Live e Prove con lo stesso componente `EventsTab`.
- `@dnd-kit/sortable` porta con sé `@dnd-kit/utilities`, che non si importa direttamente: lo spostamento del brano trascinato è scritto a mano (solo verticale).

**Repertorio**

- Ricerca per titolo e filtro per stato fatti nel browser: l'API restituisce già tutto il repertorio.
- Da `md` tabella; sotto righe impilate con titolo, artista, durata e stato, e un dettaglio espandibile con tonalità, BPM, energia, note, Modifica ed Elimina. In tabella le note compaiono sotto il titolo (massimo due righe).
- Durata in un solo campo `m:ss`: se il formato è sbagliato l'errore compare sotto il campo senza chiamare l'API; gli errori di `duration_seconds` dell'API vanno sotto lo stesso campo.
- Badge di stato: Chip con icona ed etichetta (da studiare: contorno e cerchio vuoto; in studio: pieno `secondary` con frecce; completata: pieno `primary` con spunta). Con un click apre un menu per il cambio rapido.
- Stelle dell'energia (MUI Rating) con i colori della palette, impostati nel tema.

**Live, prove e scaletta**

- I tab Live e Prove mostrano solo gli eventi futuri (comportamento di default dell'API). Un nuovo live apre subito la sua pagina; una prova si modifica o elimina nella finestra.
- Pagina del live: modifica di luogo e data/ora nella finestra; note del live e della scaletta in un riquadro a parte con un solo "Salva".
- Riordino: maniglia dnd-kit (mouse dopo 5 px, tocco dopo 200 ms, tastiera con Spazio e frecce, annunci per lettori di schermo in it/en) e pulsanti sposta su/giù. L'ordine cambia subito e poi si salva con `PUT /lives/{live}/songs/order`; se l'API risponde con un errore si ricarica il live.
- Cambio di stato e rimozione di un brano dalla scaletta rileggono il live, così progresso e durata arrivano sempre dall'API. Togliere un brano dalla scaletta non chiede conferma: il brano resta nel repertorio.
- "Aggiungi brano": finestra con due schede, "Dal repertorio" (Autocomplete dei brani non ancora in scaletta) e "Brano nuovo" (stessi campi del repertorio).
- "Copia da un altro live": elenco di tutti i live della band, anche passati (`?from=2000-01-01T00:00:00Z`). Se la scaletta non è vuota, la finestra avvisa che verrà sostituita insieme alle sue note e il pulsante diventa "Sostituisci la scaletta": vale come conferma.

## Backend & API

Laravel espone un'API REST JSON sotto il prefisso `/api`, protetta da token Sanctum; ogni utente accede solo ai dati delle band di cui è membro.

### Principi generali

- **Autenticazione**: Laravel Sanctum con token Bearer nell'header `Authorization`. Sono pubbliche solo registrazione, login, richiesta e reset della password; tutte le altre rotte richiedono `auth:sanctum`.
- **Autorizzazione**: una Policy verifica che l'utente sia membro della band proprietaria della risorsa (band, canzone, live, prova), altrimenti risponde 403. Tutti i membri hanno gli stessi permessi, compresi eliminare la band e rimuovere altri membri.
- **Validazione**: Form Request per ogni operazione di scrittura; errori in JSON con codice 422 e messaggi per campo.
- **Lingue**: un middleware imposta la lingua dall'header `Accept-Language` (it o en, default it). Messaggi di validazione ed email di reset password sono disponibili in entrambe (`lang/it`, `lang/en`).
- **Risposte**: una Laravel API Resource per ogni modello; codici 200, 201 (creazione), 204 (eliminazione), 401, 403, 404, 422.
- **CORS**: consentita solo l'origine del frontend (variabile d'ambiente `FRONTEND_URL`).
- **Date**: salvate e inviate in UTC, formato ISO 8601.

**Driver di Laravel**: l'API è stateless, quindi non usa sessioni (`SESSION_DRIVER=array`). La cache è su file (`CACHE_STORE=file`, serve al rate limiting) e le code sono sincrone (`QUEUE_CONNECTION=sync`, anche per le email). Le migration di default non usate (sessions, cache, jobs) si possono rimuovere.

### Endpoint

| Metodo | Endpoint | Cosa fa |
| --- | --- | --- |
| POST | `/api/register` | Crea l'utente e restituisce il token |
| POST | `/api/login` | Verifica le credenziali e restituisce il token |
| POST | `/api/logout` | Revoca il token corrente |
| POST | `/api/forgot-password` | Invia via email il link di reset |
| POST | `/api/reset-password` | Imposta la nuova password con token ed email |
| GET | `/api/me` | Restituisce l'utente autenticato |
| PATCH | `/api/me` | Modifica nome ed email dell'utente autenticato |
| PUT | `/api/me/password` | Cambia la password (richiede quella attuale) |
| DELETE | `/api/me` | Elimina l'account (richiede la password) |
| GET | `/api/bands` | Band dell'utente, con i suoi strumenti |
| POST | `/api/bands` | Crea la band; il creatore diventa membro (con i suoi strumenti) e viene generato il codice di invito |
| POST | `/api/bands/join` | Entra in una band con `invite_code` e `instruments` |
| GET | `/api/bands/{band}` | Dettaglio con membri (nome e strumenti) e codice di invito |
| PATCH | `/api/bands/{band}` | Modifica nome e genere |
| DELETE | `/api/bands/{band}` | Elimina la band e, a catena, repertorio, live e prove |
| POST | `/api/bands/{band}/invite-code` | Rigenera il codice di invito (il vecchio smette di funzionare) |
| PUT | `/api/bands/{band}/me/instruments` | Sostituisce l'elenco degli strumenti dell'utente autenticato in quella band |
| DELETE | `/api/bands/{band}/members/{user}` | Rimuove un membro (o l'utente stesso esce dalla band) |
| GET | `/api/bands/{band}/songs` | Elenco delle canzoni del repertorio |
| POST | `/api/bands/{band}/songs` | Aggiunge una canzone al repertorio |
| PATCH | `/api/songs/{song}` | Modifica una canzone (anche stato e note) |
| DELETE | `/api/songs/{song}` | Elimina la canzone dal repertorio e da tutte le scalette |
| GET | `/api/bands/{band}/lives` | Live della band dal più vicino; `?from=` filtra dalla data (di default solo i live futuri) |
| POST | `/api/bands/{band}/lives` | Crea un live |
| GET | `/api/lives/{live}` | Dettaglio con scaletta ordinata, `total_duration_seconds` e `progress_percent` |
| PATCH | `/api/lives/{live}` | Modifica luogo, data/ora, `notes` e `setlist_notes` |
| DELETE | `/api/lives/{live}` | Elimina il live e la sua scaletta |
| POST | `/api/lives/{live}/songs` | Aggiunge un brano alla scaletta, con `song_id` oppure con i dati di un brano nuovo |
| PUT | `/api/lives/{live}/songs/order` | Riordina la scaletta con l'elenco ordinato di `song_ids` |
| PUT | `/api/lives/{live}/setlist` | Sostituisce la scaletta con l'elenco ordinato di `song_ids` (usato per salvare la proposta della chat AI) |
| DELETE | `/api/lives/{live}/songs/{song}` | Toglie il brano dalla scaletta (resta nel repertorio) |
| POST | `/api/lives/{live}/copy-setlist` | Copia la scaletta di un altro live della stessa band (`source_live_id`) |
| GET | `/api/bands/{band}/rehearsals` | Prove della band dalla più vicina (di default solo le future) |
| POST | `/api/bands/{band}/rehearsals` | Crea una prova |
| PATCH | `/api/rehearsals/{rehearsal}` | Modifica luogo, data/ora e note |
| DELETE | `/api/rehearsals/{rehearsal}` | Elimina la prova |
| GET | `/api/calendar?from=&to=` | Live e prove di tutte le band dell'utente nell'intervallo, con tipo, band, data e luogo |
| POST | `/api/bands/{band}/chat` | Chat AI con Ollama: risposta e, se richiesta, proposta di scaletta (vedi Integrazione AI) |

L'endpoint della chat con Ollama è definito nella sezione Integrazione AI.

### Regole di business

- **Codice di invito**: `bands.invite_code`, 8 caratteri alfanumerici maiuscoli senza caratteri ambigui (niente 0/O, 1/I), UNIQUE, generato alla creazione della band. Chi ha il codice entra come membro; se è già membro la richiesta è rifiutata con 422. La rotta `join` è limitata a 10 tentativi al minuto per utente.
- **Creazione band**: in una transazione crea la band e la riga `band_user` del creatore, con i suoi strumenti.
- **Uscita e rimozione**: qualsiasi membro può rimuovere un altro membro o eliminare la band. Se l'ultimo membro lascia la band, questa viene eliminata automaticamente, per non lasciare band senza membri.
- **Scaletta**: valgono le regole della sezione Database. Un brano nuovo viene creato nel repertorio con `firstOrCreate` sulla chiave (`band_id`, `title`, `artist`, `version`); un brano già presente in scaletta genera un errore 422; il riordino riscrive tutte le `position` in una transazione; `copy-setlist` sostituisce la scaletta del live di destinazione e copia anche `setlist_notes`.
- **Valori calcolati**: `total_duration_seconds`, `progress_percent` e `songs_count` sono calcolati con una query aggregata e inclusi in ogni risposta su live e scaletta.
- **Reset password**: usa il Password Broker di Laravel. `forgot-password` risponde sempre 200, anche se l'email non esiste. Il link punta al frontend (`FRONTEND_URL/reset-password?token=…&email=…`) e scade dopo 60 minuti; dopo il reset tutti i token di accesso dell'utente vengono revocati. In sviluppo le email sono intercettate da Mailpit, servizio del docker-compose.
- **Password**: minimo 8 caratteri, salvata con hash; l'email è UNIQUE.

### Profilo e dati personali

- **Regola generale**: ogni utente può modificare solo i propri dati. Sugli altri utenti l'unica azione consentita è rimuoverli da una band (`DELETE /api/bands/{band}/members/{user}`); non esistono endpoint per leggere o modificare i dati di altri utenti.
- **Dati visibili agli altri membri**: solo `id`, nome e strumenti, mai l'email.
- **Strumenti**: `PUT /api/bands/{band}/me/instruments` sostituisce l'elenco degli strumenti dell'utente autenticato in quella band. Da 1 a 10 strumenti, testo di 1-50 caratteri con `trim`, senza duplicati (maiuscole ignorate). Lo stesso vale per `instruments` in creazione e ingresso in una band. Non esiste modo di cambiare gli strumenti di un altro membro.
- **Modifica profilo**: `PATCH /api/me` accetta `name` ed `email` (UNIQUE).
- **Cambio password**: `PUT /api/me/password` richiede `current_password`, `password` e `password_confirmation`; revoca gli altri token dell'utente, mantenendo quello in uso.
- **Eliminazione account**: `DELETE /api/me` richiede la password; cancella l'utente e, a catena, le sue appartenenze e i suoi strumenti. Le band rimaste senza membri vengono eliminate, come quando esce l'ultimo membro; tutti i token vengono revocati.

### Regole di validazione

| Risorsa | Obbligatori | Opzionali e limiti |
| --- | --- | --- |
| Utente (registrazione) | `name` (max 100), `email` (valida, UNIQUE), `password` (min 8) e `password_confirmation` |  |
| Band | `name` (max 100); alla creazione `instruments` (da 1 a 10) | `genre` (max 50) |
| Canzone | `title` (max 150), `artist` (max 150), `duration_seconds` (da 1 a 7200) | `version` (max 100), `link` (URL http/https, max 500), `musical_key` (max 10), `energy` (1-5), `bpm` (30-300), `status` (to\_study, studying, completed; default to\_study), `notes` |
| Live | `place` (max 150), `starts_at` (ISO 8601) | `notes`, `setlist_notes` |
| Prova | `place` (max 150), `starts_at` (ISO 8601) | `notes` |

### Organizzazione del codice

- Un Controller per risorsa (Auth, Profile, PasswordReset, Band, BandMember, Song, Live, LiveSong, Rehearsal, Calendar), con Form Request e API Resource dedicati.
- Modelli con relazioni: `User` ↔ `Band` many-to-many tramite il pivot `band_user` (modello pivot `Membership`, con id); ogni `Membership` ha molti `MemberInstrument`; `Band` ha molte `Song`, `Live` e `Rehearsal`; `Live` ↔ `Song` many-to-many (pivot `live_song` con `position`, ordinata per `position`).
- Seeder con dati dimostrativi: due utenti (demo1@example.com e demo2@example.com, password password123); due band, la prima con entrambi gli utenti; circa 15 canzoni con stati, energie e bpm diversi; due live, uno con una scaletta di 6 brani; tre prove. Le date sono relative al giorno del seed, così il calendario non è mai vuoto.
- Feature test PHPUnit su registrazione e login, ingresso in band con codice e gestione della scaletta.

### Decisioni di implementazione (fasi 0-3)

Scelte non coperte in dettaglio dalle sezioni precedenti, prese durante lo sviluppo. Valgono come il resto delle specifiche.

**Formato delle risposte**

- `register` (201) e `login` (200) restituiscono `{ "token": "...", "user": { id, name, email, created_at } }`. Le credenziali errate danno 422 con l'errore sul campo `email`.
- Le altre risorse sono avvolte in `data`: oggetto singolo `{ "data": { ... } }`, elenco `{ "data": [ ... ] }`. Nessuna paginazione.
- 204 senza contenuto per: `logout`, `PUT /me/password`, `DELETE /me`, eliminazione di band, canzone, live e prova, `DELETE /bands/{band}/members/{user}` e `DELETE /lives/{live}/songs/{song}`.
- Errori di validazione 422 nel formato standard di Laravel `{ "message": "...", "errors": { "campo": ["..."] } }`, tradotti in base ad `Accept-Language` (anche il riepilogo "(e altri N errori)").
- Date in uscita in UTC con il formato di Laravel, es. `2026-10-14T19:30:00.000000Z`.

**Utenti e profilo**

- La tabella `users` non ha `email_verified_at` né `remember_token` (l'API usa solo token Sanctum).
- L'email viene salvata in minuscolo e senza spazi ai lati; nomi, titoli, artisti e luoghi vengono salvati senza spazi ai lati.
- `PATCH /me` accetta anche un solo campo (`name` o `email`).
- Nessun limite di tentativi su `login`, `forgot-password` e `reset-password` (le specifiche lo chiedono solo per `join` e chat).

**Band e membri**

- Le risposte delle band includono `members_count` e `my_instruments` (strumenti dell'utente autenticato); il dettaglio aggiunge `members` (`id`, `name`, `instruments`).
- Creazione band e `join` rispondono 201 con il dettaglio della band; `POST /bands/{band}/invite-code` e `PUT /bands/{band}/me/instruments` restituiscono il dettaglio aggiornato.
- Il codice di invito è accettato anche in minuscolo. Codice inesistente o utente già membro: 422 sul campo `invite_code`.
- Gli strumenti restano nell'ordine in cui sono stati inseriti.
- `DELETE /bands/{band}/members/{user}` su un utente che non è membro risponde 404.
- L'elenco delle band è ordinato per nome.

**Repertorio**

- `version` assente o vuota diventa stringa vuota; `link` e `musical_key` vuoti diventano `null`.
- Il controllo anti-duplicati (stessa band, titolo, artista e versione, maiuscole ignorate) dà 422 sul campo `title`, sia in creazione sia in modifica.
- Il repertorio è ordinato per titolo e poi per artista.
- Le note (canzoni, live, scaletta, prove) accettano al massimo 10.000 caratteri.

**Live, scaletta e prove**

- `starts_at` accetta ISO 8601 con fuso (es. `2030-06-01T21:30:00+02:00`) e viene convertito in UTC prima del salvataggio.
- Il dettaglio del live include `band` (`id`, `name`) e `songs` in ordine, ciascuna con `position`. `progress_percent` è un intero arrotondato.
- Elenchi di live e prove ordinati per `starts_at`; senza `from` partono da adesso.
- `POST /lives/{live}/songs` risponde 201 con il dettaglio del live; riordino, sostituzione e copia rispondono 200 con il dettaglio.
- Brano già in scaletta: 422 su `song_id` (brano del repertorio) o su `title` (brano nuovo). Brano di un'altra band: 422 su `song_id` o `song_ids`.
- `PUT .../songs/order` deve contenere tutti e soli i brani della scaletta, altrimenti 422 su `song_ids`. `PUT .../setlist` accetta anche un elenco vuoto (svuota la scaletta).
- Dopo la rimozione di un brano le `position` non vengono rinumerate (l'ordine resta corretto); un brano non presente in scaletta dà 404.
- `copy-setlist` dallo stesso live o da un live di un'altra band: 422 su `source_live_id`.

**Calendario**

- `from` e `to` obbligatori (ISO 8601), `to` non precedente a `from`; gli estremi sono inclusi.
- Ogni evento è `{ type: "live" | "rehearsal", id, band: { id, name }, starts_at, place }`, in ordine di data.

**Ambiente e strumenti**

- Laravel 13 con `config.platform.php = 8.3.0` in `composer.json`, così le dipendenze restano compatibili con l'immagine PHP 8.3.
- Lingua predefinita del backend `it`, lingua di riserva `en`.
- I test girano su SQLite in memoria: `phpunit.xml` forza le variabili (`<env force="true">` e `<server>`), così `php artisan test` non tocca il MySQL di sviluppo.
- L'immagine del backend contiene un `backend/.env` vuoto solo per evitare i warning di phpdotenv; la configurazione arriva comunque da compose. L'entrypoint è `backend/docker/entrypoint.sh`.
- Il frontend usa ESLint (il template Vite attuale proporrebbe oxlint).

### Collection Postman

Per testare tutti gli endpoint senza il frontend, il repository include una collection Postman.

- **File**: `docs/postman/rehearsal-setlist-manager.postman_collection.json` (formato Collection v2.1) e `docs/postman/local.postman_environment.json`.
- **Contenuto**: una richiesta per ogni endpoint della tabella sopra, raggruppate in cartelle (Auth, Profilo, Band e membri, Repertorio, Live e scaletta, Prove, Calendario, Chat AI), con body di esempio e header `Accept: application/json`.
- **Variabili**: `baseUrl` (es. `http://localhost:8000/api`; la porta reale è definita nella sezione Docker), `token`, `bandId`, `songId`, `liveId`, `rehearsalId`.
- **Token automatico**: gli script di test di `register` e `login` salvano il token nella variabile `token`; le altre richieste lo usano con l'autenticazione Bearer ereditata dalla collection.
- **Id automatici**: gli script di test delle richieste di creazione (band, canzone, live, prova) salvano l'id ricevuto nella variabile corrispondente, così le richieste successive funzionano in sequenza.
- **Test base**: ogni richiesta verifica il codice atteso (es. 201 alla creazione, 422 per dati non validi), eseguibili con il Collection Runner.
- Il README spiega come importare la collection e l'environment.

**Decisioni di implementazione (fase 4)**

- `docs/API.md` contiene risposte reali, ottenute eseguendo la collection con `newman` e, per i casi che la collection non copre (`join` riuscito, reset con token vero), con `curl` sugli account demo.
- La collection si esegue in ordine con il Collection Runner o con `npx newman run` (comando nel README) e si può rieseguire più volte: crea un utente nuovo a ogni esecuzione e alla fine lo elimina. La cartella Profilo è l'ultima, perché termina con l'eliminazione dell'account.
- Variabili aggiuntive salvate dagli script: `userId`, `email`, `password`, `inviteCode`, `tempBandId`, `song2Id`, `live2Id` e, per il secondo utente, `token2`, `user2Id`, `email2`.
- Un secondo utente ("Registra secondo membro") entra nella band con il codice usando `token2`, così `join` è provato sia riuscito (201) sia rifiutato (422, utente già membro). Alla fine anche il suo account viene eliminato e la band, rimasta senza membri, sparisce.
- Due band temporanee servono a provare l'eliminazione della band e l'uscita dell'ultimo membro senza toccare la band usata dalle cartelle successive.
- Le richieste con errore atteso lo dichiarano nel nome, es. "Reset password (token finto: 422 atteso)": il token vero arriva solo via email (Mailpit).
- Ogni richiesta invia anche `Accept-Language: it`. La richiesta della chat accetta 200, 503 o 404 finché l'endpoint non esiste (fase 8).
- Con `APP_DEBUG=true` le risposte 403, 404 e 500 contengono anche lo stack trace: il frontend usa solo lo status e, al massimo, `message`.

## Database

MySQL con 8 tabelle applicative (più personal\_access\_tokens di Sanctum e password\_reset\_tokens di Laravel, create dalle migration di default), gestite con migration Laravel (nomi al plurale, `id` auto-increment, `created_at`/`updated_at` su ogni tabella, `password` salvata con hash).

### Decisioni di progetto

- **Scaletta = pivot `live_song`**: collega direttamente live e canzoni (many-to-many) e contiene la posizione del brano; non serve una tabella `setlists` separata, perché ogni live ha una sola scaletta.
- **Una scaletta per live**: la scaletta di un live è l'insieme delle righe di `live_song` con il suo `live_id`. Per riciclarla su un altro live, il backend offre "duplica scaletta", che copia le righe della pivot.
- **Repertorio = `songs` legate alla band** (`songs.band_id`): le canzoni di una scaletta appartengono al repertorio della band; un brano nuovo aggiunto da una scaletta viene creato automaticamente nel repertorio.
- **Note nel database**: le note di canzoni, live e prove sono colonne `TEXT` nullable, e la scaletta ha le sue note in `lives.setlist_notes`. Se restassero solo nel frontend si perderebbero al refresh e non sarebbero visibili agli altri membri.
- **Progresso e durata totale non si salvano**: sono valori derivati dalle canzoni della scaletta, calcolati a ogni richiesta (vedi formule sotto), così non possono andare fuori sincrono.

### Tabelle

**users**

| Colonna | Tipo | Note |
| --- | --- | --- |
| id | BIGINT PK |  |
| name | VARCHAR(100) |  |
| email | VARCHAR(255) | UNIQUE |
| password | VARCHAR(255) | hash |

**bands**

| Colonna | Tipo | Note |
| --- | --- | --- |
| id | BIGINT PK |  |
| name | VARCHAR(100) |  |
| genre | VARCHAR(50) | nullable |
| invite\_code | CHAR(8) | UNIQUE, codice per entrare nella band; rigenerabile |

**band\_user** (pivot membri)

| Colonna | Tipo | Note |
| --- | --- | --- |
| id | BIGINT PK |  |
| band\_id | FK → bands.id | ON DELETE CASCADE |
| user\_id | FK → users.id | ON DELETE CASCADE |

Vincolo UNIQUE su (`band_id`, `user_id`).

**member\_instruments** (strumenti di ogni membro in una band)

| Colonna | Tipo | Note |
| --- | --- | --- |
| id | BIGINT PK |  |
| band\_user\_id | FK → band\_user.id | ON DELETE CASCADE |
| instrument | VARCHAR(50) | testo libero (es. batteria, percussioni, pianoforte, arpa) |

Vincolo UNIQUE su (`band_user_id`, `instrument`): lo stesso strumento non compare due volte per lo stesso membro. Un membro può suonare più strumenti nella stessa band, e strumenti diversi in band diverse; il backend garantisce almeno uno strumento per membro.

**songs** (repertorio)

| Colonna | Tipo | Note |
| --- | --- | --- |
| id | BIGINT PK |  |
| band\_id | FK → bands.id | ON DELETE CASCADE |
| title | VARCHAR(150) |  |
| artist | VARCHAR(150) |  |
| version | VARCHAR(100) | NOT NULL, default stringa vuota; testo breve per distinguere le versioni (es. acustica, live 2024) |
| link | VARCHAR(500) | nullable, URL Spotify/YouTube; non fa parte del vincolo UNIQUE |
| duration\_seconds | INT UNSIGNED | il frontend lo mostra come mm:ss |
| musical\_key | VARCHAR(10) | nullable, es. Am, C#; `key` è parola riservata in MySQL |
| energy | TINYINT UNSIGNED | nullable, da 1 (calmo) a 5 (molto intenso); validato dal backend; usato dalla chat AI per mood e dinamica |
| bpm | SMALLINT UNSIGNED | nullable, tra 30 e 300; validato dal backend; usato dalla chat AI |
| status | ENUM('to\_study','studying','completed') | default 'to\_study' |
| notes | TEXT | nullable |

Vincolo UNIQUE su (`band_id`, `title`, `artist`, `version`).

**lives**

| Colonna | Tipo | Note |
| --- | --- | --- |
| id | BIGINT PK |  |
| band\_id | FK → bands.id | ON DELETE CASCADE |
| place | VARCHAR(150) |  |
| starts\_at | DATETIME | data e orario in un solo campo, comodo per il calendario |
| notes | TEXT | nullable, note sul live (es. logistica, soundcheck) |
| setlist\_notes | TEXT | nullable, note sulla scaletta (ordine dei brani, transizioni) |

**rehearsals**

| Colonna | Tipo | Note |
| --- | --- | --- |
| id | BIGINT PK |  |
| band\_id | FK → bands.id | ON DELETE CASCADE |
| place | VARCHAR(150) |  |
| starts\_at | DATETIME |  |
| notes | TEXT | nullable |

**live\_song** (pivot scaletta del live)

| Colonna | Tipo | Note |
| --- | --- | --- |
| id | BIGINT PK |  |
| live\_id | FK → lives.id | ON DELETE CASCADE |
| song\_id | FK → songs.id | ON DELETE CASCADE |
| position | INT UNSIGNED | ordine del brano in scaletta (drag & drop) |

Vincolo UNIQUE su (`live_id`, `song_id`): un brano compare una sola volta per scaletta.

### Indici, vincoli e regole

- **Anti-duplicati in `songs`**: UNIQUE su (`band_id`, `title`, `artist`, `version`). `version` è NOT NULL con default stringa vuota, perché con NULL il vincolo non bloccherebbe i duplicati (in MySQL i NULL sono tutti diversi). Il backend applica `trim` a titolo, artista e versione prima di salvare; il confronto ignora le maiuscole.
- **Brano nuovo dalla scaletta**: se si aggiunge a un live un brano che non è nel repertorio, il backend in una transazione lo crea in `songs` con il `band_id` del live (`firstOrCreate` sulla chiave unica: se esiste già, viene riusato) e poi inserisce la riga in `live_song`.
- **Band diverse, stessi brani**: due band possono suonare gli stessi brani, ciascuna con la propria riga in `songs`. Il backend controlla che ogni canzone in `live_song` abbia lo stesso `band_id` del live.
- **Indici per il calendario**: indice su (`band_id`, `starts_at`) in `lives` e in `rehearsals` (`$table->index(['band_id', 'starts_at'])`), per leggere gli eventi di una band da una data in poi già in ordine.
- **Ordine in scaletta**: `live_song.position` non è UNIQUE. Dopo un riordino il backend riscrive tutte le `position` della scaletta in un'unica transazione.
- **Fuso orario**: Laravel resta in UTC. Le date sono inviate in formato ISO 8601 e il frontend le converte nel fuso del browser (dayjs o MUI X).

### Valori calcolati (non salvati)

- **Durata totale scaletta** = somma di `songs.duration_seconds` dei brani in scaletta.
- **Progresso scaletta** = brani con `status = 'completed'` / brani totali × 100 (0 se la scaletta è vuota).
- Il calcolo avviene nel backend con una sola query aggregata (withSum/withCount oppure JOIN con SUM), esposta da una Laravel API Resource e la risposta include `total_duration_seconds` e `progress_percent`, così il frontend mostra solo i valori ricevuti.

## Integrazione AI (Ollama)

La chat AI di ogni band gira su Ollama in locale, con un modello piccolo adatto a un computer con sola CPU. Conosce i dati della band e può proporre una scaletta che l'utente salva con un click. La cronologia non viene salvata: si azzera al refresh e non serve nessuna tabella nel database.

### Modello e configurazione

- **Modello predefinito**: `llama3.2:3b` (circa 2 GB, supporta l'italiano), adatto a un computer con sola CPU e 8 GB di RAM. Se risulta troppo lento, si passa a `llama3.2:1b` cambiando solo `OLLAMA_MODEL`.
- **Tempi**: su CPU una risposta può richiedere decine di secondi. Servono un timeout lungo, un indicatore di attesa nel frontend e un server PHP che gestisca richieste in parallelo (nginx + php-fpm, vedi sezione Docker).

| Variabile | Valore di default | Uso |
| --- | --- | --- |
| `OLLAMA_BASE_URL` | `http://ollama:11434` | Indirizzo di Ollama nella rete Docker |
| `OLLAMA_MODEL` | `llama3.2:3b` | Modello usato dalla chat |
| `OLLAMA_NUM_CTX` | `4096` | Finestra di contesto, tenuta bassa per limitare la RAM |
| `OLLAMA_KEEP_ALIVE` | `30m` | Tempo in cui il modello resta in memoria dopo l'ultima richiesta |
| `OLLAMA_TIMEOUT` | `120` | Secondi di attesa massima per la risposta |
| `AI_FALLBACK_ENABLED` | `false` | Se `true`, usa OpenRouter quando Ollama non risponde |
| `OPENROUTER_API_KEY` | vuoto | Chiave gratuita OpenRouter (solo per il fallback) |
| `OPENROUTER_MODEL` | `openrouter/free` | Router di modelli gratuiti di OpenRouter |

### Endpoint

`POST /api/bands/{band}/chat` richiede il token e l'appartenenza alla band, ed è limitato a 10 richieste al minuto per utente.

- **Richiesta**: `messages` (da 1 a 10 elementi `{role, content}` con `role` = `user` o `assistant`, contenuto fino a 2000 caratteri, l'ultimo deve essere `user`) e `live_id` opzionale, un live della stessa band su cui concentrare le risposte. Il frontend invia la conversazione; il backend non ne conserva copia.
- **Risposta 200**: il testo della risposta e, se il modello propone una scaletta, la proposta con i brani completi.
- **Errori**: 422 per dati non validi; 503 se l'AI non è disponibile (Ollama irraggiungibile, modello non ancora scaricato o oltre il timeout, e fallback spento o fallito).

```json
{
  "reply": "Ecco una scaletta da circa 45 minuti...",
  "setlist_proposal": {
    "song_ids": [12, 5, 8],
    "songs": [{ "id": 12, "title": "...", "artist": "...", "musical_key": "Am", "duration_seconds": 215 }],
    "total_duration_seconds": 2640,
    "notes": "Aprire con un brano energico"
  }
}
```

`setlist_proposal` è `null` quando il modello non propone nulla.

### Cosa conosce la chat

Il contesto è costruito a ogni richiesta dal database, in formato compatto (una riga per elemento), e inserito nel messaggio di sistema:

- **Band**: nome e genere. **Membri**: nome e strumenti, mai l'email.
- **Repertorio**: `id | titolo - artista (versione) | tonalità | durata | stato | energia | bpm`, fino a 100 brani; energia e bpm compaiono solo se compilati.
- **Live**: i prossimi 5 (oppure quello indicato da `live_id`), con data, luogo, id dei brani in scaletta in ordine, durata totale e progresso.
- **Prove**: le prossime 3, con data e luogo.
- **Istruzioni**: rispondere nella lingua dell'utente, usare solo i dati forniti, non inventare brani né valori mancanti, restare brevi e usare solo id del repertorio per le scalette.

### Proposta di scaletta

- Il modello risponde con JSON vincolato da uno schema (structured outputs di Ollama, [documentazione](https://docs.ollama.com/capabilities/structured-outputs)): `reply` (testo), `setlist_song_ids` (array di id) e `setlist_notes` (testo). Un array vuoto significa nessuna proposta.
- Lo schema è costruito a ogni richiesta con un `enum` dei soli id del repertorio della band, così il modello non può proporre brani inesistenti.
- Il backend valida comunque il risultato: scarta id non validi e doppioni, calcola la durata reale e restituisce i brani completi.
- Un modello piccolo può non rispettare esattamente la durata richiesta (es. 45 minuti): per questo la proposta mostra sempre la durata reale calcolata dal backend.
- **Salvataggio**: `PUT /api/lives/{live}/setlist` con `song_ids` (nell'ordine) e `setlist_notes` opzionale. Sostituisce la scaletta del live in una transazione.

**Mood e dinamica**: il mood richiesto dall'utente (es. "serata energica", "set intimo") viene tradotto dal modello usando `energy` e `bpm` dei brani. Nelle scalette cerca una curva con apertura energica, calo a metà e chiusura forte. Se i due campi mancano, il modello ripiega su ciò che sa dei brani più noti, in modo meno affidabile.

### Flusso della richiesta

1. Il backend verifica che l'utente sia membro della band e valida la richiesta.
2. Costruisce il contesto e lo schema di risposta.
3. Chiama Ollama (`POST /api/chat`) con `stream: false`, `format` = schema, `options.num_ctx`, `options.temperature` = 0.3 e `keep_alive`.
4. Se Ollama è irraggiungibile o supera il timeout e `AI_FALLBACK_ENABLED=true`, ripete la richiesta su OpenRouter (API compatibile OpenAI, `response_format` con lo stesso schema). Se il fallback è spento o OpenRouter risponde con un errore (es. 429 per limite di richieste raggiunto), risponde 503.
5. Interpreta il JSON, valida gli id, calcola la durata e risponde.

### Organizzazione del codice

- `AiChatService` orchestra il flusso; `BandContextBuilder` costruisce il contesto.
- Interfaccia `LlmClient` con due implementazioni, `OllamaClient` e `OpenRouterClient`, scelte in base alla configurazione (`config/ai.php`).
- Feature test con `Http::fake` sulle risposte di Ollama: contesto senza email, id non validi scartati, 503 con Ollama irraggiungibile, fallback attivo.

### Interfaccia (frontend)

- **ChatWindow** nel tab Chat AI: bolle utente e AI, campo di testo (Invio invia, Maiusc+Invio va a capo), indicatore "l'AI sta scrivendo…" durante l'attesa. Nessuno streaming.
- **Cronologia** solo nello stato React: si azzera al refresh o con il pulsante "Nuova conversazione". A ogni richiesta si inviano gli ultimi 10 messaggi.
- **Suggerimenti** cliccabili nella chat vuota, tradotti in italiano e inglese, ad esempio: "Proponi una scaletta da 45 minuti per il prossimo live", "Quali brani devo ancora studiare?", "Quali brani sono nella stessa tonalità?".
- **Card della proposta** dentro il messaggio: brani in ordine (titolo, artista, tonalità, durata), durata totale, selettore del live di destinazione (default: il live indicato o il prossimo) e pulsanti "Salva come scaletta" e "Scarta". Se il live ha già una scaletta, una finestra di conferma chiede se sostituirla.
- **Errori**: con un 503 compare un messaggio tradotto con il pulsante "Riprova"; il messaggio dell'utente resta nella chat.

## Docker & deployment

Dopo aver copiato `.env.example` in `.env`, un solo `docker compose up --build` avvia tutti i servizi. Il repository è un monorepo: ogni servizio ha la sua cartella e c'è un solo repository Git, nella radice (niente .git dentro backend/ o frontend/).

### Struttura del repository

```text
.
├── CLAUDE.md                istruzioni per Claude Code
├── .claude/                 impostazioni e comandi di Claude Code
├── backend/                 Laravel (API)
├── frontend/                React + Material UI
├── docker/
│   ├── nginx/               configurazione nginx dell'API
│   └── ollama/              script di download del modello
├── docs/
│   ├── specifiche.md        questo documento
│   ├── piano-di-lavoro.md   fasi e prompt per Claude Code
│   ├── API.md               esempi di richiesta e risposta (generato)
│   ├── postman/             collection ed environment
│   └── screenshots/
├── docker-compose.yml
├── docker-compose.dev.yml   sviluppo con hot reload (opzionale)
├── .env.example
├── .gitattributes
├── .gitignore
└── README.md
```

### Servizi

| Servizio | Immagine / build | Porta sull'host | Profilo | Note |
| --- | --- | --- | --- | --- |
| `frontend` | build di `frontend/` (node → nginx) | 3000 | sempre | React compilato, con fallback su `index.html` |
| `nginx` | `nginx:alpine` | 8000 | sempre | ingresso HTTP dell'API, inoltra a php-fpm |
| `backend` | build di `backend/` (PHP 8.3 FPM) | nessuna | sempre | Laravel; migrazioni e seeder all'avvio |
| `db` | `mysql:8.4` | 3307 (→ 3306) | sempre | volume `db_data`, healthcheck |
| `mailpit` | `axllent/mailpit` | 8025 (interfaccia web) | sempre | intercetta le email, es. reset password |
| `ollama` | `ollama/ollama` | 11434, solo su 127.0.0.1 | `ai` | volume `ollama_data`, healthcheck `ollama list` |
| `ollama-pull` | `ollama/ollama` | nessuna | `ai` | scarica `OLLAMA_MODEL` e termina |

&#91;embedded content: architettura Docker · 6 servizi e 1 servizio esterno\]

Il browser carica il frontend sulla porta 3000 e chiama l'API sulla porta 8000; solo il backend parla con database, Mailpit, Ollama e, se attivo, OpenRouter. I riquadri tratteggiati sono opzionali.

### Primo avvio

1. `cp .env.example .env`
2. `docker compose up --build`
3. Frontend su `http://localhost:3000`, API su `http://localhost:8000`, email di test su `http://localhost:8025`.
4. Accesso con gli account demo creati dal seeder (credenziali nel README).

Al primo avvio `ollama-pull` scarica il modello (circa 2 GB): l'app è subito utilizzabile e la chat diventa disponibile a download finito.

### Avvio senza Ollama (`COMPOSE_PROFILES`)

- I servizi `ollama` e `ollama-pull` appartengono al profilo `ai`. `.env.example` contiene `COMPOSE_PROFILES=ai`, così chi clona il repository avvia tutto, Ollama compreso.
- Su un PC con poca RAM, o dove non si vuole scaricare nulla, nel proprio `.env` si lascia `COMPOSE_PROFILES=` vuoto: `docker compose up` avvia gli altri servizi e non scarica alcun modello.
- Il backend non ha `depends_on` verso `ollama`. Senza Ollama la chat risponde 503 con il messaggio "AI non disponibile" (oppure usa il fallback OpenRouter, se attivo) e il resto dell'app funziona.
- Il file `.env` non è versionato (è in `.gitignore`), quindi ogni PC ha la propria configurazione.

### Dettagli dei servizi

- **backend**: Dockerfile multi-stage, con `composer:2` che installa le dipendenze (anche quelle di sviluppo, per i test) e poi un'immagine PHP 8.3 FPM con l'estensione `pdo_mysql`. Legge la configurazione solo dalle variabili d'ambiente passate da compose, senza file `backend/.env`.
- **Entrypoint del backend**: se `APP_KEY` è vuota ne genera una per il processo; esegue `php artisan migrate --force`; se `SEED_ON_START=true` e la tabella `users` è vuota esegue i seeder con i dati dimostrativi; infine avvia php-fpm. Parte solo quando `db` è healthy.
- **nginx (API)**: inoltra tutte le richieste a `backend:9000` con `SCRIPT_FILENAME` fisso su `/var/www/html/public/index.php`, quindi non condivide il codice con il backend. Il CORS è gestito da Laravel. Il timeout di lettura FastCGI è di 180 secondi (con php-fpm e max\_execution\_time in linea), perché la chat AI su CPU può superare il default di 60 secondi.
- **frontend**: Dockerfile multi-stage, con `node` LTS che esegue `npm ci` e `npm run build` e poi `nginx:alpine` che serve i file statici. `VITE_API_URL` è fissata in fase di build: se cambia la porta dell'API serve `docker compose up --build`.
- **db**: MySQL con database, utente e password presi da `.env`; il volume `db_data` conserva i dati tra un avvio e l'altro.
- **ollama-pull**: attende che `ollama` sia healthy, esegue `ollama pull` del modello indicato in `OLLAMA_MODEL` e termina (`restart: "no"`). Il volume `ollama_data` conserva i modelli, che restano dopo `docker compose down` ma non dopo `docker compose down -v`.
- Nessuna GPU: Ollama gira su CPU.

**Windows**: il repository include un `.gitattributes` che forza gli a capo LF su script shell e file di configurazione, e l'entrypoint del backend è lanciato con `sh`, così non dipende dal bit di esecuzione.

### Variabili d'ambiente (`.env.example`)

| Variabile | Valore di default | Uso |
| --- | --- | --- |
| `COMPOSE_PROFILES` | `ai` | Profili attivi; vuoto = senza Ollama |
| `FRONTEND_PORT` | `3000` | Porta del frontend sull'host |
| `API_PORT` | `8000` | Porta dell'API sull'host |
| `DB_HOST_PORT` | `3307` | Porta di MySQL sull'host (evita conflitti con un MySQL locale) |
| `MAILPIT_PORT` | `8025` | Interfaccia web di Mailpit |
| `DB_DATABASE`, `DB_USERNAME` | `setlist` | Database e utente applicativo |
| `DB_PASSWORD`, `DB_ROOT_PASSWORD` | valori di sviluppo | Password di MySQL, da cambiare fuori dallo sviluppo |
| `APP_ENV`, `APP_DEBUG` | `local`, `true` | Modalità di Laravel |
| `APP_KEY` | vuoto | Generata all'avvio se vuota |
| `APP_URL` | `http://localhost:8000` | URL pubblico dell'API |
| `FRONTEND_URL` | `http://localhost:3000` | Origine consentita dal CORS e base dei link nelle email |
| `SEED_ON_START` | `true` | Crea i dati dimostrativi al primo avvio |
| `MAIL_HOST`, `MAIL_PORT` | `mailpit`, `1025` | SMTP di sviluppo |
| `VITE_API_URL` | `http://localhost:8000/api` | Indirizzo dell'API usato dal frontend (fissato in build) |
| `OLLAMA_*`, `AI_FALLBACK_ENABLED`, `OPENROUTER_*` | vedi Integrazione AI | Configurazione della chat |

### Sviluppo con hot reload (opzionale)

`docker compose -f docker-compose.yml -f docker-compose.dev.yml up` monta `backend/` e `frontend/` come volumi. Il frontend gira con `npm run dev` (Vite, porta 5173, con `host` aperto) e il backend usa il codice montato, con `vendor` nel volume dell'immagine. In questa modalità `FRONTEND_URL` deve contenere `http://localhost:5173`.

### Comandi utili

- `docker compose exec backend php artisan test`: feature test.
- `docker compose exec backend php artisan migrate:fresh --seed`: ripristina i dati dimostrativi.
- `docker compose logs -f backend`: log del backend.
- `docker compose exec ollama ollama list`: modelli scaricati.
- `docker compose down -v`: ferma tutto e cancella anche database e modelli.

### Requisiti del README (consegna)

Il README nella radice deve contenere:

- titolo e descrizione del progetto;
- prerequisiti: Docker con Compose v2, circa 4 GB di spazio libero con Ollama, 8 GB di RAM consigliati con Ollama attivo;
- istruzioni di avvio (primo avvio, avvio senza Ollama, porte e URL), account demo e servizi da tenere attivi;
- come provare l'API con Postman (`docs/postman/`);
- backend di terze parti usati (OpenRouter, opzionale) e come avviene il collegamento: chiave API nel `.env`, chiamata fatta dal backend Laravel;
- funzionalità da sviluppare in futuro;
- riferimenti in rete utili (Laravel, Ollama, OpenRouter, Material UI, Atkinson Hyperlegible).

Nel repository ci sono anche gli screenshot in `docs/screenshots/` e i dati di inizializzazione (seeder). Il progetto deve funzionare dopo `git clone` seguendo solo il README.
