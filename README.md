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
Su un PC con poca RAM lascia `COMPOSE_PROFILES=` vuoto nel `.env` per non avviare Ollama.
