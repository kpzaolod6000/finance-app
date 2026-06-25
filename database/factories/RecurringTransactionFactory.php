<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\RecurrenceInterval;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\RecurringTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RecurringTransaction>
 */
class RecurringTransactionFactory extends Factory
{
    protected $model = RecurringTransaction::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'account_id' => Account::factory(),
            'transfer_account_id' => null,
            'category_id' => null,
            'type' => TransactionType::Expense->value,
            'amount' => fake()->randomFloat(2, 10, 500),
            'currency' => 'PEN',
            'description' => fake()->optional()->sentence(),
            'interval' => RecurrenceInterval::Monthly->value,
            'next_run_at' => today()->toDateString(),
            'ends_at' => null,
            'is_active' => true,
        ];
    }
}
