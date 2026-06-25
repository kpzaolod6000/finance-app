<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'account_id' => Account::factory(),
            'transfer_account_id' => null,
            'category_id' => null,
            'type' => TransactionType::Expense->value,
            'amount' => fake()->randomFloat(2, 1, 1000),
            'currency' => 'PEN',
            'occurred_at' => fake()->dateTimeBetween('-1 year')->format('Y-m-d'),
            'description' => fake()->optional()->sentence(),
        ];
    }

    public function income(): static
    {
        return $this->state(['type' => TransactionType::Income->value]);
    }

    public function expense(): static
    {
        return $this->state(['type' => TransactionType::Expense->value]);
    }
}
