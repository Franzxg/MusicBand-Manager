#!/bin/sh
# Scarica il modello della chat (OLLAMA_MODEL) nel volume condiviso e termina
set -e
echo "Download del modello $OLLAMA_MODEL (solo al primo avvio, può richiedere alcuni minuti)..."
ollama pull "$OLLAMA_MODEL"
echo "Modello $OLLAMA_MODEL pronto."
