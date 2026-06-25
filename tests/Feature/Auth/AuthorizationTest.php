<?php

declare(strict_types=1);

use App\Models\User;

test('unauthenticated user is redirected from dashboard to login', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('unauthenticated user is redirected from profile to login', function () {
    $this->get('/profile')->assertRedirect('/login');
});

test('authenticated user can reach dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->get('/dashboard')->assertOk();
});

test('profile update saves timezone and default currency', function () {
    $user = User::factory()->create([
        'timezone' => 'UTC',
        'default_currency' => 'PEN',
    ]);

    $this->actingAs($user)
        ->patch('/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'timezone' => 'America/Lima',
            'default_currency' => 'USD',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    $user->refresh();
    expect($user->timezone)->toBe('America/Lima')
        ->and($user->default_currency)->toBe('USD');
});

test('profile update rejects invalid timezone', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->patch('/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'timezone' => 'Not/ATimezone',
            'default_currency' => 'USD',
        ])
        ->assertSessionHasErrors(['timezone']);
});
