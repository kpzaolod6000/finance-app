import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

type IconProps = { className?: string };

function Icon({ path, className = 'h-[18px] w-[18px]' }: { path: ReactNode } & IconProps) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {path}
        </svg>
    );
}

const ICONS: Record<string, ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>,
    accounts: <><rect x="2.5" y="6" width="19" height="13" rx="2" /><path d="M2.5 10h19" /><path d="M16 15h2" /></>,
    transactions: <><path d="M7 4v13" /><path d="m3.5 13.5 3.5 3.5 3.5-3.5" /><path d="M17 20V7" /><path d="m20.5 10.5-3.5-3.5-3.5 3.5" /></>,
    budgets: <><circle cx="12" cy="12" r="9" /><path d="M12 12 12 3" /><path d="M12 12l6.5 4" /></>,
    categories: <><path d="M3 5h18" /><path d="M3 12h18" /><path d="M3 19h18" /><circle cx="7" cy="5" r="0.5" fill="currentColor" /></>,
    reports: <><path d="M4 20V4" /><path d="M4 20h16" /><path d="M8 16v-4" /><path d="M13 16V8" /><path d="M18 16v-7" /></>,
};

type NavEntry = { key: string; label: string; route: string; pattern: string };

const NAV: NavEntry[] = [
    { key: 'dashboard', label: 'Dashboard', route: 'dashboard', pattern: 'dashboard' },
    { key: 'accounts', label: 'Accounts', route: 'accounts.index', pattern: 'accounts.*' },
    { key: 'transactions', label: 'Transactions', route: 'transactions.index', pattern: 'transactions.*' },
    { key: 'budgets', label: 'Budgets', route: 'budgets.index', pattern: 'budgets.*' },
    { key: 'categories', label: 'Categories', route: 'categories.index', pattern: 'categories.*' },
    { key: 'reports', label: 'Reports', route: 'reports.index', pattern: 'reports.*' },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
    const user = usePage().props.auth.user;

    return (
        <div className="flex h-full flex-col">
            {/* Brand */}
            <div className="flex h-16 items-center gap-2.5 px-5">
                <span className="text-primary">
                    <ApplicationLogo className="h-7 w-7" />
                </span>
                <span className="text-base font-semibold tracking-tight">Ledger</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                <p className="px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                    Overview
                </p>
                {NAV.map((item) => (
                    <NavLink
                        key={item.key}
                        href={route(item.route)}
                        active={route().current(item.pattern)}
                        onClick={onNavigate}
                    >
                        <Icon path={ICONS[item.key]} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* User footer */}
            <div className="border-t border-sidebar-border p-3">
                <Link
                    href={route('profile.edit')}
                    onClick={onNavigate}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-sidebar-accent/60"
                >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {user.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-sidebar-foreground">{user.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                    </span>
                </Link>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    onClick={onNavigate}
                    className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                >
                    <Icon path={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>} />
                    Log out
                </Link>
            </div>
        </div>
    );
}

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
                <SidebarContent />
            </aside>

            {/* Mobile drawer */}
            {drawerOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <aside className="absolute inset-y-0 left-0 w-64 border-r border-sidebar-border bg-sidebar">
                        <SidebarContent onNavigate={() => setDrawerOpen(false)} />
                    </aside>
                </div>
            )}

            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        className="btn-ghost -ml-1 px-2 lg:hidden"
                        aria-label="Open navigation"
                    >
                        <Icon path={<><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>} className="h-5 w-5" />
                    </button>
                    <div className="min-w-0 flex-1 text-lg font-semibold tracking-tight text-foreground">
                        {header}
                    </div>
                </header>

                <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
            </div>
        </div>
    );
}
