<?php

declare(strict_types=1);

namespace App\Data;

use Spatie\LaravelData\Data;

final class UserData extends Data
{
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly string $email,
        public readonly string $timezone,
        public readonly string $default_currency,
    ) {}
}
