<?php

declare(strict_types=1);

namespace App\Enums;

enum BudgetStatus: string
{
    case Ok = 'ok';
    case AtRisk = 'at_risk';
    case Exceeded = 'exceeded';

    public static function fromPercentage(float $percentage): self
    {
        if ($percentage > 100) {
            return self::Exceeded;
        }

        if ($percentage >= 80) {
            return self::AtRisk;
        }

        return self::Ok;
    }
}
