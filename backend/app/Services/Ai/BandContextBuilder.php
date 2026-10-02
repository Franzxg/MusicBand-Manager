<?php

namespace App\Services\Ai;

use App\Models\Band;
use App\Models\Live;
use Illuminate\Support\Collection;

// Contesto compatto della band (una riga per elemento) per il messaggio di sistema
class BandContextBuilder
{
    public const MAX_SONGS = 100;

    private const MAX_LIVES = 5;

    private const MAX_REHEARSALS = 3;

    // Brani inclusi nel contesto: gli unici id ammessi nello schema della risposta
    public function songs(Band $band): Collection
    {
        return $band->songs()->orderBy('title')->limit(self::MAX_SONGS)->get();
    }

    public function build(Band $band, Collection $songs, ?Live $focusLive = null): string
    {
        $lines = [];

        $lines[] = 'BAND: '.$band->name.($band->genre ? ' | genre: '.$band->genre : '');

        // Membri: solo nome e strumenti, mai l'email
        $lines[] = '';
        $lines[] = 'MEMBERS (name | instruments):';
        $band->memberships()->with(['user:id,name', 'instruments'])->get()
            ->each(function ($membership) use (&$lines) {
                $instruments = $membership->instruments->pluck('instrument')->implode(', ');
                $lines[] = '- '.$membership->user->name.' | '.($instruments ?: '-');
            });

        $lines[] = '';
        $lines[] = 'REPERTOIRE (id | title - artist (version) | key | duration | status | energy 1-5 | bpm):';
        if ($songs->isEmpty()) {
            $lines[] = '(no songs)';
        }
        foreach ($songs as $song) {
            $parts = [
                $song->id,
                $song->title.' - '.$song->artist.($song->version !== '' ? ' ('.$song->version.')' : ''),
                $song->musical_key ?: '-',
                $this->duration($song->duration_seconds),
                $song->status,
            ];
            // Energia e bpm solo se compilati
            if ($song->energy) {
                $parts[] = 'energy '.$song->energy;
            }
            if ($song->bpm) {
                $parts[] = 'bpm '.$song->bpm;
            }
            $lines[] = '- '.implode(' | ', $parts);
        }

        $lives = $focusLive
            ? Live::whereKey($focusLive->id)
            : $band->lives()->where('starts_at', '>=', now())->orderBy('starts_at')->limit(self::MAX_LIVES);
        $lives = $lives->with('songs:id')->withSetlistStats()->get();

        $lines[] = '';
        $lines[] = ($focusLive ? 'SELECTED LIVE' : 'UPCOMING LIVES')
            .' (id | date UTC | place | setlist song ids in order | total duration | learned %):';
        if ($lives->isEmpty()) {
            $lines[] = '(none)';
        }
        foreach ($lives as $live) {
            $count = (int) $live->songs_count;
            $progress = $count > 0 ? (int) round($live->completed_songs_count * 100 / $count) : 0;
            $lines[] = '- '.implode(' | ', [
                $live->id,
                $live->starts_at->format('Y-m-d H:i'),
                $live->place,
                '['.$live->songs->pluck('id')->implode(', ').']',
                $this->duration((int) $live->total_duration_seconds),
                $progress.'%',
            ]);
        }

        $lines[] = '';
        $lines[] = 'UPCOMING REHEARSALS (date UTC | place):';
        $rehearsals = $band->rehearsals()->where('starts_at', '>=', now())->orderBy('starts_at')->limit(self::MAX_REHEARSALS)->get();
        if ($rehearsals->isEmpty()) {
            $lines[] = '(none)';
        }
        foreach ($rehearsals as $rehearsal) {
            $lines[] = '- '.$rehearsal->starts_at->format('Y-m-d H:i').' | '.$rehearsal->place;
        }

        return implode("\n", $lines);
    }

    private function duration(?int $seconds): string
    {
        return $seconds ? sprintf('%d:%02d', intdiv($seconds, 60), $seconds % 60) : '-';
    }
}
