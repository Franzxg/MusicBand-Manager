<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BandController;
use App\Http\Controllers\Api\BandMemberController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\LiveController;
use App\Http\Controllers\Api\LiveSongController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RehearsalController;
use App\Http\Controllers\Api\SongController;
use Illuminate\Support\Facades\Route;

// Rotte pubbliche
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordResetController::class, 'forgot']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me', [ProfileController::class, 'show']);
    Route::patch('/me', [ProfileController::class, 'update']);
    Route::put('/me/password', [ProfileController::class, 'updatePassword']);
    Route::delete('/me', [ProfileController::class, 'destroy']);

    Route::get('/bands', [BandController::class, 'index']);
    Route::post('/bands', [BandController::class, 'store']);
    Route::post('/bands/join', [BandController::class, 'join'])->middleware('throttle:join');
    Route::get('/bands/{band}', [BandController::class, 'show']);
    Route::patch('/bands/{band}', [BandController::class, 'update']);
    Route::delete('/bands/{band}', [BandController::class, 'destroy']);
    Route::post('/bands/{band}/invite-code', [BandController::class, 'regenerateInviteCode']);
    Route::put('/bands/{band}/me/instruments', [BandMemberController::class, 'updateMyInstruments']);
    Route::delete('/bands/{band}/members/{user}', [BandMemberController::class, 'destroy']);

    Route::get('/bands/{band}/songs', [SongController::class, 'index']);
    Route::post('/bands/{band}/songs', [SongController::class, 'store']);
    Route::patch('/songs/{song}', [SongController::class, 'update']);
    Route::delete('/songs/{song}', [SongController::class, 'destroy']);

    Route::get('/bands/{band}/lives', [LiveController::class, 'index']);
    Route::post('/bands/{band}/lives', [LiveController::class, 'store']);
    Route::get('/lives/{live}', [LiveController::class, 'show']);
    Route::patch('/lives/{live}', [LiveController::class, 'update']);
    Route::delete('/lives/{live}', [LiveController::class, 'destroy']);

    Route::post('/lives/{live}/songs', [LiveSongController::class, 'store']);
    Route::put('/lives/{live}/songs/order', [LiveSongController::class, 'order']);
    Route::put('/lives/{live}/setlist', [LiveSongController::class, 'replace']);
    Route::delete('/lives/{live}/songs/{song}', [LiveSongController::class, 'destroy']);
    Route::post('/lives/{live}/copy-setlist', [LiveSongController::class, 'copy']);

    Route::get('/bands/{band}/rehearsals', [RehearsalController::class, 'index']);
    Route::post('/bands/{band}/rehearsals', [RehearsalController::class, 'store']);
    Route::patch('/rehearsals/{rehearsal}', [RehearsalController::class, 'update']);
    Route::delete('/rehearsals/{rehearsal}', [RehearsalController::class, 'destroy']);

    Route::get('/calendar', CalendarController::class);
});
