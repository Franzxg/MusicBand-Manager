<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesBands;
use Tests\TestCase;

class LiveTest extends TestCase
{
    use CreatesBands, RefreshDatabase;

    public function test_member_can_create_live_and_time_is_saved_in_utc(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        Sanctum::actingAs($user);

        $this->postJson("/api/bands/{$band->id}/lives", [
            'place' => 'Arena',
            'starts_at' => '2030-06-01T21:30:00+02:00',
            'notes' => 'Soundcheck alle 18',
        ])->assertCreated()
            ->assertJsonPath('data.place', 'Arena')
            ->assertJsonPath('data.starts_at', '2030-06-01T19:30:00.000000Z')
            ->assertJsonPath('data.songs_count', 0)
            ->assertJsonPath('data.total_duration_seconds', 0)
            ->assertJsonPath('data.progress_percent', 0)
            ->assertJsonPath('data.songs', []);
    }

    public function test_index_lists_future_lives_by_default_ordered(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        $band->lives()->create(['place' => 'Passato', 'starts_at' => now()->subDays(3)]);
        $band->lives()->create(['place' => 'Lontano', 'starts_at' => now()->addDays(20)]);
        $band->lives()->create(['place' => 'Vicino', 'starts_at' => now()->addDays(2)]);
        Sanctum::actingAs($user);

        $this->getJson("/api/bands/{$band->id}/lives")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.place', 'Vicino')
            ->assertJsonPath('data.1.place', 'Lontano');

        $from = now()->subDays(5)->toIso8601String();
        $this->getJson("/api/bands/{$band->id}/lives?from=".urlencode($from))
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.place', 'Passato');
    }

    public function test_show_returns_setlist_with_computed_values(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        $live = $band->lives()->create(['place' => 'Club', 'starts_at' => now()->addDay()]);
        $songs = [
            $this->songFor($band, ['duration_seconds' => 200, 'status' => 'completed']),
            $this->songFor($band, ['duration_seconds' => 180, 'status' => 'studying']),
            $this->songFor($band, ['duration_seconds' => 220, 'status' => 'to_study']),
        ];
        $live->songs()->attach($songs[2]->id, ['position' => 1]);
        $live->songs()->attach($songs[0]->id, ['position' => 2]);
        $live->songs()->attach($songs[1]->id, ['position' => 3]);
        Sanctum::actingAs($user);

        $this->getJson("/api/lives/{$live->id}")
            ->assertOk()
            ->assertJsonPath('data.songs_count', 3)
            ->assertJsonPath('data.total_duration_seconds', 600)
            ->assertJsonPath('data.progress_percent', 33)
            ->assertJsonPath('data.band.id', $band->id)
            ->assertJsonPath('data.songs.0.id', $songs[2]->id)
            ->assertJsonPath('data.songs.0.position', 1)
            ->assertJsonPath('data.songs.2.id', $songs[1]->id);

        // Gli stessi valori compaiono nell'elenco dei live
        $this->getJson("/api/bands/{$band->id}/lives")
            ->assertJsonPath('data.0.total_duration_seconds', 600)
            ->assertJsonPath('data.0.progress_percent', 33);
    }

    public function test_member_can_update_and_delete_live(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        $live = $band->lives()->create(['place' => 'Club', 'starts_at' => now()->addDay()]);
        $live->songs()->attach($this->songFor($band)->id, ['position' => 1]);
        Sanctum::actingAs($user);

        $this->patchJson("/api/lives/{$live->id}", ['place' => 'Teatro', 'setlist_notes' => 'Bis finale'])
            ->assertOk()
            ->assertJsonPath('data.place', 'Teatro')
            ->assertJsonPath('data.setlist_notes', 'Bis finale');

        $this->deleteJson("/api/lives/{$live->id}")->assertNoContent();
        $this->assertModelMissing($live);
        $this->assertDatabaseCount('live_song', 0);
        $this->assertDatabaseCount('songs', 1);
    }

    public function test_live_validation(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        Sanctum::actingAs($user);

        $this->postJson("/api/bands/{$band->id}/lives", ['place' => '', 'starts_at' => 'domani'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['place', 'starts_at']);
    }

    public function test_non_member_gets_403_on_lives(): void
    {
        $band = $this->bandWith(User::factory()->create());
        $live = $band->lives()->create(['place' => 'Club', 'starts_at' => now()->addDay()]);
        Sanctum::actingAs(User::factory()->create());

        $this->getJson("/api/bands/{$band->id}/lives")->assertForbidden();
        $this->postJson("/api/bands/{$band->id}/lives", ['place' => 'X', 'starts_at' => now()->toIso8601String()])
            ->assertForbidden();
        $this->getJson("/api/lives/{$live->id}")->assertForbidden();
        $this->patchJson("/api/lives/{$live->id}", ['place' => 'X'])->assertForbidden();
        $this->deleteJson("/api/lives/{$live->id}")->assertForbidden();
    }
}
