import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Account } from '@/types/models';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

const ACCOUNT_TYPES = ['cash', 'bank', 'card', 'savings', 'investment'] as const;
const COLORS = ['#6366f1', '#3b82f6', '#22c55e', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#eab308'];

function AccountForm({
    account,
    defaultCurrency,
    onClose,
}: {
    account?: Account;
    defaultCurrency: string;
    onClose: () => void;
}) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: account?.name ?? '',
        type: account?.type ?? 'bank',
        initial_balance: account?.initial_balance ?? '0.00',
        currency: account?.currency ?? defaultCurrency,
        color: account?.color ?? '#6366f1',
        icon: account?.icon ?? 'wallet',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (account) {
            put(route('accounts.update', account.id), { onSuccess: onClose });
        } else {
            post(route('accounts.store'), { onSuccess: onClose });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    {account ? 'Edit Account' : 'New Account'}
                </h2>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                        <input
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value as typeof data.type)}
                        >
                            {ACCOUNT_TYPES.map((t) => (
                                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    {!account && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Balance</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                value={data.initial_balance}
                                onChange={(e) => setData('initial_balance', e.target.value)}
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                        <input
                            maxLength={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm uppercase focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={data.currency}
                            onChange={(e) => setData('currency', e.target.value.toUpperCase())}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                        <div className="mt-1 flex gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`h-7 w-7 rounded-full border-2 ${data.color === c ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setData('color', c)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing} className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">
                            {account ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AccountsIndex({
    accounts,
    auth,
}: {
    accounts: Account[];
    auth: { user: { default_currency: string } };
}) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Account | undefined>();

    const handleArchive = (account: Account) => {
        if (confirm(`Archive "${account.name}"? Accounts with transactions are archived, others are deleted.`)) {
            router.delete(route('accounts.destroy', account.id));
        }
    };

    const formatBalance = (balance: string | null, currency: string) =>
        balance === null ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(balance));

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Accounts</h2>}
        >
            <Head title="Accounts" />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{accounts.length} account(s)</p>
                        <button
                            onClick={() => { setEditing(undefined); setShowForm(true); }}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                        >
                            New Account
                        </button>
                    </div>

                    {accounts.length === 0 ? (
                        <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
                            <p className="text-gray-500 dark:text-gray-400">No accounts yet. Create your first account to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Account</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Balance</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {accounts.map((account) => (
                                        <tr key={account.id} className={account.is_archived ? 'opacity-50' : ''}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: account.color }} />
                                                    <span className="font-medium text-gray-900 dark:text-white">{account.name}</span>
                                                    {account.is_archived && <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">archived</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 capitalize text-gray-500 dark:text-gray-400">{account.type}</td>
                                            <td className="px-6 py-4 text-right font-mono text-gray-900 dark:text-white">
                                                {formatBalance(account.current_balance, account.currency)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => { setEditing(account); setShowForm(true); }}
                                                        className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleArchive(account)}
                                                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400"
                                                    >
                                                        {account.is_archived ? 'Delete' : 'Archive'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showForm && (
                <AccountForm
                    account={editing}
                    defaultCurrency={auth.user.default_currency}
                    onClose={() => setShowForm(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}
