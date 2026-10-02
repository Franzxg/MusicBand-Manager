<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_sends_link_to_frontend(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'luca@example.com']);

        $this->postJson('/api/forgot-password', ['email' => 'luca@example.com'])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            $url = $notification->toMail($user)->actionUrl;

            return str_starts_with($url, config('app.frontend_url').'/reset-password?token='.$notification->token)
                && str_contains($url, 'email=luca%40example.com');
        });
    }

    public function test_forgot_password_returns_200_for_unknown_email(): void
    {
        Notification::fake();

        $this->postJson('/api/forgot-password', ['email' => 'nessuno@example.com'])->assertOk();

        Notification::assertNothingSent();
    }

    public function test_reset_password_changes_password_and_revokes_tokens(): void
    {
        $user = User::factory()->create();
        $user->createToken('api');
        $token = Password::createToken($user);

        $this->postJson('/api/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'password-nuova',
            'password_confirmation' => 'password-nuova',
        ])->assertOk();

        $user->refresh();
        $this->assertTrue(Hash::check('password-nuova', $user->password));
        $this->assertCount(0, $user->tokens);
    }

    public function test_reset_password_rejects_invalid_token(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/reset-password', [
            'token' => 'token-non-valido',
            'email' => $user->email,
            'password' => 'password-nuova',
            'password_confirmation' => 'password-nuova',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }
}
