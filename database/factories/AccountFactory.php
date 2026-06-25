<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\AccountType;
use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Account>
 */
class AccountFactory extends Factory
{
    protected $model = Account::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->words(2, true),
            'type' => fake()->randomElement(AccountType::cases())->value,
            'initial_balance' => fake()->randomFloat(2, 0, 10000),
            'currency' => 'PEN',
            'color' => fake()->hexColor(),
            'icon' => 'wallet',
            'is_archived' => false,
        ];
    }
}
