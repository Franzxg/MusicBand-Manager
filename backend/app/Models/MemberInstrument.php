<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['band_user_id', 'instrument'])]
class MemberInstrument extends Model
{
    public function membership(): BelongsTo
    {
        return $this->belongsTo(Membership::class, 'band_user_id');
    }
}
