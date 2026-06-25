<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CategoryType;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'parent_id' => null,
            'name' => fake()->word(),
            'type' => fake()->randomElement(CategoryType::cases())->value,
            'color' => '#6366f1',
            'icon' => 'tag',
        ];
    }

    public function income(): static
    {
        return $this->state(['type' => CategoryType::Income->value]);
    }

    public function expense(): static
    {
        return $this->state(['type' => CategoryType::Expense->value]);
    }
}
