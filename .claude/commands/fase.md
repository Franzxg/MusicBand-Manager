---
description: Esegue una fase del piano di lavoro (es. /fase 3)
argument-hint: [numero della fase]
---

Esegui la fase $ARGUMENTS di `docs/piano-di-lavoro.md`.

1. Leggi la fase indicata e SOLO le sezioni di `docs/specifiche.md` che elenca. Se dipende da una fase precedente, controlla che sia fatta (`git log`, file presenti).
2. Scrivi in 5 righe cosa farai e quali file toccherai, poi procedi senza aspettare conferma, salvo dubbi sulle specifiche.
3. Implementa solo questa fase. Rispetta `CLAUDE.md` e il `CLAUDE.md` della sottocartella su cui lavori.
4. Esegui i controlli del punto "Fatto quando" della fase (test, build, `docker compose`) e correggi finché passano.
5. Se è cambiato l'avvio o una variabile d'ambiente, aggiorna `.env.example` e il README.
6. Committa a blocchi coerenti: Conventional Commits con descrizione in italiano, senza alcuna firma o trailer di Claude.
7. Chiudi con un riepilogo di massimo 10 righe: cosa è fatto, cosa no, decisioni prese e cosa devo controllare a mano.
