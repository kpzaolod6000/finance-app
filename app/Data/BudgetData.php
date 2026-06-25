<?php

declare(strict_types=1);

namespace App\Data;

use App\Enums\BudgetStatus;
use Spatie\LaravelData\Data;

final class BudgetData extends Data
{
    public function __construct(
        public readonly string $id,
        public readonly string $user_id,
        public readonly string $category_id,
        public readonly string $amount_limit,
        public readonly string $currency,
        public readonly string $period_month,
        public readonly ?string $spent = null,
        public readonly ?float $percentage = null,
        public readonly ?BudgetStatus $status = null,
        public readonly ?CategoryData $category = null,
    ) {}
}
