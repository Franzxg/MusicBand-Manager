<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

#[Fillable(['band_id', 'place', 'starts_at', 'notes', 'setlist_notes'])]
class Live extends Model
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

    // Scaletta: brani del live in ordine di posizione
    public function songs(): BelongsToMany
    {
        return $this->belongsToMany(Song::class)
            ->withPivot('id', 'position')
            ->withTimestamps()
            ->orderByPivot('position');
    }

    // Numero di brani, brani completati e durata totale con query aggregate
    public function scopeWithSetlistStats(Builder $query): void
    {
        $query->withCount(self::countAggregates())
            ->withSum('songs as total_duration_seconds', 'duration_seconds');
    }

    public function loadSetlistStats(): static
    {
        return $this->loadCount(self::countAggregates())
            ->loadSum('songs as total_duration_seconds', 'duration_seconds');
    }

    private static function countAggregates(): array
    {
        return [
            'songs',
            'songs as completed_songs_count' => fn (Builder $query) => $query->where('status', 'completed'),
        ];
    }
}
