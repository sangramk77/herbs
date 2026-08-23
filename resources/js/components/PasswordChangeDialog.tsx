import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface PasswordChangeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Password strength calculation
const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
    };

    if (checks.length) strength += 25;
    if (checks.uppercase) strength += 25;
    if (checks.lowercase) strength += 25;
    if (checks.number) strength += 25;

    return { strength, checks };
};

const getStrengthLabel = (strength: number) => {
    if (strength === 0) return 'None';
    if (strength <= 25) return 'Weak';
    if (strength <= 50) return 'Fair';
    if (strength <= 75) return 'Good';
    return 'Strong';
};

const getStrengthColor = (strength: number) => {
    if (strength === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (strength <= 25) return 'bg-red-500';
    if (strength <= 50) return 'bg-yellow-500';
    if (strength <= 75) return 'bg-blue-500';
    return 'bg-green-500';
};

const formSchema = z
    .object({
        current_password: z.string().min(1, 'Current password is required'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(
                /[A-Z]/,
                'Password must contain at least one uppercase letter',
            )
            .regex(
                /[a-z]/,
                'Password must contain at least one lowercase letter',
            )
            .regex(/[0-9]/, 'Password must contain at least one number'),
        password_confirmation: z
            .string()
            .min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Passwords do not match',
        path: ['password_confirmation'],
    });

type FormValues = z.infer<typeof formSchema>;

export default function PasswordChangeDialog({
    open,
    onOpenChange,
}: PasswordChangeDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            current_password: '',
            password: '',
            password_confirmation: '',
        },
    });

    const watchPassword = form.watch('password');
    const watchConfirmPassword = form.watch('password_confirmation');
    const { strength, checks } = calculatePasswordStrength(watchPassword || '');
    const passwordsMatch =
        watchPassword &&
        watchConfirmPassword &&
        watchPassword === watchConfirmPassword;

    const onSubmit = (data: FormValues) => {
        setIsSubmitting(true);

        router.post('/admin/profile/password', data, {
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                const firstError = Object.values(errors)[0];
                if (firstError) {
                    toast.error(String(firstError));
                } else {
                    toast.error('Failed to change password. Please try again.');
                }
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleClose = () => {
        form.reset();
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-125 dark:border-zinc-800 dark:bg-black">
                <DialogHeader>
                    <DialogTitle className="dark:text-white">
                        Change Password
                    </DialogTitle>
                    <DialogDescription className="dark:text-zinc-400">
                        Enter your current password and choose a new secure
                        password.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        {/* Current Password */}
                        <FormField
                            control={form.control}
                            name="current_password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="dark:text-zinc-300">
                                        Current Password
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={
                                                    showCurrentPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                placeholder="Enter current password"
                                                {...field}
                                                className="pr-10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowCurrentPassword(
                                                        !showCurrentPassword,
                                                    )
                                                }
                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* New Password */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="dark:text-zinc-300">
                                        New Password
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={
                                                    showNewPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                placeholder="Enter new password"
                                                {...field}
                                                className="pr-10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowNewPassword(
                                                        !showNewPassword,
                                                    )
                                                }
                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>

                                    {/* Password Strength Meter */}
                                    {watchPassword && (
                                        <div className="mt-2 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    Password Strength:
                                                </span>
                                                <span
                                                    className={`text-xs font-medium ${
                                                        strength <= 25
                                                            ? 'text-red-500'
                                                            : strength <= 50
                                                              ? 'text-yellow-500'
                                                              : strength <= 75
                                                                ? 'text-blue-500'
                                                                : 'text-green-500'
                                                    }`}
                                                >
                                                    {getStrengthLabel(strength)}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                                <div
                                                    className={`h-full transition-all duration-300 ${getStrengthColor(strength)}`}
                                                    style={{
                                                        width: `${strength}%`,
                                                    }}
                                                />
                                            </div>

                                            {/* Requirements Checklist */}
                                            <div className="space-y-1 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/50">
                                                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                    Password Requirements:
                                                </p>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        {checks.length ? (
                                                            <Check className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <X className="h-3 w-3 text-red-500" />
                                                        )}
                                                        <span
                                                            className={`text-xs ${
                                                                checks.length
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-zinc-500 dark:text-zinc-400'
                                                            }`}
                                                        >
                                                            At least 8
                                                            characters
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {checks.uppercase ? (
                                                            <Check className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <X className="h-3 w-3 text-red-500" />
                                                        )}
                                                        <span
                                                            className={`text-xs ${
                                                                checks.uppercase
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-zinc-500 dark:text-zinc-400'
                                                            }`}
                                                        >
                                                            One uppercase letter
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {checks.lowercase ? (
                                                            <Check className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <X className="h-3 w-3 text-red-500" />
                                                        )}
                                                        <span
                                                            className={`text-xs ${
                                                                checks.lowercase
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-zinc-500 dark:text-zinc-400'
                                                            }`}
                                                        >
                                                            One lowercase letter
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {checks.number ? (
                                                            <Check className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <X className="h-3 w-3 text-red-500" />
                                                        )}
                                                        <span
                                                            className={`text-xs ${
                                                                checks.number
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-zinc-500 dark:text-zinc-400'
                                                            }`}
                                                        >
                                                            One number
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Confirm Password */}
                        <FormField
                            control={form.control}
                            name="password_confirmation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="dark:text-zinc-300">
                                        Confirm New Password
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={
                                                    showConfirmPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                placeholder="Confirm new password"
                                                {...field}
                                                className="pr-10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword,
                                                    )
                                                }
                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>

                                    {/* Password Match Indicator */}
                                    {watchConfirmPassword && (
                                        <div className="mt-2">
                                            {passwordsMatch ? (
                                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                    <Check className="h-4 w-4" />
                                                    <span className="text-xs font-medium">
                                                        Passwords match
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-red-500">
                                                    <X className="h-4 w-4" />
                                                    <span className="text-xs font-medium">
                                                        Passwords do not match
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? 'Changing Password...'
                                    : 'Change Password'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
