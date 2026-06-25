<?php

declare(strict_types=1);

namespace App\Data;

use App\Enums\TransactionType;
use Spatie\LaravelData\Data;

final class TransactionData extends Data
{
    public function __construct(
        public readonly string $id,
        public readonly string $user_id,
        public readonly string $account_id,
        public readonly ?string $transfer_account_id,
        public readonly ?string $category_id,
        public readonly TransactionType $type,
        public readonly string $amount,
        public readonly string $currency,
        public readonly string $occurred_at,
        public readonly ?string $description,
        public readonly ?string $recurring_transaction_id,
        public readonly ?AccountData $account = null,
        public readonly ?AccountData $transfer_account = null,
        public readonly ?CategoryData $category = null,
    ) {}
}
