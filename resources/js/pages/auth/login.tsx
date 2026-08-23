import { Form, Head } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
    redirectTo?: string | null;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
    redirectTo,
}: LoginProps) {
    const hasShownResetToast = useRef(false);

    const isRateLimitMessage = (message: unknown): message is string => {
        if (typeof message !== 'string') return false;
        return message.toLowerCase().includes('too many login attempts');
    };

    function RateLimitToast({ message }: { message?: string }) {
        const lastMessage = useRef<string | null>(null);

        useEffect(() => {
            if (!isRateLimitMessage(message)) return;
            if (lastMessage.current === message) return;

            lastMessage.current = message;
            toast.error('Too many attempts', { description: message });
        }, [message]);

        return null;
    }

    useEffect(() => {
        if (status !== 'Your password has been reset.') return;
        if (hasShownResetToast.current) return;

        hasShownResetToast.current = true;
        toast.success('Reset successful', {
            description: 'Your password has been reset. Please log in.',
        });
    }, [status]);

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <Form
                action={store()}
                resetOnSuccess={['password']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <RateLimitToast message={errors.email} />

                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError
                                    message={
                                        isRateLimitMessage(errors.email)
                                            ? undefined
                                            : errors.email
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <TextLink
                                    href={
                                        redirectTo
                                            ? `/register?redirect=${encodeURIComponent(redirectTo)}`
                                            : register().url
                                    }
                                    tabIndex={5}
                                >
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && status !== 'Your password has been reset.' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
