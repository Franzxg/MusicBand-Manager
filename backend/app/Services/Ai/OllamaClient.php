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
                ->timeout($config['timeout'])
                ->post('/api/chat', [
                    'model' => $config['model'],
                    'messages' => $messages,
                    'stream' => false,
                    'format' => $schema,
                    'keep_alive' => $config['keep_alive'],
                    'options' => [
                        'num_ctx' => $config['num_ctx'],
                        'temperature' => $config['temperature'],
                    ],
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
