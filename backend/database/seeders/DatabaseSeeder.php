<?php

namespace Database\Seeders;

use App\Models\Band;
use App\Models\Membership;
use App\Models\User;
use Illuminate\Database\Seeder;

// Dati dimostrativi: date relative al giorno del seed, così il calendario non è mai vuoto
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $giulia = User::create(['name' => 'Giulia Demo', 'email' => 'demo1@example.com', 'password' => 'password123']);
        $marco = User::create(['name' => 'Marco Demo', 'email' => 'demo2@example.com', 'password' => 'password123']);

        // Prima band: entrambi gli utenti
        $rock = Band::create(['name' => 'Le Onde Elettriche', 'genre' => 'Rock', 'invite_code' => Band::generateInviteCode()]);
        $this->addMember($rock, $giulia, ['Voce', 'Chitarra acustica']);
        $this->addMember($rock, $marco, ['Batteria']);

        // Seconda band: solo demo1
        $duo = Band::create(['name' => 'Duo Notturno', 'genre' => 'Acustico', 'invite_code' => Band::generateInviteCode()]);
        $this->addMember($duo, $giulia, ['Pianoforte']);

        // [titolo, artista, versione, durata in secondi, tonalità, energia, bpm, stato]
        $rockSongs = [
            ['Seven Nation Army', 'The White Stripes', '', 232, 'Em', 4, 124, 'completed'],
            ['Smells Like Teen Spirit', 'Nirvana', '', 301, 'Fm', 5, 117, 'completed'],
            ['Wonderwall', 'Oasis', '', 258, 'F#m', 3, 87, 'completed'],
            ['Wonderwall', 'Oasis', 'acustica', 245, 'F#m', 2, 87, 'studying'],
            ['Back in Black', 'AC/DC', '', 255, 'E', 5, 94, 'studying'],
            ['Creep', 'Radiohead', '', 238, 'G', 2, 92, 'completed'],
            ['Zombie', 'The Cranberries', '', 306, 'Em', 4, 84, 'to_study'],
            ['Sweet Child O\' Mine', 'Guns N\' Roses', '', 356, 'D', 4, 125, 'studying'],
            ['Under the Bridge', 'Red Hot Chili Peppers', '', 264, 'E', 2, 84, 'to_study'],
            ['Mr. Brightside', 'The Killers', '', 222, 'C#', 5, 148, 'completed'],
            ['Highway to Hell', 'AC/DC', '', 208, 'A', 5, 116, 'to_study'],
            ['Albachiara', 'Vasco Rossi', '', 260, 'C', 3, 120, 'completed'],
        ];
        $duoSongs = [
            ['La cura', 'Franco Battiato', '', 228, 'C', 1, 72, 'completed'],
            ['Hallelujah', 'Leonard Cohen', '', 278, 'C', 1, 56, 'studying'],
            ['Imagine', 'John Lennon', '', 183, 'C', 1, 76, 'to_study'],
        ];

        $songs = $this->addSongs($rock, $rockSongs);
        $this->addSongs($duo, $duoSongs);

        // Live con scaletta di 6 brani e live ancora da preparare
        $festa = $rock->lives()->create([
            'place' => 'Festa della Musica, Piazza Grande',
            'starts_at' => now()->addDays(12)->setTime(19, 30),
            'notes' => 'Soundcheck alle 17:00. Portare cavi di scorta.',
            'setlist_notes' => 'Apertura energica, momento acustico al centro, chiusura con Mr. Brightside.',
        ]);
        $setlist = ['Seven Nation Army', 'Back in Black', 'Creep', 'Wonderwall', 'Albachiara', 'Mr. Brightside'];
        foreach ($setlist as $index => $title) {
            $festa->songs()->attach($songs[$title]->id, ['position' => $index + 1]);
        }

        $rock->lives()->create([
            'place' => 'Pub The Anchor',
            'starts_at' => now()->addDays(30)->setTime(21, 0),
            'notes' => 'Due set da 45 minuti.',
        ]);

        // Tre prove
        $rock->rehearsals()->create([
            'place' => 'Sala prove Sound Lab',
            'starts_at' => now()->addDays(3)->setTime(18, 0),
            'notes' => 'Provare i passaggi tra i brani della scaletta.',
        ]);
        $rock->rehearsals()->create([
            'place' => 'Sala prove Sound Lab',
            'starts_at' => now()->addDays(10)->setTime(18, 0),
            'notes' => 'Prova generale prima della Festa della Musica.',
        ]);
        $duo->rehearsals()->create([
            'place' => 'Casa di Giulia',
            'starts_at' => now()->addDays(5)->setTime(17, 0),
        ]);
    }

    private function addMember(Band $band, User $user, array $instruments): void
    {
        $membership = Membership::create(['band_id' => $band->id, 'user_id' => $user->id]);
        foreach ($instruments as $instrument) {
            $membership->instruments()->create(['instrument' => $instrument]);
        }
    }

    // Restituisce le canzoni create indicizzate per titolo (la prima versione)
    private function addSongs(Band $band, array $rows): array
    {
        $songs = [];
        foreach ($rows as [$title, $artist, $version, $duration, $key, $energy, $bpm, $status]) {
            $song = $band->songs()->create([
                'title' => $title,
                'artist' => $artist,
                'version' => $version,
                'duration_seconds' => $duration,
                'musical_key' => $key,
                'energy' => $energy,
                'bpm' => $bpm,
                'status' => $status,
            ]);
            $songs[$title] ??= $song;
        }

        return $songs;
    }
}
