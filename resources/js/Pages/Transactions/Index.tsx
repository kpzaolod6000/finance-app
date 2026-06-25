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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {transaction ? 'Edit Transaction' : 'New Transaction'}
                </h2>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                        <div className="mt-1 flex gap-2">
                            {(['income', 'expense', 'transfer'] as TransactionType[]).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`flex-1 rounded-md border py-2 text-sm capitalize ${data.type === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200' : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'}`}
                                    onClick={() => setData('type', t)}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                required
                            />
                            {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                            <input
                                type="date"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                value={data.occurred_at}
                                onChange={(e) => setData('occurred_at', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {data.type === 'transfer' ? 'From Account' : 'Account'}
                        </label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={data.account_id}
                            onChange={(e) => setData('account_id', e.target.value)}
                        >
                            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        {errors.account_id && <p className="mt-1 text-xs text-red-500">{errors.account_id}</p>}
                    </div>

                    {data.type === 'transfer' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">To Account</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                value={data.transfer_account_id}
                                onChange={(e) => setData('transfer_account_id', e.target.value)}
                            >
                                <option value="">Select destination</option>
                                {accounts.filter((a) => a.id !== data.account_id).map((a) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                            {errors.transfer_account_id && <p className="mt-1 text-xs text-red-500">{errors.transfer_account_id}</p>}
                        </div>
                    )}

                    {data.type !== 'transfer' && filteredCategories.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category (optional)</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                value={data.category_id}
                                onChange={(e) => setData('category_id', e.target.value)}
                            >
                                <option value="">Uncategorized</option>
                                {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (optional)</label>
                        <input
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Cancel</button>
                        <button type="submit" disabled={processing} className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">
                            {transaction ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function typeColor(type: TransactionType) {
    if (type === 'income') return 'text-green-600 dark:text-green-400';
    if (type === 'expense') return 'text-red-600 dark:text-red-400';
    return 'text-blue-600 dark:text-blue-400';
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
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Transactions</h2>}>
            <Head title="Transactions" />
            <div className="py-12">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    {/* Filters bar */}
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <select
                            className="rounded-md border-gray-300 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={filters.type ?? ''}
                            onChange={(e) => handleFilter('type', e.target.value)}
                        >
                            <option value="">All types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                            <option value="transfer">Transfer</option>
                        </select>
                        <select
                            className="rounded-md border-gray-300 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={filters.account_id ?? ''}
                            onChange={(e) => handleFilter('account_id', e.target.value)}
                        >
                            <option value="">All accounts</option>
                            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <input
                            type="date"
                            className="rounded-md border-gray-300 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={filters.date_from ?? ''}
                            onChange={(e) => handleFilter('date_from', e.target.value)}
                            placeholder="From"
                        />
                        <input
                            type="date"
                            className="rounded-md border-gray-300 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={filters.date_to ?? ''}
                            onChange={(e) => handleFilter('date_to', e.target.value)}
                        />
                        <input
                            className="flex-1 rounded-md border-gray-300 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={filters.search ?? ''}
                            onChange={(e) => handleFilter('search', e.target.value)}
                            placeholder="Search description…"
                        />
                        <button
                            onClick={() => { setEditing(undefined); setShowForm(true); }}
                            className="ml-auto rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                        >
                            New Transaction
                        </button>
                    </div>

                    {transactions.data.length === 0 ? (
                        <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
                            <p className="text-gray-500 dark:text-gray-400">No transactions yet. Record your first transaction to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Account</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {transactions.data.map((t) => (
                                        <tr key={t.id}>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{t.occurred_at}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{t.description || <span className="italic text-gray-400">—</span>}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                {t.account?.name}
                                                {t.type === 'transfer' && t.transfer_account && ` → ${t.transfer_account.name}`}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{t.category?.name ?? <span className="italic text-gray-400">Uncategorized</span>}</td>
                                            <td className={`px-4 py-3 text-right font-mono text-sm font-medium tabular-nums ${typeColor(t.type)}`}>
                                                {formatAmount(t.amount, t.currency, t.type)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => { setEditing(t); setShowForm(true); }} className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">Edit</button>
                                                    <button onClick={() => handleDelete(t)} className="text-xs text-red-600 hover:text-red-800 dark:text-red-400">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {transactions.last_page > 1 && (
                                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {transactions.total} total
                                    </p>
                                    <div className="flex gap-2">
                                        {transactions.current_page > 1 && (
                                            <button onClick={() => router.get(route('transactions.index'), { ...filters, page: transactions.current_page - 1 })} className="text-sm text-indigo-600 dark:text-indigo-400">Previous</button>
                                        )}
                                        {transactions.current_page < transactions.last_page && (
                                            <button onClick={() => router.get(route('transactions.index'), { ...filters, page: transactions.current_page + 1 })} className="text-sm text-indigo-600 dark:text-indigo-400">Next</button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showForm && (
                <TransactionForm
                    transaction={editing}
                    accounts={accounts}
                    categories={categories}
                    onClose={() => setShowForm(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}
