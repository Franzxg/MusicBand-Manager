<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'genre', 'invite_code'])]
class Band extends Model
{
    public function memberships(): HasMany
    {
        return $this->hasMany(Membership::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->using(Membership::class)
            ->withPivot('id')
            ->withTimestamps();
    }

    public function songs(): HasMany
    {
        return $this->hasMany(Song::class);
    }

    public function lives(): HasMany
    {
        return $this->hasMany(Live::class);
    }

    public function rehearsals(): HasMany
    {
        return $this->hasMany(Rehearsal::class);
    }
}
