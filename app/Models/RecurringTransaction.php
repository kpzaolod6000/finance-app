<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuidV7;
use App\Enums\RecurrenceInterval;
use App\Enums\TransactionType;
use Database\Factories\RecurringTransactionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecurringTransaction extends Model
{
    /** @use HasFactory<RecurringTransactionFactory> */
    use HasFactory, HasUuidV7;

    protected $fillable = [
        'user_id',
        'account_id',
        'transfer_account_id',
        'category_id',
        'type',
        'amount',
        'currency',
        'description',
        'interval',
        'next_run_at',
        'ends_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => TransactionType::class,
            'interval' => RecurrenceInterval::class,
            'amount' => 'decimal:2',
            'next_run_at' => 'date',
            'ends_at' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function generatedTransactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'recurring_transaction_id');
    }
}
