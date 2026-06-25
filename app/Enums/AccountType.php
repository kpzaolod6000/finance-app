<?php

declare(strict_types=1);

namespace App\Enums;

enum AccountType: string
{
    case Cash = 'cash';
    case Bank = 'bank';
    case Card = 'card';
    case Savings = 'savings';
    case Investment = 'investment';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Cash',
            self::Bank => 'Bank',
            self::Card => 'Card',
            self::Savings => 'Savings',
            self::Investment => 'Investment',
        };
    }
}
