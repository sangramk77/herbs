import { Form, Head } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
        length: password.length >= 12,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password),
    };

    if (checks.length) strength += 20;
    if (checks.uppercase) strength += 20;
    if (checks.lowercase) strength += 20;
    if (checks.number) strength += 20;
    if (checks.symbol) strength += 20;

    return { strength, checks };
};

const getStrengthLabel = (strength: number) => {
    if (strength === 0) return 'None';
    if (strength <= 20) return 'Weak';
    if (strength <= 40) return 'Fair';
    if (strength <= 60) return 'Good';
    if (strength <= 80) return 'Strong';
    return 'Very strong';
};

const getStrengthColor = (strength: number) => {
    if (strength === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (strength <= 20) return 'bg-red-500';
    if (strength <= 40) return 'bg-yellow-500';
    if (strength <= 60) return 'bg-blue-500';
    if (strength <= 80) return 'bg-green-500';
    return 'bg-emerald-600';
};

interface RegisterProps {
    redirectTo?: string | null;
}

export default function Register({ redirectTo }: RegisterProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordValue, setPasswordValue] = useState('');

    const { strength, checks } = calculatePasswordStrength(passwordValue);

    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            <Form
                action={store()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                noValidate
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                    pattern="[A-Za-z\\s.\\-]+"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone number</Label>
                                <div className="flex items-center">
                                    <div className="flex h-10 items-center gap-2 rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                                        <svg
                                            width="18"
                                            height="12"
                                            viewBox="0 0 18 12"
                                            xmlns="http://www.w3.org/2000/svg"
                                            aria-hidden="true"
                                        >
                                            <rect
                                                width="18"
                                                height="12"
                                                fill="#FF9933"
                                            />
                                            <rect
                                                y="4"
                                                width="18"
                                                height="4"
                                                fill="#FFFFFF"
                                            />
                                            <rect
                                                y="8"
                                                width="18"
                                                height="4"
                                                fill="#138808"
                                            />
                                            <circle
                                                cx="9"
                                                cy="6"
                                                r="1.6"
                                                fill="none"
                                                stroke="#000080"
                                                strokeWidth="0.6"
                                            />
                                        </svg>
                                        +91
                                    </div>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        required
                                        tabIndex={3}
                                        autoComplete="tel"
                                        name="phone"
                                        placeholder="9876543210"
                                        maxLength={10}
                                        inputMode="numeric"
                                        pattern="[6-9][0-9]{9}"
                                        className="rounded-l-none"
                                        onKeyDown={(event) => {
                                            const { key, ctrlKey, metaKey } =
                                                event;
                                            const allowedKeys = [
                                                'Backspace',
                                                'Delete',
                                                'ArrowLeft',
                                                'ArrowRight',
                                                'Tab',
                                                'Home',
                                                'End',
                                            ];

                                            if (
                                                ctrlKey ||
                                                metaKey ||
                                                allowedKeys.includes(key)
                                            ) {
                                                return;
                                            }

                                            if (!/^\d$/.test(key)) {
                                                event.preventDefault();
                                            }
                                        }}
                                        onInput={(event) => {
                                            const target =
                                                event.currentTarget as HTMLInputElement;
                                            let value = target.value
                                                .replace(/\\D/g, '')
                                                .replace(/^91/, '');

                                            if (value.length > 10) {
                                                value = value.slice(-10);
                                            }

                                            if (value.length > 0) {
                                                value = value.replace(
                                                    /^[0-5]+/,
                                                    '',
                                                );
                                            }

                                            target.value = value.slice(0, 10);
                                        }}
                                    />
                                </div>
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Password"
                                        className="pr-10"
                                        onChange={(event) =>
                                            setPasswordValue(event.target.value)
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        aria-label={
                                            showPassword
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />

                                {passwordValue.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">
                                                Password strength
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {getStrengthLabel(strength)}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={`h-full transition-all duration-300 ${getStrengthColor(strength)}`}
                                                style={{
                                                    width: `${strength}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="grid gap-1 text-xs text-muted-foreground">
                                            <span
                                                className={
                                                    checks.length
                                                        ? 'text-green-600'
                                                        : ''
                                                }
                                            >
                                                • 12+ characters
                                            </span>
                                            <span
                                                className={
                                                    checks.uppercase
                                                        ? 'text-green-600'
                                                        : ''
                                                }
                                            >
                                                • Uppercase letter
                                            </span>
                                            <span
                                                className={
                                                    checks.lowercase
                                                        ? 'text-green-600'
                                                        : ''
                                                }
                                            >
                                                • Lowercase letter
                                            </span>
                                            <span
                                                className={
                                                    checks.number
                                                        ? 'text-green-600'
                                                        : ''
                                                }
                                            >
                                                • Number
                                            </span>
                                            <span
                                                className={
                                                    checks.symbol
                                                        ? 'text-green-600'
                                                        : ''
                                                }
                                            >
                                                • Symbol
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type={
                                            showConfirmPassword
                                                ? 'text'
                                                : 'password'
                                        }
                                        required
                                        tabIndex={5}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Confirm password"
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword,
                                            )
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        aria-label={
                                            showConfirmPassword
                                                ? 'Hide password confirmation'
                                                : 'Show password confirmation'
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={6}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink
                                href={
                                    redirectTo
                                        ? `/login?redirect=${encodeURIComponent(redirectTo)}`
                                        : login().url
                                }
                                tabIndex={7}
                            >
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
