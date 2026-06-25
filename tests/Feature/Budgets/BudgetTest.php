<?php

declare(strict_types=1);

use App\Actions\Budgets\CalculateBudgetUsage;
use App\Enums\BudgetStatus;
use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;

test('budget shows 90% at-risk when 450 of 500 spent', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    $category = Category::factory()->expense()->create(['user_id' => $user->id]);

    Transaction::factory()->create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'category_id' => $category->id,
        'type' => 'expense',
        'amount' => '450.00',
        'currency' => 'PEN',
        'occurred_at' => now()->startOfMonth()->toDateString(),
    ]);

    $budget = Budget::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'amount_limit' => '500.00',
        'currency' => 'PEN',
        'period_month' => now()->startOfMonth()->toDateString(),
    ]);
    $budget->load('category');

    $data = (new CalculateBudgetUsage)->handle($budget);

    expect($data->percentage)->toBe(90.0)
        ->and($data->status)->toBe(BudgetStatus::AtRisk);
});

test('budget shows exceeded when 510 of 500 spent', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    $category = Category::factory()->expense()->create(['user_id' => $user->id]);

    Transaction::factory()->create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'category_id' => $category->id,
        'type' => 'expense',
        'amount' => '510.00',
        'currency' => 'PEN',
        'occurred_at' => now()->startOfMonth()->toDateString(),
    ]);

    $budget = Budget::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'amount_limit' => '500.00',
        'currency' => 'PEN',
        'period_month' => now()->startOfMonth()->toDateString(),
    ]);
    $budget->load('category');

    $data = (new CalculateBudgetUsage)->handle($budget);

    expect($data->percentage)->toBe(102.0)
        ->and($data->status)->toBe(BudgetStatus::Exceeded);
});

test('budget cannot be set for income category', function () {
    $user = User::factory()->create();
    $incomeCategory = Category::factory()->income()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->post(route('budgets.store'), [
            'category_id' => $incomeCategory->id,
            'amount_limit' => '500',
            'currency' => 'PEN',
            'period_month' => now()->format('Y-m'),
        ])
        ->assertSessionHasErrors(['category_id']);
});

test('user cannot delete another users budget', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $category = Category::factory()->expense()->create(['user_id' => $userB->id]);

    $budget = Budget::create([
        'user_id' => $userB->id,
        'category_id' => $category->id,
        'amount_limit' => '500',
        'currency' => 'PEN',
        'period_month' => now()->startOfMonth()->toDateString(),
    ]);

    $this->actingAs($userA)
        ->delete(route('budgets.destroy', $budget->id))
        ->assertForbidden();
});
