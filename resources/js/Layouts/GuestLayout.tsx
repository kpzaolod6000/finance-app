import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';

/** Faint ledger lines used as ambient texture on the brand panel. */
const LEDGER_ROWS: [string, string][] = [
    ['Salary', '+ 4,200.00'],
    ['Rent', '− 1,150.00'],
    ['Groceries', '− 312.40'],
    ['Transfer to Savings', '↔ 500.00'],
    ['Dividends', '+ 86.10'],
];

export default function Guest({
    title,
    description,
    children,
}: PropsWithChildren<{ title?: ReactNode; description?: ReactNode }>) {
    return (
        <div className="dark flex min-h-screen bg-background text-foreground">
            {/* Brand panel */}
            <aside className="relative hidden w-1/2 overflow-hidden border-r border-border bg-[#0b0c0e] lg:flex lg:flex-col lg:justify-between lg:p-12">
                <Link href="/" className="flex items-center gap-2.5">
                    <span className="text-primary">
                        <ApplicationLogo className="h-8 w-8" />
                    </span>
                    <span className="text-lg font-semibold tracking-tight">Ledger</span>
                </Link>

                <div className="relative z-10 max-w-md">
                    <h1 className="text-3xl font-semibold leading-tight tracking-tight">
                        Every figure, accounted for.
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        A quiet, precise ledger for your accounts, budgets, and
                        spending — built for the long view, not the next semester.
                    </p>
                </div>

                {/* Ambient ledger texture */}
                <div className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-center pl-12 pr-8 opacity-[0.06]">
                    {LEDGER_ROWS.map(([label, amount], i) => (
                        <div
                            key={i}
                            className="flex items-baseline justify-between border-b border-foreground/40 py-3"
                        >
                            <span className="text-sm">{label}</span>
                            <span className="money text-sm">{amount}</span>
                        </div>
                    ))}
                </div>

                <p className="relative z-10 text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Ledger · Personal finance, kept honest.
                </p>
            </aside>

            {/* Form panel */}
            <main className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
                <div className="w-full max-w-sm">
                    <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
                        <span className="text-primary">
                            <ApplicationLogo className="h-7 w-7" />
                        </span>
                        <span className="text-base font-semibold tracking-tight">Ledger</span>
                    </Link>

                    {(title || description) && (
                        <div className="mb-7">
                            {title && (
                                <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                            )}
                            {description && (
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                    )}

                    {children}
                </div>
            </main>
        </div>
    );
}
