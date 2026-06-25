<?php

declare(strict_types=1);

namespace App\Actions\Transactions;

use App\Models\Transaction;
use App\Models\User;

class CreateTransaction
{
    public function handle(User $user, array $data): Transaction
    {
        return $user->transactions()->create([
            'account_id' => $data['account_id'],
            'transfer_account_id' => $data['transfer_account_id'] ?? null,
            'category_id' => $data['category_id'] ?? null,
            'type' => $data['type'],
            'amount' => $data['amount'],
            'currency' => strtoupper($data['currency']),
            'occurred_at' => $data['occurred_at'],
            'description' => $data['description'] ?? null,
        ]);
    }
}
