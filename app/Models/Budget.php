<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuidV7;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Budget extends Model
{
    use HasUuidV7;

    protected $fillable = [
        'user_id',
        'category_id',
        'amount_limit',
        'currency',
        'period_month',
    ];

    protected function casts(): array
    {
        return [
            'amount_limit' => 'decimal:2',
            'period_month' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
