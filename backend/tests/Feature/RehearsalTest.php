<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesBands;
use Tests\TestCase;

class RehearsalTest extends TestCase
{
    use CreatesBands, RefreshDatabase;

    public function test_member_can_manage_rehearsals(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        Sanctum::actingAs($user);

        $id = $this->postJson("/api/bands/{$band->id}/rehearsals", [
            'place' => 'Sala prove',
            'starts_at' => '2030-01-10T18:00:00+01:00',
        ])->assertCreated()
            ->assertJsonPath('data.starts_at', '2030-01-10T17:00:00.000000Z')
            ->json('data.id');

        $this->patchJson("/api/rehearsals/{$id}", ['notes' => 'Portare il metronomo'])
            ->assertOk()
            ->assertJsonPath('data.notes', 'Portare il metronomo')
            ->assertJsonPath('data.place', 'Sala prove');

        $this->getJson("/api/bands/{$band->id}/rehearsals")
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->deleteJson("/api/rehearsals/{$id}")->assertNoContent();
        $this->assertDatabaseCount('rehearsals', 0);
    }

    public function test_index_lists_future_rehearsals_by_default(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        $band->rehearsals()->create(['place' => 'Ieri', 'starts_at' => now()->subDay()]);
        $band->rehearsals()->create(['place' => 'Domani', 'starts_at' => now()->addDay()]);
        Sanctum::actingAs($user);

        $this->getJson("/api/bands/{$band->id}/rehearsals")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.place', 'Domani');
    }

    public function test_non_member_gets_403_on_rehearsals(): void
    {
        $band = $this->bandWith(User::factory()->create());
        $rehearsal = $band->rehearsals()->create(['place' => 'Sala', 'starts_at' => now()->addDay()]);
        Sanctum::actingAs(User::factory()->create());

        $this->getJson("/api/bands/{$band->id}/rehearsals")->assertForbidden();
        $this->postJson("/api/bands/{$band->id}/rehearsals", ['place' => 'X', 'starts_at' => now()->toIso8601String()])
            ->assertForbidden();
        $this->patchJson("/api/rehearsals/{$rehearsal->id}", ['place' => 'X'])->assertForbidden();
        $this->deleteJson("/api/rehearsals/{$rehearsal->id}")->assertForbidden();
    }
}
