<?php

namespace App\Policies;

use App\Models\Song;
use App\Models\User;

// Solo i membri della band proprietaria del brano
class SongPolicy
{
    public function update(User $user, Song $song): bool
    {
        return $user->isMemberOf($song->band);
    }

    public function delete(User $user, Song $song): bool
    {
        return $user->isMemberOf($song->band);
    }
}
