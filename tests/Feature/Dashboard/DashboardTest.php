<?php

declare(strict_types=1);

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;

test('dashboard figures reflect only authenticated users data', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();

    $accountA = Account::factory()->create(['user_id' => $userA->id, 'initial_balance' => '0']);
    $accountB = Account::factory()->create(['user_id' => $userB->id, 'initial_balance' => '0']);

    Transaction::factory()->create([
        'user_id' => $userA->id,
        'account_id' => $accountA->id,
        'type' => 'income',
        'amount' => '1000',
        'occurred_at' => now()->startOfMonth()->toDateString(),
    ]);

    Transaction::factory()->create([
        'user_id' => $userB->id,
        'account_id' => $accountB->id,
        'type' => 'income',
        'amount' => '9999',
        'occurred_at' => now()->startOfMonth()->toDateString(),
    ]);

    $response = $this->actingAs($userA)->get('/dashboard');
    $response->assertOk();

    // UserA's dashboard should show 1000, not 9999
    $props = $response->original->getData()['page']['props'];
    expect((float) $props['dashboard']['month_income'])->toBe(1000.0);
});

test('csv export contains only authenticated users transactions', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $accountA = Account::factory()->create(['user_id' => $userA->id]);
    $accountB = Account::factory()->create(['user_id' => $userB->id]);

    Transaction::factory()->create([
        'user_id' => $userA->id,
        'account_id' => $accountA->id,
        'description' => 'UserA transaction',
        'type' => 'expense',
        'amount' => '50',
    ]);
    Transaction::factory()->create([
        'user_id' => $userB->id,
        'account_id' => $accountB->id,
        'description' => 'UserB transaction',
        'type' => 'expense',
        'amount' => '200',
    ]);

    $response = $this->actingAs($userA)->get(route('reports.export'));
    $response->assertOk();
    $csv = $response->getContent();

    expect($csv)->toContain('UserA transaction')
        ->and($csv)->not->toContain('UserB transaction');
});
