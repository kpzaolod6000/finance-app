<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Budgets\CalculateBudgetUsage;
use App\Data\AccountData;
use App\Data\CategoryData;
use App\Data\DashboardData;
use App\Models\Budget;
use App\Models\Transaction;
use App\Repositories\ReportRepository;
use App\Services\BalanceCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly ReportRepository $reports,
        private readonly BalanceCalculator $balanceCalc,
        private readonly CalculateBudgetUsage $budgetCalc,
    ) {}

    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $month = now()->format('Y-m');

        $summary = $this->reports->currentMonthSummary($user);
        $expensesByCategory = $this->reports->expensesByCategory($user, $month);
        $trend = $this->reports->monthlyTrend($user);
        $latest = $this->reports->latestTransactions($user, 8);

        // Budget status for current month
        $budgets = $user->budgets()
            ->with('category')
            ->whereYear('period_month', now()->year)
            ->whereMonth('period_month', now()->month)
            ->get()
            ->map(fn (Budget $b) => $this->budgetCalc->handle($b)->toArray());

        // Net worth across all active accounts
        $accounts = $user->accounts()
            ->where('is_archived', false)
            ->get()
            ->map(fn ($a) => [
                ...AccountData::from($a)->toArray(),
                'current_balance' => $this->balanceCalc->currentBalance($a),
            ]);

        $netWorth = $accounts->sum(fn ($a) => (float) $a['current_balance']);

        // Monthly trend normalized for charting
        $trendByMonth = [];
        foreach ($trend as $row) {
            $trendByMonth[$row->month] ??= ['month' => $row->month, 'income' => 0, 'expenses' => 0];
            $trendByMonth[$row->month][$row->type === 'income' ? 'income' : 'expenses'] = (float) $row->total;
        }

        $dashboard = new DashboardData(
            net_worth: number_format($netWorth, 2, '.', ''),
            month_income: $summary['income'],
            month_expenses: $summary['expenses'],
            month_balance: $summary['balance'],
            expenses_by_category: $expensesByCategory->map(fn ($r) => [
                'name' => $r->name,
                'color' => $r->color,
                'total' => (float) $r->total,
            ])->values()->toArray(),
            monthly_trend: array_values($trendByMonth),
            budget_status: $budgets->toArray(),
            latest_transactions: $latest->map(fn (Transaction $t) => [
                'id' => $t->id,
                'type' => $t->type->value,
                'amount' => $t->amount,
                'currency' => $t->currency,
                'occurred_at' => $t->occurred_at->toDateString(),
                'description' => $t->description,
                'account' => $t->account ? AccountData::from($t->account)->toArray() : null,
                'category' => $t->category ? CategoryData::from($t->category)->toArray() : null,
            ])->values()->toArray(),
        );

        return Inertia::render('Dashboard', [
            'dashboard' => $dashboard,
            'accounts' => $accounts,
            'hasAccounts' => $accounts->isNotEmpty(),
        ]);
    }
}
