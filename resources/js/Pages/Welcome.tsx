import ApplicationLogo from '@/Components/ApplicationLogo';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

const LEDGER_ROWS: [string, string, string][] = [
    ['Salary', '+ 4,200.00', 'amount-income'],
    ['Rent', '− 1,150.00', 'amount-expense'],
    ['Groceries', '− 312.40', 'amount-expense'],
    ['To Savings', '↔ 500.00', 'amount-neutral'],
    ['Dividends', '+ 86.10', 'amount-income'],
];

export default function Welcome({ auth }: PageProps) {
    return (
        <>
            <Head title="Welcome" />
            <div className="dark min-h-screen bg-background text-foreground">
                {/* Header */}
                <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
                    <div className="flex items-center gap-2.5">
                        <span className="text-primary">
                            <ApplicationLogo className="h-7 w-7" />
                        </span>
                        <span className="text-base font-semibold tracking-tight">Ledger</span>
                    </div>
                    <nav className="flex items-center gap-3">
                        {auth.user ? (
                            <Link href={route('dashboard')} className="btn-primary">
                                Open dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="btn-ghost">Log in</Link>
                                <Link href={route('register')} className="btn-primary">Get started</Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero */}
                <main className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-28">
                    <div>
                        <p className="eyebrow mb-4">Personal finance, kept honest</p>
                        <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
                            Every figure,
                            <br />
                            accounted for.
                        </h1>
                        <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
                            Track accounts, set budgets, and watch where the money
                            actually goes — in a quiet, precise ledger built for the
                            long view.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="btn-primary px-6 py-2.5">
                                    Open dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('register')} className="btn-primary px-6 py-2.5">
                                        Create your account
                                    </Link>
                                    <Link href={route('login')} className="btn-secondary px-6 py-2.5">
                                        Log in
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Ledger preview */}
                    <div className="card card-p sm:p-7">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="eyebrow">This month</h3>
                            <span className="money text-sm text-muted-foreground">June 2026</span>
                        </div>
                        <div>
                            {LEDGER_ROWS.map(([label, amount, cls], i) => (
                                <div key={i} className="flex items-center justify-between border-b border-border/70 py-3 last:border-0">
                                    <span className="text-sm text-foreground">{label}</span>
                                    <span className={`money text-sm ${cls}`}>{amount}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
                            <span className="text-sm font-medium text-foreground">Net this month</span>
                            <span className="money text-sm font-semibold amount-income">+ 2,323.70</span>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
