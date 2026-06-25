<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\CategoryType;
use App\Models\User;
use Illuminate\Database\Seeder;

class DefaultCategoriesSeeder extends Seeder
{
    private const INCOME = [
        ['name' => 'Salary', 'icon' => 'briefcase', 'color' => '#22c55e'],
        ['name' => 'Freelance', 'icon' => 'laptop', 'color' => '#16a34a'],
        ['name' => 'Investments', 'icon' => 'trending-up', 'color' => '#15803d'],
        ['name' => 'Other Income', 'icon' => 'plus-circle', 'color' => '#86efac'],
    ];

    private const EXPENSE = [
        ['name' => 'Food & Dining', 'icon' => 'utensils', 'color' => '#f97316'],
        ['name' => 'Transport', 'icon' => 'car', 'color' => '#3b82f6'],
        ['name' => 'Housing', 'icon' => 'home', 'color' => '#8b5cf6'],
        ['name' => 'Leisure', 'icon' => 'gamepad-2', 'color' => '#ec4899'],
        ['name' => 'Health', 'icon' => 'heart-pulse', 'color' => '#ef4444'],
        ['name' => 'Utilities', 'icon' => 'zap', 'color' => '#eab308'],
        ['name' => 'Education', 'icon' => 'book-open', 'color' => '#06b6d4'],
        ['name' => 'Shopping', 'icon' => 'shopping-bag', 'color' => '#f43f5e'],
        ['name' => 'Other Expense', 'icon' => 'minus-circle', 'color' => '#94a3b8'],
    ];

    public function run(User $user): void
    {
        foreach (self::INCOME as $cat) {
            $user->categories()->create([
                ...$cat,
                'type' => CategoryType::Income,
            ]);
        }

        foreach (self::EXPENSE as $cat) {
            $user->categories()->create([
                ...$cat,
                'type' => CategoryType::Expense,
            ]);
        }
    }
}
