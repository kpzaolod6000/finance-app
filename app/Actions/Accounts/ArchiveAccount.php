<?php

declare(strict_types=1);

namespace App\Actions\Accounts;

use App\Models\Account;
use Illuminate\Validation\ValidationException;

class ArchiveAccount
{
    public function handle(Account $account): Account
    {
        if ($account->transactions()->exists()) {
            $account->update(['is_archived' => true]);

            return $account->fresh();
        }

        $account->delete();

        return $account;
    }

    public function forceDelete(Account $account): void
    {
        if ($account->transactions()->exists()) {
            throw ValidationException::withMessages([
                'account' => 'Cannot delete an account that has transactions.',
            ]);
        }

        $account->forceDelete();
    }
}
