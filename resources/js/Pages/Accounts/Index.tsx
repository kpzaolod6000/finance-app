import SlideOver from '@/Components/SlideOver';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Account } from '@/types/models';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';

const ACCOUNT_TYPES = ['cash', 'bank', 'card', 'savings', 'investment'] as const;
const COLORS = ['#4f9d7e', '#7d9ab5', '#b8a36a', '#9b8bc4', '#c26b62', '#6fa287', '#8a8d94', '#c08aa6'];

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
        color: account?.color ?? '#4f9d7e',
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
        <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="label">Name</label>
                        <input className="field" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        {errors.name && <p className="field-error">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="label">Type</label>
                        <select className="field" value={data.type} onChange={(e) => setData('type', e.target.value as typeof data.type)}>
                            {ACCOUNT_TYPES.map((t) => (
                                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    {!account && (
                        <div>
                            <label className="label">Initial balance</label>
                            <input type="number" step="0.01" min="0" className="field money" value={data.initial_balance} onChange={(e) => setData('initial_balance', e.target.value)} />
                        </div>
                    )}
                    <div>
                        <label className="label">Currency</label>
                        <input maxLength={3} className="field uppercase" value={data.currency} onChange={(e) => setData('currency', e.target.value.toUpperCase())} />
                    </div>
                    <div>
                        <label className="label">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`h-7 w-7 rounded-full ring-2 ring-offset-2 ring-offset-card transition-all ${data.color === c ? 'ring-foreground' : 'ring-transparent'}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setData('color', c)}
                                    aria-label={`Color ${c}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="sticky bottom-0 -mx-6 -mb-5 flex justify-end gap-3 border-t border-border bg-card px-6 py-4">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={processing} className="btn-primary">
                            {account ? 'Update' : 'Create'}
                        </button>
                    </div>
        </form>
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
        <AuthenticatedLayout header="Accounts">
            <Head title="Accounts" />
            <div className="mx-auto max-w-4xl space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{accounts.length} account(s)</p>
                    <button onClick={() => { setEditing(undefined); setShowForm(true); }} className="btn-primary">
                        New account
                    </button>
                </div>

                {accounts.length === 0 ? (
                    <div className="card p-12 text-center">
                        <p className="text-muted-foreground">No accounts yet. Create your first account to get started.</p>
                    </div>
                ) : (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="ledger">
                                <thead>
                                    <tr>
                                        <th>Account</th>
                                        <th>Type</th>
                                        <th className="text-right">Balance</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accounts.map((account) => (
                                        <tr key={account.id} className={account.is_archived ? 'opacity-50' : ''}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <span className="dot" style={{ backgroundColor: account.color }} />
                                                    <span className="font-medium text-foreground">{account.name}</span>
                                                    {account.is_archived && <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">archived</span>}
                                                </div>
                                            </td>
                                            <td className="capitalize text-muted-foreground">{account.type}</td>
                                            <td className="money text-right font-medium text-foreground">{formatBalance(account.current_balance, account.currency)}</td>
                                            <td className="text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={() => { setEditing(account); setShowForm(true); }} className="text-sm link-accent">Edit</button>
                                                    <button onClick={() => handleArchive(account)} className="text-sm text-destructive hover:underline">
                                                        {account.is_archived ? 'Delete' : 'Archive'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <SlideOver
                show={showForm}
                onClose={() => setShowForm(false)}
                title={editing ? 'Edit account' : 'New account'}
                maxWidth="md"
            >
                <AccountForm
                    key={editing?.id ?? 'new'}
                    account={editing}
                    defaultCurrency={auth.user.default_currency}
                    onClose={() => setShowForm(false)}
                />
            </SlideOver>
        </AuthenticatedLayout>
    );
}
