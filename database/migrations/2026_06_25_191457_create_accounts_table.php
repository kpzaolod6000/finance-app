<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type');
            $table->decimal('initial_balance', 14, 2)->default('0.00');
            $table->string('currency', 3);
            $table->string('color', 7)->default('#6366f1');
            $table->string('icon')->default('wallet');
            $table->boolean('is_archived')->default(false);
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index('user_id');
            $table->index(['user_id', 'is_archived']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
