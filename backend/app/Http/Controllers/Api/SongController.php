<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Song\StoreSongRequest;
use App\Http\Requests\Song\UpdateSongRequest;
use App\Http\Resources\SongResource;
use App\Models\Band;
use App\Models\Song;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class SongController extends Controller
{
    public function index(Band $band): AnonymousResourceCollection
    {
        Gate::authorize('view', $band);

        return SongResource::collection($band->songs()->orderBy('title')->orderBy('artist')->get());
    }

    public function store(StoreSongRequest $request, Band $band): JsonResponse
    {
        $song = $band->songs()->create($request->validated());

        return (new SongResource($song->refresh()))->response()->setStatusCode(201);
    }

    public function update(UpdateSongRequest $request, Song $song): SongResource
    {
        $song->update($request->validated());

        return new SongResource($song);
    }

    public function destroy(Song $song): Response
    {
        Gate::authorize('delete', $song);

        // Le righe in scaletta si cancellano a catena (ON DELETE CASCADE)
        $song->delete();

        return response()->noContent();
    }
}
