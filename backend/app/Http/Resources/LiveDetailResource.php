<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

// Dettaglio del live: aggiunge la scaletta ordinata
class LiveDetailResource extends LiveResource
{
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'songs' => SongResource::collection($this->whenLoaded('songs')),
        ];
    }
}
