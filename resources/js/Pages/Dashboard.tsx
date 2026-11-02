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

const INCOME = '#6fa287';
const EXPENSE = '#c26b62';

function StatCard({ label, value, currency = 'PEN', accent = '' }: { label: string; value: string; currency?: string; accent?: string }) {
    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(value));
    return (
        <div className="card card-p">
            <p className="eyebrow">{label}</p>
            <p className={`money mt-2 text-2xl font-semibold ${accent || 'text-foreground'}`}>{formatted}</p>
        </div>
    );
}

function BudgetPill({ budget }: { budget: Budget }) {
    const pct = budget.percentage ?? 0;
    const barColor = budget.status === 'exceeded' ? EXPENSE : budget.status === 'at_risk' ? '#b8a36a' : INCOME;
    return (
        <div className="mb-3 last:mb-0">
            <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-foreground">{budget.category?.name}</span>
                <span className="money text-muted-foreground">{pct.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }} />
            </div>
        </div>
    );
}

function CardHeader({ title, href, action }: { title: string; href?: string; action?: string }) {
    return (
        <div className="mb-4 flex items-center justify-between">
            <h3 className="eyebrow">{title}</h3>
            {href && action && (
                <Link href={href} className="link-accent text-xs">{action}</Link>
            )}
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
            <AuthenticatedLayout header="Dashboard">
                <Head title="Dashboard" />
                <div className="card flex min-h-[60vh] flex-col items-center justify-center gap-4 p-12 text-center">
                    <p className="max-w-sm text-muted-foreground">
                        No accounts yet. Create your first account to start tracking your finances.
                    </p>
                    <Link href={route('accounts.index')} className="btn-primary">
                        Create account
                    </Link>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard label="Net worth" value={dashboard.net_worth} currency={currency} />
                    <StatCard label="Income this month" value={dashboard.month_income} currency={currency} accent="text-income" />
                    <StatCard label="Expenses this month" value={dashboard.month_expenses} currency={currency} accent="text-expense" />
                    <StatCard label="Balance" value={dashboard.month_balance} currency={currency} accent={parseFloat(dashboard.month_balance) >= 0 ? 'text-income' : 'text-expense'} />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="card card-p">
                        <CardHeader title="Expenses by category" />
                        {dashboard.expenses_by_category.length === 0 ? (
                            <p className="py-12 text-center text-sm text-muted-foreground">No expenses this month.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie data={dashboard.expenses_by_category} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} stroke="var(--card)" strokeWidth={2}>
                                        {dashboard.expenses_by_category.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--popover-foreground)' }}
                                        formatter={(val: unknown) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(val))}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="card card-p">
                        <CardHeader title="Income vs expenses · 6 months" />
                        {dashboard.monthly_trend.length === 0 ? (
                            <p className="py-12 text-center text-sm text-muted-foreground">No data yet.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={dashboard.monthly_trend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.6} vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                                        contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--popover-foreground)' }}
                                        formatter={(val: unknown) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(val))}
                                    />
                                    <Legend />
                                    <Bar dataKey="income" name="Income" fill={INCOME} radius={[3, 3, 0, 0]} />
                                    <Bar dataKey="expenses" name="Expenses" fill={EXPENSE} radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="card card-p">
                        <CardHeader title="Budgets" href={route('budgets.index')} action="Manage →" />
                        {dashboard.budget_status.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">No budgets set this month.</p>
                        ) : (
                            dashboard.budget_status.map((b) => <BudgetPill key={b.id} budget={b} />)
                        )}
                    </div>

                    <div className="card card-p">
                        <CardHeader title="Latest transactions" href={route('transactions.index')} action="View all →" />
                        {dashboard.latest_transactions.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">No transactions yet.</p>
                        ) : (
                            <div className="-mx-1">
                                {dashboard.latest_transactions.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between rounded-lg px-1 py-2">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm text-foreground">{t.description || t.category?.name || t.type}</p>
                                            <p className="text-xs text-muted-foreground">{t.occurred_at} · {t.account?.name}</p>
                                        </div>
                                        <span className={`money ml-3 shrink-0 text-sm ${t.type === 'income' ? 'amount-income' : t.type === 'expense' ? 'amount-expense' : 'amount-neutral'}`}>
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
        </AuthenticatedLayout>
    );
}
