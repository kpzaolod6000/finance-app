<?php

declare(strict_types=1);

namespace App\Http\Requests\Transactions;

use App\Enums\CategoryType;
use App\Enums\TransactionType;
use App\Models\Account;
use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Validator;

class StoreTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', new Enum(TransactionType::class)],
            'amount' => ['required', 'numeric', 'gt:0'],
            'currency' => ['required', 'string', 'size:3'],
            'occurred_at' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:500'],
            'account_id' => ['required', 'uuid'],
            'transfer_account_id' => ['nullable', 'uuid', 'different:account_id'],
            'category_id' => ['nullable', 'uuid'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $this->validateAccountOwnership($validator);
                $this->validateTransferAccount($validator);
                $this->validateCategoryType($validator);
            },
        ];
    }

    private function validateAccountOwnership(Validator $validator): void
    {
        $account = Account::where('id', $this->account_id)
            ->where('user_id', $this->user()->id)
            ->first();

        if (! $account) {
            $validator->errors()->add('account_id', 'The selected account is invalid.');
        }
    }

    private function validateTransferAccount(Validator $validator): void
    {
        if ($this->type !== TransactionType::Transfer->value) {
            return;
        }

        if (! $this->transfer_account_id) {
            $validator->errors()->add('transfer_account_id', 'A destination account is required for transfers.');

            return;
        }

        $account = Account::where('id', $this->transfer_account_id)
            ->where('user_id', $this->user()->id)
            ->first();

        if (! $account) {
            $validator->errors()->add('transfer_account_id', 'The selected destination account is invalid.');
        }
    }

    private function validateCategoryType(Validator $validator): void
    {
        if (! $this->category_id || $this->type === TransactionType::Transfer->value) {
            return;
        }

        $category = Category::where('id', $this->category_id)
            ->where('user_id', $this->user()->id)
            ->first();

        if (! $category) {
            $validator->errors()->add('category_id', 'The selected category is invalid.');

            return;
        }

        $expectedType = $this->type === TransactionType::Income->value
            ? CategoryType::Income
            : CategoryType::Expense;

        if ($category->type !== $expectedType) {
            $validator->errors()->add('category_id', 'Category type must match transaction type.');
        }
    }
}
