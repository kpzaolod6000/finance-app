<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Data;

final class DashboardData extends Data
{
    public function __construct(
        public readonly string $net_worth,
        public readonly string $month_income,
        public readonly string $month_expenses,
        public readonly string $month_balance,
        public readonly array $expenses_by_category,
        public readonly array $monthly_trend,
        public readonly array $budget_status,
        public readonly array $latest_transactions,
    ) {}
}
