# Backend (Laravel)

Valgono anche le regole del `CLAUDE.md` nella radice. Specifiche: `docs/specifiche.md`, sezioni "Backend & API", "Database" e "Integrazione AI (Ollama)".

## Impostazione

- API REST JSON, solo API (nessuna vista). Ultima versione stabile di Laravel, PHP 8.3 FPM nell'immagine Docker.
- Autenticazione con Laravel Sanctum (token Bearer). Sono pubbliche solo registrazione, login, richiesta e reset della password.
- Configurazione solo da variabili d'ambiente passate da `docker-compose.yml`. Nessun file `backend/.env` versionato.
- Driver: `SESSION_DRIVER=array`, `CACHE_STORE=file`, `QUEUE_CONNECTION=sync`. Rimuovi le migration di default non usate (sessions, cache, jobs).
- Date salvate e inviate in UTC, formato ISO 8601. Fuso di Laravel: UTC.

## Struttura

- `app/Http/Controllers/Api/`: un controller per risorsa (Auth, Profile, PasswordReset, Band, BandMember, Song, Live, LiveSong, Rehearsal, Calendar, Chat).
- `app/Http/Requests/`: una Form Request per ogni scrittura. Errori 422 in JSON.
- `app/Http/Resources/`: una API Resource per modello. Nessuna risposta con modelli grezzi.
- `app/Policies/`: la Policy verifica che l'utente sia membro della band proprietaria della risorsa (403 altrimenti). Tutti i membri hanno gli stessi permessi.
- `app/Services/Ai/`: `AiChatService`, `BandContextBuilder`, interfaccia `LlmClient` con `OllamaClient` e `OpenRouterClient`. Configurazione in `config/ai.php`.
- `app/Models/`: `User`, `Band`, `Membership` (modello pivot di `band_user`, con id), `MemberInstrument`, `Song`, `Live`, `Rehearsal`.
- `lang/it` e `lang/en`: messaggi di validazione e dell'email di reset. Un middleware imposta la lingua da `Accept-Language` (it o en, default it).

## Regole da rispettare

- Schema, vincoli, indici e `ON DELETE CASCADE` esattamente come in "Database" (8 tabelle applicative). Valori di `status`: `to_study`, `studying`, `completed`. La colonna della tonalità si chiama `musical_key` (`key` è riservata in MySQL).
- Operazioni da fare in transazione: creazione band, aggiunta di un brano nuovo alla scaletta, riordino (`order`), sostituzione (`setlist`), copia scaletta, uscita dell'ultimo membro.
- Se l'ultimo membro lascia la band (o elimina l'account), la band viene eliminata.
- Codice di invito: 8 caratteri maiuscoli senza 0/O e 1/I, UNIQUE, rigenerabile. La rotta `join` è limitata a 10 tentativi al minuto per utente; la chat a 10 richieste al minuto.
- Durata totale, progresso e numero di brani non si salvano: si calcolano con una query aggregata (`withSum`, `withCount`) ed escono come `total_duration_seconds`, `progress_percent`, `songs_count`. Usa l'eager loading per evitare N+1.
- Agli altri membri si mostrano solo `id`, nome e strumenti, mai l'email.
- Reset password: Password Broker di Laravel, link verso `FRONTEND_URL/reset-password?token=...&email=...` (personalizza l'URL del messaggio), risposta sempre 200, email intercettate da Mailpit.
- Chat AI: `stream: false`, schema JSON con `enum` degli id del repertorio, validazione del risultato, 503 se Ollama non risponde o il modello non è ancora scaricato. I timeout PHP e nginx devono superare `OLLAMA_TIMEOUT`.
- Nessuna chiamata a servizi esterni nei test: usa `Http::fake`.

## Prima di ogni commit

1. `docker compose exec backend php artisan test` senza errori.
2. `docker compose exec backend php artisan route:list --path=api` coerente con la tabella "Endpoint" delle specifiche.
3. Formattazione con Laravel Pint, se presente (`./vendor/bin/pint`).
4. Se l'API cambia: aggiorna `docs/API.md` e la collection in `docs/postman/`.
