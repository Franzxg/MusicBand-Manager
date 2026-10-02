<?php

namespace App\Policies;

use App\Models\Rehearsal;
use App\Models\User;

// Solo i membri della band proprietaria della prova
class RehearsalPolicy
{
    public function update(User $user, Rehearsal $rehearsal): bool
    {
        return $user->isMemberOf($rehearsal->band);
    }

    public function delete(User $user, Rehearsal $rehearsal): bool
    {
        return $user->isMemberOf($rehearsal->band);
    }
}
