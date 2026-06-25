<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Actions\RecurringTransactions\GenerateRecurringTransactions;
use Illuminate\Console\Command;

class GenerateRecurringTransactionsCommand extends Command
{
    protected $signature = 'transactions:generate-recurring';

    protected $description = 'Generate due recurring transactions';

    public function handle(GenerateRecurringTransactions $action): int
    {
        $count = $action->handle();
        $this->info("Generated {$count} recurring transaction(s).");

        return self::SUCCESS;
    }
}
