import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Account, Budget, Transaction } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

type CategoryExpense = { name: string; color: string; total: number };
type MonthTrend = { month: string; income: number; expenses: number };

type DashboardData = {
    net_worth: string;
    month_income: string;
    month_expenses: string;
    month_balance: string;
    expenses_by_category: CategoryExpense[];
    monthly_trend: MonthTrend[];
    budget_status: Budget[];
    latest_transactions: Transaction[];
};

function StatCard({ label, value, currency = 'PEN', accent = '' }: { label: string; value: string; currency?: string; accent?: string }) {
    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(value));
    return (
        <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`mt-1 text-2xl font-bold tabular-nums ${accent || 'text-gray-900 dark:text-white'}`}>{formatted}</p>
        </div>
    );
}

function BudgetPill({ budget }: { budget: Budget }) {
    const pct = budget.percentage ?? 0;
    const barColor = budget.status === 'exceeded' ? '#ef4444' : budget.status === 'at_risk' ? '#f59e0b' : '#22c55e';
    return (
        <div className="mb-3">
            <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{budget.category?.name}</span>
                <span className="text-gray-500">{pct.toFixed(0)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }} />
            </div>
        </div>
    );
}

export default function Dashboard({
    dashboard,
    accounts,
    hasAccounts,
}: {
    dashboard: DashboardData;
    accounts: Account[];
    hasAccounts: boolean;
}) {
    const currency = accounts[0]?.currency ?? 'PEN';

    if (!hasAccounts) {
        return (
            <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Dashboard</h2>}>
                <Head title="Dashboard" />
                <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No accounts yet. Create your first account to start tracking your finances.</p>
                    <Link href={route('accounts.index')} className="rounded-md bg-indigo-600 px-5 py-2 text-sm text-white hover:bg-indigo-700">
                        Create Account
                    </Link>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Dashboard</h2>}>
            <Head title="Dashboard" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StatCard label="Net Worth" value={dashboard.net_worth} currency={currency} />
                        <StatCard label="Income this month" value={dashboard.month_income} currency={currency} accent="text-green-600 dark:text-green-400" />
                        <StatCard label="Expenses this month" value={dashboard.month_expenses} currency={currency} accent="text-red-600 dark:text-red-400" />
                        <StatCard label="Balance" value={dashboard.month_balance} currency={currency} accent={parseFloat(dashboard.month_balance) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} />
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Expenses by Category</h3>
                            {dashboard.expenses_by_category.length === 0 ? (
                                <p className="py-12 text-center text-sm text-gray-400">No expenses this month.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={240}>
                                    <PieChart>
                                        <Pie data={dashboard.expenses_by_category} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90}>
                                            {dashboard.expenses_by_category.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(val: unknown) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(val))} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
                            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Income vs Expenses (6 months)</h3>
                            {dashboard.monthly_trend.length === 0 ? (
                                <p className="py-12 text-center text-sm text-gray-400">No data yet.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={dashboard.monthly_trend}>
                                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip formatter={(val: unknown) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(val))} />
                                        <Legend />
                                        <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Budgets</h3>
                                <Link href={route('budgets.index')} className="text-xs text-indigo-600 dark:text-indigo-400">Manage →</Link>
                            </div>
                            {dashboard.budget_status.length === 0 ? (
                                <p className="py-6 text-center text-sm text-gray-400">No budgets set this month.</p>
                            ) : (
                                dashboard.budget_status.map((b) => <BudgetPill key={b.id} budget={b} />)
                            )}
                        </div>

                        <div className="rounded-lg bg-white p-5 shadow dark:bg-gray-800">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Latest Transactions</h3>
                                <Link href={route('transactions.index')} className="text-xs text-indigo-600 dark:text-indigo-400">View all →</Link>
                            </div>
                            {dashboard.latest_transactions.length === 0 ? (
                                <p className="py-6 text-center text-sm text-gray-400">No transactions yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {dashboard.latest_transactions.map((t) => (
                                        <div key={t.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-900 dark:text-white">{t.description || t.category?.name || t.type}</p>
                                                <p className="text-xs text-gray-400">{t.occurred_at} · {t.account?.name}</p>
                                            </div>
                                            <span className={`font-mono text-sm tabular-nums ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : t.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                {t.type === 'income' ? '+' : t.type === 'expense' ? '−' : '↔'}
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: t.currency }).format(parseFloat(t.amount))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
