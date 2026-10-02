<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListEventsRequest;
use App\Http\Requests\Live\StoreLiveRequest;
use App\Http\Requests\Live\UpdateLiveRequest;
use App\Http\Resources\LiveDetailResource;
use App\Http\Resources\LiveResource;
use App\Models\Band;
use App\Models\Live;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;

class LiveController extends Controller
{
    // Live dal più vicino; di default solo quelli futuri
    public function index(ListEventsRequest $request, Band $band): AnonymousResourceCollection
    {
        $from = $request->validated('from') ? Carbon::parse($request->validated('from'))->utc() : now();

        $lives = $band->lives()
            ->where('starts_at', '>=', $from)
            ->orderBy('starts_at')
            ->withSetlistStats()
            ->get();

        return LiveResource::collection($lives);
    }

    public function store(StoreLiveRequest $request, Band $band): JsonResponse
    {
        $live = $band->lives()->create($request->validated());

        return self::detail($live)->response()->setStatusCode(201);
    }

    public function show(Live $live): LiveDetailResource
    {
        Gate::authorize('view', $live);

        return self::detail($live);
    }

    public function update(UpdateLiveRequest $request, Live $live): LiveDetailResource
    {
        $live->update($request->validated());

        return self::detail($live);
    }

    public function destroy(Live $live): Response
    {
        Gate::authorize('delete', $live);

        $live->delete();

        return response()->noContent();
    }

    // Live con band, scaletta ordinata e valori calcolati
    public static function detail(Live $live): LiveDetailResource
    {
        $live->load(['band', 'songs'])->loadSetlistStats();

        return new LiveDetailResource($live);
    }
}
