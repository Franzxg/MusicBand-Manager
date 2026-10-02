<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

// Imposta la lingua dall'header Accept-Language (it o en, default it)
class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        App::setLocale($request->getPreferredLanguage(['it', 'en']) ?? 'it');

        return $next($request);
    }
}
