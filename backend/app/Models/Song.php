<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['band_id', 'title', 'artist', 'version', 'link', 'duration_seconds', 'musical_key', 'energy', 'bpm', 'status', 'notes'])]
class Song extends Model
{
    public const STATUSES = ['to_study', 'studying', 'completed'];

    protected $attributes = [
        'version' => '',
        'status' => 'to_study',
    ];

    protected function casts(): array
    {
        return [
            'duration_seconds' => 'integer',
            'energy' => 'integer',
            'bpm' => 'integer',
        ];
    }

    public function band(): BelongsTo
    {
        return $this->belongsTo(Band::class);
    }

    public function lives(): BelongsToMany
    {
        return $this->belongsToMany(Live::class)
            ->withPivot('id', 'position')
            ->withTimestamps();
    }

    // Brano con la stessa chiave (band, titolo, artista, versione), maiuscole ignorate
    public static function findDuplicate(int $bandId, string $title, string $artist, string $version, ?int $exceptId = null): ?self
    {
        return self::where('band_id', $bandId)
            ->whereRaw('LOWER(title) = ?', [mb_strtolower($title)])
            ->whereRaw('LOWER(artist) = ?', [mb_strtolower($artist)])
            ->whereRaw('LOWER(version) = ?', [mb_strtolower($version)])
            ->when($exceptId, fn ($query) => $query->whereKeyNot($exceptId))
            ->first();
    }
}
