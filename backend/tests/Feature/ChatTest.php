<?php

namespace Tests\Feature;

use App\Models\Band;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesBands;
use Tests\TestCase;

class ChatTest extends TestCase
{
    use CreatesBands, RefreshDatabase;

    private User $user;

    private Band $band;

    protected function setUp(): void
    {
        parent::setUp();

        Http::preventStrayRequests();
        config(['ai.fallback_enabled' => false, 'ai.openrouter.api_key' => 'test-key']);

        $this->user = User::factory()->create(['name' => 'Anna', 'email' => 'anna@example.com']);
        $this->band = $this->bandWith($this->user, User::factory()->create(['name' => 'Bruno', 'email' => 'bruno@example.com']));
        Sanctum::actingAs($this->user);
    }

    private function ollamaReply(array $content): array
    {
        return ['model' => 'llama3.2:3b', 'message' => ['role' => 'assistant', 'content' => json_encode($content)], 'done' => true];
    }

    private function ask(array $extra = []): TestResponse
    {
        return $this->postJson("/api/bands/{$this->band->id}/chat", [
            'messages' => [['role' => 'user', 'content' => 'Proponi una scaletta da 10 minuti']],
            ...$extra,
        ]);
    }

    public function test_reply_with_validated_setlist_proposal(): void
    {
        $first = $this->songFor($this->band, ['duration_seconds' => 200, 'musical_key' => 'Am']);
        $second = $this->songFor($this->band, ['duration_seconds' => 180]);
        $foreign = $this->songFor($this->bandWith(User::factory()->create()));

        Http::fake(['*/api/chat' => Http::response($this->ollamaReply([
            'reply' => 'Ecco la scaletta',
            // id di un'altra band, inesistente e doppione: vanno scartati
            'setlist_song_ids' => [$second->id, $foreign->id, 99999, $first->id, $second->id],
            'setlist_notes' => 'Apri forte',
        ]))]);

        $this->ask()->assertOk()
            ->assertJsonPath('reply', 'Ecco la scaletta')
            ->assertJsonPath('setlist_proposal.song_ids', [$second->id, $first->id])
            ->assertJsonPath('setlist_proposal.songs.1.title', $first->title)
            ->assertJsonPath('setlist_proposal.songs.1.musical_key', 'Am')
            ->assertJsonPath('setlist_proposal.total_duration_seconds', 380)
            ->assertJsonPath('setlist_proposal.notes', 'Apri forte');

        Http::assertSent(function (Request $request) use ($first, $second) {
            $enum = $request['format']['properties']['setlist_song_ids']['items']['enum'];
            sort($enum);

            return $request['stream'] === false
                && $request['model'] === config('ai.ollama.model')
                && $request['options']['temperature'] === 0.3
                && $enum === [$first->id, $second->id]
                && $request['messages'][0]['role'] === 'system'
                && $request['messages'][1]['content'] === 'Proponi una scaletta da 10 minuti';
        });
    }

    public function test_context_contains_band_data_but_no_emails(): void
    {
        $this->songFor($this->band, ['title' => 'Wonderwall', 'energy' => 4, 'bpm' => 87]);
        Http::fake(['*/api/chat' => Http::response($this->ollamaReply(['reply' => 'Ok', 'setlist_song_ids' => [], 'setlist_notes' => '']))]);

        $this->ask()->assertOk()->assertJsonPath('setlist_proposal', null);

        Http::assertSent(function (Request $request) {
            $system = $request['messages'][0]['content'];

            return str_contains($system, 'Anna')
                && str_contains($system, 'Bruno | Chitarra')
                && str_contains($system, 'Wonderwall')
                && str_contains($system, 'energy 4 | bpm 87')
                && ! str_contains($system, '@');
        });
    }

    public function test_unreachable_ollama_returns_503(): void
    {
        Http::fake(['*/api/chat' => fn () => throw new ConnectionException('Connection refused')]);

        $this->ask()->assertStatus(503)->assertJsonPath('message', __('ai.unavailable'));
    }

