import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Loader2, RefreshCw, Shield } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type Step = 'phone' | 'otp' | 'profile';
type OtpResponse = {
    success?: boolean;
    message?: string;
    expires_in?: number;
    redirect?: string;
    csrf_token?: string;
    is_new_user?: boolean;
};
interface LoginProps {
    status?: string;
    redirectTo?: string | null;
}
const csrfToken = (): string =>
    document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? '';

export default function Login({ status, redirectTo }: LoginProps) {
    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [remaining, setRemaining] = useState(0);
    const [profileName, setProfileName] = useState('');
    const [profileEmail, setProfileEmail] = useState('');
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (status) toast.info(status);
    }, [status]);
    useEffect(() => {
        if (remaining < 1) return;
        const timer = window.setInterval(
            () => setRemaining((value) => Math.max(0, value - 1)),
            1000,
        );
        return () => window.clearInterval(timer);
    }, [remaining]);

    const requestOtp = async (endpoint = '/auth/otp/send') => {
        if (!/^[6-9]\d{9}$/.test(phone)) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify({ phone }),
            });
            const data = (await response.json()) as OtpResponse;
            if (!response.ok || !data.success) {
                setError(data.message ?? 'Unable to send OTP.');
                return;
            }
            setStep('otp');
            setRemaining(data.expires_in ?? 120);
            setOtp(['', '', '', '', '', '']);
            window.setTimeout(() => otpRefs.current[0]?.focus(), 50);
            toast.success('OTP sent to +91 ' + phone);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    const verifyOtp = async () => {
        const value = otp.join('');
        if (value.length !== 6) {
            setError('Please enter the complete 6-digit OTP.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const response = await fetch('/auth/otp/verify', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify({
                    phone,
                    otp: value,
                    redirect: redirectTo ?? '/',
                }),
            });
            const data = (await response.json()) as OtpResponse;
            if (!response.ok || !data.success) {
                setError(data.message ?? 'Invalid OTP.');
                setOtp(['', '', '', '', '', '']);
                return;
            }
            if (data.csrf_token)
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.setAttribute('content', data.csrf_token);
            if (data.is_new_user) {
                setStep('profile');
                return;
            }
            toast.success(data.message ?? 'Welcome back!');
            router.visit(data.redirect ?? redirectTo ?? '/');
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const completeProfile = async () => {
        if (!profileName.trim()) {
            setError('Please enter your name.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/auth/otp/profile', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify({
                    name: profileName.trim(),
                    email: profileEmail.trim() || null,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                setError(data.message ?? 'Unable to save profile.');
                return;
            }
            toast.success('Welcome to Herbs!');
            router.visit(redirectTo ?? '/');
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Sign in with your mobile number"
            description="We will send a one-time password to verify your account."
        >
            <Head title="Sign in" />
            {step === 'phone' ? (
                <div className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Mobile number</Label>
                        <div className="flex">
                            <span className="flex h-10 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm">
                                +91
                            </span>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(event) =>
                                    setPhone(
                                        event.target.value
                                            .replace(/\D/g, '')
                                            .slice(0, 10),
                                    )
                                }
                                inputMode="numeric"
                                autoFocus
                                placeholder="9876543210"
                                className="rounded-l-none"
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter')
                                        void requestOtp();
                                }}
                            />
                        </div>
                    </div>
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                    <Button
                        className="w-full"
                        onClick={() => void requestOtp()}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="animate-spin" />} Send
                        OTP
                    </Button>
                </div>
            ) : step === 'profile' ? (
                <div className="space-y-5">
                    <p className="text-sm text-muted-foreground">
                        Tell us a little about yourself to complete your
                        account.
                    </p>
                    <div className="grid gap-2">
                        <Label htmlFor="profile-name">Name</Label>
                        <Input
                            id="profile-name"
                            value={profileName}
                            onChange={(event) =>
                                setProfileName(event.target.value)
                            }
                            autoFocus
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="profile-email">Email (optional)</Label>
                        <Input
                            id="profile-email"
                            type="email"
                            value={profileEmail}
                            onChange={(event) =>
                                setProfileEmail(event.target.value)
                            }
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                    <Button
                        className="w-full"
                        onClick={() => void completeProfile()}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="animate-spin" />}{' '}
                        Continue
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    <button
                        type="button"
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            setStep('phone');
                            setError('');
                        }}
                    >
                        <ArrowLeft size={16} /> Change number
                    </button>
                    <div className="rounded-md bg-muted p-3 text-center text-sm">
                        Code sent to <strong>+91 {phone}</strong>
                    </div>
                    <div>
                        <Label className="mb-3 block text-center">
                            Enter 6-digit OTP
                        </Label>
                        <div className="flex justify-center gap-2">
                            {otp.map((digit, index) => (
                                <Input
                                    key={index}
                                    ref={(element) => {
                                        otpRefs.current[index] = element;
                                    }}
                                    value={digit}
                                    inputMode="numeric"
                                    maxLength={1}
                                    className="h-12 w-10 text-center text-lg"
                                    onChange={(event) => {
                                        const value =
                                            event.target.value.replace(
                                                /\D/g,
                                                '',
                                            );
                                        const next = [...otp];
                                        next[index] = value;
                                        setOtp(next);
                                        if (value)
                                            otpRefs.current[index + 1]?.focus();
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Backspace' && !digit)
                                            otpRefs.current[index - 1]?.focus();
                                        if (event.key === 'Enter')
                                            void verifyOtp();
                                    }}
                                    onPaste={(event) => {
                                        event.preventDefault();
                                        const values = event.clipboardData
                                            .getData('text')
                                            .replace(/\D/g, '')
                                            .slice(0, 6)
                                            .split('');
                                        if (values.length === 6) {
                                            setOtp([...values]);
                                            otpRefs.current[5]?.focus();
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    {error && (
                        <p className="text-center text-sm text-destructive">
                            {error}
                        </p>
                    )}
                    <Button
                        className="w-full"
                        onClick={() => void verifyOtp()}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="animate-spin" />} Verify
                        & sign in
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full"
                        disabled={loading || remaining > 0}
                        onClick={() => void requestOtp('/auth/otp/resend')}
                    >
                        <RefreshCw />{' '}
                        {remaining
                            ? 'Resend in ' +
                              Math.floor(remaining / 60) +
                              ':' +
                              String(remaining % 60).padStart(2, '0')
                            : 'Resend OTP'}
                    </Button>
                </div>
            )}
            <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <Shield size={14} /> Your mobile number is used only to secure
                your account.
            </p>
        </AuthLayout>
    );
}
