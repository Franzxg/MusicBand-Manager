<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Band\JoinBandRequest;
use App\Http\Requests\Band\StoreBandRequest;
use App\Http\Requests\Band\UpdateBandRequest;
use App\Http\Resources\BandDetailResource;
use App\Http\Resources\BandResource;
use App\Models\Band;
use App\Models\Membership;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class BandController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $userId = $request->user()->id;

        $bands = $request->user()->bands()
            ->withCount('memberships')
            // Solo l'appartenenza dell'utente, per i suoi strumenti
            ->with(['memberships' => fn ($query) => $query->where('user_id', $userId)->with('instruments')])
            ->orderBy('name')
            ->get();

        return BandResource::collection($bands);
    }

    public function store(StoreBandRequest $request): JsonResponse
    {
        $band = DB::transaction(function () use ($request) {
            $band = Band::create([
                'name' => $request->validated('name'),
                'genre' => $request->validated('genre'),
                'invite_code' => Band::generateInviteCode(),
            ]);

            $this->addMember($band, $request->user()->id, $request->validated('instruments'));

            return $band;
        });

        return $this->detail($band)->response()->setStatusCode(201);
    }

    public function join(JoinBandRequest $request): JsonResponse
    {
        $band = $request->band();

        DB::transaction(fn () => $this->addMember($band, $request->user()->id, $request->validated('instruments')));

        return $this->detail($band)->response()->setStatusCode(201);
    }

    public function show(Band $band): BandDetailResource
    {
        Gate::authorize('view', $band);

        return $this->detail($band);
    }

    public function update(UpdateBandRequest $request, Band $band): BandDetailResource
    {
        $band->update($request->validated());

        return $this->detail($band);
    }

    public function destroy(Band $band): Response
    {
        Gate::authorize('delete', $band);

        // Repertorio, live, scalette, prove e membri si cancellano a catena
        $band->delete();

        return response()->noContent();
    }

    public function regenerateInviteCode(Band $band): BandDetailResource
    {
        Gate::authorize('update', $band);

        $band->update(['invite_code' => Band::generateInviteCode()]);

        return $this->detail($band);
    }

    private function addMember(Band $band, int $userId, array $instruments): void
    {
        $membership = Membership::create(['band_id' => $band->id, 'user_id' => $userId]);
        $membership->instruments()->createMany(
            array_map(fn (string $instrument) => ['instrument' => $instrument], $instruments)
        );
    }

    private function detail(Band $band): BandDetailResource
    {
        $band->load(['memberships.user', 'memberships.instruments'])->loadCount('memberships');

        return new BandDetailResource($band);
    }
}
