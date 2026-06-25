<?php

declare(strict_types=1);

namespace App\Enums;

use Carbon\Carbon;

enum RecurrenceInterval: string
{
    case Daily = 'daily';
    case Weekly = 'weekly';
    case Monthly = 'monthly';
    case Yearly = 'yearly';

    public function nextDate(Carbon $from): Carbon
    {
        return match ($this) {
            self::Daily => $from->addDay(),
            self::Weekly => $from->addWeek(),
            self::Monthly => $from->addMonth(),
            self::Yearly => $from->addYear(),
        };
    }
}
