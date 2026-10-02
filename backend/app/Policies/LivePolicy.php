<?php

namespace App\Policies;

use App\Models\Live;
use App\Models\User;

// Solo i membri della band proprietaria del live (anche per la scaletta)
class LivePolicy
{
    public function view(User $user, Live $live): bool
    {
        return $user->isMemberOf($live->band);
    }

    public function update(User $user, Live $live): bool
    {
        return $user->isMemberOf($live->band);
    }

    public function delete(User $user, Live $live): bool
    {
        return $user->isMemberOf($live->band);
    }
}
