<?php

declare(strict_types=1);

namespace App\Actions\Accounts;

use App\Models\Account;
use App\Models\User;

class CreateAccount
{
    public function handle(User $user, array $data): Account
    {
        return $user->accounts()->create([
            'name' => $data['name'],
            'type' => $data['type'],
            'initial_balance' => $data['initial_balance'],
            'currency' => strtoupper($data['currency']),
            'color' => $data['color'],
            'icon' => $data['icon'],
        ]);
    }
}
