<?php

declare(strict_types=1);

use App\Actions\RecurringTransactions\GenerateRecurringTransactions;
use App\Models\Account;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;

test('monthly recurring transaction generates instance when due', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    $rt = RecurringTransaction::factory()->create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'interval' => 'monthly',
        'next_run_at' => '2026-06-01',
        'is_active' => true,
    ]);

    $action = new GenerateRecurringTransactions;
    $count = $action->handle(Carbon::parse('2026-06-15'));

    expect($count)->toBe(1);

    $transaction = Transaction::where('recurring_transaction_id', $rt->id)->first();
    expect($transaction)->not->toBeNull()
        ->and($transaction->occurred_at->format('Y-m-d'))->toBe('2026-06-01');

    // next_run_at advanced by one month
    $rt->refresh();
    expect($rt->next_run_at->format('Y-m-d'))->toBe('2026-07-01');
});

test('recurring transaction does not generate twice', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    RecurringTransaction::factory()->create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'next_run_at' => '2026-06-01',
    ]);

    $action = new GenerateRecurringTransactions;
    $action->handle(Carbon::parse('2026-06-15'));
    $action->handle(Carbon::parse('2026-06-15')); // second call — next_run_at is now July

    expect(Transaction::count())->toBe(1);
});

test('recurring transaction respects ends_at', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    RecurringTransaction::factory()->create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'next_run_at' => '2026-06-01',
        'ends_at' => '2026-05-31',
    ]);

    $action = new GenerateRecurringTransactions;
    $count = $action->handle(Carbon::parse('2026-06-15'));

    expect($count)->toBe(0);
    expect(Transaction::count())->toBe(0);
});

test('artisan command runs without error', function () {
    $this->artisan('transactions:generate-recurring')->assertExitCode(0);
});
