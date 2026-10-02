<?php

namespace Tests\Feature;

use App\Models\Band;
use App\Models\Membership;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $this->withToken($token)->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_user_can_update_name_and_email(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $this->withToken($token)->patchJson('/api/me', [
            'name' => 'Nuovo Nome',
            'email' => 'nuova@example.com',
        ])->assertOk()
            ->assertJsonPath('data.name', 'Nuovo Nome')
            ->assertJsonPath('data.email', 'nuova@example.com');
    }

    public function test_email_must_be_unique_on_update(): void
    {
        User::factory()->create(['email' => 'altro@example.com']);
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $this->withToken($token)->patchJson('/api/me', ['email' => 'altro@example.com'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        // La propria email si può reinviare senza errori
        $this->withToken($token)->patchJson('/api/me', ['email' => $user->email])->assertOk();
    }

    public function test_change_password_keeps_current_token_and_revokes_others(): void
    {
        $user = User::factory()->create();
        $current = $user->createToken('api')->plainTextToken;
        $user->createToken('api');

        $this->withToken($current)->putJson('/api/me/password', [
            'current_password' => 'password',
            'password' => 'nuova-password',
            'password_confirmation' => 'nuova-password',
        ])->assertNoContent();

        $user->refresh();
        $this->assertTrue(Hash::check('nuova-password', $user->password));
        $this->assertCount(1, $user->tokens);
    }

    public function test_change_password_requires_current_password(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $this->withToken($token)->putJson('/api/me/password', [
            'current_password' => 'sbagliata',
            'password' => 'nuova-password',
            'password_confirmation' => 'nuova-password',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['current_password']);
    }

    public function test_delete_account_requires_password(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $this->withToken($token)->deleteJson('/api/me', ['password' => 'sbagliata'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);

        $this->assertModelExists($user);
    }

    public function test_delete_account_removes_memberships_and_empty_bands(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $soloBand = Band::create(['name' => 'Solo', 'invite_code' => 'ABCDEFGH']);
        $sharedBand = Band::create(['name' => 'Shared', 'invite_code' => 'HGFEDCBA']);
        $membership = Membership::create(['band_id' => $soloBand->id, 'user_id' => $user->id]);
        $membership->instruments()->create(['instrument' => 'Basso']);
        Membership::create(['band_id' => $sharedBand->id, 'user_id' => $user->id]);
        Membership::create(['band_id' => $sharedBand->id, 'user_id' => $other->id]);

        $this->withToken($token)->deleteJson('/api/me', ['password' => 'password'])
            ->assertNoContent();

        $this->assertModelMissing($user);
        $this->assertModelMissing($soloBand);
        $this->assertModelExists($sharedBand);
        $this->assertDatabaseCount('member_instruments', 0);
        $this->assertDatabaseCount('band_user', 1);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
