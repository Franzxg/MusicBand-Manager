<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Setlist\AddLiveSongRequest;
use App\Http\Requests\Setlist\CopySetlistRequest;
use App\Http\Requests\Setlist\ReorderSetlistRequest;
use App\Http\Requests\Setlist\ReplaceSetlistRequest;
use App\Http\Resources\LiveDetailResource;
use App\Models\Live;
use App\Models\Song;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

// Gestione della scaletta di un live (pivot live_song)
class LiveSongController extends Controller
{
    public function store(AddLiveSongRequest $request, Live $live): JsonResponse
    {
        DB::transaction(function () use ($request, $live) {
            if ($request->filled('song_id')) {
                $song = Song::findOrFail($request->validated('song_id'));
                $errorField = 'song_id';
            } else {
                // Brano nuovo: riusa quello con la stessa chiave o lo crea nel repertorio
                $data = $request->validated();
                $song = Song::findDuplicate($live->band_id, $data['title'], $data['artist'], $data['version'] ?? '')
                    ?? $live->band->songs()->create($data);
                $errorField = 'title';
            }

            if ($live->songs()->whereKey($song->id)->exists()) {
                throw ValidationException::withMessages([$errorField => __('setlist.already_in_setlist')]);
            }

            $last = DB::table('live_song')->where('live_id', $live->id)->max('position') ?? 0;
            $live->songs()->attach($song->id, ['position' => $last + 1]);
        });

        return LiveController::detail($live)->response()->setStatusCode(201);
    }

    public function order(ReorderSetlistRequest $request, Live $live): LiveDetailResource
    {
        DB::transaction(function () use ($request, $live) {
            foreach ($request->validated('song_ids') as $index => $songId) {
                $live->songs()->updateExistingPivot($songId, ['position' => $index + 1]);
            }
        });

        return LiveController::detail($live);
    }

    public function replace(ReplaceSetlistRequest $request, Live $live): LiveDetailResource
    {
        DB::transaction(fn () => $live->songs()->sync($this->positions($request->validated('song_ids'))));

        return LiveController::detail($live);
    }

    public function destroy(Live $live, Song $song): Response
    {
        Gate::authorize('update', $live);

        // Il brano resta nel repertorio; 404 se non è in questa scaletta
        if ($live->songs()->detach($song->id) === 0) {
            abort(404);
        }

        return response()->noContent();
    }

    public function copy(CopySetlistRequest $request, Live $live): LiveDetailResource
    {
        $source = $request->sourceLive();

        DB::transaction(function () use ($source, $live) {
            $live->songs()->sync($this->positions($source->songs()->pluck('songs.id')->all()));
            $live->update(['setlist_notes' => $source->setlist_notes]);
        });

        return LiveController::detail($live);
    }

    // [id1, id2, ...] => [id1 => ['position' => 1], id2 => ['position' => 2], ...]
    private function positions(array $songIds): array
    {
        $positions = [];
        foreach (array_values($songIds) as $index => $songId) {
            $positions[$songId] = ['position' => $index + 1];
        }

        return $positions;
    }
}
