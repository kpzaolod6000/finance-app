import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Budget, BudgetStatus, Category } from '@/types/models';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

function statusColor(status?: BudgetStatus) {
    if (status === 'exceeded') return 'bg-red-500';
    if (status === 'at_risk') return 'bg-amber-400';
    return 'bg-green-500';
}

function statusLabel(status?: BudgetStatus) {
    if (status === 'exceeded') return 'Exceeded';
    if (status === 'at_risk') return 'At Risk';
    return 'On Track';
}

function statusTextColor(status?: BudgetStatus) {
    if (status === 'exceeded') return 'text-red-600 dark:text-red-400';
    if (status === 'at_risk') return 'text-amber-600 dark:text-amber-400';
    return 'text-green-600 dark:text-green-400';
}

function BudgetForm({ categories, month, onClose }: { categories: Category[]; month: string; onClose: () => void }) {
    const { data, setData, post, processing, errors } = useForm({
        category_id: '',
        amount_limit: '',
        currency: 'PEN',
        period_month: month,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('budgets.store'), { onSuccess: onClose });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Set Budget</h2>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={data.category_id}
                            onChange={(e) => setData('category_id', e.target.value)}
                            required
                        >
                            <option value="">Select expense category</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Limit</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={data.amount_limit}
                            onChange={(e) => setData('amount_limit', e.target.value)}
                            required
                        />
                        {errors.amount_limit && <p className="mt-1 text-xs text-red-500">{errors.amount_limit}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Cancel</button>
                        <button type="submit" disabled={processing} className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">Set Budget</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function BudgetsIndex({
    budgets,
    categories,
    month,
}: {
    budgets: Budget[];
    categories: Category[];
    month: string;
}) {
    const [showForm, setShowForm] = useState(false);

    const handleMonthChange = (m: string) => {
        router.get(route('budgets.index'), { month: m }, { replace: true });
    };

    const handleDelete = (budget: Budget) => {
        if (confirm('Remove this budget?')) {
            router.delete(route('budgets.destroy', budget.id));
        }
    };

    const formatMoney = (val: string | undefined, currency: string) =>
        val ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(val)) : '—';

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Budgets</h2>}>
            <Head title="Budgets" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="mb-4 flex items-center gap-4">
                        <input
                            type="month"
                            className="rounded-md border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={month}
                            onChange={(e) => handleMonthChange(e.target.value)}
                        />
                        <button
                            onClick={() => setShowForm(true)}
                            className="ml-auto rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                        >
                            Set Budget
                        </button>
                    </div>

                    {budgets.length === 0 ? (
                        <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
                            <p className="text-gray-500 dark:text-gray-400">No budgets set for this month. Set a budget to track your spending.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {budgets.map((budget) => (
                                <div key={budget.id} className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: budget.category?.color ?? '#6366f1' }} />
                                            <span className="font-medium text-gray-900 dark:text-white">{budget.category?.name ?? 'Unknown'}</span>
                                            <span className={`text-sm font-medium ${statusTextColor(budget.status)}`}>{statusLabel(budget.status)}</span>
                                        </div>
                                        <button onClick={() => handleDelete(budget)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                        <div
                                            className={`h-3 rounded-full transition-all ${statusColor(budget.status)}`}
                                            style={{ width: `${Math.min(budget.percentage ?? 0, 100)}%` }}
                                        />
                                    </div>

                                    <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span>
                                            {formatMoney(budget.spent, budget.currency)} spent
                                        </span>
                                        <span>
                                            {budget.percentage?.toFixed(1)}% of {formatMoney(budget.amount_limit, budget.currency)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showForm && <BudgetForm categories={categories} month={month} onClose={() => setShowForm(false)} />}
        </AuthenticatedLayout>
    );
}
