<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Membro di una band (Membership): solo id utente, nome e strumenti, mai l'email
class MemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->user_id,
            'name' => $this->user->name,
            'instruments' => $this->instruments->pluck('instrument')->values(),
        ];
    }
}
