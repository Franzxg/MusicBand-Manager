# Music Band Manager

Web app per organizzare una band musicale: membri e strumenti, repertorio con lo stato di preparazione dei brani, prove, live con la loro scaletta e un assistente AI locale (Ollama) che risponde a domande sulla band e propone scalette.

Progetto finale del corso Fullstack ITS FS25.

- **Frontend**: React + Material UI (Vite, JavaScript), italiano e inglese, tema chiaro e scuro, pensato anche per smartphone.
- **Backend**: Laravel (API REST con autenticazione Sanctum), MySQL 8.4.
- **AI**: Ollama con il modello `llama3.2:3b` su CPU; fallback facoltativo su OpenRouter.
- **Infrastruttura**: tutto in Docker Compose, avviabile con un solo comando.

Specifiche complete: [`docs/specifiche.md`](docs/specifiche.md). Documentazione dell'API: [`docs/API.md`](docs/API.md).

## Funzionalità

- Registrazione, login, recupero della password via email, profilo (dati, password, eliminazione account).
- Band: creazione, ingresso con codice di invito, membri con i loro strumenti, uscita ed eliminazione.
- Repertorio: canzoni con artista, versione, tonalità, BPM, durata, energia, note e link; stato "da studiare", "in studio" o "completata" cambiabile con un click; ricerca e filtro.
- Live e prove con luogo e data/ora; calendario con tutti gli eventi delle proprie band.
- Scaletta di ogni live: aggiunta di brani, riordino con trascinamento (anche al tocco e da tastiera), copia da un altro live, durata totale e percentuale di brani pronti.
- Chat AI per ogni band: conosce repertorio, live e prove e può proporre una scaletta da salvare con un click.

## Prerequisiti

