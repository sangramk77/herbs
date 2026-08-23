import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { useForm, useWatch } from 'react-hook-form';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/AdminLayout';

interface EditBannerProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    banner: {
        id: string;
        heading1: string;
        main_heading: string;
        image: string;
        mobile_image?: string;
        description: string;
        status: boolean;
        sort_order: number;
    };
}

const formSchema = z.object({
    image: z.union([z.instanceof(File), z.string()]).optional(),
    mobile_image: z.union([z.instanceof(File), z.string()]).optional(),
    heading1: z.string().optional(),
    main_heading: z.string().optional(),
    description: z.string().optional(),
    status: z.boolean().optional(),
    sort_order: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditBanner({ auth, banner }: EditBannerProps) {
    // Construct full image URL if it's a string path
    const initialImage = banner.image
        ? banner.image.startsWith('http')
            ? banner.image
            : `/uploads/banners/${banner.image}`
        : '';
    const initialMobileImage = banner.mobile_image
        ? banner.mobile_image.startsWith('http')
            ? banner.mobile_image
            : `/uploads/banners/${banner.mobile_image}`
        : '';

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: 'all',
        defaultValues: {
            image: initialImage,
            mobile_image: initialMobileImage,
            heading1: banner.heading1 || '',
            main_heading: banner.main_heading || '',
            description: banner.description || '',
            status: banner.status ?? true,
            sort_order: banner.sort_order ?? 0,
        },
    });

    const watchedImage = useWatch({ control: form.control, name: 'image' });
    const watchedMobileImage = useWatch({
        control: form.control,
        name: 'mobile_image',
    });

    const onSubmit = (data: FormValues) => {
        // Use POST with _method: 'put' for file uploads to work correctly in Laravel
        router.post(
            `/admin/cms/banner/${banner.id}`,
            {
                ...data,
                _method: 'put',
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Redirect handled by controller
                },
                onError: (errors) => {
                    console.error('Submission error:', errors);
                    // Set form errors from backend validation
                    Object.keys(errors).forEach((key) => {
                        form.setError(key as any, {
                            type: 'manual',
                            message: errors[key] as string,
                        });
                    });
                },
            },
        );
    };

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="Edit Banner" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Edit Banner
                        </h2>
                        <p className="text-muted-foreground dark:text-zinc-400">
                            Update banner information
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
                                {/* Live Image Preview */}
                                {(watchedImage instanceof File ||
                                    (typeof watchedImage === 'string' &&
                                        watchedImage.length > 0)) && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium dark:text-zinc-300">
                                            {watchedImage instanceof File
                                                ? 'New Image Preview'
                                                : 'Current Image'}
                                        </label>
                                        <div className="overflow-hidden rounded-md border border-gray-200 dark:border-zinc-700">
                                            <img
                                                src={
                                                    watchedImage instanceof File
                                                        ? URL.createObjectURL(
                                                              watchedImage,
                                                          )
                                                        : watchedImage
                                                }
                                                alt="Banner Preview"
                                                className="h-48 w-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}

                                {(watchedMobileImage instanceof File ||
                                    (typeof watchedMobileImage === 'string' &&
                                        watchedMobileImage.length > 0)) && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium dark:text-zinc-300">
                                            {watchedMobileImage instanceof File
                                                ? 'New Mobile Image Preview'
                                                : 'Current Mobile Image'}
                                        </label>
                                        <div className="overflow-hidden rounded-md border border-gray-200 dark:border-zinc-700">
                                            <img
                                                src={
                                                    watchedMobileImage instanceof
                                                    File
                                                        ? URL.createObjectURL(
                                                              watchedMobileImage,
                                                          )
                                                        : watchedMobileImage
                                                }
                                                alt="Mobile Banner Preview"
                                                className="h-48 w-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}

                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="dark:text-zinc-300">
                                                Banner Image (Optional - leave
                                                empty to keep current)
                                            </FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    onRemove={() =>
                                                        field.onChange('')
                                                    }
                                                    label="Choose New File"
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
                                                Mobile Banner Image (Optional -
                                                leave empty to keep current)
                                            </FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    onRemove={() =>
                                                        field.onChange('')
                                                    }
                                                    label="Choose New Mobile File"
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
                                                        field.onChange(
                                                            e.target.value,
                                                        );
                                                    }}
                                                    className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                />
                                            </FormControl>
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
                                                        value={
                                                            field.value || ''
                                                        }
                                                        onChange={(val) => {
                                                            const newValue =
                                                                val ?? '';
                                                            field.onChange(
                                                                newValue,
                                                            );
                                                        }}
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
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    router.visit('/admin/cms/banner')
                                }
                            >
                                Cancel
                            </Button>
                            <Button type="submit" size="lg">
                                Update Banner
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </AdminLayout>
    );
}
