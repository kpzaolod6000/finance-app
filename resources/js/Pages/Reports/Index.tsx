import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

type MonthlySummary = {
    month: string;
    income: number;
    expenses: number;
    savings: number;
};

const INCOME = '#6fa287';
const EXPENSE = '#c26b62';
const SAVINGS = '#7d9ab5';

export default function ReportsIndex({ monthly_summary }: { monthly_summary: MonthlySummary[] }) {
    const currency = 'PEN';

    const fmt = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val);

    const exportUrl = route('reports.export');

    return (
        <AuthenticatedLayout header="Reports">
            <Head title="Reports" />
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex justify-end">
                    <a href={exportUrl} className="btn-secondary">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M12 3v12" /><path d="m8 11 4 4 4-4" /><path d="M5 21h14" />
                        </svg>
                        Export CSV
                    </a>
                </div>

                <div className="card card-p">
                    <h3 className="eyebrow mb-4">Monthly summary</h3>
                    {monthly_summary.length === 0 ? (
                        <p className="py-12 text-center text-sm text-muted-foreground">No transaction data yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={monthly_summary}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.6} vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                                    contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--popover-foreground)' }}
                                    formatter={(val: unknown) => fmt(Number(val))}
                                />
                                <Legend />
                                <Bar dataKey="income" name="Income" fill={INCOME} radius={[3, 3, 0, 0]} />
                                <Bar dataKey="expenses" name="Expenses" fill={EXPENSE} radius={[3, 3, 0, 0]} />
                                <Bar dataKey="savings" name="Savings" fill={SAVINGS} radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {monthly_summary.length > 0 && (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="ledger">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th className="text-right">Income</th>
                                        <th className="text-right">Expenses</th>
                                        <th className="text-right">Savings</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthly_summary.slice().reverse().map((row) => (
                                        <tr key={row.month}>
                                            <td className="font-medium text-foreground">{row.month}</td>
                                            <td className="money text-right amount-income">{fmt(row.income)}</td>
                                            <td className="money text-right amount-expense">{fmt(row.expenses)}</td>
                                            <td className={`money text-right ${row.savings >= 0 ? 'amount-neutral' : 'amount-expense'}`}>{fmt(row.savings)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
