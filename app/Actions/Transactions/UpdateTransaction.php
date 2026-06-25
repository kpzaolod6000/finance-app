<?php

declare(strict_types=1);

namespace App\Actions\Transactions;

use App\Models\Transaction;

class UpdateTransaction
{
    public function handle(Transaction $transaction, array $data): Transaction
    {
        $transaction->update([
            'account_id' => $data['account_id'],
            'transfer_account_id' => $data['transfer_account_id'] ?? null,
            'category_id' => $data['category_id'] ?? null,
            'type' => $data['type'],
            'amount' => $data['amount'],
            'currency' => strtoupper($data['currency']),
            'occurred_at' => $data['occurred_at'],
            'description' => $data['description'] ?? null,
        ]);

        return $transaction->fresh();
    }
}
