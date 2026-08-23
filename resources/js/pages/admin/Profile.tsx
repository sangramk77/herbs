import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { FileText, Key, MessageSquare, Trash2, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import PasswordChangeDialog from '@/components/PasswordChangeDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/AdminLayout';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    avatar_url?: string;
    last_login_at?: string;
    created_at?: string;
}

interface ProfileStats {
    blogs_count: number;
    testimonials_count: number;
}

interface ProfileProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    user: User;
    stats?: ProfileStats;
    flash?: {
        success?: string;
        error?: string;
    };
}

const formSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    avatar: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Profile({ auth, user, stats, flash }: ProfileProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user.name || '',
            avatar: user.avatar_url || '',
        },
    });

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Sync form with updated user data after successful update
    useEffect(() => {
        form.reset({
            name: user.name || '',
            avatar: user.avatar_url || '',
        });
    }, [user.avatar_url, user.name, form]);

    const onSubmit = (data: FormValues) => {
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', data.name);

        // Only append avatar if a new file was selected
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        router.post('/admin/profile', formData, {
            forceFormData: true,
            onSuccess: () => {
                // Clear avatar file state after successful submission
                setAvatarFile(null);
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                // Show specific validation errors if available
                const firstError = Object.values(errors)[0];
                if (firstError) {
                    toast.error(String(firstError));
                } else {
                    toast.error(
                        'Failed to update profile. Please check the form.',
                    );
                }
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const removeAvatar = () => {
        // If a new file was selected but not saved yet, just clear it locally.
        if (avatarFile) {
            form.setValue('avatar', user.avatar_url || '');
            setAvatarFile(null);
            return;
        }

        // Only call backend removal if there is an uploaded avatar on record.
        if (!user.avatar) return;

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', form.getValues('name'));
        formData.append('remove_avatar', '1');

        router.post('/admin/profile', formData, {
            forceFormData: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    // Get role display name
    const getRoleDisplay = (role: string) => {
        switch (role) {
            case 'super_admin':
                return 'Super Admin';
            case 'admin':
                return 'Admin';
            default:
                return 'User';
        }
    };

    // Get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Generate consistent color from name
    const getAvatarColor = (name: string) => {
        const colors = [
            'from-blue-500 to-purple-600',
            'from-green-500 to-teal-600',
            'from-orange-500 to-red-600',
            'from-pink-500 to-rose-600',
            'from-indigo-500 to-blue-600',
            'from-cyan-500 to-blue-600',
            'from-violet-500 to-purple-600',
            'from-amber-500 to-orange-600',
        ];

        // Generate a consistent index based on the name
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="Profile" />

            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Profile
                    </h2>
                    <p className="text-muted-foreground dark:text-zinc-400">
                        Manage your profile information and account settings
                    </p>
                </div>

                {/* Profile Stats Cards */}
                {stats && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="dark:border-zinc-800 dark:bg-black">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                            Blogs Created
                                        </p>
                                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                            {stats.blogs_count}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="dark:border-zinc-800 dark:bg-black">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                                        <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                            Testimonials Added
                                        </p>
                                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                            {stats.testimonials_count}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="dark:border-zinc-800 dark:bg-black">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                                        <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                            Total Activity
                                        </p>
                                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                            {stats.blogs_count +
                                                stats.testimonials_count}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Form */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left Column - Profile Info */}
                            <div className="space-y-6 lg:col-span-2">
                                <Card className="dark:border-zinc-800 dark:bg-black">
                                    <CardHeader>
                                        <CardTitle className="dark:text-white">
                                            Profile Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Avatar Section */}
                                        <FormField
                                            control={form.control}
                                            name="avatar"
                                            render={({ field }) => {
                                                // Get preview URL for selected file
                                                const getPreviewUrl = () => {
                                                    if (avatarFile) {
                                                        return URL.createObjectURL(
                                                            avatarFile,
                                                        );
                                                    }
                                                    if (
                                                        typeof field.value ===
                                                            'string' &&
                                                        field.value
                                                    ) {
                                                        return field.value;
                                                    }
                                                    return null;
                                                };

                                                const previewUrl =
                                                    getPreviewUrl();

                                                return (
                                                    <FormItem>
                                                        <FormLabel className="dark:text-zinc-300">
                                                            Profile Photo
                                                        </FormLabel>
                                                        <FormControl>
                                                            <div className="flex items-start gap-6">
                                                                {/* Avatar Display with Initials Fallback */}
                                                                <div className="shrink-0">
                                                                    {previewUrl ? (
                                                                        <img
                                                                            src={
                                                                                previewUrl
                                                                            }
                                                                            alt={
                                                                                user.name
                                                                            }
                                                                            className="h-24 w-24 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-700"
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(user.name)} text-2xl font-bold text-white ring-2 ring-zinc-200 dark:ring-zinc-700`}
                                                                        >
                                                                            {getInitials(
                                                                                user.name,
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Upload Controls */}
                                                                <div className="flex-1 space-y-3">
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                const input =
                                                                                    document.getElementById(
                                                                                        'avatar-upload',
                                                                                    ) as HTMLInputElement;
                                                                                input?.click();
                                                                            }}
                                                                        >
                                                                            {previewUrl
                                                                                ? 'Change Photo'
                                                                                : 'Upload Photo'}
                                                                        </Button>
                                                                        {(avatarFile ||
                                                                            user.avatar) && (
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={
                                                                                    removeAvatar
                                                                                }
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                Remove
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                    <input
                                                                        id="avatar-upload"
                                                                        type="file"
                                                                        accept="image/jpeg,image/png,image/jpg"
                                                                        className="hidden"
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            const file =
                                                                                e
                                                                                    .target
                                                                                    .files?.[0];
                                                                            if (
                                                                                !file
                                                                            )
                                                                                return;

                                                                            // Validate file type
                                                                            const validTypes =
                                                                                [
                                                                                    'image/jpeg',
                                                                                    'image/png',
                                                                                    'image/jpg',
                                                                                ];
                                                                            if (
                                                                                !validTypes.includes(
                                                                                    file.type,
                                                                                )
                                                                            ) {
                                                                                toast.error(
                                                                                    'Please upload only JPG or PNG images',
                                                                                );
                                                                                return;
                                                                            }

                                                                            // Validate file size (max 2MB)
                                                                            if (
                                                                                file.size >
                                                                                2 *
                                                                                    1024 *
                                                                                    1024
                                                                            ) {
                                                                                toast.error(
                                                                                    'File size should be less than 2MB',
                                                                                );
                                                                                return;
                                                                            }

                                                                            field.onChange(
                                                                                file,
                                                                            );
                                                                            setAvatarFile(
                                                                                file,
                                                                            );
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </FormControl>
                                                        <FormDescription className="text-xs text-zinc-500">
                                                            JPG or PNG. Max size
                                                            2MB. Image will be
                                                            automatically
                                                            cropped to 200x200px
                                                            square
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />

                                        {/* Name Field */}
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Name *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Your name"
                                                            {...field}
                                                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Email Field (Disabled) */}
                                        <FormItem>
                                            <FormLabel className="dark:text-zinc-300">
                                                Email
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    value={user.email}
                                                    disabled
                                                    className="cursor-not-allowed bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400"
                                                />
                                            </FormControl>
                                            <FormDescription className="text-xs text-zinc-500">
                                                Email cannot be changed for
                                                security reasons
                                            </FormDescription>
                                        </FormItem>
                                    </CardContent>
                                </Card>

                                {/* Password Change Section */}
                                <Card className="dark:border-zinc-800 dark:bg-black">
                                    <CardHeader>
                                        <CardTitle className="dark:text-white">
                                            Security
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                                                    <Key className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-zinc-900 dark:text-white">
                                                        Password
                                                    </p>
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                        Change your password to
                                                        keep your account secure
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    setPasswordDialogOpen(true)
                                                }
                                            >
                                                Change Password
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Account Info */}
                            <div className="space-y-6">
                                <Card className="dark:border-zinc-800 dark:bg-black">
                                    <CardHeader>
                                        <CardTitle className="text-base dark:text-white">
                                            Account Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                                Role
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                                {getRoleDisplay(user.role)}
                                            </p>
                                        </div>

                                        {user.last_login_at && (
                                            <div>
                                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                                    Last Login
                                                </p>
                                                <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                                                    {user.last_login_at}
                                                </p>
                                            </div>
                                        )}

                                        {user.created_at && (
                                            <div>
                                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                                    Member Since
                                                </p>
                                                <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                                                    {user.created_at}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? 'Updating...'
                                    : 'Update Profile'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>

            {/* Password Change Dialog */}
            <PasswordChangeDialog
                open={passwordDialogOpen}
                onOpenChange={setPasswordDialogOpen}
            />
        </AdminLayout>
    );
}
