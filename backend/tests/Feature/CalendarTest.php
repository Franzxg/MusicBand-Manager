<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesBands;
use Tests\TestCase;

class CalendarTest extends TestCase
{
    use CreatesBands, RefreshDatabase;

    public function test_calendar_lists_events_of_all_user_bands_in_range(): void
    {
        $user = User::factory()->create();
        $first = $this->bandWith($user);
        $second = $this->bandWith($user);
        $foreign = $this->bandWith(User::factory()->create());

        $first->lives()->create(['place' => 'Arena', 'starts_at' => '2030-05-10 21:00:00']);
        $second->rehearsals()->create(['place' => 'Sala', 'starts_at' => '2030-05-03 18:00:00']);
        $first->rehearsals()->create(['place' => 'Fuori intervallo', 'starts_at' => '2030-06-15 18:00:00']);
        $foreign->lives()->create(['place' => 'Altra band', 'starts_at' => '2030-05-12 21:00:00']);
        Sanctum::actingAs($user);

        $this->getJson('/api/calendar?from=2030-05-01T00:00:00Z&to=2030-05-31T23:59:59Z')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.type', 'rehearsal')
            ->assertJsonPath('data.0.band.id', $second->id)
            ->assertJsonPath('data.0.place', 'Sala')
            ->assertJsonPath('data.1.type', 'live')
            ->assertJsonPath('data.1.band.name', $first->name)
            ->assertJsonPath('data.1.starts_at', '2030-05-10T21:00:00.000000Z');
    }

    public function test_calendar_requires_valid_range(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/calendar')
            ->assertUnprocessable()->assertJsonValidationErrors(['from', 'to']);
        $this->getJson('/api/calendar?from=2030-05-10&to=2030-05-01')
            ->assertUnprocessable()->assertJsonValidationErrors(['to']);
    }
}
