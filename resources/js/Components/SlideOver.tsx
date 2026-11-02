import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { PropsWithChildren, ReactNode } from 'react';

/**
 * Right-side slide-over sheet. Replaces centered modals for forms that can grow:
 * the body scrolls independently, so length never breaks the layout.
 * Accessible by default — focus trap, Escape to close, backdrop click.
 */
export default function SlideOver({
    show,
    onClose,
    title,
    description,
    maxWidth = 'lg',
    children,
}: PropsWithChildren<{
    show: boolean;
    onClose: () => void;
    title: ReactNode;
    description?: ReactNode;
    maxWidth?: 'md' | 'lg' | 'xl' | '2xl';
}>) {
    const maxWidthClass = {
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    }[maxWidth];

    return (
        <Transition show={show}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
                        <TransitionChild
                            enter="transform transition ease-out duration-300"
                            enterFrom="translate-x-full"
                            enterTo="translate-x-0"
                            leave="transform transition ease-in duration-200"
                            leaveFrom="translate-x-0"
                            leaveTo="translate-x-full"
                        >
                            <DialogPanel className={`w-screen ${maxWidthClass}`}>
                                <div className="flex h-full flex-col border-l border-border bg-card text-card-foreground shadow-2xl shadow-black/40">
                                    <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
                                        <div className="min-w-0">
                                            <DialogTitle className="text-lg font-semibold tracking-tight">
                                                {title}
                                            </DialogTitle>
                                            {description && (
                                                <p className="mt-0.5 text-sm text-muted-foreground">
                                                    {description}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="btn-ghost -mr-2 px-2"
                                            aria-label="Close panel"
                                        >
                                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                <path d="M18 6 6 18" />
                                                <path d="m6 6 12 12" />
                                            </svg>
                                        </button>
                                    </header>
                                    <div className="flex-1 overflow-y-auto px-6 py-5">
                                        {children}
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
