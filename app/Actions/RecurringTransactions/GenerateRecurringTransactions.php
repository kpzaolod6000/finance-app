<?php

declare(strict_types=1);

namespace App\Actions\RecurringTransactions;

use App\Models\RecurringTransaction;
use App\Models\Transaction;
use Carbon\Carbon;

class GenerateRecurringTransactions
{
    public function handle(?Carbon $asOf = null): int
    {
        $asOf ??= Carbon::today();
        $generated = 0;

        RecurringTransaction::query()
            ->where('is_active', true)
            ->where('next_run_at', '<=', $asOf)
            ->where(function ($q) use ($asOf) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $asOf);
            })
            ->cursor()
            ->each(function (RecurringTransaction $rt) use (&$generated) {
                Transaction::create([
                    'user_id' => $rt->user_id,
                    'account_id' => $rt->account_id,
                    'transfer_account_id' => $rt->transfer_account_id,
                    'category_id' => $rt->category_id,
                    'type' => $rt->type->value,
                    'amount' => $rt->amount,
                    'currency' => $rt->currency,
                    'occurred_at' => $rt->next_run_at->toDateString(),
                    'description' => $rt->description,
                    'recurring_transaction_id' => $rt->id,
                ]);

                $nextRun = $rt->interval->nextDate(Carbon::instance($rt->next_run_at));

                $rt->update(['next_run_at' => $nextRun->toDateString()]);

                $generated++;
            });

        return $generated;
    }
}
