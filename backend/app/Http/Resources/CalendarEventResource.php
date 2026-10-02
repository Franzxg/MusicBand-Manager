<?php

namespace App\Http\Resources;

use App\Models\Live;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Evento del calendario: un live o una prova, con la sua band
class CalendarEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'type' => $this->resource instanceof Live ? 'live' : 'rehearsal',
            'id' => $this->id,
            'band' => ['id' => $this->band->id, 'name' => $this->band->name],
            'starts_at' => $this->starts_at,
            'place' => $this->place,
        ];
    }
}
