# MusicBand-Manager

Web app per gestire band musicali: membri, repertorio, prove, live e scalette, con un assistente AI locale (Ollama).

Progetto finale Fullstack (ITS FS25). Stack: React + Material UI, Laravel, MySQL, Docker, Ollama.

> README in costruzione: verrà completato nell'ultima fase del progetto.
> Le specifiche sono in [`docs/specifiche.md`](docs/specifiche.md).

## Avvio

Prerequisito: Docker con Compose v2.

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: <http://localhost:3000>
- API: <http://localhost:8000> (controllo di salute: <http://localhost:8000/up>)
- Email di test (Mailpit): <http://localhost:8025>

Al primo avvio il backend esegue le migrazioni e, con `SEED_ON_START=true`, crea i dati dimostrativi.
Account demo: `demo1@example.com` e `demo2@example.com`, password `password123`.
Per ripristinarli: `docker compose exec backend php artisan migrate:fresh --seed`.
Su un PC con poca RAM lascia `COMPOSE_PROFILES=` vuoto nel `.env` per non avviare Ollama.

## API e Postman

- Documentazione con esempi di richiesta e risposta: [`docs/API.md`](docs/API.md).
- Collection Postman: in Postman scegli **Import** e seleziona `docs/postman/rehearsal-setlist-manager.postman_collection.json` e `docs/postman/local.postman_environment.json`, poi attiva l'environment "Music Band Manager - locale".
- Esegui la collection con il **Collection Runner**, in ordine: crea un utente nuovo, salva da sola token e id e alla fine elimina l'account. Da terminale: `npx newman run docs/postman/rehearsal-setlist-manager.postman_collection.json -e docs/postman/local.postman_environment.json`.
- Se `API_PORT` non è 8000, cambia `baseUrl` nell'environment.
