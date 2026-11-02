import { InertiaLinkProps, Link } from '@inertiajs/react';

/** Sidebar navigation row. Children are an icon + label. */
export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            aria-current={active ? 'page' : undefined}
            className={
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ' +
                (active
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground') +
                ' ' +
                className
            }
        >
            <span
                className={
                    'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary transition-opacity ' +
                    (active ? 'opacity-100' : 'opacity-0')
                }
                aria-hidden="true"
            />
            {children}
        </Link>
    );
}
