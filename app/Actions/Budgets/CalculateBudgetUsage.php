<?php

declare(strict_types=1);

namespace App\Actions\Budgets;

use App\Data\BudgetData;
use App\Data\CategoryData;
use App\Enums\BudgetStatus;
use App\Models\Budget;
use Brick\Math\BigDecimal;
use Carbon\Carbon;

class CalculateBudgetUsage
{
    public function handle(Budget $budget): BudgetData
    {
        $periodStart = Carbon::instance($budget->period_month)->startOfMonth();
        $periodEnd = $periodStart->copy()->endOfMonth();

        $spent = (string) ($budget->category->transactions()
            ->where('type', 'expense')
            ->where('user_id', $budget->user_id)
            ->whereBetween('occurred_at', [$periodStart->toDateString(), $periodEnd->toDateString()])
            ->sum('amount') ?? '0');

        $limit = BigDecimal::of((string) $budget->amount_limit);
        $spentDecimal = BigDecimal::of($spent);

        $percentage = $limit->isPositive()
            ? $spentDecimal->dividedBy($limit, 4)->multipliedBy(100)->toFloat()
            : 0.0;

        return BudgetData::from([
            ...$budget->toArray(),
            'spent' => $spentDecimal->toScale(2)->__toString(),
            'percentage' => round($percentage, 2),
            'status' => BudgetStatus::fromPercentage($percentage),
            'category' => $budget->category ? CategoryData::from($budget->category) : null,
        ]);
    }
}
