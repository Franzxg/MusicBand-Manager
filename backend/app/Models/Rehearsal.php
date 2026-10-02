<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['band_id', 'place', 'starts_at', 'notes'])]
class Rehearsal extends Model
{
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
        ];
    }

    public function band(): BelongsTo
    {
        return $this->belongsTo(Band::class);
    }
}
