---
description: Controlli rapidi sullo stato del progetto
---

Esegui questi controlli e riporta solo gli esiti (OK, oppure problema e come lo risolvi):

1. `git status`: tra i file tracciati non devono esserci `.env`, `vendor/`, `node_modules/` o cartelle di build. Cerca repository annidati con `find . -name .git -not -path './.git'` (deve restare vuoto).
2. `docker compose config -q` è valido.
3. Se i container sono attivi: `docker compose exec backend php artisan test` senza errori.
4. Se esiste `frontend/package.json`: `npm --prefix frontend run lint` e `npm --prefix frontend run build` senza errori.
5. `git log -20 --format=%B | grep -i -E "co-authored-by|generated with|claude-session"` non deve trovare nulla.
6. Se esiste il backend: gli endpoint di `php artisan route:list --path=api` coincidono con la tabella "Endpoint" di `docs/specifiche.md` (indica quelli mancanti o in più).

Correggi da solo i problemi semplici. Segnala invece quelli che richiedono una mia decisione.
