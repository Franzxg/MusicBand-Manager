<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Live con i valori calcolati della scaletta (da Live::withSetlistStats)
class LiveResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $songsCount = (int) $this->songs_count;

        return [
            'id' => $this->id,
            'band_id' => $this->band_id,
            'band' => $this->whenLoaded('band', fn () => ['id' => $this->band->id, 'name' => $this->band->name]),
            'place' => $this->place,
            'starts_at' => $this->starts_at,
            'notes' => $this->notes,
            'setlist_notes' => $this->setlist_notes,
            'songs_count' => $songsCount,
            'total_duration_seconds' => (int) $this->total_duration_seconds,
            'progress_percent' => $songsCount > 0
                ? (int) round($this->completed_songs_count * 100 / $songsCount)
                : 0,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
