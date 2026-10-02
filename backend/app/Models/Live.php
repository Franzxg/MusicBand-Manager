<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['band_id', 'place', 'starts_at', 'notes', 'setlist_notes'])]
class Live extends Model
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

    // Scaletta: brani del live in ordine di posizione
    public function songs(): BelongsToMany
    {
        return $this->belongsToMany(Song::class)
            ->withPivot('id', 'position')
            ->withTimestamps()
            ->orderByPivot('position');
    }
}
