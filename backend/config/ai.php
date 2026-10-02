<?php

// Chat AI: Ollama in locale, OpenRouter come fallback opzionale (spento di default)
return [
    'ollama' => [
        'base_url' => env('OLLAMA_BASE_URL', 'http://ollama:11434'),
        'model' => env('OLLAMA_MODEL', 'llama3.2:3b'),
        'num_ctx' => (int) env('OLLAMA_NUM_CTX', 4096),
        // Thread della CPU: sulle CPU ibride (core P ed E) il default di Ollama usa tutti i core ed è molto lento; null = automatico
        'num_thread' => env('OLLAMA_NUM_THREAD') ? (int) env('OLLAMA_NUM_THREAD') : null,
        'keep_alive' => env('OLLAMA_KEEP_ALIVE', '30m'),
        'timeout' => (int) env('OLLAMA_TIMEOUT', 120),
        'temperature' => 0.3,
    ],

    'fallback_enabled' => (bool) env('AI_FALLBACK_ENABLED', false),

    'openrouter' => [
        'base_url' => 'https://openrouter.ai/api/v1',
        'api_key' => env('OPENROUTER_API_KEY'),
        'model' => env('OPENROUTER_MODEL', 'openrouter/free'),
        // Dopo un timeout di Ollama (120 s) resta poco tempo prima dei 180 s di nginx e php-fpm
        'timeout' => 45,
    ],
];
