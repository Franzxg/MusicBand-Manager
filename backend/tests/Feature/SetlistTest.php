<?php

namespace Tests\Feature;

use App\Models\Band;
use App\Models\Live;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesBands;
use Tests\TestCase;

class SetlistTest extends TestCase
{
    use CreatesBands, RefreshDatabase;

    private User $user;

    private Band $band;

    private Live $live;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->band = $this->bandWith($this->user);
        $this->live = $this->band->lives()->create(['place' => 'Club', 'starts_at' => now()->addDay()]);
        Sanctum::actingAs($this->user);
    }

    private function setlistIds(): array
    {
        return $this->live->songs()->pluck('songs.id')->all();
    }

    public function test_add_song_from_repertoire(): void
    {
        $first = $this->songFor($this->band);
        $second = $this->songFor($this->band);

        $this->postJson("/api/lives/{$this->live->id}/songs", ['song_id' => $first->id])->assertCreated();
        $this->postJson("/api/lives/{$this->live->id}/songs", ['song_id' => $second->id])
            ->assertCreated()
            ->assertJsonPath('data.songs_count', 2)
            ->assertJsonPath('data.songs.1.id', $second->id)
            ->assertJsonPath('data.songs.1.position', 2);
    }

    public function test_add_new_song_creates_it_in_repertoire(): void
    {
        $this->postJson("/api/lives/{$this->live->id}/songs", [
            'title' => 'Nuovo Brano',
            'artist' => 'Noi',
            'duration_seconds' => 210,
        ])->assertCreated()
            ->assertJsonPath('data.songs.0.title', 'Nuovo Brano');

        $this->assertDatabaseHas('songs', ['band_id' => $this->band->id, 'title' => 'Nuovo Brano']);
    }

    public function test_add_new_song_reuses_existing_one_with_same_key(): void
    {
        $existing = $this->songFor($this->band, ['title' => 'Creep', 'artist' => 'Radiohead']);

        $this->postJson("/api/lives/{$this->live->id}/songs", [
            'title' => 'creep', 'artist' => 'radiohead', 'duration_seconds' => 999,
        ])->assertCreated()
            ->assertJsonPath('data.songs.0.id', $existing->id);

        $this->assertDatabaseCount('songs', 1);
    }

    public function test_song_already_in_setlist_returns_422(): void
    {
        $song = $this->songFor($this->band, ['title' => 'Creep', 'artist' => 'Radiohead']);
        $this->live->songs()->attach($song->id, ['position' => 1]);

        $this->postJson("/api/lives/{$this->live->id}/songs", ['song_id' => $song->id])
            ->assertUnprocessable()->assertJsonValidationErrors(['song_id']);

        // Anche passando i dati di un brano già presente
        $this->postJson("/api/lives/{$this->live->id}/songs", [
            'title' => 'Creep', 'artist' => 'Radiohead', 'duration_seconds' => 200,
        ])->assertUnprocessable()->assertJsonValidationErrors(['title']);
    }

    public function test_song_of_another_band_is_rejected(): void
    {
        $otherBand = $this->bandWith(User::factory()->create());
        $foreign = $this->songFor($otherBand);

        $this->postJson("/api/lives/{$this->live->id}/songs", ['song_id' => $foreign->id])
            ->assertUnprocessable()->assertJsonValidationErrors(['song_id']);

        $this->putJson("/api/lives/{$this->live->id}/setlist", ['song_ids' => [$foreign->id]])
            ->assertUnprocessable()->assertJsonValidationErrors(['song_ids']);
    }

    public function test_reorder_rewrites_positions(): void
    {
        [$a, $b, $c] = [$this->songFor($this->band), $this->songFor($this->band), $this->songFor($this->band)];
        foreach ([$a, $b, $c] as $index => $song) {
            $this->live->songs()->attach($song->id, ['position' => $index + 1]);
        }

        $this->putJson("/api/lives/{$this->live->id}/songs/order", ['song_ids' => [$c->id, $a->id, $b->id]])
            ->assertOk()
            ->assertJsonPath('data.songs.0.id', $c->id)
            ->assertJsonPath('data.songs.0.position', 1)
            ->assertJsonPath('data.songs.2.id', $b->id);

        // L'elenco deve contenere tutti e soli i brani della scaletta
        $this->putJson("/api/lives/{$this->live->id}/songs/order", ['song_ids' => [$a->id, $b->id]])
            ->assertUnprocessable()->assertJsonValidationErrors(['song_ids']);
    }

    public function test_replace_setlist(): void
    {
        [$a, $b, $c] = [$this->songFor($this->band), $this->songFor($this->band), $this->songFor($this->band)];
        $this->live->songs()->attach($a->id, ['position' => 1]);

        $this->putJson("/api/lives/{$this->live->id}/setlist", ['song_ids' => [$c->id, $b->id]])
            ->assertOk()
            ->assertJsonPath('data.songs_count', 2);

        $this->assertEquals([$c->id, $b->id], $this->setlistIds());

        // setlist_notes facoltativo: se presente sostituisce le note della scaletta
        $this->putJson("/api/lives/{$this->live->id}/setlist", ['song_ids' => [$a->id], 'setlist_notes' => 'Apri forte'])
            ->assertOk()
            ->assertJsonPath('data.setlist_notes', 'Apri forte');

        $this->putJson("/api/lives/{$this->live->id}/setlist", ['song_ids' => []])
            ->assertOk()
            ->assertJsonPath('data.songs_count', 0)
            ->assertJsonPath('data.setlist_notes', 'Apri forte');
    }

    public function test_remove_song_from_setlist_keeps_it_in_repertoire(): void
    {
        $song = $this->songFor($this->band);
        $this->live->songs()->attach($song->id, ['position' => 1]);

        $this->deleteJson("/api/lives/{$this->live->id}/songs/{$song->id}")->assertNoContent();

        $this->assertEquals([], $this->setlistIds());
        $this->assertModelExists($song);

        $this->deleteJson("/api/lives/{$this->live->id}/songs/{$song->id}")->assertNotFound();
    }

    public function test_copy_setlist_from_another_live(): void
    {
        $source = $this->band->lives()->create([
            'place' => 'Sagra', 'starts_at' => now()->addDays(5), 'setlist_notes' => 'Chiusura lenta',
        ]);
        [$a, $b] = [$this->songFor($this->band), $this->songFor($this->band)];
        $source->songs()->attach($b->id, ['position' => 1]);
        $source->songs()->attach($a->id, ['position' => 2]);
        $this->live->songs()->attach($this->songFor($this->band)->id, ['position' => 1]);

        $this->postJson("/api/lives/{$this->live->id}/copy-setlist", ['source_live_id' => $source->id])
            ->assertOk()
            ->assertJsonPath('data.setlist_notes', 'Chiusura lenta')
            ->assertJsonPath('data.songs_count', 2);

        $this->assertEquals([$b->id, $a->id], $this->setlistIds());
    }

    public function test_copy_setlist_rejects_same_live_and_other_band(): void
    {
        $otherLive = $this->bandWith($this->user)->lives()->create(['place' => 'X', 'starts_at' => now()->addDay()]);

        $this->postJson("/api/lives/{$this->live->id}/copy-setlist", ['source_live_id' => $this->live->id])
            ->assertUnprocessable()->assertJsonValidationErrors(['source_live_id']);
        $this->postJson("/api/lives/{$this->live->id}/copy-setlist", ['source_live_id' => $otherLive->id])
            ->assertUnprocessable()->assertJsonValidationErrors(['source_live_id']);
    }

    public function test_non_member_gets_403_on_setlist(): void
    {
        $song = $this->songFor($this->band);
        Sanctum::actingAs(User::factory()->create());

        $this->postJson("/api/lives/{$this->live->id}/songs", ['song_id' => $song->id])->assertForbidden();
        $this->putJson("/api/lives/{$this->live->id}/songs/order", ['song_ids' => []])->assertForbidden();
        $this->putJson("/api/lives/{$this->live->id}/setlist", ['song_ids' => []])->assertForbidden();
        $this->deleteJson("/api/lives/{$this->live->id}/songs/{$song->id}")->assertForbidden();
        $this->postJson("/api/lives/{$this->live->id}/copy-setlist", ['source_live_id' => $this->live->id])
            ->assertForbidden();
    }
}
