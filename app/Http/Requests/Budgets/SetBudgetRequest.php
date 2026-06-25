<?php

declare(strict_types=1);

namespace App\Http\Requests\Budgets;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SetBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'uuid'],
            'amount_limit' => ['required', 'numeric', 'gt:0'],
            'currency' => ['required', 'string', 'size:3'],
            'period_month' => ['required', 'date_format:Y-m'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $category = Category::where('id', $this->category_id)
                    ->where('user_id', $this->user()->id)
                    ->first();

                if (! $category) {
                    $validator->errors()->add('category_id', 'The selected category is invalid.');

                    return;
                }

                if ($category->type->value !== 'expense') {
                    $validator->errors()->add('category_id', 'Budgets can only be set for expense categories.');
                }
            },
        ];
    }
}
