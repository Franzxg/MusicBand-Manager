# Music Band Manager

Web app fullstack per band: membri, repertorio, prove, live, scalette e chat AI locale (Ollama).
Progetto d'esame ITS (corso FS25). **Consegna: martedì 6 ottobre 2026, ore 23:59:59.**

## Fonti di verità

- `docs/specifiche.md`: specifiche complete (frontend, backend, database, AI, Docker). Vale quello che c'è scritto lì.
  È lungo: non leggerlo tutto a ogni sessione. Guarda i titoli e leggi solo le sezioni utili al compito.
- `docs/piano-di-lavoro.md`: le fasi del lavoro, da eseguire una alla volta.
- `docs/API.md`: esempi di richiesta e risposta di ogni endpoint. Si crea nella fase 4; da lì in poi il frontend si basa su questo file.
- Se le specifiche sono ambigue o in conflitto con il codice, fermati e chiedi. Se una scelta cambia le specifiche, aggiorna `docs/specifiche.md` nello stesso commit.

## Monorepo (vincolo del docente)

- Un solo repository Git, nella radice. Non eseguire mai `git init` in `backend/` o `frontend/`. Se un generatore (`laravel new`, `composer create-project`, `npm create vite`) crea una cartella `.git` annidata, eliminala subito.
- Ogni servizio sta nella sua sottocartella. Tutto si avvia dalla radice con `docker compose up --build`.
- Dopo `git clone` e le istruzioni del README il progetto deve funzionare senza altri passaggi. L'unico file locale necessario è `.env`, copiato da `.env.example`.
- Non committare mai `.env`, `vendor/`, `node_modules/`, cartelle di build o chiavi API.

```text
.
├── CLAUDE.md
├── .claude/                 impostazioni e comandi di Claude Code
├── backend/                 Laravel (API)       -> vedi backend/CLAUDE.md
├── frontend/                React + MUI         -> vedi frontend/CLAUDE.md
├── docker/                  nginx, script Ollama
├── docs/                    specifiche, piano, API.md, postman/, screenshots/
├── docker-compose.yml
├── docker-compose.dev.yml   opzionale, solo se avanza tempo
├── .env.example
├── .gitattributes
├── .gitignore
└── README.md
```

## Stack

React + Material UI (Vite, JavaScript) · Laravel (API REST, Sanctum) · MySQL 8.4 · Ollama (`llama3.2:3b`, solo CPU) · Docker Compose.

## Comandi (dalla radice)

- Avvio: `docker compose up --build`
- Test backend: `docker compose exec backend php artisan test`
- Controlli frontend: `npm --prefix frontend run lint` e `npm --prefix frontend run build`
- Ripristino dati demo: `docker compose exec backend php artisan migrate:fresh --seed`
- Log del backend: `docker compose logs -f backend`
- Senza Ollama (PC con poca RAM): lascia `COMPOSE_PROFILES=` vuoto nel `.env`.

## Regole di lavoro

1. Una fase alla volta dal piano. Non anticipare le fasi successive.
2. All'inizio di una fase scrivi in 5 righe cosa farai. Alla fine esegui i controlli, correggi, poi committa.
3. Non dichiarare finito senza aver eseguito test, build o comandi che lo dimostrano. Riporta l'esito in breve.
4. Semplicità: il progetto va consegnato in pochi giorni. Niente over-engineering e nessuna libreria non prevista dalle specifiche senza chiedere.
5. Codice (nomi, API, tipi di commit) in inglese; commenti brevi in italiano; testi dell'interfaccia solo tramite i18n (it/en).
6. Sicurezza: password con hash, Policy su ogni risorsa, Form Request su ogni scrittura, mai l'email di altri utenti nelle risposte, nessun segreto nel codice.
7. Se una fase cambia l'avvio o le variabili d'ambiente, aggiorna `.env.example` e il README.
8. Su una scelta non coperta dalle specifiche scegli la più semplice e segnalala in una riga.

## Git

- Commit piccoli, a fine di ogni blocco coerente: non tutto alla fine.
- Conventional Commits con descrizione in italiano: `feat: aggiungi endpoint scaletta`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`. Titolo di massimo 72 caratteri.
- **Non aggiungere mai** `Co-Authored-By`, "Generated with Claude Code", `Claude-Session` o qualsiasi altra firma o trailer di Claude o Anthropic ai messaggi di commit e alle PR. L'unico autore è l'utente. La stessa regola è impostata in `.claude/settings.json`.
- Lavora su `main`. Non eseguire `git push`, `--force`, `reset --hard` né modificare la configurazione di git senza richiesta esplicita.
- Prima di ogni commit controlla con `git status` che non ci siano `.env`, `vendor/`, `node_modules/` o cartelle `.git` annidate.
