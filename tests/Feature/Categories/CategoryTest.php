<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\User;
use Database\Seeders\DefaultCategoriesSeeder;

test('default categories are seeded on registration', function () {
    $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $user = User::where('email', 'test@example.com')->first();
    expect($user->categories()->count())->toBeGreaterThan(0);
});

test('user can create expense category', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('categories.store'), [
            'name' => 'Groceries',
            'type' => 'expense',
            'color' => '#f97316',
            'icon' => 'shopping-cart',
            'parent_id' => null,
        ])
        ->assertRedirect(route('categories.index'));

    expect($user->categories()->where('name', 'Groceries')->exists())->toBeTrue();
});

test('category list only shows current users categories', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    (new DefaultCategoriesSeeder)->run($userA);
    (new DefaultCategoriesSeeder)->run($userB);

    $countA = $userA->categories()->count();
    $countB = $userB->categories()->count();

    $this->actingAs($userA)
        ->get(route('categories.index'))
        ->assertInertia(fn ($page) => $page
            ->component('Categories/Index')
            ->has('categories', $countA)
        );

    expect($countA)->toBe($countB);
});

test('user cannot delete another users category', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $category = Category::factory()->create(['user_id' => $userB->id]);

    $this->actingAs($userA)
        ->delete(route('categories.destroy', $category->id))
        ->assertForbidden();
});
