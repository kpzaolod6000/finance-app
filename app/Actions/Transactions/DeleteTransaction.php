<?php

declare(strict_types=1);

namespace App\Actions\Transactions;

use App\Models\Transaction;

class DeleteTransaction
{
    public function handle(Transaction $transaction): void
    {
        $transaction->delete();
    }
}
