<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Account;
use Brick\Math\BigDecimal;
use Brick\Math\RoundingMode;

class BalanceCalculator
{
    public function currentBalance(Account $account): string
    {
        $initial = BigDecimal::of((string) $account->initial_balance);

        // Income credited to this account
        $credited = BigDecimal::of((string) (
            $account->transactions()->where('type', 'income')->sum('amount') +
            $account->incomingTransfers()->sum('amount')
        ));

        // Expenses and transfers out of this account
        $debited = BigDecimal::of((string) (
            $account->transactions()->where('type', 'expense')->sum('amount') +
            $account->transactions()->where('type', 'transfer')->sum('amount')
        ));

        return $initial->plus($credited)->minus($debited)
            ->toScale(2, RoundingMode::HalfUp)
            ->__toString();
    }
}
