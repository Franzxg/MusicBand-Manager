<?php

namespace App\Services\Ai;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

// Fallback su OpenRouter (API compatibile OpenAI), usato solo se AI_FALLBACK_ENABLED=true
class OpenRouterClient implements LlmClient
{
    public function chat(array $messages, array $schema): string
    {
        $config = config('ai.openrouter');

        if (empty($config['api_key'])) {
            throw new LlmUnavailableException('OpenRouter: missing API key');
        }

        try {
            $response = Http::baseUrl($config['base_url'])
                ->withToken($config['api_key'])
                ->timeout($config['timeout'])
                ->post('/chat/completions', [
                    'model' => $config['model'],
                    'messages' => $messages,
                    'temperature' => config('ai.ollama.temperature'),
                    'response_format' => [
                        'type' => 'json_schema',
                        'json_schema' => ['name' => 'band_chat_reply', 'strict' => true, 'schema' => $schema],
                    ],
                ]);
        } catch (ConnectionException $e) {
            throw new LlmUnavailableException('OpenRouter unreachable: '.$e->getMessage(), previous: $e);
        }

        // Es. 429 quando si supera il limite di richieste gratuite
        if ($response->failed()) {
            throw new LlmUnavailableException('OpenRouter error '.$response->status().': '.$response->body());
        }

        $content = $response->json('choices.0.message.content');
        if (! is_string($content)) {
            throw new LlmUnavailableException('OpenRouter: empty response');
        }

        return $content;
    }
}
