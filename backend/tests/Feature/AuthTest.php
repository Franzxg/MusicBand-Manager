<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receives_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => '  Mario Rossi ',
            'email' => 'Mario@Example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']])
            ->assertJsonPath('user.name', 'Mario Rossi')
            ->assertJsonPath('user.email', 'mario@example.com')
            ->assertJsonMissingPath('user.password');

        $user = User::firstWhere('email', 'mario@example.com');
        $this->assertNotEquals('password123', $user->password);
        $this->assertCount(1, $user->tokens);
    }

    public function test_register_validates_fields(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->postJson('/api/register', [
            'name' => str_repeat('a', 101),
            'email' => 'taken@example.com',
            'password' => 'short',
            'password_confirmation' => 'different',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        User::factory()->create(['email' => 'anna@example.com']);

        $this->postJson('/api/login', [
            'email' => 'anna@example.com',
            'password' => 'password',
        ])->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'anna@example.com']);

        $this->postJson('/api/login', [
            'email' => 'anna@example.com',
            'password' => 'wrong-password',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_logout_revokes_current_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api')->plainTextToken;

        $this->withToken($token)->postJson('/api/logout')->assertNoContent();

        $this->assertCount(0, $user->fresh()->tokens);
    }

    public function test_protected_routes_require_token(): void
    {
        $this->getJson('/api/me')->assertUnauthorized();
        // Anche senza header Accept la risposta è 401 in JSON (nessun redirect)
        $this->get('/api/me')->assertUnauthorized();
    }

    public function test_validation_messages_follow_accept_language(): void
    {
        $it = $this->postJson('/api/register', [], ['Accept-Language' => 'it-IT,it;q=0.9']);
        $it->assertJsonPath('errors.name.0', 'Il campo nome è obbligatorio.');

        $en = $this->postJson('/api/register', [], ['Accept-Language' => 'en-US,en;q=0.9']);
        $en->assertJsonPath('errors.name.0', 'The name field is required.');

        // Lingua non supportata: italiano
        $default = $this->postJson('/api/register', [], ['Accept-Language' => 'de-DE']);
        $default->assertJsonPath('errors.name.0', 'Il campo nome è obbligatorio.');
    }
}
