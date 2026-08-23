import { Transition } from '@headlessui/react';
import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { Trash2, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const nameRef = useRef<HTMLInputElement | null>(null);
    const emailRef = useRef<HTMLInputElement | null>(null);

    const hasUploadedAvatar = (url: unknown): url is string => {
        if (typeof url !== 'string') return false;
        return url.includes('/uploads/avatars/');
    };

    const avatarPreviewUrl = useMemo(() => {
        if (avatarFile) {
            return URL.createObjectURL(avatarFile);
        }
        return auth.user.avatar;
    }, [auth.user.avatar, avatarFile]);

    useEffect(() => {
        // Cleanup object URLs to avoid memory leaks.
        if (!avatarFile) return;
        const url = avatarPreviewUrl;
        return () => {
            if (typeof url === 'string') {
                URL.revokeObjectURL(url);
            }
        };
    }, [avatarFile, avatarPreviewUrl]);

    useEffect(() => {
        // When the backend updates the avatar (upload/remove), clear local selection flags.
        setAvatarFile(null);
    }, [auth.user.avatar]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Profile information"
                        description="Update your name and email address"
                    />

                    <Form
                        action={ProfileController.update()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label>Profile photo</Label>
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={avatarPreviewUrl}
                                            alt={auth.user.name}
                                            className="h-16 w-16 rounded-full object-cover ring-1 ring-border"
                                        />

                                        <div className="flex-1 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const input =
                                                            document.getElementById(
                                                                'avatar-upload',
                                                            ) as HTMLInputElement | null;
                                                        input?.click();
                                                    }}
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload
                                                </Button>

                                                {hasUploadedAvatar(
                                                    auth.user.avatar,
                                                ) && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setAvatarFile(null);

                                                            const formData = new FormData();
                                                            formData.append(
                                                                'name',
                                                                nameRef.current
                                                                    ?.value ??
                                                                    auth.user
                                                                        .name,
                                                            );
                                                            formData.append(
                                                                'email',
                                                                emailRef.current
                                                                    ?.value ??
                                                                    auth.user
                                                                        .email,
                                                            );
                                                            formData.append(
                                                                'remove_avatar',
                                                                '1',
                                                            );

                                                            router.post(
                                                                ProfileController.update(),
                                                                formData,
                                                                {
                                                                    preserveScroll:
                                                                        true,
                                                                    forceFormData:
                                                                        true,
                                                                },
                                                            );
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>

                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                name="avatar"
                                                accept="image/jpeg,image/png,image/jpg"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files?.[0];
                                                    if (!file) return;
                                                    setAvatarFile(file);
                                                }}
                                            />

                                            <InputError
                                                className="mt-1"
                                                message={errors.avatar}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        ref={nameRef}
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        ref={emailRef}
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    A new verification link has
                                                    been sent to your email
                                                    address.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
