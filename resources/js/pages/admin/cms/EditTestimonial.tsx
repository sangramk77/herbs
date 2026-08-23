import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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

interface Testimonial {
    id: string;
    name: string;
    designation?: string;
    description: string;
    image?: string;
    status: boolean;
    seo_url?: string;
    meta_title?: string;
    meta_keyword?: string;
    meta_description?: string;
}

interface EditTestimonialProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    testimonial: Testimonial;
}

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    designation: z.string().optional(),
    image: z.any().optional(),
    description: z.string().min(1, 'Description is required'),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    seo_url: z.string().optional(),
    meta_keyword: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditTestimonial({
    auth,
    testimonial,
}: EditTestimonialProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: testimonial.name || '',
            designation: testimonial.designation || '',
            image: testimonial.image
                ? `/uploads/testimonials/${testimonial.image}`
                : '',
            description: testimonial.description || '',
            meta_title: testimonial.meta_title || '',
            meta_description: testimonial.meta_description || '',
            seo_url: testimonial.seo_url || '',
            meta_keyword: testimonial.meta_keyword || '',
        },
    });

    const onSubmit = (data: FormValues) => {
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('_method', 'PUT');

        // Only append image if a new file was selected
        if (imageFile) {
            formData.append('image', imageFile);
        }

        if (data.designation) {
            formData.append('designation', data.designation);
        }
        if (data.meta_title) {
            formData.append('meta_title', data.meta_title);
        }
        if (data.meta_description) {
            formData.append('meta_description', data.meta_description);
        }
        if (data.seo_url) {
            formData.append('seo_url', data.seo_url);
        }
        if (data.meta_keyword) {
            formData.append('meta_keyword', data.meta_keyword);
        }

        router.post(`/admin/cms/testimonial/${testimonial.id}`, formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Testimonial updated successfully');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error(
                    'Failed to update testimonial. Please check the form.',
                );
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="Edit Testimonial" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Edit Testimonial
                        </h2>
                        <p className="text-muted-foreground dark:text-zinc-400">
                            Update the testimonial
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/admin/cms/testimonial')}
                    >
                        Cancel
                    </Button>
                </div>

                {/* Form */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Left Column - Main Content */}
                            <div className="space-y-6 lg:col-span-2">
                                <Card className="dark:border-zinc-800 dark:bg-black">
                                    <CardHeader>
                                        <CardTitle className="dark:text-white">
                                            Testimonial Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
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
                                                            placeholder="Name"
                                                            {...field}
                                                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="designation"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Designation
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Designation"
                                                            {...field}
                                                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="image"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Image
                                                    </FormLabel>
                                                    <FormControl>
                                                        <ImageUpload
                                                            value={field.value}
                                                            onChange={(
                                                                value,
                                                            ) => {
                                                                field.onChange(
                                                                    value,
                                                                );
                                                                if (
                                                                    value instanceof
                                                                    File
                                                                ) {
                                                                    setImageFile(
                                                                        value,
                                                                    );
                                                                }
                                                            }}
                                                            onRemove={() => {
                                                                field.onChange(
                                                                    '',
                                                                );
                                                                setImageFile(
                                                                    null,
                                                                );
                                                            }}
                                                            label="Choose Image"
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-red-500">
                                                        Only JPG,png files are
                                                        acceptable
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Description *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div data-color-mode="auto">
                                                            <LazyMDEditor
                                                                value={
                                                                    field.value
                                                                }
                                                                onChange={(
                                                                    val,
                                                                ) =>
                                                                    field.onChange(
                                                                        val ||
                                                                            '',
                                                                    )
                                                                }
                                                                height={300}
                                                                preview="edit"
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - SEO */}
                            <div className="space-y-6">
                                <Card className="dark:border-zinc-800 dark:bg-black">
                                    <CardHeader>
                                        <CardTitle className="text-base dark:text-white">
                                            Search engine listing preview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="meta_title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Meta Title
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Meta Title"
                                                            {...field}
                                                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="meta_description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Meta Description
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="First Description"
                                                            {...field}
                                                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="seo_url"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Seo Url
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Seo Url"
                                                            {...field}
                                                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="meta_keyword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Meta Keyword
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Meta Keyword"
                                                            {...field}
                                                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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
                                    : 'Update Testimonial'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </AdminLayout>
    );
}
