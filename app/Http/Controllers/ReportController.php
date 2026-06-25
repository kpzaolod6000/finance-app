<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Repositories\ReportRepository;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(private readonly ReportRepository $reports) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $summary = $this->reports->monthlySummary($user);

        // Pivot by month
        $byMonth = [];
        foreach ($summary as $row) {
            $byMonth[$row->month] ??= ['month' => $row->month, 'income' => 0, 'expenses' => 0, 'savings' => 0];
            $byMonth[$row->month][$row->type === 'income' ? 'income' : 'expenses'] = (float) $row->total;
        }

        foreach ($byMonth as &$row) {
            $row['savings'] = round($row['income'] - $row['expenses'], 2);
        }

        return Inertia::render('Reports/Index', [
            'monthly_summary' => array_values($byMonth),
        ]);
    }

    public function export(Request $request): HttpResponse
    {
        $query = $request->user()->transactions()
            ->with(['account', 'category'])
            ->orderByDesc('occurred_at');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('account_id')) {
            $query->where('account_id', $request->account_id);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('occurred_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('occurred_at', '<=', $request->date_to);
        }

        $rows = $query->get();

        $csv = "Date,Type,Amount,Currency,Account,Category,Description\n";
        foreach ($rows as $t) {
            $csv .= implode(',', [
                $t->occurred_at->toDateString(),
                $t->type->value,
                $t->amount,
                $t->currency,
                '"'.str_replace('"', '""', $t->account?->name ?? '').'"',
                '"'.str_replace('"', '""', $t->category?->name ?? '').'"',
                '"'.str_replace('"', '""', $t->description ?? '').'"',
            ])."\n";
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="transactions.csv"',
        ]);
    }
}
