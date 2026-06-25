<?php

declare(strict_types=1);

namespace App\Data;

use App\Enums\CategoryType;
use Spatie\LaravelData\Data;

final class CategoryData extends Data
{
    public function __construct(
        public readonly string $id,
        public readonly string $user_id,
        public readonly ?string $parent_id,
        public readonly string $name,
        public readonly CategoryType $type,
        public readonly string $color,
        public readonly string $icon,
    ) {}
}
