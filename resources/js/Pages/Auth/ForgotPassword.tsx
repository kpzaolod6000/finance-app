import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout
            title="Reset your password"
            description="Enter your email and we'll send you a link to choose a new password."
        >
            <Head title="Forgot Password" />

            {status && (
                <div className="mb-4 rounded-lg border border-income/30 bg-income/10 px-3 py-2 text-sm font-medium text-income">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <PrimaryButton className="w-full" disabled={processing}>
                    Email password reset link
                </PrimaryButton>

                <p className="text-center text-sm text-muted-foreground">
                    <Link href={route('login')} className="link-accent font-medium">
                        Back to log in
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
