import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import FloatingLines from '@/components/FloatingLines';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function AdminLogin() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/login');
    };

    return (
        <>
            <Head title="Admin Login" />

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-900 via-stone-800 to-neutral-900 p-4">
                <div className="pointer-events-none absolute inset-0 opacity-75">
                    <FloatingLines
                        animationSpeed={0.8}
                        interactive
                        bendRadius={4.5}
                        bendStrength={-0.45}
                        mouseDamping={0.05}
                        parallax
                        parallaxStrength={0.14}
                        lineCount={[4, 6, 4]}
                        lineDistance={[10, 14, 10]}
                        mixBlendMode="screen"
                    />
                </div>
                <div className="relative z-10 w-full max-w-sm">
                    {/* Logo/Header */}
                    <div className="mb-6 text-center">
                        <img
                            src="/assets/brand/herbs-logo.svg"
                            alt="Herbs"
                            className="mx-auto h-28 w-auto object-contain drop-shadow-md"
                        />
                    </div>

                    <Card className="border-white/15 bg-white/12 shadow-2xl backdrop-blur-2xl">
                        <CardHeader>
                            <CardTitle className="text-white">
                                Sign In
                            </CardTitle>
                            <CardDescription className="text-stone-200">
                                Enter your credentials to access the admin panel
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="email"
                                        className="text-stone-200"
                                    >
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-amber-100/80" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            className="border-amber-200/30 bg-white/15 pl-10 text-white shadow-sm placeholder:text-stone-300 focus:border-amber-300/60 focus:ring-amber-300/40"
                                            placeholder="admin@example.com"
                                            autoComplete="username"
                                            autoFocus
                                        />
                                    </div>
                                    <FormError
                                        message={errors.email}
                                        tone="dark"
                                    />
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-stone-200"
                                    >
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-amber-100/80" />
                                        <Input
                                            id="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            className="border-amber-200/30 bg-white/15 pr-10 pl-10 text-white shadow-sm placeholder:text-stone-300 focus:border-amber-300/60 focus:ring-amber-300/40"
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((v) => !v)
                                            }
                                            className="absolute top-1/2 right-3 -translate-y-1/2 text-amber-100/70 transition-colors hover:text-amber-100"
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
                                    <FormError
                                        message={errors.password}
                                        tone="dark"
                                    />
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                'remember',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-amber-200/50 bg-white/15 text-amber-200 focus:ring-amber-300/50 focus:ring-offset-neutral-900"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="ml-2 cursor-pointer text-sm text-stone-300"
                                    >
                                        Remember me
                                    </Label>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-amber-400 font-semibold text-neutral-950 shadow-lg shadow-amber-400/40 hover:bg-amber-300"
                                >
                                    {processing ? (
                                        <>
                                            <Spinner className="text-neutral-950" />
                                            Signing in...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                            </form>

                            {/* Info Alert */}
                            <Alert className="mt-6 border-amber-200/30 bg-amber-400/15">
                                <AlertDescription className="text-sm text-stone-200">
                                    This is the admin panel. Regular user
                                    credentials will not work here.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    {/* Back to Home */}
                    <div className="mt-6 text-center">
                        <Button
                            asChild
                            variant="outline"
                            className="border-white/25 bg-white/10 text-stone-100 shadow-lg backdrop-blur-md hover:bg-white/20 hover:text-white"
                        >
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Website
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
