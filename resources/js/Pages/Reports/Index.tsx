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

export default function ReportsIndex({ monthly_summary }: { monthly_summary: MonthlySummary[] }) {
    const currency = 'PEN';

    const fmt = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val);

    const exportUrl = route('reports.export');

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Reports</h2>}>
            <Head title="Reports" />
            <div className="py-12">
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                    {/* Export button */}
                    <div className="flex justify-end">
                        <a
                            href={exportUrl}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                        >
                            Export CSV
                        </a>
                    </div>

                    {/* Bar chart */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Monthly Summary</h3>
                        {monthly_summary.length === 0 ? (
                            <p className="py-12 text-center text-sm text-gray-400">No transaction data yet.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={monthly_summary}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(val: unknown) => fmt(Number(val))} />
                                    <Legend />
                                    <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="savings" name="Savings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Monthly table */}
                    {monthly_summary.length > 0 && (
                        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Month</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Income</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Expenses</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Savings</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {monthly_summary.slice().reverse().map((row) => (
                                            <tr key={row.month}>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{row.month}</td>
                                                <td className="px-6 py-4 text-right font-mono text-sm text-green-600 dark:text-green-400">{fmt(row.income)}</td>
                                                <td className="px-6 py-4 text-right font-mono text-sm text-red-600 dark:text-red-400">{fmt(row.expenses)}</td>
                                                <td className={`px-6 py-4 text-right font-mono text-sm ${row.savings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>{fmt(row.savings)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
