import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

import { home } from '@/routes';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden bg-slate-50 p-6 md:p-10">
            {/* Soft decorative background elements */}
            <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-orange-200/40 blur-[120px]" />
            <div className="absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full bg-amber-200/40 blur-[120px]" />

            <div className="relative z-10 w-full max-w-sm">
                <div className="flex flex-col gap-8 rounded-2xl border border-border bg-white/80 p-8 shadow-xl backdrop-blur-md">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="mb-1 flex items-center justify-center">
                                <img
                                    src="/assets/img/favi.png"
                                    alt="Natural Rudraksh"
                                    className="h-16 w-auto object-contain"
                                />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {title}
                            </h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                            <Link
                                href={home()}
                                className="inline-flex items-center justify-center rounded-full border border-amber-200/70 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-white uppercase shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-amber-300/60 focus-visible:outline-none"
                            >
                                Back to home
                            </Link>
                        </div>
                    </div>
                    <div className="[&_input]:border-input [&_input]:bg-white [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground [&_label]:text-foreground">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
