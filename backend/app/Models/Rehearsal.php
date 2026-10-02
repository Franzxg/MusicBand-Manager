<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

#[Fillable(['band_id', 'place', 'starts_at', 'notes'])]
class Rehearsal extends Model
{
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
        ];
    }

    // Data e ora ricevute in ISO 8601 (con fuso) e salvate in UTC
    protected function startsAt(): Attribute
    {
        return Attribute::set(fn ($value) => Carbon::parse($value)->utc()->format('Y-m-d H:i:s'));
    }

    public function band(): BelongsTo
    {
        return $this->belongsTo(Band::class);
    }
}
