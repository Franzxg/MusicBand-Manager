<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\DeleteAccountRequest;
use App\Http\Requests\Profile\UpdatePasswordRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\Band;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    public function show(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function update(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();
        $user->update($request->validated());

        return new UserResource($user);
    }

    public function updatePassword(UpdatePasswordRequest $request): Response
    {
        $user = $request->user();
        $user->update(['password' => $request->validated('password')]);

        // Revoca gli altri token, tiene quello in uso
        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();

        return response()->noContent();
    }

    public function destroy(DeleteAccountRequest $request): Response
    {
        $user = $request->user();

        DB::transaction(function () use ($user) {
            $bandIds = $user->bands()->pluck('bands.id');

            $user->tokens()->delete();
            // Appartenenze e strumenti si cancellano a catena (ON DELETE CASCADE)
            $user->delete();

            // Le band rimaste senza membri vengono eliminate
            Band::whereIn('id', $bandIds)->doesntHave('memberships')->delete();
        });

        return response()->noContent();
    }
}
