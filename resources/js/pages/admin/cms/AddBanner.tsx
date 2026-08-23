import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { ImageUpload } from '@/components/admin/ImageUpload';
import LazyMDEditor from '@/components/admin/lazy-md-editor';
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

interface AddBannerProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
}

const formSchema = z.object({
    image: z
        .union([
            z.instanceof(File),
            z.string().min(1, 'Banner image is required'),
        ])
        .refine((val) => {
            if (val instanceof File) return true;
            if (typeof val === 'string' && val.length > 0) return true;
            return false;
        }, 'Banner image is required'),
    heading1: z.string().optional(),
    main_heading: z.string().optional(),
    mobile_image: z.union([z.instanceof(File), z.string()]).optional(),
    description: z.string().optional(),
    status: z.boolean().optional(),
    sort_order: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddBanner({ auth }: AddBannerProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: 'all', // changed from onSubmit to all for better debugging
        defaultValues: {
            image: '',
            mobile_image: '',
            heading1: '',
            main_heading: '',
            description: '',
            status: true,
            sort_order: 0,
        },
    });

    const onSubmit = (data: FormValues) => {
        // ... (keep existing onSubmit)
        console.log('Final form submission:', data);
        router.post('/admin/cms/banner', data, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
            },
            onError: (errors) => {
                console.error('Submission error:', errors);
                // ... (keep existing onError)
            },
        });
    };

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="Add Banner" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Add Banner
                        </h2>
                        <p className="text-muted-foreground dark:text-zinc-400">
                            Create a new banner for your website
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/admin/cms/banner')}
                    >
                        Cancel
                    </Button>
                </div>

                {/* Form */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(
                            (data) => {
                                console.log('Form submitting with data:', data);
                                onSubmit(data);
                            },
                            (errors) => {
                                console.error(
                                    'Form validation failed:',
                                    errors,
                                );
                            },
                        )}
                        className="space-y-6"
                    >
                        <Card className="dark:border-zinc-800 dark:bg-black">
                            <CardHeader>
                                <CardTitle className="dark:text-white">
                                    Banner Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="dark:text-zinc-300">
                                                Banner Image *
                                            </FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    onRemove={() =>
                                                        field.onChange('')
                                                    }
                                                    label="Choose File"
                                                />
                                            </FormControl>
                                            <FormDescription className="text-orange-600 dark:text-orange-400">
                                                Use JPG, PNG, or WebP. Recommended
                                                size: 2800 x 1100 (ratio 2.55:1)
                                            </FormDescription>
                                            {form.formState.errors.image && (
                                                <p className="text-sm font-medium text-red-600">
                                                    {
                                                        form.formState.errors
                                                            .image.message
                                                    }
                                                </p>
                                            )}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="mobile_image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="dark:text-zinc-300">
                                                Mobile Banner Image (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    onRemove={() =>
                                                        field.onChange('')
                                                    }
                                                    label="Choose Mobile File"
                                                />
                                            </FormControl>
                                            <FormDescription className="text-orange-600 dark:text-orange-400">
                                                Use JPG, PNG, or WebP. Recommended
                                                size: 1200 x 820 (ratio 1.46:1)
                                            </FormDescription>
                                            {form.formState.errors
                                                .mobile_image && (
                                                <p className="text-sm font-medium text-red-600">
                                                    {
                                                        form.formState.errors
                                                            .mobile_image
                                                            .message
                                                    }
                                                </p>
                                            )}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="heading1"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="dark:text-zinc-300">
                                                Banner Heading
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Banner Heading"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const val =
                                                            e.target.value;
                                                        console.log(
                                                            'Heading1 manual change:',
                                                            val,
                                                        );
                                                        field.onChange(val);
                                                    }}
                                                    className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            {form.formState.errors.heading1 && (
                                                <p className="text-sm font-medium text-red-600">
                                                    {
                                                        form.formState.errors
                                                            .heading1.message
                                                    }
                                                </p>
                                            )}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="main_heading"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="dark:text-zinc-300">
                                                Main Heading
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Main Heading"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(
                                                            e.target.value,
                                                        );
                                                    }}
                                                    className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                />
                                            </FormControl>
                                            {form.formState.errors
                                                .main_heading && (
                                                <p className="text-sm font-medium text-red-600">
                                                    {
                                                        form.formState.errors
                                                            .main_heading
                                                            .message
                                                    }
                                                </p>
                                            )}
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="dark:text-zinc-300">
                                                Description
                                            </FormLabel>
                                            <FormControl>
                                                <div data-color-mode="auto">
                                                    <LazyMDEditor
                                                        value={field.value}
                                                        onChange={(val) =>
                                                            field.onChange(
                                                                val || '',
                                                            )
                                                        }
                                                        height={300}
                                                        preview="edit"
                                                    />
                                                </div>
                                            </FormControl>
                                            {form.formState.errors
                                                .description && (
                                                <p className="text-sm font-medium text-red-600">
                                                    {
                                                        form.formState.errors
                                                            .description.message
                                                    }
                                                </p>
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button type="submit" size="lg">
                                Create Banner
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </AdminLayout>
    );
}
