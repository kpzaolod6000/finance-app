<?php

declare(strict_types=1);

namespace App\Actions\Categories;

use App\Models\Category;

class UpdateCategory
{
    public function handle(Category $category, array $data): Category
    {
        $category->update([
            'parent_id' => $data['parent_id'] ?? null,
            'name' => $data['name'],
            'type' => $data['type'],
            'color' => $data['color'],
            'icon' => $data['icon'],
        ]);

        return $category->fresh();
    }
}
