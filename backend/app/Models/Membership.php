<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\Pivot;

// Riga di band_user (con id): un utente membro di una band
#[Fillable(['band_id', 'user_id'])]
class Membership extends Pivot
{
    protected $table = 'band_user';

    public $incrementing = true;

    public function band(): BelongsTo
    {
        return $this->belongsTo(Band::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function instruments(): HasMany
    {
        return $this->hasMany(MemberInstrument::class, 'band_user_id');
    }
}
