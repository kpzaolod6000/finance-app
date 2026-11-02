import SlideOver from '@/Components/SlideOver';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Budget, BudgetStatus, Category } from '@/types/models';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

function statusBar(status?: BudgetStatus) {
    if (status === 'exceeded') return '#c26b62';
    if (status === 'at_risk') return '#b8a36a';
    return '#6fa287';
}

function statusLabel(status?: BudgetStatus) {
    if (status === 'exceeded') return 'Exceeded';
    if (status === 'at_risk') return 'At risk';
    return 'On track';
}

function statusTextColor(status?: BudgetStatus) {
    if (status === 'exceeded') return 'text-expense';
    if (status === 'at_risk') return 'text-[var(--chart-3)]';
    return 'text-income';
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
        <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="label">Category</label>
                        <select className="field" value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} required>
                            <option value="">Select expense category</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {errors.category_id && <p className="field-error">{errors.category_id}</p>}
                    </div>
                    <div>
                        <label className="label">Monthly limit</label>
                        <input type="number" step="0.01" min="0.01" className="field money" value={data.amount_limit} onChange={(e) => setData('amount_limit', e.target.value)} required />
                        {errors.amount_limit && <p className="field-error">{errors.amount_limit}</p>}
                    </div>
                    <div className="sticky bottom-0 -mx-6 -mb-5 flex justify-end gap-3 border-t border-border bg-card px-6 py-4">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={processing} className="btn-primary">Set budget</button>
                    </div>
        </form>
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
        <AuthenticatedLayout header="Budgets">
            <Head title="Budgets" />
            <div className="mx-auto max-w-4xl space-y-4">
                <div className="flex items-center gap-4">
                    <input type="month" className="field w-auto" value={month} onChange={(e) => handleMonthChange(e.target.value)} />
                    <button onClick={() => setShowForm(true)} className="btn-primary ml-auto">Set budget</button>
                </div>

                {budgets.length === 0 ? (
                    <div className="card p-12 text-center">
                        <p className="text-muted-foreground">No budgets set for this month. Set a budget to track your spending.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {budgets.map((budget) => (
                            <div key={budget.id} className="card card-p">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="dot" style={{ backgroundColor: budget.category?.color ?? '#4f9d7e' }} />
                                        <span className="font-medium text-foreground">{budget.category?.name ?? 'Unknown'}</span>
                                        <span className={`text-sm font-medium ${statusTextColor(budget.status)}`}>{statusLabel(budget.status)}</span>
                                    </div>
                                    <button onClick={() => handleDelete(budget)} className="text-xs text-destructive hover:underline">Remove</button>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-2 rounded-full transition-all"
                                        style={{ width: `${Math.min(budget.percentage ?? 0, 100)}%`, backgroundColor: statusBar(budget.status) }}
                                    />
                                </div>

                                <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                                    <span className="money">{formatMoney(budget.spent, budget.currency)} spent</span>
                                    <span className="money">{budget.percentage?.toFixed(1)}% of {formatMoney(budget.amount_limit, budget.currency)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <SlideOver
                show={showForm}
                onClose={() => setShowForm(false)}
                title="Set budget"
                description="Cap monthly spending for a category."
                maxWidth="md"
            >
                <BudgetForm key={month} categories={categories} month={month} onClose={() => setShowForm(false)} />
            </SlideOver>
        </AuthenticatedLayout>
    );
}
