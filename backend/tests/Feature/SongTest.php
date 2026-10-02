<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesBands;
use Tests\TestCase;

class SongTest extends TestCase
{
    use CreatesBands, RefreshDatabase;

    public function test_member_can_add_and_list_songs(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        Sanctum::actingAs($user);

        $this->postJson("/api/bands/{$band->id}/songs", [
            'title' => ' Creep ',
            'artist' => 'Radiohead',
            'duration_seconds' => 238,
            'musical_key' => 'G',
            'energy' => 2,
            'bpm' => 92,
            'link' => 'https://www.youtube.com/watch?v=XFkzRNyygfk',
        ])->assertCreated()
            ->assertJsonPath('data.title', 'Creep')
            ->assertJsonPath('data.version', '')
            ->assertJsonPath('data.status', 'to_study');

        $this->getJson("/api/bands/{$band->id}/songs")
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_song_fields_are_validated(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        Sanctum::actingAs($user);

        $this->postJson("/api/bands/{$band->id}/songs", [
            'title' => '',
            'artist' => str_repeat('a', 151),
            'duration_seconds' => 7201,
            'energy' => 6,
            'bpm' => 20,
            'status' => 'done',
            'link' => 'ftp://example.com/file',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'artist', 'duration_seconds', 'energy', 'bpm', 'status', 'link']);
    }

    public function test_duplicate_song_is_rejected_ignoring_case(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        $this->songFor($band, ['title' => 'Zombie', 'artist' => 'The Cranberries']);
        Sanctum::actingAs($user);

        $this->postJson("/api/bands/{$band->id}/songs", [
            'title' => ' zombie', 'artist' => 'THE CRANBERRIES', 'duration_seconds' => 300,
        ])->assertUnprocessable()->assertJsonValidationErrors(['title']);

        // Con una versione diversa è un brano distinto
        $this->postJson("/api/bands/{$band->id}/songs", [
            'title' => 'Zombie', 'artist' => 'The Cranberries', 'version' => 'acustica', 'duration_seconds' => 280,
        ])->assertCreated();

        // Un'altra band può avere lo stesso brano
        $otherBand = $this->bandWith($user);
        $this->postJson("/api/bands/{$otherBand->id}/songs", [
            'title' => 'Zombie', 'artist' => 'The Cranberries', 'duration_seconds' => 300,
        ])->assertCreated();
    }

    public function test_member_can_update_status_and_notes(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        $song = $this->songFor($band);
        Sanctum::actingAs($user);

        $this->patchJson("/api/songs/{$song->id}", ['status' => 'completed', 'notes' => 'Attacco in levare'])
            ->assertOk()
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.notes', 'Attacco in levare')
            ->assertJsonPath('data.title', $song->title);
    }

    public function test_update_cannot_create_duplicate(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        $this->songFor($band, ['title' => 'Uno', 'artist' => 'A']);
        $song = $this->songFor($band, ['title' => 'Due', 'artist' => 'A']);
        Sanctum::actingAs($user);

        $this->patchJson("/api/songs/{$song->id}", ['title' => 'UNO'])
            ->assertUnprocessable()->assertJsonValidationErrors(['title']);
        // Lo stesso brano può essere salvato con i suoi valori
        $this->patchJson("/api/songs/{$song->id}", ['title' => 'Due'])->assertOk();
    }

    public function test_deleting_song_removes_it_from_setlists(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        $song = $this->songFor($band);
        $live = $band->lives()->create(['place' => 'Pub', 'starts_at' => now()->addDay()]);
        $live->songs()->attach($song->id, ['position' => 1]);
        Sanctum::actingAs($user);

        $this->deleteJson("/api/songs/{$song->id}")->assertNoContent();

        $this->assertModelMissing($song);
        $this->assertDatabaseCount('live_song', 0);
    }

    public function test_non_member_gets_403_on_songs(): void
    {
        $band = $this->bandWith(User::factory()->create());
        $song = $this->songFor($band);
        Sanctum::actingAs(User::factory()->create());

        $this->getJson("/api/bands/{$band->id}/songs")->assertForbidden();
        $this->postJson("/api/bands/{$band->id}/songs", ['title' => 'X', 'artist' => 'Y', 'duration_seconds' => 100])
            ->assertForbidden();
        $this->patchJson("/api/songs/{$song->id}", ['status' => 'completed'])->assertForbidden();
        $this->deleteJson("/api/songs/{$song->id}")->assertForbidden();
    }
}
