<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Band\UpdateInstrumentsRequest;
use App\Http\Resources\BandDetailResource;
use App\Models\Band;
use App\Models\User;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class BandMemberController extends Controller
{
    // Sostituisce gli strumenti dell'utente autenticato in questa band
    public function updateMyInstruments(UpdateInstrumentsRequest $request, Band $band): BandDetailResource
    {
        $membership = $band->memberships()->where('user_id', $request->user()->id)->firstOrFail();

        DB::transaction(function () use ($membership, $request) {
            $membership->instruments()->delete();
            $membership->instruments()->createMany(
                array_map(fn (string $instrument) => ['instrument' => $instrument], $request->validated('instruments'))
            );
        });

        $band->load(['memberships.user', 'memberships.instruments'])->loadCount('memberships');

        return new BandDetailResource($band);
    }

    // Rimuove un membro; se è l'utente stesso, esce dalla band
    public function destroy(Band $band, User $user): Response
    {
        Gate::authorize('update', $band);

        $membership = $band->memberships()->where('user_id', $user->id)->firstOrFail();

        DB::transaction(function () use ($band, $membership) {
            $membership->delete();

            // Una band senza membri viene eliminata
            if ($band->memberships()->doesntExist()) {
                $band->delete();
            }
        });

        return response()->noContent();
    }
}
