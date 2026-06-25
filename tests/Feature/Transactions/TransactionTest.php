<?php

declare(strict_types=1);

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;

test('amount zero or negative is rejected', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->post(route('transactions.store'), [
            'type' => 'expense',
            'amount' => '-10',
            'currency' => 'PEN',
            'occurred_at' => today()->toDateString(),
            'account_id' => $account->id,
        ])
        ->assertSessionHasErrors(['amount']);

    $this->actingAs($user)
        ->post(route('transactions.store'), [
            'type' => 'expense',
            'amount' => '0',
            'currency' => 'PEN',
            'occurred_at' => today()->toDateString(),
            'account_id' => $account->id,
        ])
        ->assertSessionHasErrors(['amount']);
});

test('transfer requires two distinct accounts', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->post(route('transactions.store'), [
            'type' => 'transfer',
            'amount' => '100',
            'currency' => 'PEN',
            'occurred_at' => today()->toDateString(),
            'account_id' => $account->id,
            'transfer_account_id' => $account->id, // same account
        ])
        ->assertSessionHasErrors(['transfer_account_id']);
});

test('expense category cannot be used on income transaction', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    $expenseCategory = Category::factory()->expense()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->post(route('transactions.store'), [
            'type' => 'income',
            'amount' => '500',
            'currency' => 'PEN',
            'occurred_at' => today()->toDateString(),
            'account_id' => $account->id,
            'category_id' => $expenseCategory->id,
        ])
        ->assertSessionHasErrors(['category_id']);
});

test('cross-user transaction isolation', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $accountB = Account::factory()->create(['user_id' => $userB->id]);
    $transaction = Transaction::factory()->create([
        'user_id' => $userB->id,
        'account_id' => $accountB->id,
    ]);

    $this->actingAs($userA)
        ->delete(route('transactions.destroy', $transaction->id))
        ->assertForbidden();
});

test('transfer is neutral in income and expense totals', function () {
    $user = User::factory()->create();
    $accountA = Account::factory()->create(['user_id' => $user->id, 'initial_balance' => '1000']);
    $accountB = Account::factory()->create(['user_id' => $user->id, 'initial_balance' => '0']);

    // Create a transfer of 200 from A to B
    $this->actingAs($user)
        ->post(route('transactions.store'), [
            'type' => 'transfer',
            'amount' => '200',
            'currency' => 'PEN',
            'occurred_at' => today()->toDateString(),
            'account_id' => $accountA->id,
            'transfer_account_id' => $accountB->id,
        ])
        ->assertRedirect();

    // Verify transfer transaction exists and has type 'transfer'
    $transfer = Transaction::where('user_id', $user->id)
        ->where('type', 'transfer')
        ->first();
    expect($transfer)->not->toBeNull();

    // Transfers are not counted as income or expense
    $incomeSum = $user->transactions()->where('type', 'income')->sum('amount');
    $expenseSum = $user->transactions()->where('type', 'expense')->sum('amount');
    expect((float) $incomeSum)->toBe(0.0)
        ->and((float) $expenseSum)->toBe(0.0);
});
