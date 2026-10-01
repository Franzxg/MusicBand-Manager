---
description: Controllo finale prima della consegna del progetto
---

Prepara la consegna del progetto. Tutto il lavoro deve essere già committato: se non lo è, dimmelo e fermati.

1. **Clone pulita**: clona il repository in una cartella temporanea, esegui `cp .env.example .env` e `docker compose up --build -d`, seguendo solo le istruzioni del README. Verifica che il frontend (`http://localhost:3000`), l'API (`http://localhost:8000/up`) e Mailpit rispondano, che si possa accedere con gli account demo e che la chat risponda (oppure mostri "AI non disponibile" se Ollama non è attivo). Poi `docker compose down -v` e cancella la cartella temporanea.
2. **README**: confrontalo con la sezione "Requisiti del README (consegna)" di `docs/specifiche.md` e con le richieste del docente: titolo e descrizione; istruzioni d'uso (dipendenze da installare, dati per provare il sistema, servizi da tenere attivi); funzionalità future; riferimenti in rete; backend di terze parti usati e come avviene il collegamento; descrizione della funzionalità AI.
3. **Monorepo**: un solo `.git` nella radice, servizi in sottocartelle, `docker-compose.yml` che lancia tutti i servizi, nessun file locale necessario oltre a `.env`.
4. **Contenuto del repository**: presenti `docs/postman/`, `docs/screenshots/`, `docs/specifiche.md` e i dati di inizializzazione (seeder). Nessun segreto o file generato tracciato.
5. Esegui tutti i controlli di `/verifica`.

Chiudi con l'elenco, in ordine, di ciò che devo fare io a mano: push su GitHub, invito del docente al repository (il suo username è nel documento degli appunti) e compilazione del form di consegna entro martedì 6 ottobre 2026, ore 23:59:59.
