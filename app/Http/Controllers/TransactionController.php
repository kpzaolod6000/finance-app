<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Transactions\CreateTransaction;
use App\Actions\Transactions\DeleteTransaction;
use App\Actions\Transactions\UpdateTransaction;
use App\Data\AccountData;
use App\Data\CategoryData;
use App\Data\TransactionData;
use App\Http\Requests\Transactions\StoreTransactionRequest;
use App\Http\Requests\Transactions\UpdateTransactionRequest;
use App\Models\Transaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = $request->user()->transactions()
            ->with(['account', 'transferAccount', 'category'])
            ->orderByDesc('occurred_at')
            ->orderByDesc('created_at');

        // Filters
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('account_id')) {
            $query->where('account_id', $request->account_id);
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('occurred_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('occurred_at', '<=', $request->date_to);
        }
        if ($request->filled('search')) {
            $query->where('description', 'ilike', '%'.$request->search.'%');
        }

        $transactions = $query->paginate(25)->through(
            fn (Transaction $t) => TransactionData::from([
                ...$t->toArray(),
                'account' => $t->account ? AccountData::from($t->account->toArray()) : null,
                'transfer_account' => $t->transferAccount ? AccountData::from($t->transferAccount->toArray()) : null,
                'category' => $t->category ? CategoryData::from($t->category->toArray()) : null,
            ])
        );

        $accounts = $request->user()->accounts()->where('is_archived', false)->get()
            ->map(fn ($a) => AccountData::from($a));
        $categories = $request->user()->categories()->get()
            ->map(fn ($c) => CategoryData::from($c));

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'accounts' => $accounts,
            'categories' => $categories,
            'filters' => $request->only(['type', 'account_id', 'category_id', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function store(StoreTransactionRequest $request, CreateTransaction $action): RedirectResponse
    {
        $this->authorize('create', Transaction::class);
        $action->handle($request->user(), $request->validated());

        return redirect()->route('transactions.index');
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction, UpdateTransaction $action): RedirectResponse
    {
        $this->authorize('update', $transaction);
        $action->handle($transaction, $request->validated());

        return redirect()->route('transactions.index');
    }

    public function destroy(Transaction $transaction, DeleteTransaction $action): RedirectResponse
    {
        $this->authorize('delete', $transaction);
        $action->handle($transaction);

        return redirect()->route('transactions.index');
    }
}
