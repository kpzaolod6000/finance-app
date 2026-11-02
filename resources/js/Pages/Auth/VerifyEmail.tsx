import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout
            title="Verify your email"
            description="We sent a verification link to your inbox. Click it to activate your account — or resend it below."
        >
            <Head title="Email Verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-lg border border-income/30 bg-income/10 px-3 py-2 text-sm font-medium text-income">
                    A new verification link has been sent to your email address.
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <PrimaryButton className="w-full" disabled={processing}>
                    Resend verification email
                </PrimaryButton>

                <p className="text-center text-sm text-muted-foreground">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="link-accent font-medium"
                    >
                        Log out
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
