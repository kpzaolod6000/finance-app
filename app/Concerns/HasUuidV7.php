<?php

declare(strict_types=1);

namespace App\Concerns;

use Illuminate\Database\Eloquent\Model;

use function Ramsey\Uuid\v7;

trait HasUuidV7
{
    protected static function bootHasUuidV7(): void
    {
        static::creating(function (Model $model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) v7();
            }
        });
    }

    public function getIncrementing(): bool
    {
        return false;
    }

    public function getKeyType(): string
    {
        return 'string';
    }
}
