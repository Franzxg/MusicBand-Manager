<?php

namespace App\Services\Ai;

// Modello linguistico che risponde con JSON vincolato da uno schema
interface LlmClient
{
    /**
     * @param  array<int, array{role: string, content: string}>  $messages  messaggio di sistema compreso
     * @param  array<string, mixed>  $schema  JSON Schema della risposta
     * @return string il contenuto della risposta (JSON come testo)
     *
     * @throws LlmUnavailableException
     */
    public function chat(array $messages, array $schema): string;
}
