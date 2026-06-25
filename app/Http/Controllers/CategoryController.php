<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Categories\CreateCategory;
use App\Actions\Categories\DeleteCategory;
use App\Actions\Categories\UpdateCategory;
use App\Data\CategoryData;
use App\Http\Requests\Categories\StoreCategoryRequest;
use App\Http\Requests\Categories\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $categories = $request->user()
            ->categories()
            ->with('parent')
            ->orderBy('type')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $c) => CategoryData::from($c));

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreCategoryRequest $request, CreateCategory $action): RedirectResponse
    {
        $this->authorize('create', Category::class);
        $action->handle($request->user(), $request->validated());

        return redirect()->route('categories.index');
    }

    public function update(UpdateCategoryRequest $request, Category $category, UpdateCategory $action): RedirectResponse
    {
        $this->authorize('update', $category);
        $action->handle($category, $request->validated());

        return redirect()->route('categories.index');
    }

    public function destroy(Request $request, Category $category, DeleteCategory $action): RedirectResponse
    {
        $this->authorize('delete', $category);
        $action->handle($category, $request->input('reassign_to'));

        return redirect()->route('categories.index');
    }
}
