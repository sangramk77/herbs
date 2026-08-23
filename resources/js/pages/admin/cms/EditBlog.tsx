import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import AiBlogGeneratorModal, {
    GeneratedBlogData,
} from '@/components/admin/AiBlogGeneratorModal';
import BlogEditor from '@/components/admin/BlogEditor';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import AdminLayout from '@/layouts/AdminLayout';
import { cn } from '@/lib/utils';

interface Blog {
    id: string;
    blog_title: string;
    blog_category_id?: string;
    description: string;
    description_json?: object | null;
    post_by?: string;
    meta_title?: string;
    meta_keyword?: string;
    meta_description?: string;
    thumbnail?: string;
    banner?: string;
    publish_date?: string;
    status: boolean;
    seo_url?: string;
}

interface EditBlogProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    blog: Blog;
}

const formSchema = z.object({
    blog_title: z.string().min(1, 'Blog title is required'),
    thumbnail: z.any().optional(),
    banner: z.any().optional(),
    publish_date: z.string().optional(),
    post_by: z.string().optional(),
    description: z.string().min(1, 'Description is required'),
    description_json: z.any().optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    seo_url: z.string().optional(),
    meta_keyword: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditBlog({ auth, blog }: EditBlogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [showAiModal, setShowAiModal] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            blog_title: blog.blog_title || '',
            thumbnail: blog.thumbnail
                ? `/uploads/blogs/thumbnails/${blog.thumbnail}`
                : '',
            banner: blog.banner ? `/uploads/blogs/banners/${blog.banner}` : '',
            publish_date: blog.publish_date
                ? new Date(blog.publish_date).toISOString().split('T')[0]
                : format(new Date(), 'yyyy-MM-dd'),
            post_by: blog.post_by || '',
            description: blog.description || '',
            description_json: blog.description_json || null,
            meta_title: blog.meta_title || '',
            meta_description: blog.meta_description || '',
            seo_url: blog.seo_url || '',
            meta_keyword: blog.meta_keyword || '',
        },
    });

    const onSubmit = (data: FormValues) => {
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('blog_title', data.blog_title);
        formData.append('description', data.description);
        if (data.description_json) {
            formData.append(
                'description_json',
                JSON.stringify(data.description_json),
            );
        }
        formData.append('_method', 'PUT');

        // Only append thumbnail if a new file was selected
        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        // Only append banner if a new file was selected
        if (bannerFile) {
            formData.append('banner', bannerFile);
        }

        if (data.publish_date) {
            formData.append('publish_date', data.publish_date);
        }
        if (data.post_by) {
            formData.append('post_by', data.post_by);
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

        router.post(`/admin/cms/blog/${blog.id}`, formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Blog updated successfully');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error('Failed to update blog. Please check the form.');
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleAiGenerate = (data: GeneratedBlogData) => {
        // Populate form with AI-generated content
        form.setValue('blog_title', data.title);
        form.setValue('description', data.content);
        form.setValue('meta_title', data.title);
        form.setValue('meta_description', data.meta_description);
        form.setValue('meta_keyword', data.keywords.join(', '));

        toast.success('AI content loaded! Review and edit as needed.');
    };

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="Edit Blog" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Edit Blog
                        </h2>
                        <p className="text-muted-foreground dark:text-zinc-400">
                            Update the blog post
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/admin/cms/blog')}
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
                                            Blog Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="blog_title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Blog Title *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Blog Title"
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
                                            name="thumbnail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Thumbnail
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
                                                                    setThumbnailFile(
                                                                        value,
                                                                    );
                                                                }
                                                            }}
                                                            onRemove={() => {
                                                                field.onChange(
                                                                    '',
                                                                );
                                                                setThumbnailFile(
                                                                    null,
                                                                );
                                                            }}
                                                            label="Choose Thumbnail"
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
                                            name="banner"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Banner
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
                                                                    setBannerFile(
                                                                        value,
                                                                    );
                                                                }
                                                            }}
                                                            onRemove={() => {
                                                                field.onChange(
                                                                    '',
                                                                );
                                                                setBannerFile(
                                                                    null,
                                                                );
                                                            }}
                                                            label="Choose Banner"
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

                                        <div className="grid gap-6 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="publish_date"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="dark:text-zinc-300">
                                                            Publish Date
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Popover>
                                                                <PopoverTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        className={cn(
                                                                            'w-full justify-start text-left font-normal dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100',
                                                                            !field.value &&
                                                                                'text-muted-foreground dark:text-zinc-500',
                                                                        )}
                                                                    >
                                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                                        {field.value ? (
                                                                            format(
                                                                                new Date(
                                                                                    `${field.value}T00:00:00`,
                                                                                ),
                                                                                'dd/MM/yyyy',
                                                                            )
                                                                        ) : (
                                                                            <span>
                                                                                Pick
                                                                                a
                                                                                date
                                                                            </span>
                                                                        )}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent
                                                                    className="w-auto p-0 dark:border-zinc-800 dark:bg-black"
                                                                    align="start"
                                                                >
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={
                                                                            field.value
                                                                                ? new Date(
                                                                                      `${field.value}T00:00:00`,
                                                                                  )
                                                                                : undefined
                                                                        }
                                                                        onSelect={(
                                                                            date,
                                                                        ) => {
                                                                            if (
                                                                                date
                                                                            ) {
                                                                                // Format date manually to avoid timezone issues
                                                                                const year =
                                                                                    date.getFullYear();
                                                                                const month =
                                                                                    String(
                                                                                        date.getMonth() +
                                                                                            1,
                                                                                    ).padStart(
                                                                                        2,
                                                                                        '0',
                                                                                    );
                                                                                const day =
                                                                                    String(
                                                                                        date.getDate(),
                                                                                    ).padStart(
                                                                                        2,
                                                                                        '0',
                                                                                    );
                                                                                field.onChange(
                                                                                    `${year}-${month}-${day}`,
                                                                                );
                                                                            } else {
                                                                                field.onChange(
                                                                                    '',
                                                                                );
                                                                            }
                                                                        }}
                                                                        disabled={(
                                                                            date,
                                                                        ) =>
                                                                            date >
                                                                            new Date()
                                                                        }
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="post_by"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="dark:text-zinc-300">
                                                            Post By
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Post By"
                                                                {...field}
                                                                className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="dark:text-zinc-300">
                                                            Description *
                                                        </FormLabel>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                setShowAiModal(
                                                                    true,
                                                                )
                                                            }
                                                            className="gap-2"
                                                        >
                                                            <Sparkles className="h-4 w-4 text-amber-500" />
                                                            Generate with AI
                                                        </Button>
                                                    </div>
                                                    <FormControl>
                                                        <BlogEditor
                                                            value={field.value}
                                                            valueJson={
                                                                blog.description_json
                                                            }
                                                            onChange={(
                                                                data,
                                                            ) => {
                                                                field.onChange(
                                                                    data.html ||
                                                                        '',
                                                                );
                                                                form.setValue(
                                                                    'description_json',
                                                                    data.json,
                                                                );
                                                            }}
                                                            height={400}
                                                        />
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
                                {isSubmitting ? 'Updating...' : 'Update Blog'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>

            {/* AI Blog Generator Modal */}
            <AiBlogGeneratorModal
                open={showAiModal}
                onOpenChange={setShowAiModal}
                onGenerate={handleAiGenerate}
            />
        </AdminLayout>
    );
}
