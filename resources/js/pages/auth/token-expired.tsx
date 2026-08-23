import { Head } from '@inertiajs/react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { request } from '@/routes/password';

export default function TokenExpired() {
    return (
        <AuthLayout
            title="Page Expired"
            description="This password reset link has expired or has already been used"
        >
            <Head title="Page Expired" />

            <div className="space-y-6">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
                    <p className="text-sm text-amber-800">
                        This password reset link has expired or has already been
                        used. Password reset links are valid for 1 hour and can
                        only be used once.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Button asChild className="w-full">
                        <TextLink href={request()}>
                            Request New Reset Link
                        </TextLink>
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
}
