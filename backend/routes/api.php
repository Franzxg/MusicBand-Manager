<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BandController;
use App\Http\Controllers\Api\BandMemberController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ProfileController;
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
});
