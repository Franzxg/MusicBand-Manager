<?php

namespace App\Policies;

use App\Models\Band;
use App\Models\User;

// Tutti i membri hanno gli stessi permessi; chi non è membro riceve 403
class BandPolicy
{
    public function view(User $user, Band $band): bool
    {
        return $user->isMemberOf($band);
    }

    public function update(User $user, Band $band): bool
    {
        return $user->isMemberOf($band);
    }

    public function delete(User $user, Band $band): bool
    {
        return $user->isMemberOf($band);
    }
}
