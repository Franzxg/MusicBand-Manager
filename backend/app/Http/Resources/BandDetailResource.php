<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

// Dettaglio della band: aggiunge l'elenco dei membri
class BandDetailResource extends BandResource
{
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'members' => MemberResource::collection($this->whenLoaded('memberships')),
        ];
    }
}
