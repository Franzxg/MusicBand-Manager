# Music Band Manager

Web app per organizzare una band musicale: membri e strumenti, repertorio con lo stato di preparazione dei brani, prove, live con la loro scaletta e una chat AI locale (Ollama) che risponde sui dati della band e propone scalette.

Frontend React + Material UI, API Laravel, database MySQL, tutto avviato con Docker Compose. Le specifiche complete sono in [`docs/specifiche.md`](docs/specifiche.md).

## Indice

1. [Funzionalità](#funzionalità)
2. [Screenshot](#screenshot)
3. [Architettura e scelte tecniche](#architettura-e-scelte-tecniche)
4. [Prerequisiti](#prerequisiti)
5. [Avvio rapido](#avvio-rapido)
6. [Come provare il sistema](#come-provare-il-sistema)
7. [API, Postman e test](#api-postman-e-test)
8. [Chat AI con Ollama](#chat-ai-con-ollama)
9. [Backend di terze parti: OpenRouter](#backend-di-terze-parti-openrouter)
10. [Struttura del repository](#struttura-del-repository)
11. [Problemi comuni](#problemi-comuni)
12. [Funzionalità future](#funzionalità-future)
13. [Riferimenti](#riferimenti)
14. [Autore](#autore)

## Funzionalità

- **Account**: registrazione, login, password dimenticata con link via email, profilo (nome, email, cambio password, eliminazione dell'account). Nella Navbar e nel profilo c'è un avatar con le iniziali.
- **Band e membri**: creazione di una band, ingresso con un codice di invito, strumenti di ogni membro, rimozione di un membro, uscita ed eliminazione della band. Un utente può stare in più band; la band corrente compare nella Navbar.
- **Repertorio**: canzoni con titolo, artista, versione, link, durata, tonalità, energia (1-5), BPM e note. Ogni brano ha uno stato: da studiare, in studio o completato. Ricerca per titolo, filtro per stato, conteggio e durata totale.
- **Live e scaletta**: per ogni live si costruisce la scaletta con brani del repertorio o nuovi. Il riordino funziona trascinando (anche al tocco e da tastiera) o con i pulsanti su/giù. La scaletta si può copiare da un altro live. Durata totale e percentuale di brani completati arrivano dall'API.
- **Prove**: luogo, data/ora e note.
- **Calendario**: live e prove di tutte le proprie band, in vista mensile o a elenco (su smartphone).
- **Chat AI**: per ogni band, risponde su repertorio, live e prove e propone una scaletta che si salva in un live con un click.
- **Interfaccia**: tema chiaro e scuro, italiano e inglese, pensata anche per smartphone.

## Screenshot

| Dashboard (tema scuro) | Scaletta di un live |
| --- | --- |
| ![Dashboard con le band dell'utente e il calendario del mese](docs/screenshots/dashboard.png) | ![Pagina di un live con barra di progresso, durata totale e brani della scaletta](docs/screenshots/scaletta.png) |
| Le band dell'utente e il calendario con live e prove. | Progresso, durata totale e riordino della scaletta. |

| Chat AI | Repertorio (tema chiaro) |
| --- | --- |
| ![Chat AI con una proposta di scaletta e il pulsante per salvarla](docs/screenshots/chat.png) | ![Tabella del repertorio con stati dei brani, conteggio e durata totale](docs/screenshots/repertorio-chiaro.png) |
| Proposta di scaletta da salvare in un live. | Stati dei brani, ricerca, filtro e durata totale. |

<img src="docs/screenshots/smartphone.png" alt="Dashboard su uno smartphone largo 360 pixel, con menu compatto e una sola colonna" width="260">

Vista da smartphone (360 px): menu a cassetto e una sola colonna.

## Architettura e scelte tecniche

```mermaid
flowchart LR
    browser["Browser"]
    frontend["frontend<br/>nginx + build React<br/>porta 3000"]
    nginx["nginx<br/>ingresso API<br/>porta 8000"]
    backend["backend<br/>Laravel su php-fpm"]
    db[("db<br/>MySQL 8.4")]
    mailpit["mailpit<br/>email di sviluppo<br/>porta 8025"]
    ollama["ollama<br/>llama3.2:3b su CPU<br/>profilo ai"]
    openrouter["OpenRouter<br/>servizio esterno, facoltativo"]

    browser --> frontend
    browser -->|"API REST + token"| nginx
    nginx -->|"FastCGI"| backend
    backend --> db
    backend -->|"SMTP"| mailpit
    backend --> ollama
    backend -.->|"solo fallback"| openrouter
```

Il browser carica il frontend e chiama l'API. Solo il backend parla con database, Mailpit, Ollama e, se attivo, OpenRouter.

| Scelta | Motivo | Compromesso |
| --- | --- | --- |
| Monorepo | Vincolo del corso: un solo repository, ogni servizio nella sua cartella, avvio dalla radice con un comando. | Backend e frontend condividono storia e commit. |
| nginx + php-fpm invece di `artisan serve` | La chat su CPU può superare i 60 secondi e servono richieste in parallelo. Timeout FastCGI, php-fpm e `max_execution_time` sono a 180 secondi. | Un container in più. Se si ricostruisce solo il backend, nginx risponde 502 finché non si esegue `docker compose restart nginx`. |
| MySQL 8.4 | Database richiesto dalle specifiche; dati nel volume `db_data`. | I test girano su SQLite in memoria (per non toccare i dati di sviluppo), quindi non provano differenze specifiche di MySQL. |
| Laravel Sanctum con token Bearer | API stateless, senza sessioni né cookie; lo stesso token funziona dal frontend e da Postman. | Il frontend salva il token nel `localStorage` e i token non hanno scadenza (`expiration` nullo). |
| React + Material UI + Vite | Stack del progetto. MUI dà tema chiaro/scuro (`createTheme`), dialog, tabelle e date picker. | La build segnala un bundle sopra i 500 kB, soprattutto per MUI; l'avviso è accettato. |
| dnd-kit per la scaletta | Riordino con mouse, tocco (maniglia di 44 px) e tastiera, con annunci per lettori di schermo; in più i pulsanti su/giù. | Lo spostamento del brano trascinato è scritto a mano (solo verticale). |
| FullCalendar | Vista mensile a griglia e vista a elenco (`listMonth`) per smartphone. | Gli stili si adattano al tema con variabili CSS e qualche regola che sovrascrive quelle di FullCalendar. |
| react-i18next | Testi in `it.json` ed `en.json`. Ogni richiesta invia `Accept-Language`, così anche validazione ed email di reset sono nella lingua scelta. | Ogni testo va scritto in due file. |
| Font Atkinson Hyperlegible | Pensato per la leggibilità; arriva dal pacchetto npm `@fontsource`, quindi nessuna richiesta a Google Fonts e funziona anche offline. | Un solo font con due pesi (400 e 700). |
| Durata e progresso calcolati dal backend | Non si salvano: si calcolano a ogni richiesta con una query aggregata (`withCount` e `withSum`), quindi non vanno fuori sincrono. Il frontend mostra i valori ricevuti. | Ogni modifica alla scaletta rilegge il live. Eccezione: la durata totale del repertorio la somma il browser, che ha già tutti i brani. |
| Password dimenticata con Mailpit | Password Broker di Laravel; il link porta al frontend e scade dopo 60 minuti; dopo il reset tutti i token vengono revocati. In sviluppo Mailpit intercetta le email. | Nessuna email reale: in produzione servirebbe un server SMTP vero. |
| Band eliminata quando esce l'ultimo membro | Non restano band senza membri (vale anche se un utente elimina l'account). | Tutti i membri hanno gli stessi permessi, compresi eliminare la band e rimuovere altri membri. |
| Codice di invito con limite di tentativi | 8 caratteri senza simboli ambigui (niente 0/O, 1/I); l'ingresso è limitato a 10 tentativi al minuto per utente. | Login, password dimenticata e reset non hanno limite di tentativi. |

Dettagli e decisioni prese durante lo sviluppo: [`docs/specifiche.md`](docs/specifiche.md).

## Prerequisiti

- **Docker con Compose v2** (comando `docker compose`). Su Windows e macOS: Docker Desktop. Su Linux: Docker Engine con il plugin Compose.
- **Con Ollama**: circa 4 GB di spazio libero (il modello pesa circa 2 GB) e 8 GB di RAM consigliati.
- **Senza Ollama**: servono molte meno risorse (vedi [Avvio senza Ollama](#avvio-senza-ollama)).
- **Git**. Il file [`.gitattributes`](.gitattributes) forza gli a capo LF su script e file di configurazione: con gli a capo CRLF di Windows gli script non funzionerebbero dentro i container.

Node e PHP non servono sul computer: tutto gira nei container.

## Avvio rapido

### Primo avvio

```bash
git clone https://github.com/Franzxg/MusicBand-Manager
cd MusicBand-Manager
cp .env.example .env
docker compose up --build
```

`.env` è l'unico file locale necessario e non si versiona. I valori di `.env.example` funzionano così come sono.

Cosa succede al primo avvio:

1. Vengono costruite le immagini di backend e frontend e scaricate quelle di MySQL, nginx, Mailpit e Ollama.
2. Il backend aspetta che MySQL sia pronto, genera una chiave dell'applicazione se `APP_KEY` è vuota ed esegue le migrazioni.
3. Con `SEED_ON_START=true`, e solo se non ci sono utenti, crea i dati dimostrativi.
4. Il servizio `ollama-pull` scarica il modello `llama3.2:3b` (circa 2 GB) e poi termina. Il tempo dipende dalla connessione. L'app si può usare subito; la chat risponde a download finito.

Come capire che è pronto:

- <http://localhost:8000/up> risponde con la pagina di stato di Laravel: l'API è attiva.
- <http://localhost:3000> mostra la pagina di login.
- Per la chat: `docker compose logs ollama-pull` termina con `Modello llama3.2:3b pronto.`; `docker compose exec ollama ollama list` elenca il modello.

### Avvio senza Ollama

Su un PC con poca RAM, nel `.env` lascia vuoto il profilo e avvia normalmente:

```dotenv
COMPOSE_PROFILES=
```

`ollama` e `ollama-pull` non partono e non si scarica nulla. La chat risponde "AI non disponibile" e il resto dell'app funziona.

### Servizi, indirizzi e porte

| Servizio | Indirizzo | Variabile nel `.env` | Note |
| --- | --- | --- | --- |
| `frontend` | <http://localhost:3000> | `FRONTEND_PORT` | Applicazione web |
| `nginx` | <http://localhost:8000/api> | `API_PORT` | API REST; stato su `/up` |
| `backend` | nessuna porta sull'host | | Laravel su php-fpm, raggiungibile tramite nginx |
| `db` | `localhost:3307` | `DB_HOST_PORT` | MySQL; utente, password e database in `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` |
| `mailpit` | <http://localhost:8025> | `MAILPIT_PORT` | Interfaccia web delle email inviate dall'app |
| `ollama` | `127.0.0.1:11434` | | Solo con `COMPOSE_PROFILES=ai`, raggiungibile solo dal computer locale |
| `ollama-pull` | nessuna | | Scarica il modello e termina |

Per usare l'app servono `frontend`, `nginx`, `backend` e `db`. `mailpit` serve per il reset della password, `ollama` per la chat.

### Account demo

| Email | Password | Band |
| --- | --- | --- |
| `demo1@example.com` | `password123` | Giulia Demo: "Le Onde Elettriche" e "Duo Notturno" |
| `demo2@example.com` | `password123` | Marco Demo: "Le Onde Elettriche" |

I dati comprendono 15 canzoni (12 della prima band e 3 della seconda), due live di "Le Onde Elettriche" (uno con una scaletta di 6 brani) e tre prove. Le date sono calcolate a partire dal giorno del seed. Per ripristinarli:

```bash
docker compose exec backend php artisan migrate:fresh --seed
```

### Fermare tutto

```bash
docker compose down      # ferma e rimuove i container; database e modello restano nei volumi
docker compose down -v   # come sopra, ma cancella anche i volumi: database e modello scaricato
```

Dopo `down -v` il prossimo avvio ricrea il database con i dati demo e riscarica il modello.

## Come provare il sistema

Tutte le funzionalità si provano dal browser, senza Postman. I passi usano gli [account demo](#account-demo); i nomi tra virgolette sono i testi dei pulsanti nell'interfaccia in italiano.

### Prima di iniziare: due account insieme

Il browser conserva l'accesso nel `localStorage`, che è **condiviso da tutte le schede della stessa finestra**. Se in due schede normali accedi con due account diversi, l'ultimo login sostituisce il primo anche nell'altra scheda: le richieste partono con l'account sbagliato (ad esempio "Unisciti" risponde che sei già membro).

Per provare due account insieme usa **un account per finestra**:

- `demo1@example.com` in una finestra normale;
- `demo2@example.com`, o un account nuovo, in una **finestra in incognito** (Ctrl+Shift+N in Chrome ed Edge, Ctrl+Shift+P in Firefox), oppure in un altro browser o profilo.

Anche tutte le schede in incognito condividono la stessa memoria: non usare due account in due schede incognito.

Se qualcosa non torna, ripristina i dati demo con `docker compose exec backend php artisan migrate:fresh --seed`.

### Account e profilo

1. **Registrazione**: dalla pagina di login scegli "Non hai un account? Registrati". Con dati non validi (ad esempio una password sotto gli 8 caratteri o un'email già usata) gli errori compaiono sotto i campi.
2. **Login e logout**: accedi con `demo1@example.com` / `password123`; per uscire usa il menu utente in alto a destra, voce "Esci".
3. **Password dimenticata**: dalla pagina di login scegli "Password dimenticata?" e inserisci `demo2@example.com`. Apri Mailpit su <http://localhost:8025>, apri l'email e segui il link per scegliere una nuova password. Per tornare a `password123` ripristina i dati demo.
4. **Profilo** (menu utente, "Profilo"): modifica nome ed email e salva; il nome si aggiorna anche nella Navbar.
5. **Cambio password**: con lo stesso account aperto in una finestra normale e in una in incognito, cambia la password in una delle due. Alla prossima azione l'altra finestra torna al login con il messaggio "La sessione è scaduta. Accedi di nuovo."
6. **Eliminazione dell'account**: usa un account di prova, non quelli demo. "Elimina account" chiede la password; le band in cui eri l'unico membro vengono eliminate.

### Band e membri

1. **Dashboard**: con demo1 vedi "Le Onde Elettriche" e "Duo Notturno" e il calendario.
2. **Crea una band**: "Crea band", con nome, genere e almeno uno strumento. Si apre la pagina della band.
3. **Codice di invito**: nella band, tab "Membri", copia il codice con l'icona accanto. "Rigenera" crea un codice nuovo e rende inutilizzabile il vecchio.
4. **Entrare in una band**: nella finestra in incognito, con un altro account, scegli "Unisciti a una band", incolla il codice, indica uno strumento e conferma. Ricarica la pagina della band nella finestra di demo1: il nuovo membro compare nel tab "Membri".
5. **Errori dell'invito**: un codice inesistente o un utente già membro danno un errore sotto il campo del codice. Dopo 10 tentativi in un minuto compare "Troppi tentativi".
6. **Strumenti**: nel tab "Membri", "Modifica strumenti" cambia i tuoi strumenti in quella band.
7. **Modifica ed eliminazione**: "Modifica" nell'intestazione della band cambia nome e genere; "Elimina band" chiede conferma.
8. **Rimozione e uscita**: l'icona accanto a un altro membro lo rimuove; "Esci dalla band" ti fa uscire. Se esce l'ultimo membro, la band viene eliminata.
9. **Band corrente**: con la finestra larga, il pulsante con il nome della band nella Navbar apre il menu per passare a un'altra band.

### Repertorio

1. Nella band "Le Onde Elettriche", tab "Repertorio": sopra l'elenco ci sono numero di canzoni e durata totale.
2. **Aggiungi canzone**: titolo, artista e durata (formato `3:45`) sono obbligatori; versione, tonalità, BPM, energia, link e note sono facoltativi. Una durata scritta male dà un errore sotto il campo.
3. **Duplicati**: una canzone con lo stesso titolo, artista e versione di una esistente viene rifiutata.
4. **Stato**: clicca sul badge di un brano (da studiare, in studio, completata) per cambiarlo.
5. **Ricerca e filtro**: "Cerca per titolo" e "Stato"; la riga sopra l'elenco mostra anche la durata dei soli brani filtrati.
6. **Modifica ed eliminazione**: icone matita e cestino. L'eliminazione avvisa che il brano sparisce anche dalle scalette.

### Live e scaletta

1. Tab "Live": apri "Festa della Musica, Piazza Grande". In alto ci sono percentuale di brani completati, durata totale e numero di brani.
2. **Aggiungi brano**: scheda "Dal repertorio" per un brano esistente, oppure "Brano nuovo", che viene salvato anche nel repertorio.
3. **Riordino**: trascina la maniglia a sinistra del brano, usa i pulsanti su/giù, oppure da tastiera porta il focus sulla maniglia e usa Spazio, frecce, Spazio.
4. **Progresso**: cambia lo stato di un brano dalla scaletta e osserva la percentuale aggiornarsi.
5. **Rimozione**: l'icona a destra toglie il brano dalla scaletta senza cancellarlo dal repertorio.
6. **Note**: note del live e note della scaletta si salvano con "Salva le note".
7. **Copia**: apri "Pub The Anchor" (scaletta vuota) e usa "Copia da un altro live" scegliendo la Festa della Musica. Se la scaletta di destinazione non è vuota, il pulsante diventa "Sostituisci la scaletta".
8. **Nuovo live**: dal tab "Live", "Aggiungi live" con luogo e data/ora; si apre subito la sua pagina. "Modifica" ed "Elimina live" sono nell'intestazione.

### Prove e calendario

1. Tab "Prove": "Aggiungi prova" con luogo, data/ora e note. Cliccando una prova si modifica o si elimina.
2. I tab "Live" e "Prove" mostrano solo gli eventi futuri.
3. **Calendario** in dashboard: "Mese" ed "Elenco" cambiano vista, le frecce cambiano mese. Un clic su un live apre la sua pagina; un clic su una prova apre la finestra di modifica.

### Chat AI

Serve Ollama attivo e il modello scaricato (vedi [Chat AI con Ollama](#chat-ai-con-ollama)).

1. Nella band, tab "Chat AI": usa uno dei suggerimenti, ad esempio "Proponi una scaletta da 45 minuti per il prossimo live".
2. La risposta può richiedere decine di secondi. Con una proposta compare una card con brani, durata totale e note.
3. Scegli il "Live di destinazione" e premi "Salva come scaletta" (o "Scarta"). Se il live ha già una scaletta, viene chiesta conferma prima di sostituirla.
4. Cambia tab o pagina e torna: la conversazione resta finché non premi "Nuova conversazione", esci o chiudi la scheda.
5. **Senza Ollama** (`COMPOSE_PROFILES=` vuoto, oppure `docker compose stop ollama`) la chat mostra "AI non disponibile" e il resto dell'app funziona.

### Interfaccia

1. **Tema**: l'icona sole/luna nella Navbar passa dal tema scuro al chiaro; la scelta resta dopo un ricaricamento.
2. **Lingua**: il selettore "IT"/"EN" nella Navbar (o nella pagina di login) traduce l'interfaccia e anche i messaggi di errore dell'API.
3. **Smartphone**: negli strumenti per sviluppatori del browser (F12, poi Ctrl+Shift+M) imposta 360 px. La Navbar diventa un menu a cassetto, la dashboard una colonna, il calendario un elenco e il repertorio righe espandibili.
4. **Guida e 404**: "Guida" nella Navbar spiega le funzioni; un indirizzo inesistente (ad esempio <http://localhost:3000/pagina-inesistente>) mostra la pagina 404.

### API senza Postman

Per una prova veloce dell'API da terminale con `curl` (in PowerShell usa `curl.exe`):

```bash
# login: la risposta contiene "token"
curl -X POST http://localhost:8000/api/login \
  -H "Accept: application/json" -H "Content-Type: application/json" \
  -d '{"email":"demo1@example.com","password":"password123"}'

# richiesta protetta: sostituisci TOKEN con il valore ricevuto
curl http://localhost:8000/api/bands \
  -H "Accept: application/json" -H "Authorization: Bearer TOKEN"
```

Tutti gli endpoint, con corpo delle richieste ed esempi di risposta, sono in [`docs/API.md`](docs/API.md).

## API, Postman e test

- **Documentazione**: [`docs/API.md`](docs/API.md) contiene esempi reali di richiesta e risposta per ogni endpoint. Base URL: `http://localhost:8000/api`.
- **Collection Postman**: in Postman scegli **Import** e seleziona i due file in [`docs/postman/`](docs/postman/), cioè `music-band-manager.postman_collection.json` e `local.postman_environment.json`. Poi attiva l'environment "Music Band Manager - locale".
- **Ordine**: esegui la collection dall'inizio, ad esempio con il **Collection Runner**. La prima richiesta registra un utente nuovo con un'email sempre diversa. Gli script salvano da soli token e id nell'environment, e il token viene inviato come Bearer da tutte le richieste protette. Le ultime richieste eliminano gli account creati.
- **Da terminale**, con Node installato:

  ```bash
  npx newman run docs/postman/music-band-manager.postman_collection.json -e docs/postman/local.postman_environment.json
  ```

- Se cambi `API_PORT`, aggiorna `baseUrl` nell'environment.
- La richiesta della chat accetta sia 200 sia 503, così la collection passa anche senza Ollama.

**Test del backend** (feature test PHPUnit su SQLite in memoria, non toccano il database di sviluppo):

```bash
docker compose exec backend php artisan test
```

**Controlli del frontend** (con Node installato sul computer):

```bash
npm --prefix frontend ci
npm --prefix frontend run lint
npm --prefix frontend run build
```

## Chat AI con Ollama

**Cosa fa.** La chat di ogni band risponde a domande su repertorio, live e prove e, se richiesto, propone una scaletta. La proposta compare in una card con brani, durata reale e note, e si salva in un live futuro con un click.

**Come funziona.**

1. Il frontend invia a `POST /api/bands/{band}/chat` gli ultimi messaggi della conversazione.
2. `BandContextBuilder` prepara un contesto compatto: band, membri con i soli nomi e strumenti (mai l'email), repertorio (massimo 100 brani), prossimi live con durata e percentuale già calcolate, prossime prove.
3. `AiChatService` chiede al modello una risposta in JSON secondo uno schema. Gli id dei brani ammessi sono un `enum` con i soli id del repertorio.
4. `OllamaClient` chiama l'API `/api/chat` di Ollama, senza streaming.
5. Il backend valida la risposta: scarta gli id non validi e i doppioni e calcola lui la durata totale della proposta. Se la risposta non è JSON, la mostra come testo senza proposta.

**Perché Ollama in locale.** Nessun costo, nessuna chiave da gestire, e i dati della band restano sulla macchina. Il compromesso: un modello piccolo, solo su CPU, risponde lentamente (su CPU anche decine di secondi) ed è meno preciso.

**Modello.** Il predefinito è `llama3.2:3b` (`OLLAMA_MODEL` in `.env.example`). Per cambiarlo modifica `OLLAMA_MODEL` nel `.env` e riavvia con `docker compose up -d`: `ollama-pull` scarica il nuovo modello. Se le risposte sono troppo lente, `llama3.2:1b` è più leggero. `OLLAMA_NUM_THREAD=4` limita i thread della CPU: sulle CPU con core P ed E usarli tutti rende il modello molto più lento. Le altre variabili (`OLLAMA_NUM_CTX`, `OLLAMA_KEEP_ALIVE`, `OLLAMA_TIMEOUT`) sono in `.env.example` e descritte in [`docs/specifiche.md`](docs/specifiche.md).

**Limiti.** I modelli piccoli sbagliano facilmente i calcoli e i confronti su molti brani, per esempio nel sommare le durate. Per questo i dati calcolabili li calcola il backend: durata e progresso dei live nel contesto, durata reale della proposta. La durata della proposta può comunque scostarsi da quella chiesta, perché la scelta dei brani resta del modello.

**Altri modelli provati.** Ho provato anche `llama3.1:8b` e `qwen3.5:4b`. Con entrambi lo schema JSON funzionava, ma sul mio PC con sola CPU erano più lenti e non ho potuto confrontare la qualità con rigore, quindi il predefinito resta il modello leggero.

**Senza Ollama** (profilo non attivo, modello non ancora scaricato o nessuna risposta entro `OLLAMA_TIMEOUT` secondi) la chat risponde 503 "AI non disponibile" e il resto dell'app funziona. Il limite è di 10 richieste al minuto per utente; oltre si riceve 429 e il frontend mostra "Troppe richieste".

## Backend di terze parti: OpenRouter

[OpenRouter](https://openrouter.ai) è un servizio esterno che dà accesso a vari modelli tramite un'API compatibile con quella di OpenAI. Nel progetto è un **fallback facoltativo, spento di default**.

**Come si attiva.** Crea una chiave gratuita su <https://openrouter.ai> e imposta nel `.env`:

```dotenv
AI_FALLBACK_ENABLED=true
OPENROUTER_API_KEY=la-tua-chiave
# facoltativo: modello da usare (default openrouter/free)
OPENROUTER_MODEL=openrouter/free
```

Poi riavvia il backend con `docker compose up -d`.

**Come avviene il collegamento.** La chiamata la fa solo il backend Laravel (`OpenRouterClient`) verso `https://openrouter.ai/api/v1/chat/completions`, con la chiave nell'header `Authorization: Bearer`. Il frontend non parla mai con OpenRouter e la chiave non esce dal server: sta nel `.env`, che non si versiona. Si usa lo stesso schema JSON di Ollama (`response_format` di tipo `json_schema`), con un timeout di 45 secondi.

**Quando scatta.** Solo se Ollama non risponde: servizio irraggiungibile, errore (ad esempio modello non scaricato) o timeout. Se Ollama risponde, OpenRouter non viene chiamato.

**In caso di errore.** Con la chiave mancante il fallback viene saltato. Se OpenRouter risponde con un errore, ad esempio 429 quando si supera il limite delle richieste gratuite, la chat risponde 503 "AI non disponibile", come senza Ollama. L'errore resta nei log del backend (`docker compose logs backend`).

## Struttura del repository

```text
.
├── backend/                 API Laravel
│   ├── app/                 controller, Form Request, Policy, Resource, modelli
│   │   └── Services/Ai/     chat AI: AiChatService, BandContextBuilder, OllamaClient, OpenRouterClient
│   ├── config/ai.php        configurazione di Ollama e OpenRouter
│   ├── database/            migrazioni e seeder dimostrativo
│   ├── docker/              entrypoint, php.ini e configurazione di php-fpm
│   ├── lang/                messaggi in italiano e inglese
│   ├── routes/api.php       rotte dell'API
│   └── tests/Feature/       feature test
├── frontend/                React + Material UI (Vite)
│   ├── src/
│   │   ├── api/             client axios e funzioni per risorsa
│   │   ├── components/      componenti riutilizzabili
│   │   ├── context/         autenticazione, tema, lingua, notifiche
│   │   ├── hooks/           lettura dei dati dall'API
│   │   ├── locales/         it.json ed en.json
│   │   ├── pages/           pagine dell'app
│   │   └── theme/           tema MUI e palette
│   └── nginx.conf           server dei file statici
├── docker/
│   ├── nginx/default.conf   ingresso dell'API verso php-fpm
│   └── ollama/pull.sh       download del modello
├── docs/
│   ├── specifiche.md        specifiche complete
│   ├── piano-di-lavoro.md   fasi di sviluppo
│   ├── API.md               esempi di richiesta e risposta
│   ├── postman/             collection ed environment
│   └── screenshots/         immagini usate in questo README
├── docker-compose.yml
├── .env.example             da copiare in .env
└── .gitattributes           a capo LF
```

## Problemi comuni

**Porta già occupata.** Cambia la porta nel `.env` (`FRONTEND_PORT`, `API_PORT`, `DB_HOST_PORT`, `MAILPIT_PORT`). Se cambi `API_PORT`, aggiorna anche `APP_URL` e `VITE_API_URL`. Se cambi `FRONTEND_PORT`, aggiorna `FRONTEND_URL`: serve al CORS e ai link nelle email. Poi riavvia con `docker compose up --build`, perché l'indirizzo dell'API è fissato nella build del frontend. La porta 11434 di Ollama non è configurabile: se Ollama è già installato e attivo sul computer, fermalo prima di avviare il profilo `ai`.

**La chat risponde "AI non disponibile" (503).**
- Controlla che nel `.env` ci sia `COMPOSE_PROFILES=ai`.
- Controlla che il download sia finito: `docker compose logs ollama-pull`, `docker compose exec ollama ollama list`.
- Leggi la causa nei log: `docker compose logs backend`. Ad esempio, un 404 di Ollama indica un modello non scaricato; un timeout indica che il modello è troppo lento per il PC.
- Se il modello è troppo lento, prova `OLLAMA_MODEL=llama3.2:1b`.

**Memoria insufficiente.** Con Ollama attivo servono circa 8 GB di RAM. Su Windows e macOS controlla la memoria assegnata a Docker Desktop. In alternativa usa `llama3.2:1b` o avvia senza Ollama (`COMPOSE_PROFILES=`).

**Errori del database dopo un aggiornamento del codice, o live demo non più visibili.** Le migrazioni partono a ogni avvio, ma se lo schema non è più allineato, o se le date demo sono ormai passate (i tab Live e Prove mostrano solo eventi futuri), ricrea il database con i dati dimostrativi:

```bash
docker compose exec backend php artisan migrate:fresh --seed
```

Attenzione: cancella tutti i dati.

**Con due account in due schede, "Unisciti" risponde che sei già membro o non fa nulla.** Le schede della stessa finestra condividono l'accesso: l'ultimo login vale per tutte. Usa un account per finestra, ad esempio il secondo in una finestra in incognito (vedi [Prima di iniziare: due account insieme](#prima-di-iniziare-due-account-insieme)).

**Errore 502 dopo aver ricostruito solo il backend.** Esegui `docker compose restart nginx`.

**L'email di reset non arriva.** Le email non escono dal computer: si leggono in Mailpit su <http://localhost:8025>. La richiesta risponde sempre con successo, ma l'email parte solo se l'indirizzo è registrato. Il link vale 60 minuti e porta all'indirizzo di `FRONTEND_URL`.

**Il backend non parte su Windows, con errori negli script che contengono `\r`.** Gli script hanno a capo CRLF. Il file `.gitattributes` forza LF, quindi basta una clone nuova del repository. Evita di copiare i file da archivi o editor che convertono gli a capo.

## Funzionalità future

- **Accessibilità.** Oggi ci sono contrasti verificati (almeno 4.5:1), riordino della scaletta da tastiera, il font Atkinson Hyperlegible, etichette tradotte e annunci per lettori di schermo nella chat e nelle notifiche. Il passo successivo è un audit con lettore di schermo (NVDA, VoiceOver) e test automatici con axe o Lighthouse, perché finora i controlli sono stati manuali. Mancano anche un link "vai al contenuto", utile a chi naviga da tastiera, e una revisione completa degli annunci dinamici.
- **Autenticazione.**
  - Verifica dell'indirizzo email alla registrazione: oggi qualsiasi indirizzo viene accettato.
  - Autenticazione a due fattori.
  - Scadenza dei token: oggi non scadono.
  - Elenco dei dispositivi collegati, con revoca dei singoli accessi: oggi gli altri token si revocano solo cambiando password.
  - Limite di tentativi anche su login e password dimenticata: oggi c'è solo su ingresso in band e chat.
- **Foto profilo** con caricamento di un file: oggi l'avatar mostra solo le iniziali.
- **Chat AI.**
  - Note di transizione tra un brano e l'altro.
  - Tonalità compatibili calcolate dal backend, come già succede per le durate.
  - Suggerimento di brani nuovi con un modello più capace: uno piccolo tende a inventare titoli.
  - Supporto GPU e modelli più grandi come opzione.
  - Contatore giornaliero delle richieste a OpenRouter, per restare nei limiti gratuiti.
- **Scaletta in PDF** o stampa pensata per il palco, da leggere durante il live.
- **Test end-to-end del frontend e integrazione continua** (GitHub Actions): oggi il frontend si controlla solo con lint e build, e i test del backend si lanciano a mano.
- **Hot reload in sviluppo** con un `docker-compose.dev.yml`: oggi ogni modifica al frontend richiede una nuova build dell'immagine.
- **Notifiche o promemoria** per prove e live in arrivo.

## Riferimenti

- Laravel: <https://laravel.com/docs>
- Laravel Sanctum: <https://laravel.com/docs/sanctum>
- Ollama: <https://ollama.com> e <https://github.com/ollama/ollama>
- OpenRouter: <https://openrouter.ai/docs>
- Material UI: <https://mui.com/material-ui/>
- React: <https://react.dev>
- Vite: <https://vite.dev>
- FullCalendar: <https://fullcalendar.io/docs/react>
- dnd-kit: <https://github.com/clauderic/dnd-kit>
- react-i18next: <https://react.i18next.com>
- Atkinson Hyperlegible: <https://fontsource.org/fonts/atkinson-hyperlegible>
- Mailpit: <https://mailpit.axllent.org>
- Docker Compose: <https://docs.docker.com/compose/>
- Postman: <https://learning.postman.com>

## Autore

Franzxg, progetto finale del corso Fullstack ITS FS25.
