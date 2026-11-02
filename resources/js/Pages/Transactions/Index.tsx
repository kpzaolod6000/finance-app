import SlideOver from '@/Components/SlideOver';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Account, Category, Transaction, TransactionType } from '@/types/models';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

type PaginatedTransactions = {
    data: Transaction[];
    current_page: number;
    last_page: number;
    total: number;
};

type Filters = {
    type?: string;
    account_id?: string;
    category_id?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
};

function TransactionForm({
    transaction,
    accounts,
    categories,
    onClose,
}: {
    transaction?: Transaction;
    accounts: Account[];
    categories: Category[];
    onClose: () => void;
}) {
    const { data, setData, post, put, processing, errors } = useForm({
        type: (transaction?.type ?? 'expense') as TransactionType,
        amount: transaction?.amount ?? '',
        currency: transaction?.currency ?? 'PEN',
        occurred_at: transaction?.occurred_at ?? new Date().toISOString().split('T')[0],
        description: transaction?.description ?? '',
        account_id: transaction?.account_id ?? (accounts[0]?.id ?? ''),
        transfer_account_id: transaction?.transfer_account_id ?? '',
        category_id: transaction?.category_id ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (transaction) {
            put(route('transactions.update', transaction.id), { onSuccess: onClose });
        } else {
            post(route('transactions.store'), { onSuccess: onClose });
        }
    };

    const filteredCategories = categories.filter((c) =>
        data.type === 'income' ? c.type === 'income' : c.type === 'expense'
    );

    return (
        <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="label">Type</label>
                        <div className="flex gap-2">
                            {(['income', 'expense', 'transfer'] as TransactionType[]).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`flex-1 rounded-lg border py-2 text-sm capitalize transition-colors ${data.type === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'}`}
                                    onClick={() => setData('type', t)}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="field money"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                required
                            />
                            {errors.amount && <p className="field-error">{errors.amount}</p>}
                        </div>
                        <div>
                            <label className="label">Date</label>
                            <input
                                type="date"
                                className="field"
                                value={data.occurred_at}
                                onChange={(e) => setData('occurred_at', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label">{data.type === 'transfer' ? 'From account' : 'Account'}</label>
                        <select className="field" value={data.account_id} onChange={(e) => setData('account_id', e.target.value)}>
                            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        {errors.account_id && <p className="field-error">{errors.account_id}</p>}
                    </div>

                    {data.type === 'transfer' && (
                        <div>
                            <label className="label">To account</label>
                            <select className="field" value={data.transfer_account_id} onChange={(e) => setData('transfer_account_id', e.target.value)}>
                                <option value="">Select destination</option>
                                {accounts.filter((a) => a.id !== data.account_id).map((a) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                            {errors.transfer_account_id && <p className="field-error">{errors.transfer_account_id}</p>}
                        </div>
                    )}

                    {data.type !== 'transfer' && filteredCategories.length > 0 && (
                        <div>
                            <label className="label">Category (optional)</label>
                            <select className="field" value={data.category_id} onChange={(e) => setData('category_id', e.target.value)}>
                                <option value="">Uncategorized</option>
                                {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="label">Description (optional)</label>
                        <input className="field" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                    </div>

                    <div className="sticky bottom-0 -mx-6 -mb-5 flex justify-end gap-3 border-t border-border bg-card px-6 py-4">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={processing} className="btn-primary">
                            {transaction ? 'Update' : 'Create'}
                        </button>
                    </div>
        </form>
    );
}

function amountClass(type: TransactionType) {
    if (type === 'income') return 'amount-income';
    if (type === 'expense') return 'amount-expense';
    return 'amount-neutral';
}

function formatAmount(amount: string, currency: string, type: TransactionType) {
    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(amount));
    const sign = type === 'income' ? '+' : type === 'expense' ? '−' : '↔';
    return `${sign} ${formatted}`;
}

export default function TransactionsIndex({
    transactions,
    accounts,
    categories,
    filters,
}: {
    transactions: PaginatedTransactions;
    accounts: Account[];
    categories: Category[];
    filters: Filters;
}) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Transaction | undefined>();

    const handleFilter = (key: keyof Filters, value: string) => {
        router.get(route('transactions.index'), { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    };

    const handleDelete = (t: Transaction) => {
        if (confirm('Delete this transaction?')) {
            router.delete(route('transactions.destroy', t.id));
        }
    };

    return (
        <AuthenticatedLayout header="Transactions">
            <Head title="Transactions" />
            <div className="mx-auto max-w-6xl space-y-4">
                {/* Filters bar */}
                <div className="flex flex-wrap items-center gap-3">
                    <select className="field w-auto text-sm" value={filters.type ?? ''} onChange={(e) => handleFilter('type', e.target.value)}>
                        <option value="">All types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                        <option value="transfer">Transfer</option>
                    </select>
                    <select className="field w-auto text-sm" value={filters.account_id ?? ''} onChange={(e) => handleFilter('account_id', e.target.value)}>
                        <option value="">All accounts</option>
                        {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <input type="date" className="field w-auto text-sm" value={filters.date_from ?? ''} onChange={(e) => handleFilter('date_from', e.target.value)} />
                    <input type="date" className="field w-auto text-sm" value={filters.date_to ?? ''} onChange={(e) => handleFilter('date_to', e.target.value)} />
                    <input className="field min-w-[12rem] flex-1 text-sm" value={filters.search ?? ''} onChange={(e) => handleFilter('search', e.target.value)} placeholder="Search description…" />
                    <button onClick={() => { setEditing(undefined); setShowForm(true); }} className="btn-primary ml-auto">
                        New transaction
                    </button>
                </div>

                {transactions.data.length === 0 ? (
                    <div className="card p-12 text-center">
                        <p className="text-muted-foreground">No transactions yet. Record your first transaction to get started.</p>
                    </div>
                ) : (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="ledger">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Account</th>
                                        <th>Category</th>
                                        <th className="text-right">Amount</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.data.map((t) => (
                                        <tr key={t.id}>
                                            <td className="money whitespace-nowrap text-muted-foreground">{t.occurred_at}</td>
                                            <td className="text-foreground">{t.description || <span className="italic text-muted-foreground">—</span>}</td>
                                            <td className="text-muted-foreground">
                                                {t.account?.name}
                                                {t.type === 'transfer' && t.transfer_account && ` → ${t.transfer_account.name}`}
                                            </td>
                                            <td className="text-muted-foreground">{t.category?.name ?? <span className="italic text-muted-foreground/70">Uncategorized</span>}</td>
                                            <td className={`money text-right font-medium ${amountClass(t.type)}`}>
                                                {formatAmount(t.amount, t.currency, t.type)}
                                            </td>
                                            <td className="text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={() => { setEditing(t); setShowForm(true); }} className="text-xs link-accent">Edit</button>
                                                    <button onClick={() => handleDelete(t)} className="text-xs text-destructive hover:underline">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {transactions.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-border px-4 py-3">
                                <p className="text-sm text-muted-foreground">{transactions.total} total</p>
                                <div className="flex gap-4">
                                    {transactions.current_page > 1 && (
                                        <button onClick={() => router.get(route('transactions.index'), { ...filters, page: transactions.current_page - 1 })} className="text-sm link-accent">Previous</button>
                                    )}
                                    {transactions.current_page < transactions.last_page && (
                                        <button onClick={() => router.get(route('transactions.index'), { ...filters, page: transactions.current_page + 1 })} className="text-sm link-accent">Next</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <SlideOver
                show={showForm}
                onClose={() => setShowForm(false)}
                title={editing ? 'Edit transaction' : 'New transaction'}
                description={editing ? undefined : 'Record income, an expense, or a transfer.'}
            >
                <TransactionForm
                    key={editing?.id ?? 'new'}
                    transaction={editing}
                    accounts={accounts}
                    categories={categories}
                    onClose={() => setShowForm(false)}
                />
            </SlideOver>
        </AuthenticatedLayout>
    );
}
