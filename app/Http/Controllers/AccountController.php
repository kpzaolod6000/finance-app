<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Accounts\ArchiveAccount;
use App\Actions\Accounts\CreateAccount;
use App\Actions\Accounts\UpdateAccount;
use App\Data\AccountData;
use App\Http\Requests\Accounts\StoreAccountRequest;
use App\Http\Requests\Accounts\UpdateAccountRequest;
use App\Models\Account;
use App\Services\BalanceCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function __construct(private readonly BalanceCalculator $calculator) {}

    public function index(Request $request): Response
    {
        $accounts = $request->user()
            ->accounts()
            ->withCount('transactions')
            ->orderBy('name')
            ->get()
            ->map(fn (Account $a) => AccountData::from([
                ...$a->toArray(),
                'current_balance' => $this->calculator->currentBalance($a),
            ]));

        return Inertia::render('Accounts/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function store(StoreAccountRequest $request, CreateAccount $action): RedirectResponse
    {
        $this->authorize('create', Account::class);
        $action->handle($request->user(), $request->validated());

        return redirect()->route('accounts.index');
    }

    public function update(UpdateAccountRequest $request, Account $account, UpdateAccount $action): RedirectResponse
    {
        $this->authorize('update', $account);
        $action->handle($account, $request->validated());

        return redirect()->route('accounts.index');
    }

    public function destroy(Account $account, ArchiveAccount $action): RedirectResponse
    {
        $this->authorize('delete', $account);
        $action->handle($account);

        return redirect()->route('accounts.index');
    }
}
