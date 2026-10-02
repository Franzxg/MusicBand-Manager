<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SongResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'band_id' => $this->band_id,
            'title' => $this->title,
            'artist' => $this->artist,
            'version' => $this->version,
            'link' => $this->link,
            'duration_seconds' => $this->duration_seconds,
            'musical_key' => $this->musical_key,
            'energy' => $this->energy,
            'bpm' => $this->bpm,
            'status' => $this->status,
            'notes' => $this->notes,
            // Solo dentro una scaletta
            'position' => $this->whenPivotLoaded('live_song', fn () => $this->pivot->position),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
