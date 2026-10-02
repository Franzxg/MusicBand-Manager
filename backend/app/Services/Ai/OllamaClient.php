<?php

namespace App\Services\Ai;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

// Ollama in locale: POST /api/chat senza streaming, con structured outputs
class OllamaClient implements LlmClient
{
    public function chat(array $messages, array $schema): string
    {
        $config = config('ai.ollama');

        try {
            $response = Http::baseUrl($config['base_url'])
                // Senza il servizio ollama si risponde 503 in pochi secondi
                ->connectTimeout(5)
                ->timeout($config['timeout'])
                ->post('/api/chat', [
                    'model' => $config['model'],
                    'messages' => $messages,
                    'stream' => false,
                    'format' => $schema,
                    'keep_alive' => $config['keep_alive'],
                    // num_thread solo se configurato (altrimenti decide Ollama)
                    'options' => array_filter([
                        'num_ctx' => $config['num_ctx'],
                        'num_thread' => $config['num_thread'],
                        'temperature' => $config['temperature'],
                    ], fn ($value) => $value !== null),
                ]);
        } catch (ConnectionException $e) {
            throw new LlmUnavailableException('Ollama unreachable: '.$e->getMessage(), previous: $e);
        }

        // Es. 404 se il modello non è ancora scaricato
        if ($response->failed()) {
            throw new LlmUnavailableException('Ollama error '.$response->status().': '.$response->body());
        }

        $content = $response->json('message.content');
        if (! is_string($content)) {
            throw new LlmUnavailableException('Ollama: empty response');
        }

        return $content;
    }
}
