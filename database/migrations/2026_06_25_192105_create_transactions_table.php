<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('account_id')->constrained()->restrictOnDelete();
            $table->foreignUuid('transfer_account_id')->nullable()->constrained('accounts')->restrictOnDelete();
            $table->foreignUuid('category_id')->nullable()->constrained()->nullOnDelete();
            $table->uuid('recurring_transaction_id')->nullable()->index();
            $table->string('type');
            $table->decimal('amount', 14, 2);
            $table->string('currency', 3);
            $table->date('occurred_at');
            $table->string('description')->nullable();
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index(['user_id', 'occurred_at']);
            $table->index('account_id');
            $table->index('category_id');
            $table->index('type');
        });

        // CHECK: amount > 0
        DB::statement('ALTER TABLE transactions ADD CONSTRAINT transactions_amount_positive CHECK (amount > 0)');

        // CHECK: transfer must have a distinct destination account
        DB::statement("
            ALTER TABLE transactions ADD CONSTRAINT transactions_transfer_check
            CHECK (
                type != 'transfer'
                OR (transfer_account_id IS NOT NULL AND transfer_account_id != account_id)
            )
        ");
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
