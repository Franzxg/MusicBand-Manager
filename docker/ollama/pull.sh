#!/bin/sh
# Scarica il modello della chat (OLLAMA_MODEL) nel volume condiviso e termina
set -e
echo "Download del modello $OLLAMA_MODEL (circa 2 GB al primo avvio)..."
ollama pull "$OLLAMA_MODEL"
echo "Modello $OLLAMA_MODEL pronto."
