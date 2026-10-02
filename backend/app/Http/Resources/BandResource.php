<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Band vista da un suo membro, con gli strumenti dell'utente autenticato
class BandResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'genre' => $this->genre,
            'invite_code' => $this->invite_code,
            'members_count' => $this->whenCounted('memberships'),
            'my_instruments' => $this->whenLoaded('memberships', fn () => $this->memberships
                ->firstWhere('user_id', $request->user()->id)
                ?->instruments->pluck('instrument')->values() ?? []),
            'created_at' => $this->created_at,
        ];
    }
}
