<?php

namespace Tests\Feature;

use App\Models\Band;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\CreatesBands;
use Tests\TestCase;

class BandTest extends TestCase
{
    use CreatesBands, RefreshDatabase;

    public function test_user_can_create_band_and_becomes_member(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/bands', [
            'name' => ' I Rumorosi ',
            'genre' => 'Rock',
            'instruments' => [' Basso ', 'Voce'],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'I Rumorosi')
            ->assertJsonPath('data.members_count', 1)
            ->assertJsonPath('data.my_instruments', ['Basso', 'Voce'])
            ->assertJsonPath('data.members.0.id', $user->id)
            ->assertJsonPath('data.members.0.instruments', ['Basso', 'Voce']);

        $code = $response->json('data.invite_code');
        $this->assertMatchesRegularExpression('/^[A-HJ-NP-Z2-9]{8}$/', $code);
        $this->assertTrue($user->isMemberOf(Band::first()));
    }

    public function test_instruments_are_validated(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/bands', ['name' => 'X', 'instruments' => []])
            ->assertUnprocessable()->assertJsonValidationErrors(['instruments']);

        $this->postJson('/api/bands', ['name' => 'X', 'instruments' => ['Basso', 'basso']])
            ->assertUnprocessable()->assertJsonValidationErrors(['instruments.0']);

        $this->postJson('/api/bands', ['name' => 'X', 'instruments' => array_map(fn ($i) => "S$i", range(1, 11))])
            ->assertUnprocessable()->assertJsonValidationErrors(['instruments']);

        $this->postJson('/api/bands', ['name' => 'X', 'instruments' => ['   ', str_repeat('a', 51)]])
            ->assertUnprocessable()->assertJsonValidationErrors(['instruments.0', 'instruments.1']);

        $this->assertDatabaseCount('bands', 0);
    }

    public function test_index_lists_only_user_bands_with_own_instruments(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $mine = $this->bandWith($user, $other);
        $this->bandWith($other);
        Sanctum::actingAs($user);

        $this->getJson('/api/bands')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $mine->id)
            ->assertJsonPath('data.0.members_count', 2)
            ->assertJsonPath('data.0.my_instruments', ['Chitarra']);
    }

    public function test_show_lists_members_without_email(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $band = $this->bandWith($user, $other);
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/bands/{$band->id}")
            ->assertOk()
            ->assertJsonCount(2, 'data.members')
            ->assertJsonPath('data.invite_code', $band->invite_code);

        $this->assertStringNotContainsString($other->email, $response->getContent());
        $this->assertEquals(['id', 'name', 'instruments'], array_keys($response->json('data.members.1')));
    }

    public function test_non_member_gets_403(): void
    {
        $band = $this->bandWith(User::factory()->create());
        Sanctum::actingAs(User::factory()->create());

        $this->getJson("/api/bands/{$band->id}")->assertForbidden();
        $this->patchJson("/api/bands/{$band->id}", ['name' => 'Nuovo'])->assertForbidden();
        $this->deleteJson("/api/bands/{$band->id}")->assertForbidden();
        $this->postJson("/api/bands/{$band->id}/invite-code")->assertForbidden();
        $this->putJson("/api/bands/{$band->id}/me/instruments", ['instruments' => ['Voce']])->assertForbidden();

        $this->assertModelExists($band);
    }

    public function test_member_can_update_band(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        Sanctum::actingAs($user);

        $this->patchJson("/api/bands/{$band->id}", ['name' => 'Nuovo Nome', 'genre' => 'Jazz'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Nuovo Nome')
            ->assertJsonPath('data.genre', 'Jazz');
    }

    public function test_member_can_delete_band(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user, User::factory()->create());
        Sanctum::actingAs($user);

        $this->deleteJson("/api/bands/{$band->id}")->assertNoContent();

        $this->assertModelMissing($band);
        $this->assertDatabaseCount('band_user', 0);
        $this->assertDatabaseCount('member_instruments', 0);
    }

    public function test_regenerated_invite_code_replaces_old_one(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        $oldCode = $band->invite_code;
        Sanctum::actingAs($user);

        $newCode = $this->postJson("/api/bands/{$band->id}/invite-code")
            ->assertOk()
            ->json('data.invite_code');
        $this->assertNotEquals($oldCode, $newCode);

        Sanctum::actingAs(User::factory()->create());
        $this->postJson('/api/bands/join', ['invite_code' => $oldCode, 'instruments' => ['Voce']])
            ->assertUnprocessable()->assertJsonValidationErrors(['invite_code']);
        $this->postJson('/api/bands/join', ['invite_code' => $newCode, 'instruments' => ['Voce']])
            ->assertCreated();
    }

    public function test_user_can_join_with_invite_code(): void
    {
        $band = $this->bandWith(User::factory()->create());
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/bands/join', [
            'invite_code' => strtolower($band->invite_code),
            'instruments' => ['Batteria', 'Percussioni'],
        ])->assertCreated()
            ->assertJsonPath('data.id', $band->id)
            ->assertJsonPath('data.members_count', 2)
            ->assertJsonPath('data.my_instruments', ['Batteria', 'Percussioni']);

        $this->assertTrue($user->isMemberOf($band));
    }

    public function test_join_rejects_invalid_code_and_existing_member(): void
    {
        $user = User::factory()->create();
        $band = $this->bandWith($user);
        Sanctum::actingAs($user);

        $this->postJson('/api/bands/join', ['invite_code' => 'ZZZZZZZZ', 'instruments' => ['Voce']])
            ->assertUnprocessable()->assertJsonValidationErrors(['invite_code']);

        $this->postJson('/api/bands/join', ['invite_code' => $band->invite_code, 'instruments' => ['Voce']])
            ->assertUnprocessable()
            ->assertJsonPath('errors.invite_code.0', __('bands.already_member'));
    }

    public function test_join_is_limited_to_ten_attempts_per_minute(): void
    {
        Sanctum::actingAs(User::factory()->create());

        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/bands/join', ['invite_code' => 'ZZZZZZZZ', 'instruments' => ['Voce']])
                ->assertUnprocessable();
        }

        $this->postJson('/api/bands/join', ['invite_code' => 'ZZZZZZZZ', 'instruments' => ['Voce']])
            ->assertTooManyRequests();
    }
}
