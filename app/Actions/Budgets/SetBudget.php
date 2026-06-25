<?php

declare(strict_types=1);

namespace App\Actions\Budgets;

use App\Models\Budget;
use App\Models\User;
use Carbon\Carbon;

class SetBudget
{
    public function handle(User $user, array $data): Budget
    {
        $periodMonth = Carbon::createFromFormat('Y-m', $data['period_month'])->startOfMonth()->toDateString();

        return Budget::updateOrCreate(
            [
                'user_id' => $user->id,
                'category_id' => $data['category_id'],
                'period_month' => $periodMonth,
            ],
            [
                'amount_limit' => $data['amount_limit'],
                'currency' => strtoupper($data['currency']),
            ]
        );
    }
}
