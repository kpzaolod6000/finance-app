<?php

declare(strict_types=1);

namespace App\Actions\Categories;

use App\Models\Category;

class DeleteCategory
{
    public function handle(Category $category, ?string $reassignToId = null): void
    {
        if ($reassignToId) {
            $category->transactions()->update(['category_id' => $reassignToId]);
        } else {
            $category->transactions()->update(['category_id' => null]);
        }

        $category->children()->update(['parent_id' => null]);
        $category->delete();
    }
}
