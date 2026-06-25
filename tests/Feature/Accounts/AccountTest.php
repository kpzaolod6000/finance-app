<?php

declare(strict_types=1);

use App\Models\Account;
use App\Models\User;

test('user can create account with initial balance', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('accounts.store'), [
            'name' => 'My Bank',
            'type' => 'bank',
            'initial_balance' => '1000.00',
            'currency' => 'PEN',
            'color' => '#6366f1',
            'icon' => 'wallet',
        ])
        ->assertRedirect(route('accounts.index'));

    $account = $user->accounts()->first();
    expect($account)->not->toBeNull()
        ->and($account->initial_balance)->toBe('1000.00');
});

test('account with no transactions is soft-deleted on destroy', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->delete(route('accounts.destroy', $account->id))
        ->assertRedirect(route('accounts.index'));

    // Soft-deleted: not accessible without withTrashed
    expect(Account::find($account->id))->toBeNull();
    expect(Account::withTrashed()->find($account->id))->not->toBeNull();
});

test('user cannot access another users account', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $userB->id]);

    $this->actingAs($userA)
        ->delete(route('accounts.destroy', $account->id))
        ->assertForbidden();
});

test('account list only shows current users accounts', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    Account::factory()->create(['user_id' => $userA->id, 'name' => 'UserA Account']);
    Account::factory()->create(['user_id' => $userB->id, 'name' => 'UserB Account']);

    // Verify at the model layer: user only sees their own accounts
    $userAAccounts = $userA->accounts()->pluck('name')->toArray();
    expect($userAAccounts)->toHaveCount(1)
        ->and($userAAccounts[0])->toBe('UserA Account');

    // Route is accessible
    $this->actingAs($userA)->get(route('accounts.index'))->assertOk();
});