    public function test_model_not_downloaded_returns_503(): void
    {
        Http::fake(['*/api/chat' => Http::response(['error' => 'model "llama3.2:3b" not found, try pulling it first'], 404)]);

        $this->ask()->assertStatus(503);
    }

    public function test_fallback_uses_openrouter_when_enabled(): void
    {
        config(['ai.fallback_enabled' => true]);
        $song = $this->songFor($this->band);

        Http::fake([
            '*/api/chat' => fn () => throw new ConnectionException('Connection refused'),
            'openrouter.ai/*' => Http::response(['choices' => [['message' => ['content' => json_encode([
                'reply' => 'Dal fallback', 'setlist_song_ids' => [$song->id], 'setlist_notes' => '',
            ])]]]]),
        ]);

        $this->ask()->assertOk()
            ->assertJsonPath('reply', 'Dal fallback')
            ->assertJsonPath('setlist_proposal.song_ids', [$song->id])
            ->assertJsonPath('setlist_proposal.notes', null);

        Http::assertSent(fn (Request $request) => str_contains($request->url(), 'openrouter.ai')
            && $request->hasHeader('Authorization', 'Bearer test-key')
            && $request['response_format']['type'] === 'json_schema');
    }

    public function test_fallback_error_returns_503(): void
    {
        config(['ai.fallback_enabled' => true]);
        Http::fake([
            '*/api/chat' => fn () => throw new ConnectionException('Connection refused'),
            'openrouter.ai/*' => Http::response(['error' => ['message' => 'Rate limit exceeded']], 429),
        ]);

        $this->ask()->assertStatus(503);
    }

    public function test_validation_errors(): void
    {
        Http::fake();
        $otherLive = $this->bandWith(User::factory()->create())->lives()->create(['place' => 'Altrove', 'starts_at' => now()->addDay()]);

        $this->postJson("/api/bands/{$this->band->id}/chat", ['messages' => []])
            ->assertUnprocessable()->assertJsonValidationErrors('messages');
        $this->postJson("/api/bands/{$this->band->id}/chat", ['messages' => [
            ['role' => 'user', 'content' => 'Ciao'],
            ['role' => 'assistant', 'content' => 'Ciao!'],
        ]])->assertUnprocessable()->assertJsonValidationErrors('messages');
        $this->postJson("/api/bands/{$this->band->id}/chat", ['messages' => [['role' => 'system', 'content' => 'x']]])
            ->assertUnprocessable()->assertJsonValidationErrors('messages.0.role');
        $this->postJson("/api/bands/{$this->band->id}/chat", ['messages' => [['role' => 'user', 'content' => str_repeat('a', 2001)]]])
            ->assertUnprocessable()->assertJsonValidationErrors('messages.0.content');
        $this->ask(['live_id' => $otherLive->id])->assertUnprocessable()->assertJsonValidationErrors('live_id');

        Http::assertNothingSent();
    }

    public function test_live_id_focuses_the_context(): void
    {
        $live = $this->band->lives()->create(['place' => 'Teatro Verdi', 'starts_at' => now()->addMonths(2)]);
        Http::fake(['*/api/chat' => Http::response($this->ollamaReply(['reply' => 'Ok', 'setlist_song_ids' => [], 'setlist_notes' => '']))]);

        $this->ask(['live_id' => $live->id])->assertOk();

        Http::assertSent(fn (Request $request) => str_contains($request['messages'][0]['content'], 'SELECTED LIVE')
            && str_contains($request['messages'][0]['content'], 'Teatro Verdi'));
    }

    public function test_non_member_gets_403(): void
    {
        Http::fake();
        Sanctum::actingAs(User::factory()->create());

        $this->ask()->assertForbidden();
        Http::assertNothingSent();
    }
}
