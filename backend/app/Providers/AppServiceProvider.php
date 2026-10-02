<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Il link di reset punta alla pagina del frontend
        ResetPassword::createUrlUsing(function (User $user, string $token) {
            return config('app.frontend_url').'/reset-password?'.http_build_query([
                'token' => $token,
                'email' => $user->getEmailForPasswordReset(),
            ]);
        });

        // Ingresso in una band con codice: 10 tentativi al minuto per utente
        RateLimiter::for('join', fn (Request $request) => Limit::perMinute(10)->by($request->user()->id));

        // Chat AI: 10 richieste al minuto per utente
        RateLimiter::for('chat', fn (Request $request) => Limit::perMinute(10)->by($request->user()->id));
    }
}
