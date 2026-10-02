<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'genre', 'invite_code'])]
class Band extends Model
{
    // Caratteri del codice di invito: maiuscole e cifre senza 0/O e 1/I
    private const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    public static function generateInviteCode(): string
    {
        do {
            $code = '';
            for ($i = 0; $i < 8; $i++) {
                $code .= self::INVITE_ALPHABET[random_int(0, strlen(self::INVITE_ALPHABET) - 1)];
            }
        } while (self::where('invite_code', $code)->exists());

        return $code;
    }

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