- [Docker](https://docs.docker.com/get-docker/) con **Compose v2** (comando `docker compose`).
- Con Ollama: circa **4 GB di spazio libero** (immagine e modello di circa 2 GB) e **8 GB di RAM** consigliati.
- Senza Ollama bastano molte meno risorse (vedi [Avvio senza Ollama](#avvio-senza-ollama)).
- Porte libere sull'host: 3000, 8000, 8025 e 3307 (cambiabili nel `.env`).

## Avvio

### Primo avvio

```bash
git clone <url-del-repository>
cd MusicBand-Manager
cp .env.example .env
docker compose up --build
```

Non servono altri passaggi: al primo avvio il backend genera la chiave dell'applicazione, esegue le migrazioni e crea i dati dimostrativi (`SEED_ON_START=true`). Il servizio `ollama-pull` scarica il modello AI (circa 2 GB) e poi termina: l'app è subito utilizzabile e la chat funziona a download finito.

| Indirizzo | Cosa |
| --- | --- |
| <http://localhost:3000> | Applicazione web |
| <http://localhost:8000/api> | API REST (salute del servizio: <http://localhost:8000/up>) |
| <http://localhost:8025> | Mailpit: le email inviate dall'app (es. reset della password) |
| `localhost:3307` | MySQL, per un client esterno (credenziali nel `.env`) |

### Account demo

| Email | Password | Note |
| --- | --- | --- |
| `demo1@example.com` | `password123` | Giulia, in due band |
| `demo2@example.com` | `password123` | Marco, nella band "Le Onde Elettriche" insieme a Giulia |

I dati demo comprendono due band, circa 15 canzoni, due live (uno con la scaletta) e tre prove, con date vicine al giorno dell'avvio. Per ripristinarli:

```bash
docker compose exec backend php artisan migrate:fresh --seed
```

### Servizi da tenere attivi

| Servizio | Ruolo | Necessario |
| --- | --- | --- |
| `frontend` | React compilato, servito da nginx (porta 3000) | sì |
| `nginx` | ingresso HTTP dell'API (porta 8000) | sì |
| `backend` | Laravel su PHP-FPM | sì |
| `db` | MySQL 8.4, dati nel volume `db_data` | sì |
| `mailpit` | riceve le email di sviluppo | per il reset della password |
| `ollama` | modello AI locale | per la chat (profilo `ai`) |
| `ollama-pull` | scarica il modello e termina | solo al primo avvio (profilo `ai`) |

### Avvio senza Ollama

Su un PC con poca RAM, nel `.env` lascia vuoto il profilo:

```dotenv
COMPOSE_PROFILES=
```

`ollama` e `ollama-pull` non partono e non si scarica nulla. La chat risponde "AI non disponibile" e il resto dell'app funziona normalmente.

### Chat AI: note pratiche

- Avanzamento del download: `docker compose logs -f ollama-pull`; modelli presenti: `docker compose exec ollama ollama list`.
- Su CPU una risposta può richiedere da pochi secondi a qualche decina. Se è troppo lenta, imposta `OLLAMA_MODEL=llama3.2:1b` nel `.env` e riavvia.
- `OLLAMA_NUM_THREAD=4` limita i thread usati: sulle CPU con core P ed E usarli tutti rende il modello molto più lento.

### Comandi utili

| Comando | A cosa serve |
| --- | --- |
| `docker compose up --build` | avvio (ricompila le immagini) |
| `docker compose down` | arresto (i dati restano nei volumi) |
| `docker compose down -v` | arresto ed eliminazione dei dati e del modello scaricato |
| `docker compose logs -f backend` | log del backend |
| `docker compose exec backend php artisan test` | test del backend |
| `npm --prefix frontend run lint` / `run build` | controlli del frontend (con Node installato) |

Se cambi `VITE_API_URL` o le porte nel `.env`, riavvia con `docker compose up --build`: l'indirizzo dell'API è fissato nella build del frontend.

## Provare l'API con Postman

- Esempi di richiesta e risposta di ogni endpoint: [`docs/API.md`](docs/API.md).
- In Postman scegli **Import** e seleziona `docs/postman/rehearsal-setlist-manager.postman_collection.json` e `docs/postman/local.postman_environment.json`, poi attiva l'environment "Music Band Manager - locale".
- Esegui la collection con il **Collection Runner**, in ordine: crea un utente nuovo, salva da sola token e id nelle variabili e alla fine elimina l'account.
- Da terminale: `npx newman run docs/postman/rehearsal-setlist-manager.postman_collection.json -e docs/postman/local.postman_environment.json`.
- Se `API_PORT` non è 8000, cambia `baseUrl` nell'environment.

## Backend di terze parti

Tutte le chiamate a servizi esterni partono dal backend Laravel: il browser parla solo con l'API del progetto e nessuna chiave arriva al frontend.

- **Ollama** (locale, nel container `ollama`): il backend lo chiama all'indirizzo `OLLAMA_BASE_URL` con l'API `/api/chat`, chiedendo una risposta in JSON secondo uno schema (testo e, se serve, proposta di scaletta con i soli id dei brani del repertorio).
- **OpenRouter** (facoltativo, spento di default): usato solo se Ollama non risponde. Per attivarlo crea una chiave gratuita su <https://openrouter.ai> e imposta nel `.env`:

  ```dotenv
  AI_FALLBACK_ENABLED=true
  OPENROUTER_API_KEY=la-tua-chiave
  ```

  La chiave resta nel `.env` (che non si versiona) e viene letta solo dal backend, che chiama l'API compatibile OpenAI di OpenRouter con lo stesso schema JSON.

## Screenshot

Le immagini sono in [`docs/screenshots/`](docs/screenshots/).

| Dashboard | Scaletta di un live | Chat AI |
| --- | --- | --- |
| ![Dashboard con band e calendario](docs/screenshots/dashboard.png) | ![Scaletta di un live](docs/screenshots/scaletta.png) | ![Chat AI con proposta di scaletta](docs/screenshots/chat.png) |

| Repertorio (tema chiaro) | Smartphone |
| --- | --- |
| ![Repertorio della band in tema chiaro](docs/screenshots/repertorio-chiaro.png) | ![Vista da smartphone](docs/screenshots/smartphone.png) |

## Struttura del repository

```text
.
├── backend/              Laravel (API REST)
├── frontend/             React + Material UI
├── docker/               configurazione di nginx e script di Ollama
├── docs/                 specifiche, piano di lavoro, API.md, postman/, screenshots/
├── docker-compose.yml
└── .env.example          da copiare in .env
```

## Sviluppi futuri

- Notifiche (email o push) per prove e live in arrivo.
- Ruoli nella band (es. amministratore) con permessi diversi.
- Disponibilità dei membri per le date e proposta automatica delle prove.
- Allegati alle canzoni (spartiti, testi, accordi) e anteprima audio.
- Esportazione della scaletta in PDF da stampare per il palco.
- Statistiche sul repertorio e sui brani suonati più spesso.
- Ambiente di sviluppo con hot reload (`docker-compose.dev.yml`) e test automatici del frontend.

## Riferimenti

- Laravel: <https://laravel.com/docs> · Sanctum: <https://laravel.com/docs/sanctum>
- Ollama: <https://ollama.com> · API: <https://github.com/ollama/ollama/blob/main/docs/api.md> · Modello: <https://ollama.com/library/llama3.2>
- OpenRouter: <https://openrouter.ai/docs>
- Material UI: <https://mui.com/material-ui/> · MUI X Date Pickers: <https://mui.com/x/react-date-pickers/>
- Atkinson Hyperlegible: <https://www.brailleinstitute.org/freefont/> · pacchetto: <https://fontsource.org/fonts/atkinson-hyperlegible>
- React: <https://react.dev> · Vite: <https://vite.dev> · react-i18next: <https://react.i18next.com>
- FullCalendar: <https://fullcalendar.io/docs/react> · dnd-kit: <https://docs.dndkit.com>
- Docker Compose: <https://docs.docker.com/compose/> · Palette dei colori: <https://coolors.co/0d1b2a-1b263b-415a77-778da9-ffffff>
