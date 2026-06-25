<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ReportRepository
{
    public function netWorth(User $user): string
    {
        $accounts = $user->accounts()->where('is_archived', false)->get();

        $total = '0.00';
        foreach ($accounts as $account) {
            $income = $account->transactions()->whereIn('type', ['income'])->sum('amount') +
                $account->incomingTransfers()->sum('amount');
            $expense = $account->transactions()->whereIn('type', ['expense', 'transfer'])->sum('amount');
            $balance = (float) $account->initial_balance + $income - $expense;
            $total = (string) ((float) $total + $balance);
        }

        return number_format((float) $total, 2, '.', '');
    }

    public function currentMonthSummary(User $user): array
    {
        $start = now()->startOfMonth()->toDateString();
        $end = now()->endOfMonth()->toDateString();

        $income = (float) $user->transactions()
            ->where('type', 'income')
            ->whereBetween('occurred_at', [$start, $end])
            ->sum('amount');

        $expenses = (float) $user->transactions()
            ->where('type', 'expense')
            ->whereBetween('occurred_at', [$start, $end])
            ->sum('amount');

        return [
            'income' => number_format($income, 2, '.', ''),
            'expenses' => number_format($expenses, 2, '.', ''),
            'balance' => number_format($income - $expenses, 2, '.', ''),
        ];
    }

    public function expensesByCategory(User $user, string $month): Collection
    {
        $start = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        return DB::table('transactions')
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('transactions.user_id', $user->id)
            ->where('transactions.type', 'expense')
            ->whereBetween('transactions.occurred_at', [$start->toDateString(), $end->toDateString()])
            ->whereNull('transactions.deleted_at')
            ->whereNull('categories.deleted_at')
            ->groupBy('categories.id', 'categories.name', 'categories.color')
            ->selectRaw('categories.name, categories.color, SUM(transactions.amount) as total')
            ->orderByDesc('total')
            ->get();
    }

    public function monthlyTrend(User $user, int $months = 6): Collection
    {
        $start = now()->subMonths($months - 1)->startOfMonth();

        return DB::table('transactions')
            ->where('user_id', $user->id)
            ->where('occurred_at', '>=', $start->toDateString())
            ->whereNull('deleted_at')
            ->whereIn('type', ['income', 'expense'])
            ->selectRaw("TO_CHAR(occurred_at, 'YYYY-MM') as month, type, SUM(amount) as total")
            ->groupBy('month', 'type')
            ->orderBy('month')
            ->get();
    }

    public function latestTransactions(User $user, int $limit = 10): Collection
    {
        return $user->transactions()
            ->with(['account', 'category'])
            ->orderByDesc('occurred_at')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public function monthlySummary(User $user, int $months = 12): Collection
    {
        $start = now()->subMonths($months - 1)->startOfMonth();

        return DB::table('transactions')
            ->where('user_id', $user->id)
            ->where('occurred_at', '>=', $start->toDateString())
            ->whereNull('deleted_at')
            ->whereIn('type', ['income', 'expense'])
            ->selectRaw("TO_CHAR(occurred_at, 'YYYY-MM') as month, type, SUM(amount) as total")
            ->groupBy('month', 'type')
            ->orderBy('month')
            ->get();
    }
}
