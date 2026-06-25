<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Budgets\CalculateBudgetUsage;
use App\Actions\Budgets\SetBudget;
use App\Data\CategoryData;
use App\Http\Requests\Budgets\SetBudgetRequest;
use App\Models\Budget;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function __construct(private readonly CalculateBudgetUsage $calculator) {}

    public function index(Request $request): Response
    {
        $month = $request->get('month', now()->format('Y-m'));

        $budgets = $request->user()->budgets()
            ->with('category')
            ->whereYear('period_month', substr($month, 0, 4))
            ->whereMonth('period_month', substr($month, 5, 2))
            ->get()
            ->map(fn (Budget $b) => $this->calculator->handle($b));

        $categories = $request->user()
            ->categories()
            ->where('type', 'expense')
            ->get()
            ->map(fn ($c) => CategoryData::from($c));

        return Inertia::render('Budgets/Index', [
            'budgets' => $budgets,
            'categories' => $categories,
            'month' => $month,
        ]);
    }

    public function store(SetBudgetRequest $request, SetBudget $action): RedirectResponse
    {
        $this->authorize('create', Budget::class);
        $action->handle($request->user(), $request->validated());

        return redirect()->route('budgets.index', ['month' => $request->period_month]);
    }

    public function destroy(Budget $budget): RedirectResponse
    {
        $this->authorize('delete', $budget);
        $budget->delete();

        return redirect()->route('budgets.index');
    }
}
