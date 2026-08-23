// Components
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { email as emailRoute } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    const [statusDismissed, setStatusDismissed] = useState(false);
    const [submissionKey, setSubmissionKey] = useState(0);
    const [cooldownUntilMs, setCooldownUntilMs] = useState<number | null>(null);
    const [cooldownRemainingSeconds, setCooldownRemainingSeconds] = useState(0);
    const lastCooldownToastUntilMs = useRef<number | null>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            email: '',
        });

    const showStatus = Boolean(status) && !statusDismissed;
    const isInCooldown = cooldownRemainingSeconds > 0;

    useEffect(() => {
        if (cooldownUntilMs === null) return;

        const intervalId = window.setInterval(() => {
            const remaining = Math.max(
                0,
                Math.ceil((cooldownUntilMs - Date.now()) / 1000),
            );
            setCooldownRemainingSeconds(remaining);

            if (remaining === 0) {
                setCooldownUntilMs(null);
                clearErrors('email');
            }
        }, 250);

        return () => window.clearInterval(intervalId);
    }, [cooldownUntilMs, clearErrors]);

    useEffect(() => {
        if (!status) return;

        // When the backend flashes a status message, consider the request successful:
        // clear the input, then auto-dismiss the notification.
        reset('email');

        const timer = window.setTimeout(() => setStatusDismissed(true), 5000);
        return () => window.clearTimeout(timer);
    }, [status, reset, submissionKey]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isInCooldown) return;

        setStatusDismissed(false);
        setSubmissionKey((k) => k + 1);
        post(emailRoute.url(), {
            onError: (formErrors) => {
                const emailError = formErrors.email;
                if (!emailError) return;

                const match = /Please wait\s+(\d+)\s+seconds?/i.exec(emailError);
                if (!match) return;

                const seconds = Number.parseInt(match[1] ?? '', 10);
                if (!Number.isFinite(seconds) || seconds <= 0) return;

                const untilMs = Date.now() + seconds * 1000;
                setCooldownUntilMs(untilMs);
                setCooldownRemainingSeconds(seconds);

                if (lastCooldownToastUntilMs.current !== untilMs) {
                    lastCooldownToastUntilMs.current = untilMs;
                    toast.error('Try again after some time.', {
                        description: `Please wait ${seconds} seconds before trying again.`,
                    });
                }
            },
            onSuccess: () => reset('email'),
        });
    };

    return (
        <AuthLayout
            title="Forgot password"
            description="Enter your email to receive a password reset link"
        >
            {showStatus && status && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => {
                                setData('email', e.target.value);
                                clearErrors('email');
                                setCooldownUntilMs(null);
                                setCooldownRemainingSeconds(0);
                            }}
                            autoComplete="off"
                            autoFocus
                            placeholder="email@example.com"
                            disabled={processing}
                        />

                        {!isInCooldown && errors.email && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="my-6 flex items-center justify-start">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={processing || isInCooldown}
                            data-test="email-password-reset-link-button"
                        >
                            {processing && (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            )}
                            {isInCooldown
                                ? `Try again in ${cooldownRemainingSeconds}s`
                                : 'Email password reset link'}
                        </Button>
                    </div>
                </form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Or, return to</span>
                    <TextLink href={login()}>log in</TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
