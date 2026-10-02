# API di Music Band Manager

Esempi di richiesta e risposta di ogni endpoint. Le risposte sono reali: sono state ottenute dall'API in esecuzione (dati demo del seeder e collection Postman eseguita con `newman`). Dove un oggetto si ripete identico è accorciato con `...` e un rimando.

Il frontend si basa su questo file. Le regole complete sono in `docs/specifiche.md` ("Backend & API").

## Indice

- [Convenzioni](#convenzioni)
- [Oggetti](#oggetti)
- [Auth](#auth)
- [Profilo](#profilo)
- [Band e membri](#band-e-membri)
- [Repertorio](#repertorio)
- [Live e scaletta](#live-e-scaletta)
- [Prove](#prove)
- [Calendario](#calendario)
- [Chat AI](#chat-ai)

## Convenzioni

- **Base URL**: `http://localhost:8000/api` (porta `API_PORT` del `.env`).
- **Header** di ogni richiesta: `Accept: application/json`; per i body `Content-Type: application/json`.
- **Lingua**: `Accept-Language: it` oppure `en` (default `it`). Cambia i messaggi di errore e l'email di reset.
- **Autenticazione**: `Authorization: Bearer <token>`, con il token ricevuto da `register` o `login`. Pubbliche solo `register`, `login`, `forgot-password` e `reset-password`.
- **Formato**: le risorse sono avvolte in `data` (`{ "data": { ... } }` oppure `{ "data": [ ... ] }`). Nessuna paginazione. Fanno eccezione `register` e `login` (`{ token, user }`) e i messaggi di `forgot-password` e `reset-password` (`{ message }`).
- **Date**: in uscita sempre in UTC, es. `2030-06-01T19:30:00.000000Z`. In ingresso ISO 8601, anche con fuso (`2030-06-01T21:30:00+02:00` viene salvata come `19:30Z`).
- **Codici**: 200, 201 (creazione), 204 (eliminazione e poche altre azioni, senza body), 401, 403, 404, 422, 429 (troppi tentativi su `join` e chat).

### Errori

**401** token assente o non valido:

```json
{ "message": "Unauthenticated." }
```

**403** risorsa di una band di cui l'utente non è membro (es. `GET /bands/2` da un utente esterno):

```json
{ "message": "This action is unauthorized." }
```

**404** risorsa inesistente (es. `GET /bands/999`):

```json
{ "message": "No query results for model [App\\Models\\Band] 999" }
```

Con `APP_DEBUG=true` (sviluppo) le risposte 403, 404 e 500 contengono anche `exception`, `file`, `line` e `trace`: il frontend deve usare solo lo status e, al massimo, `message`.

**422** dati non validi: `message` riassuntivo ed `errors` con un elenco di messaggi per campo.

```json
{
  "message": "Il campo nome è obbligatorio. (e altri 3 errori)",
  "errors": {
    "name": ["Il campo nome è obbligatorio."],
    "email": ["Il campo email deve essere un indirizzo email valido."],
    "password": [
      "Il campo password deve avere almeno 8 caratteri.",
      "La conferma del campo password non corrisponde."
    ]
  }
}
```

Stessa richiesta con `Accept-Language: en`:

```json
{
  "message": "The name field is required. (and 2 more errors)",
  "errors": {
    "name": ["The name field is required."],
    "email": ["The email field must be a valid email address."],
    "password": ["The password field is required."]
  }
}
```

## Oggetti

**User** (solo per l'utente autenticato; degli altri membri non esce mai l'email)

```json
{ "id": 3, "name": "Utente Postman", "email": "postman+1790934407152@example.com", "created_at": "2026-10-02T09:46:47.000000Z" }
```

**Band** (elenco). Nel dettaglio si aggiunge `members`: `[{ id, name, instruments }]`.

| Campo | Tipo | Note |
| --- | --- | --- |
| `id` | int | |
| `name` | string | |
| `genre` | string o null | |
| `invite_code` | string | 8 caratteri |
| `members_count` | int | |
| `my_instruments` | string[] | strumenti dell'utente autenticato |
| `created_at` | data | |

**Song**

| Campo | Tipo | Note |
| --- | --- | --- |
| `id`, `band_id` | int | |
| `title`, `artist` | string | |
| `version` | string | `""` se assente |
| `link` | string o null | URL http/https |
| `duration_seconds` | int | 1-7200 |
| `musical_key` | string o null | |
| `energy` | int o null | 1-5 |
| `bpm` | int o null | 30-300 |
| `status` | string | `to_study`, `studying`, `completed` |
| `notes` | string o null | |
| `position` | int | solo dentro `songs` di un live |
| `created_at`, `updated_at` | data | |

**Live** (elenco). Nel dettaglio e nelle risposte di scrittura si aggiungono `band` (`{ id, name }`) e `songs` (Song con `position`, in ordine di scaletta).

| Campo | Tipo | Note |
| --- | --- | --- |
| `id`, `band_id` | int | |
| `place` | string | |
| `starts_at` | data | |
| `notes`, `setlist_notes` | string o null | |
| `songs_count` | int | calcolato |
| `total_duration_seconds` | int | calcolato, somma delle durate |
| `progress_percent` | int | calcolato, % di brani `completed` arrotondata |
| `created_at`, `updated_at` | data | |

**Rehearsal**: `id`, `band_id`, `place`, `starts_at`, `notes`, `created_at`, `updated_at`.

**Evento del calendario**: `{ type: "live" | "rehearsal", id, band: { id, name }, starts_at, place }`.

## Auth

### POST /register

Pubblica. Crea l'utente e restituisce il token. **201**

```json
{
  "name": "Utente Postman",
  "email": "postman+1790934407152@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

```json
{
  "token": "1|GctovGLqAEpZPJYkD8r55ggNkGmhhFQSOtUsY40U4d1929c2",
  "user": {
    "id": 3,
    "name": "Utente Postman",
    "email": "postman+1790934407152@example.com",
    "created_at": "2026-10-02T09:46:47.000000Z"
  }
}
```

Errori: 422 (vedi [Errori](#errori); email già usata: errore su `email`).

### POST /login

Pubblica. **200**

```json
{ "email": "postman+1790934407152@example.com", "password": "password123" }
```

```json
{
  "token": "2|hW5BYsmBiWhQSQ4yOTP51slU7CvA1I99Sc1YZrdN9fd75db7",
  "user": {
    "id": 3,
    "name": "Utente Postman",
    "email": "postman+1790934407152@example.com",
    "created_at": "2026-10-02T09:46:47.000000Z"
  }
}
```

Credenziali errate: **422**

```json
{
  "message": "Queste credenziali non corrispondono ai nostri dati.",
  "errors": { "email": ["Queste credenziali non corrispondono ai nostri dati."] }
}
```

### POST /logout

Revoca il token corrente. Nessun body. **204**

### POST /forgot-password

Pubblica. Risponde sempre 200, anche se l'email non è registrata. L'email (in Mailpit, `http://localhost:8025`) contiene il link `FRONTEND_URL/reset-password?token=...&email=...`, valido 60 minuti. **200**

```json
{ "email": "demo2@example.com" }
```

```json
{ "message": "Ti abbiamo inviato via email il link per reimpostare la password." }
```

### POST /reset-password

Pubblica. `token` ed `email` arrivano dai parametri del link. Dopo il reset tutti i token di accesso dell'utente sono revocati. **200**

```json
{
  "token": "599769281cdead708972db9e1d8b58597a9ed8f8d6d5b268f30fef471d8d71ea",
  "email": "demo2@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

```json
{ "message": "La password è stata reimpostata." }
```

Token non valido o scaduto: **422**

```json
{
  "message": "Il link per reimpostare la password non è valido o è scaduto.",
  "errors": { "email": ["Il link per reimpostare la password non è valido o è scaduto."] }
}
```

## Profilo

### GET /me

**200**

```json
{
  "data": {
    "id": 3,
    "name": "Utente Postman",
    "email": "postman+1790934407152@example.com",
    "created_at": "2026-10-02T09:46:47.000000Z"
  }
}
```

### PATCH /me

Accetta `name` e/o `email` (anche uno solo). **200**

```json
{ "name": "Utente Postman Modificato" }
```

```json
{
  "data": {
    "id": 3,
    "name": "Utente Postman Modificato",
    "email": "postman+1790934407152@example.com",
    "created_at": "2026-10-02T09:46:47.000000Z"
  }
}
```

### PUT /me/password

Revoca gli altri token dell'utente; quello in uso resta valido. **204**

```json
{
  "current_password": "password123",
  "password": "nuovapassword123",
  "password_confirmation": "nuovapassword123"
}
```

Password attuale errata: 422 su `current_password`.

### DELETE /me

Elimina l'account e le band rimaste senza membri; revoca tutti i token. **204**

```json
{ "password": "nuovapassword123" }
```

Password errata: 422 su `password`.

## Band e membri

### GET /bands

Band dell'utente, ordinate per nome. **200** (utente demo1)

```json
{
  "data": [
    {
      "id": 2,
      "name": "Duo Notturno",
      "genre": "Acustico",
      "invite_code": "88G7LMFG",
      "members_count": 1,
      "my_instruments": ["Pianoforte"],
      "created_at": "2026-10-02T09:46:03.000000Z"
    },
    {
      "id": 1,
      "name": "Le Onde Elettriche",
      "genre": "Rock",
      "invite_code": "PPQZMAF4",
      "members_count": 2,
      "my_instruments": ["Voce", "Chitarra acustica"],
      "created_at": "2026-10-02T09:46:03.000000Z"
    }
  ]
}
```

### POST /bands

Crea la band; il creatore ne diventa membro con i suoi strumenti. `genre` facoltativo; `instruments` da 1 a 10. **201**

```json
{ "name": "Postman Band", "genre": "Rock", "instruments": ["Voce", "Chitarra"] }
```

```json
{
  "data": {
    "id": 3,
    "name": "Postman Band",
    "genre": "Rock",
    "invite_code": "ZQUL5F2B",
    "members_count": 1,
    "my_instruments": ["Voce", "Chitarra"],
    "created_at": "2026-10-02T09:46:48.000000Z",
    "members": [
      { "id": 3, "name": "Utente Postman", "instruments": ["Voce", "Chitarra"] }
    ]
  }
}
```

### POST /bands/join

Entra in una band con il codice di invito (accettato anche in minuscolo). Massimo 10 tentativi al minuto (poi 429). **201** con il dettaglio della band (utente demo2)

```json
{ "invite_code": "88G7LMFG", "instruments": ["Contrabbasso"] }
```

```json
{
  "data": {
    "id": 2,
    "name": "Duo Notturno",
    "genre": "Acustico",
    "invite_code": "88G7LMFG",
    "members_count": 2,
    "my_instruments": ["Contrabbasso"],
    "created_at": "2026-10-02T09:46:03.000000Z",
    "members": [
      { "id": 1, "name": "Giulia Demo", "instruments": ["Pianoforte"] },
      { "id": 2, "name": "Marco Demo", "instruments": ["Contrabbasso"] }
    ]
  }
}
```

Già membro (o codice inesistente): **422**

```json
{
  "message": "Sei già membro di questa band.",
  "errors": { "invite_code": ["Sei già membro di questa band."] }
}
```

### GET /bands/{band}

Dettaglio con membri. **200**

```json
{
  "data": {
    "id": 3,
    "name": "Postman Band",
    "genre": "Rock",
    "invite_code": "ZQUL5F2B",
    "members_count": 1,
    "my_instruments": ["Voce", "Chitarra"],
    "created_at": "2026-10-02T09:46:48.000000Z",
    "members": [
      { "id": 3, "name": "Utente Postman", "instruments": ["Voce", "Chitarra"] }
    ]
  }
}
```

### PATCH /bands/{band}

`name` e/o `genre`. **200** con il dettaglio.

```json
{ "name": "Postman Band", "genre": "Indie rock" }
```

```json
{
  "data": {
    "id": 3,
    "name": "Postman Band",
    "genre": "Indie rock",
    "invite_code": "ZQUL5F2B",
    "members_count": 1,
    "my_instruments": ["Voce", "Chitarra"],
    "created_at": "2026-10-02T09:46:48.000000Z",
    "members": [
      { "id": 3, "name": "Utente Postman", "instruments": ["Voce", "Chitarra"] }
    ]
  }
}
```

### DELETE /bands/{band}

Elimina la band con repertorio, live e prove. Nessun body. **204**

### POST /bands/{band}/invite-code

Rigenera il codice; il vecchio smette di funzionare. Nessun body. **200** con il dettaglio.

```json
{
  "data": {
    "id": 3,
    "name": "Postman Band",
    "genre": "Indie rock",
    "invite_code": "PUCZNDLG",
    "members_count": 1,
    "my_instruments": ["Voce", "Chitarra"],
    "created_at": "2026-10-02T09:46:48.000000Z",
    "members": [
      { "id": 3, "name": "Utente Postman", "instruments": ["Voce", "Chitarra"] }
    ]
  }
}
```

### PUT /bands/{band}/me/instruments

Sostituisce gli strumenti dell'utente autenticato in quella band (1-10, 1-50 caratteri, senza duplicati). **200** con il dettaglio.

```json
{ "instruments": ["Voce", "Chitarra acustica", "Armonica"] }
```

```json
{
  "data": {
    "id": 3,
    "name": "Postman Band",
    "genre": "Indie rock",
    "invite_code": "PUCZNDLG",
    "members_count": 1,
    "my_instruments": ["Voce", "Chitarra acustica", "Armonica"],
    "created_at": "2026-10-02T09:46:48.000000Z",
    "members": [
      { "id": 3, "name": "Utente Postman", "instruments": ["Voce", "Chitarra acustica", "Armonica"] }
    ]
  }
}
```

### DELETE /bands/{band}/members/{user}

Rimuove un membro; con il proprio id l'utente esce dalla band. Se esce l'ultimo membro la band viene eliminata. Utente non membro: 404. Nessun body. **204**

## Repertorio

### GET /bands/{band}/songs

Ordinate per titolo e poi per artista. **200**

```json
{
  "data": [
    {
      "id": 16,
      "band_id": 3,
      "title": "Canzone di prova",
      "artist": "The Postman Band",
      "version": "",
      "link": "https://example.com/brano",
      "duration_seconds": 245,
      "musical_key": "Am",
      "energy": 4,
      "bpm": 120,
      "status": "studying",
      "notes": "Attacco insieme sul quarto battere",
      "created_at": "2026-10-02T09:46:49.000000Z",
      "updated_at": "2026-10-02T09:46:49.000000Z"
    }
  ]
}
```

### POST /bands/{band}/songs

Obbligatori `title`, `artist`, `duration_seconds`; gli altri campi sono facoltativi (`status` di default `to_study`). **201**

```json
{
  "title": "Canzone di prova",
  "artist": "The Postman Band",
  "version": "",
  "duration_seconds": 245,
  "link": "https://example.com/brano",
  "musical_key": "Am",
  "energy": 4,
  "bpm": 120,
  "status": "studying",
  "notes": "Attacco insieme sul quarto battere"
}
```

```json
{
  "data": {
    "id": 16,
    "band_id": 3,
    "title": "Canzone di prova",
    "artist": "The Postman Band",
    "version": "",
    "link": "https://example.com/brano",
    "duration_seconds": 245,
    "musical_key": "Am",
    "energy": 4,
    "bpm": 120,
    "status": "studying",
    "notes": "Attacco insieme sul quarto battere",
    "created_at": "2026-10-02T09:46:49.000000Z",
    "updated_at": "2026-10-02T09:46:49.000000Z"
  }
}
```

Dati non validi: **422**. Un brano con stessa band, titolo, artista e versione dà 422 su `title`.

```json
{ "title": "", "artist": "X", "duration_seconds": 0, "energy": 9, "status": "boh" }
```

```json
{
  "message": "Il campo titolo è obbligatorio. (e altri 3 errori)",
  "errors": {
    "title": ["Il campo titolo è obbligatorio."],
    "duration_seconds": ["Il campo durata deve essere compreso tra 1 e 7200."],
    "energy": ["Il campo energia deve essere compreso tra 1 e 5."],
    "status": ["Il valore selezionato per stato non è valido."]
  }
}
```

### PATCH /songs/{song}

Accetta anche un solo campo. **200**

```json
{ "status": "completed", "notes": "Pronta per il live" }
```

```json
{
  "data": {
    "id": 16,
    "band_id": 3,
    "title": "Canzone di prova",
    "artist": "The Postman Band",
    "version": "",
    "link": "https://example.com/brano",
    "duration_seconds": 245,
    "musical_key": "Am",
    "energy": 4,
    "bpm": 120,
    "status": "completed",
    "notes": "Pronta per il live",
    "created_at": "2026-10-02T09:46:49.000000Z",
    "updated_at": "2026-10-02T09:46:50.000000Z"
  }
}
```

### DELETE /songs/{song}

Elimina la canzone dal repertorio e da tutte le scalette. **204**

## Live e scaletta

Tutte le scritture sulla scaletta rispondono con il **dettaglio del live** (come `GET /lives/{live}`).

### GET /bands/{band}/lives

Ordinati per `starts_at`. Senza `from` solo i live da adesso in poi; `?from=2026-01-01T00:00:00Z` parte da quella data. Senza `band` e `songs`. **200**

```json
{
  "data": [
    {
      "id": 3,
      "band_id": 3,
      "place": "Circolo Arci, Bologna",
      "starts_at": "2030-06-01T19:30:00.000000Z",
      "notes": "Soundcheck alle 18",
      "setlist_notes": "Bis solo se richiesto",
      "songs_count": 0,
      "total_duration_seconds": 0,
      "progress_percent": 0,
      "created_at": "2026-10-02T09:46:50.000000Z",
      "updated_at": "2026-10-02T09:46:50.000000Z"
    },
    {
      "id": 4,
      "band_id": 3,
      "place": "Festa della musica, Modena",
      "starts_at": "2030-06-21T18:00:00.000000Z",
      "notes": null,
      "setlist_notes": null,
      "songs_count": 0,
      "total_duration_seconds": 0,
      "progress_percent": 0,
      "created_at": "2026-10-02T09:46:50.000000Z",
      "updated_at": "2026-10-02T09:46:50.000000Z"
    }
  ]
}
```

### POST /bands/{band}/lives

Obbligatori `place` e `starts_at`; facoltativi `notes` e `setlist_notes`. **201**

```json
{
  "place": "Circolo Arci, Bologna",
  "starts_at": "2030-06-01T21:30:00+02:00",
  "notes": "Soundcheck alle 18",
  "setlist_notes": "Bis solo se richiesto"
}
```

```json
{
  "data": {
    "id": 3,
    "band_id": 3,
    "band": { "id": 3, "name": "Postman Band" },
    "place": "Circolo Arci, Bologna",
    "starts_at": "2030-06-01T19:30:00.000000Z",
    "notes": "Soundcheck alle 18",
    "setlist_notes": "Bis solo se richiesto",
    "songs_count": 0,
    "total_duration_seconds": 0,
    "progress_percent": 0,
    "created_at": "2026-10-02T09:46:50.000000Z",
    "updated_at": "2026-10-02T09:46:50.000000Z",
    "songs": []
  }
}
```

### GET /lives/{live}

Dettaglio con la scaletta in ordine. **200** (dopo il riordino descritto sotto)

```json
{
  "data": {
    "id": 3,
    "band_id": 3,
    "band": { "id": 3, "name": "Postman Band" },
    "place": "Circolo Arci San Lazzaro, Bologna",
    "starts_at": "2030-06-01T19:30:00.000000Z",
    "notes": "Soundcheck alle 18",
    "setlist_notes": "Chiudere con il pezzo più energico",
    "songs_count": 2,
    "total_duration_seconds": 480,
    "progress_percent": 0,
    "created_at": "2026-10-02T09:46:50.000000Z",
    "updated_at": "2026-10-02T09:46:50.000000Z",
    "songs": [
      {
        "id": 18,
        "band_id": 3,
        "title": "Ballata",
        "artist": "The Postman Band",
        "version": "",
        "link": null,
        "duration_seconds": 280,
        "musical_key": null,
        "energy": 2,
        "bpm": 72,
        "status": "to_study",
        "notes": null,
        "position": 1,
        "created_at": "2026-10-02T09:46:50.000000Z",
        "updated_at": "2026-10-02T09:46:50.000000Z"
      },
      {
        "id": 17,
        "band_id": 3,
        "title": "Apertura",
        "artist": "The Postman Band",
        "version": "",
        "link": null,
        "duration_seconds": 200,
        "musical_key": null,
        "energy": 5,
        "bpm": 140,
        "status": "to_study",
        "notes": null,
        "position": 2,
        "created_at": "2026-10-02T09:46:50.000000Z",
        "updated_at": "2026-10-02T09:46:50.000000Z"
      }
    ]
  }
}
```

### PATCH /lives/{live}

`place`, `starts_at`, `notes`, `setlist_notes` (anche uno solo). **200** con il dettaglio.

```json
{
  "place": "Circolo Arci San Lazzaro, Bologna",
  "setlist_notes": "Chiudere con il pezzo più energico"
}
```

```json
{
  "data": {
    "id": 3,
    "band_id": 3,
    "band": { "id": 3, "name": "Postman Band" },
    "place": "Circolo Arci San Lazzaro, Bologna",
    "starts_at": "2030-06-01T19:30:00.000000Z",
    "notes": "Soundcheck alle 18",
    "setlist_notes": "Chiudere con il pezzo più energico",
    "songs_count": 0,
    "total_duration_seconds": 0,
    "progress_percent": 0,
    "created_at": "2026-10-02T09:46:50.000000Z",
    "updated_at": "2026-10-02T09:46:50.000000Z",
    "songs": []
  }
}
```

### DELETE /lives/{live}

Elimina il live e la sua scaletta (i brani restano nel repertorio). **204**

### POST /lives/{live}/songs

Aggiunge un brano in fondo alla scaletta. Due forme:

- **brano del repertorio**: `{ "song_id": 17 }`;
- **brano nuovo**: gli stessi campi di `POST /bands/{band}/songs`. Il brano viene creato nel repertorio, oppure riusato se esiste già con stesso titolo, artista e versione.

**201** con il dettaglio. Brano nuovo:

```json
{ "title": "Apertura", "artist": "The Postman Band", "duration_seconds": 200, "energy": 5, "bpm": 140 }
```

```json
{
  "data": {
    "id": 3,
    "band_id": 3,
    "band": { "id": 3, "name": "Postman Band" },
    "place": "Circolo Arci San Lazzaro, Bologna",
    "starts_at": "2030-06-01T19:30:00.000000Z",
    "notes": "Soundcheck alle 18",
    "setlist_notes": "Chiudere con il pezzo più energico",
    "songs_count": 1,
    "total_duration_seconds": 200,
    "progress_percent": 0,
    "created_at": "2026-10-02T09:46:50.000000Z",
    "updated_at": "2026-10-02T09:46:50.000000Z",
    "songs": [
      {
        "id": 17,
        "band_id": 3,
        "title": "Apertura",
        "artist": "The Postman Band",
        "version": "",
        "link": null,
        "duration_seconds": 200,
        "musical_key": null,
        "energy": 5,
        "bpm": 140,
        "status": "to_study",
        "notes": null,
        "position": 1,
        "created_at": "2026-10-02T09:46:50.000000Z",
        "updated_at": "2026-10-02T09:46:50.000000Z"
      }
    ]
  }
}
```

Brano del repertorio, su un altro live (id 4):

```json
{ "song_id": 17 }
```

```json
{
  "data": {
    "id": 4,
    "band_id": 3,
    "band": { "id": 3, "name": "Postman Band" },
    "place": "Festa della musica, Modena",
    "starts_at": "2030-06-21T18:00:00.000000Z",
    "notes": null,
    "setlist_notes": null,
    "songs_count": 1,
    "total_duration_seconds": 200,
    "progress_percent": 0,
    "created_at": "2026-10-02T09:46:50.000000Z",
    "updated_at": "2026-10-02T09:46:50.000000Z",
    "songs": [
      { "id": 17, "title": "Apertura", "position": 1, "...": "Song completa, come sopra" }
    ]
  }
}
```

Brano già in scaletta: **422** su `song_id` (su `title` se è un brano nuovo). Brano di un'altra band: 422 su `song_id`.

```json
{
  "message": "Questo brano è già in scaletta.",
  "errors": { "song_id": ["Questo brano è già in scaletta."] }
}
```

### PUT /lives/{live}/songs/order

Riordina la scaletta. `song_ids` deve contenere tutti e soli i brani della scaletta, altrimenti 422 su `song_ids`. **200** con il dettaglio (vedi [GET /lives/{live}](#get-liveslive), che mostra proprio questo risultato).

```json
{ "song_ids": [18, 17] }
```

### PUT /lives/{live}/setlist

Sostituisce la scaletta con l'elenco dato, nell'ordine dato. Serve a salvare la proposta della chat AI. Accetta anche `[]` (svuota la scaletta). `setlist_notes` è facoltativo: se presente sostituisce le note della scaletta, altrimenti restano quelle attuali. Brani di un'altra band: 422 su `song_ids`. **200** con il dettaglio.

```json
{ "song_ids": [17, 18], "setlist_notes": "Chiudere con il pezzo più energico" }
```

```json
{
  "data": {
    "id": 3,
    "band_id": 3,
    "band": { "id": 3, "name": "Postman Band" },
    "place": "Circolo Arci San Lazzaro, Bologna",
    "starts_at": "2030-06-01T19:30:00.000000Z",
    "notes": "Soundcheck alle 18",
    "setlist_notes": "Chiudere con il pezzo più energico",
    "songs_count": 2,
    "total_duration_seconds": 480,
    "progress_percent": 0,
    "created_at": "2026-10-02T09:46:50.000000Z",
    "updated_at": "2026-10-02T09:46:50.000000Z",
    "songs": [
      { "id": 17, "title": "Apertura", "position": 1, "...": "Song completa" },
      { "id": 18, "title": "Ballata", "position": 2, "...": "Song completa" }
    ]
  }
}
```

### DELETE /lives/{live}/songs/{song}

Toglie il brano dalla scaletta (resta nel repertorio). Le `position` degli altri non vengono rinumerate, ma l'ordine resta corretto. Brano non in scaletta: 404. **204**

### POST /lives/{live}/copy-setlist

Sostituisce la scaletta del live con quella di un altro live della stessa band, comprese le `setlist_notes`. Stesso live o live di un'altra band: 422 su `source_live_id`. **200** con il dettaglio.

```json
{ "source_live_id": 4 }
```

```json
{
  "data": {
    "id": 3,
    "band_id": 3,
    "band": { "id": 3, "name": "Postman Band" },
    "place": "Circolo Arci San Lazzaro, Bologna",
    "starts_at": "2030-06-01T19:30:00.000000Z",
    "notes": "Soundcheck alle 18",
    "setlist_notes": null,
    "songs_count": 1,
    "total_duration_seconds": 200,
    "progress_percent": 0,
    "created_at": "2026-10-02T09:46:50.000000Z",
    "updated_at": "2026-10-02T09:46:51.000000Z",
    "songs": [
      { "id": 17, "title": "Apertura", "position": 1, "...": "Song completa" }
    ]
  }
}
```

## Prove

### GET /bands/{band}/rehearsals

Ordinate per `starts_at`; senza `from` solo le prove future (`?from=` come per i live). **200**

```json
{
  "data": [
    {
      "id": 4,
      "band_id": 3,
      "place": "Sala prove Garage",
      "starts_at": "2030-05-28T18:00:00.000000Z",
      "notes": "Ripassare i finali",
      "created_at": "2026-10-02T09:46:51.000000Z",
      "updated_at": "2026-10-02T09:46:51.000000Z"
    }
  ]
}
```

### POST /bands/{band}/rehearsals

Obbligatori `place` e `starts_at`; facoltativo `notes`. **201**

```json
{ "place": "Sala prove Garage", "starts_at": "2030-05-28T20:00:00+02:00", "notes": "Ripassare i finali" }
```

```json
{
  "data": {
    "id": 4,
    "band_id": 3,
    "place": "Sala prove Garage",
    "starts_at": "2030-05-28T18:00:00.000000Z",
    "notes": "Ripassare i finali",
    "created_at": "2026-10-02T09:46:51.000000Z",
    "updated_at": "2026-10-02T09:46:51.000000Z"
  }
}
```

### PATCH /rehearsals/{rehearsal}

`place`, `starts_at`, `notes` (anche uno solo). **200**

```json
{ "starts_at": "2030-05-28T21:00:00+02:00", "notes": "Ripassare i finali e la ballata" }
```

```json
{
  "data": {
    "id": 4,
    "band_id": 3,
    "place": "Sala prove Garage",
    "starts_at": "2030-05-28T19:00:00.000000Z",
    "notes": "Ripassare i finali e la ballata",
    "created_at": "2026-10-02T09:46:51.000000Z",
    "updated_at": "2026-10-02T09:46:51.000000Z"
  }
}
```

### DELETE /rehearsals/{rehearsal}

**204**

## Calendario

### GET /calendar?from=&to=

Live e prove di tutte le band dell'utente tra `from` e `to` (obbligatori, ISO 8601, estremi inclusi, `to` non prima di `from`), in ordine di data. **200**

`GET /calendar?from=2030-01-01T00:00:00Z&to=2030-12-31T23:59:59Z`

```json
{
  "data": [
    {
      "type": "live",
      "id": 4,
      "band": { "id": 3, "name": "Postman Band" },
      "starts_at": "2030-06-21T18:00:00.000000Z",
      "place": "Festa della musica, Modena"
    }
  ]
}
```

Le prove hanno `"type": "rehearsal"` e gli stessi campi.

## Chat AI

### POST /bands/{band}/chat

Chat con il modello locale (Ollama) sui dati della band. Il backend non conserva la conversazione: il frontend invia ogni volta gli ultimi messaggi. Su CPU la risposta può richiedere decine di secondi (attesa massima `OLLAMA_TIMEOUT`, 120 s).

Massimo 10 richieste al minuto per utente (poi 429). `messages`: da 1 a 10 elementi, `role` = `user` o `assistant`, `content` fino a 2000 caratteri, l'ultimo deve essere `user` (altrimenti 422 su `messages`). `live_id` facoltativo: un live della stessa band (altrimenti 422 su `live_id`) su cui concentrare il contesto. Chi non è membro della band riceve 403.

```json
{
  "messages": [
    { "role": "user", "content": "Proponi una scaletta di circa 30 minuti per questo live, con apertura energica" }
  ],
  "live_id": 2
}
```

**200** (risposta reale di `llama3.2:3b` sui dati demo, in circa 18 secondi)

```json
{
  "reply": "Scegliamo una scaletta che inizia con un grande impacto, con 'Smells Like Teen Spirit' e 'Back in Black' per esempio. Questo ci permetterà di coinvolgere il pubblico e creare un'atmosfera energica.",
  "setlist_proposal": {
    "song_ids": [2, 5, 7, 12, 10],
    "songs": [
      { "id": 2, "title": "Smells Like Teen Spirit", "artist": "Nirvana", "version": "", "musical_key": "Fm", "duration_seconds": 301 },
      { "id": 5, "title": "Back in Black", "artist": "AC/DC", "version": "", "musical_key": "E", "duration_seconds": 255 },
      { "id": 7, "title": "Zombie", "artist": "The Cranberries", "version": "", "musical_key": "Em", "duration_seconds": 306 },
      { "id": 12, "title": "Albachiara", "artist": "Vasco Rossi", "version": "", "musical_key": "C", "duration_seconds": 260 },
      { "id": 10, "title": "Mr. Brightside", "artist": "The Killers", "version": "", "musical_key": "C#", "duration_seconds": 222 }
    ],
    "total_duration_seconds": 1344,
    "notes": "Una scaletta che cerca di bilanciare energia e calma, con un finale carico e coinvolgente."
  }
}
```

**200** senza proposta (domanda "Quali brani devo ancora studiare?"):

```json
{
  "reply": "Devi ancora studiare 'Imagine' di John Lennon e 'La cura' di Franco Battiato.",
  "setlist_proposal": null
}
```

- Gli id proposti sono solo brani del repertorio della band: lo schema JSON inviato a Ollama ha un `enum` degli id, e il backend scarta comunque id non validi e doppioni.
- `total_duration_seconds` è calcolata dal backend. Un modello piccolo può non rispettare la durata richiesta (qui 22:24 invece di 30 minuti), per questo l'interfaccia mostra sempre la durata reale. `notes` può essere `null`.
- Per salvare la proposta: [PUT /lives/{live}/setlist](#put-liveslivesetlist) con `song_ids` e, se presenti, le note come `setlist_notes`.

**503**: Ollama irraggiungibile, modello non ancora scaricato o oltre il timeout, con il fallback OpenRouter spento o fallito.

```json
{ "message": "AI non disponibile. Riprova tra poco." }
```
