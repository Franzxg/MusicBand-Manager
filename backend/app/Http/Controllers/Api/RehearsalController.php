<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListEventsRequest;
use App\Http\Requests\Rehearsal\StoreRehearsalRequest;
use App\Http\Requests\Rehearsal\UpdateRehearsalRequest;
use App\Http\Resources\RehearsalResource;
use App\Models\Band;
use App\Models\Rehearsal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;

class RehearsalController extends Controller
{
    // Prove dalla più vicina; di default solo quelle future
    public function index(ListEventsRequest $request, Band $band): AnonymousResourceCollection
    {
        $from = $request->validated('from') ? Carbon::parse($request->validated('from'))->utc() : now();

        $rehearsals = $band->rehearsals()
            ->where('starts_at', '>=', $from)
            ->orderBy('starts_at')
            ->get();

        return RehearsalResource::collection($rehearsals);
    }

    public function store(StoreRehearsalRequest $request, Band $band): JsonResponse
    {
        $rehearsal = $band->rehearsals()->create($request->validated());

        return (new RehearsalResource($rehearsal->refresh()))->response()->setStatusCode(201);
    }

    public function update(UpdateRehearsalRequest $request, Rehearsal $rehearsal): RehearsalResource
    {
        $rehearsal->update($request->validated());

        return new RehearsalResource($rehearsal->refresh());
    }

    public function destroy(Rehearsal $rehearsal): Response
    {
        Gate::authorize('delete', $rehearsal);

        $rehearsal->delete();

        return response()->noContent();
    }
}
