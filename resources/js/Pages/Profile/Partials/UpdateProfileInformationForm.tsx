import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Lima',
    'America/Bogota',
    'America/Mexico_City',
    'America/Sao_Paulo',
    'America/Argentina/Buenos_Aires',
    'America/Santiago',
    'Europe/London',
    'Europe/Madrid',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney',
];

const CURRENCIES = [
    { code: 'PEN', label: 'PEN — Peruvian Sol' },
    { code: 'USD', label: 'USD — US Dollar' },
    { code: 'EUR', label: 'EUR — Euro' },
    { code: 'GBP', label: 'GBP — British Pound' },
    { code: 'MXN', label: 'MXN — Mexican Peso' },
    { code: 'ARS', label: 'ARS — Argentine Peso' },
    { code: 'CLP', label: 'CLP — Chilean Peso' },
    { code: 'COP', label: 'COP — Colombian Peso' },
    { code: 'BRL', label: 'BRL — Brazilian Real' },
    { code: 'JPY', label: 'JPY — Japanese Yen' },
    { code: 'CNY', label: 'CNY — Chinese Yuan' },
];

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            timezone: user.timezone,
            default_currency: user.default_currency,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-semibold text-foreground">Profile information</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Update your name, email address, timezone, and default currency.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        className="block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        className="block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel htmlFor="timezone" value="Timezone" />
                    <select
                        id="timezone"
                        className="field"
                        value={data.timezone}
                        onChange={(e) => setData('timezone', e.target.value)}
                    >
                        {TIMEZONES.map((tz) => (
                            <option key={tz} value={tz}>{tz}</option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.timezone} />
                </div>

                <div>
                    <InputLabel htmlFor="default_currency" value="Default currency" />
                    <select
                        id="default_currency"
                        className="field"
                        value={data.default_currency}
                        onChange={(e) => setData('default_currency', e.target.value)}
                    >
                        {CURRENCIES.map(({ code, label }) => (
                            <option key={code} value={code}>{label}</option>
                        ))}
                    </select>
                    <InputError className="mt-2" message={errors.default_currency} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-foreground">
                            Your email address is unverified.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="link-accent"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-income">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save changes</PrimaryButton>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-muted-foreground">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
