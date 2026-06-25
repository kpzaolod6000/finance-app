<?php

declare(strict_types=1);

namespace App\Actions\Accounts;

use App\Models\Account;

class UpdateAccount
{
    public function handle(Account $account, array $data): Account
    {
        $account->update([
            'name' => $data['name'],
            'type' => $data['type'],
            'currency' => strtoupper($data['currency']),
            'color' => $data['color'],
            'icon' => $data['icon'],
        ]);

        return $account->fresh();
    }
}
