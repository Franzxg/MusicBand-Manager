<?php

namespace App\Services\Ai;

use App\Models\Band;
use App\Models\Live;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

// Orchestra la chat: contesto, schema, chiamata al modello (con fallback) e validazione
class AiChatService
{
    private const INSTRUCTIONS = <<<'TXT'
You are the assistant of a music band inside the "Music Band Manager" app.
Rules:
- Reply in the language of the user's last message (default: %s).
- Use only the data below. Never invent songs, durations, keys or other missing values: "-" means unknown.
- Keep replies short and practical.
- Reply with a JSON object: "reply" (your answer as plain text), "setlist_song_ids" and "setlist_notes".
- Fill "setlist_song_ids" only when the user asks for a setlist: song ids from the REPERTOIRE, in playing order, without repetitions. Otherwise use an empty array.
- For a setlist, get as close as possible to the requested duration (sum the song durations). Follow the requested mood using energy and bpm: open with energy, lower it in the middle, close strong.
- "setlist_notes" is a short note about the proposed setlist, or an empty string.
TXT;

    public function __construct(
        private BandContextBuilder $contextBuilder,
        private OllamaClient $ollama,
        private OpenRouterClient $openRouter,
    ) {}

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array{reply: string, setlist_proposal: array<string, mixed>|null}
     *
     * @throws LlmUnavailableException
     */
    public function reply(Band $band, array $messages, ?Live $live = null): array
    {
        $songs = $this->contextBuilder->songs($band);
        $language = app()->getLocale() === 'en' ? 'English' : 'Italian';

        $system = sprintf(self::INSTRUCTIONS, $language)."\n\n".$this->contextBuilder->build($band, $songs, $live);
        $content = $this->complete(
            [['role' => 'system', 'content' => $system], ...$messages],
            $this->schema($songs->pluck('id')->all()),
        );

        return $this->parse($content, $songs);
    }

    // Ollama prima; OpenRouter solo se il fallback è attivo
    private function complete(array $messages, array $schema): string
    {
        try {
            return $this->ollama->chat($messages, $schema);
        } catch (LlmUnavailableException $e) {
            Log::warning($e->getMessage());
            if (! config('ai.fallback_enabled')) {
                throw $e;
            }
        }

        try {
            return $this->openRouter->chat($messages, $schema);
        } catch (LlmUnavailableException $e) {
            Log::warning($e->getMessage());
            throw $e;
        }
    }

    // Schema della risposta: gli id ammessi sono solo quelli del repertorio (enum)
    public function schema(array $songIds): array
    {
        $ids = ['type' => 'array', 'items' => ['type' => 'integer']];
        if ($songIds === []) {
            $ids['maxItems'] = 0;
        } else {
            $ids['items']['enum'] = array_values($songIds);
        }

        return [
            'type' => 'object',
            'properties' => [
                'reply' => ['type' => 'string'],
                'setlist_song_ids' => $ids,
                'setlist_notes' => ['type' => 'string'],
            ],
            'required' => ['reply', 'setlist_song_ids', 'setlist_notes'],
            'additionalProperties' => false,
        ];
    }

    // Valida il JSON del modello: scarta id non validi e doppioni, calcola la durata reale
    private function parse(string $content, Collection $songs): array
    {
        $data = json_decode($content, true);
        if (! is_array($data)) {
            // Risposta non in JSON: la si mostra come testo, senza proposta
            return ['reply' => trim($content), 'setlist_proposal' => null];
        }

        $byId = $songs->keyBy('id');
        $ids = collect(is_array($data['setlist_song_ids'] ?? null) ? $data['setlist_song_ids'] : [])
            ->filter(fn ($id) => is_int($id) && $byId->has($id))
            ->unique()
            ->values();

        $proposal = null;
        if ($ids->isNotEmpty()) {
            $proposalSongs = $ids->map(fn ($id) => $byId[$id]);
            $notes = is_string($data['setlist_notes'] ?? null) ? trim($data['setlist_notes']) : '';
            $proposal = [
                'song_ids' => $ids->all(),
                'songs' => $proposalSongs->map(fn ($song) => [
                    'id' => $song->id,
                    'title' => $song->title,
                    'artist' => $song->artist,
                    'version' => $song->version,
                    'musical_key' => $song->musical_key,
                    'duration_seconds' => $song->duration_seconds,
                ])->all(),
                'total_duration_seconds' => (int) $proposalSongs->sum('duration_seconds'),
                'notes' => $notes !== '' ? $notes : null,
            ];
        }

        return [
            'reply' => is_string($data['reply'] ?? null) ? trim($data['reply']) : '',
            'setlist_proposal' => $proposal,
        ];
    }
}
