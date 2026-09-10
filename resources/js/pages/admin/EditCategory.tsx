import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';

const formSchema = z.object({
    name: z.string().min(1, 'Category name is required').max(255),
    description: z.string().max(500).optional(),
    status: z.enum(['active', 'inactive']),
    sort_order: z.string().optional(),
    image: z.any().optional(),
    video: z.any().optional(),
    banner: z.any().optional(),
    show_video: z.boolean(),
    show_banner: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    status: 'active' | 'inactive';
    sort_order: number;
    products_count: number;
    image_url?: string | null;
    video_url?: string | null;
    banner_url?: string | null;
    show_video: boolean;
    show_banner: boolean;
}

interface EditCategoryProps {
    category: Category;
    auth?: {
        user?: {
            name: string;
        };
    };
    errors?: {
        [key: string]: string;
    };
}

export default function EditCategory({
    category,
    auth,
    errors,
}: EditCategoryProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: category.name,
            description: category.description || '',
            status: category.status,
            sort_order: category.sort_order.toString(),
            show_video: category.show_video,
            show_banner: category.show_banner,
        },
    });
    const [removeImage, setRemoveImage] = useState(false);
    const [removeVideo, setRemoveVideo] = useState(false);
    const [removeBanner, setRemoveBanner] = useState(false);

    const onSubmit = (data: FormValues) => {
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        formData.append('status', data.status);
        if (data.sort_order) formData.append('sort_order', data.sort_order);
        if (data.image && data.image[0]) {
            formData.append('image', data.image[0]);
        }
        if (data.video && data.video[0])
            formData.append('video', data.video[0]);
        if (data.banner && data.banner[0])
            formData.append('banner', data.banner[0]);
        formData.append('show_video', data.show_video ? '1' : '0');
        formData.append('show_banner', data.show_banner ? '1' : '0');
        if (removeImage) formData.append('remove_image', '1');
        if (removeVideo) formData.append('remove_video', '1');
        if (removeBanner) formData.append('remove_banner', '1');
        formData.append('_method', 'PUT');

        router.post(`/admin/categories/${category.id}`, formData, {
            onSuccess: () => {
                toast.success('Category updated successfully');
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('Failed to update category');
            },
            forceFormData: true,
        });
    };

    return (
        <AdminLayout userName={auth?.user?.name}>
            <Head title={`Edit ${category.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.visit('/admin/categories')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Edit Category
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Update category details
                        </p>
                    </div>
                </div>

                {/* Info Alert */}
                {category.products_count > 0 && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            This category has {category.products_count}{' '}
                            product(s) attached.
                        </p>
                    </div>
                )}

                {/* Error Display */}
                {errors && Object.keys(errors).length > 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" />
                            <div className="flex-1">
                                <p className="mb-1 text-sm font-medium text-red-800 dark:text-red-200">
                                    Please fix the following errors:
                                </p>
                                <ul className="list-inside list-disc text-sm text-red-700 dark:text-red-300">
                                    {Object.entries(errors).map(
                                        ([key, error]) => (
                                            <li key={key}>{error}</li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="rounded-lg border bg-white p-6 dark:bg-zinc-900">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="dark:text-zinc-300">
                                            Category Name *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter category name"
                                                {...field}
                                                className="dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Slug:</strong> {category.slug}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                    The slug is auto-generated and cannot be
                                    changed
                                </p>
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="dark:text-zinc-300">
                                            Description
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter category description"
                                                {...field}
                                                className="dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                            />
                                        </FormControl>
                                        <FormDescription className="dark:text-zinc-500">
                                            Optional description for the
                                            category
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="dark:text-zinc-300">
                                                Status *
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="active">
                                                        Active
                                                    </SelectItem>
                                                    <SelectItem value="inactive">
                                                        Inactive
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="sort_order"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="dark:text-zinc-300">
                                                Sort Order
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    className="dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                                />
                                            </FormControl>
                                            <FormDescription className="dark:text-zinc-500">
                                                Lower numbers appear first
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field: { onChange, ...field } }) => (
                                    <FormItem>
                                        <FormLabel className="dark:text-zinc-300">
                                            Category Image
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) =>
                                                    onChange(e.target.files)
                                                }
                                                {...field}
                                                className="dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                            />
                                        </FormControl>
                                        <FormDescription className="dark:text-zinc-500">
                                            Upload a new image to replace the
                                            existing one (JPG, PNG, WebP, max
                                            2MB)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {category.image_url && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setRemoveImage((value) => !value)
                                    }
                                >
                                    {removeImage
                                        ? 'Keep Current Image'
                                        : 'Remove Current Image'}
                                </Button>
                            )}
                            <FormField
                                control={form.control}
                                name="show_video"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-4 dark:border-zinc-700">
                                        <div>
                                            <FormLabel>
                                                Show category video
                                            </FormLabel>
                                            <FormDescription>
                                                Display the optional category
                                                video.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="video"
                                render={({ field: { onChange, ...field } }) => (
                                    <FormItem>
                                        <FormLabel>Category Video</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm"
                                                onChange={(event) => {
                                                    setRemoveVideo(false);
                                                    onChange(
                                                        event.target.files,
                                                    );
                                                }}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Upload a replacement video (max
                                            100MB).
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {category.video_url && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setRemoveVideo((value) => !value)
                                    }
                                >
                                    {removeVideo
                                        ? 'Keep Current Video'
                                        : 'Remove Current Video'}
                                </Button>
                            )}
                            <FormField
                                control={form.control}
                                name="show_banner"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-4 dark:border-zinc-700">
                                        <div>
                                            <FormLabel>
                                                Show category banner
                                            </FormLabel>
                                            <FormDescription>
                                                Display this category's banner
                                                above its products.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="banner"
                                render={({ field: { onChange, ...field } }) => (
                                    <FormItem>
                                        <FormLabel>Category Banner</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={(event) => {
                                                    setRemoveBanner(false);
                                                    onChange(
                                                        event.target.files,
                                                    );
                                                }}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Upload a replacement banner (max
                                            5MB).
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {category.banner_url && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setRemoveBanner((value) => !value)
                                    }
                                >
                                    {removeBanner
                                        ? 'Keep Current Banner'
                                        : 'Remove Current Banner'}
                                </Button>
                            )}

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.visit('/admin/categories')
                                    }
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">Update Category</Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </AdminLayout>
    );
}
