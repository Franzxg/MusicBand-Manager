<?php

namespace Tests\Concerns;

use App\Models\Band;
use App\Models\Membership;
use App\Models\Song;
use App\Models\User;

// Helper dei test: band con membri e canzoni
trait CreatesBands
{
    protected function bandWith(User ...$users): Band
    {
        $band = Band::create(['name' => 'The Testers', 'invite_code' => Band::generateInviteCode()]);
        foreach ($users as $user) {
            Membership::create(['band_id' => $band->id, 'user_id' => $user->id])
                ->instruments()->create(['instrument' => 'Chitarra']);
        }

        return $band;
    }

    protected function songFor(Band $band, array $attributes = []): Song
    {
        static $count = 0;
        $count++;

        return $band->songs()->create([
            'title' => "Brano $count",
            'artist' => 'Artista',
            'duration_seconds' => 200,
            ...$attributes,
        ])->refresh();
    }
}
