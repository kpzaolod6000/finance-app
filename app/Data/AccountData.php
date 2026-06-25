<?php

declare(strict_types=1);

namespace App\Data;

use App\Enums\AccountType;
use Spatie\LaravelData\Data;

final class AccountData extends Data
{
    public function __construct(
        public readonly string $id,
        public readonly string $user_id,
        public readonly string $name,
        public readonly AccountType $type,
        public readonly string $initial_balance,
        public readonly string $currency,
        public readonly string $color,
        public readonly string $icon,
        public readonly bool $is_archived,
        public readonly ?string $current_balance = null,
    ) {}
}
