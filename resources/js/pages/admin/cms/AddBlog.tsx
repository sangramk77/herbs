import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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

interface AddBlogProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
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

export default function AddBlog({ auth }: AddBlogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [showAiModal, setShowAiModal] = useState(false);
    const bypassNavigationGuardRef = useRef(false);
    const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const [pendingNavigationUrl, setPendingNavigationUrl] = useState<
        string | null
    >(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            blog_title: '',
            thumbnail: '',
            banner: '',
            publish_date: format(new Date(), 'yyyy-MM-dd'),
            post_by: '',
            description: '',
            description_json: null,
            meta_title: '',
            meta_description: '',
            seo_url: '',
            meta_keyword: '',
        },
    });
    const hasUnsavedChanges =
        form.formState.isDirty || thumbnailFile !== null || bannerFile !== null;

    useEffect(() => {
        const removeBeforeListener = router.on('before', (event) => {
            if (bypassNavigationGuardRef.current) {
                bypassNavigationGuardRef.current = false;
                return;
            }

            if (!hasUnsavedChanges || isSubmitting) {
                return;
            }

            event.preventDefault();
            setPendingNavigationUrl(event.detail.visit.url.pathname);
            setLeaveConfirmOpen(true);
        });

        return () => {
            removeBeforeListener();
        };
    }, [hasUnsavedChanges, isSubmitting]);

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

        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }
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

        router.post('/admin/cms/blog', formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Blog created successfully');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error('Failed to create blog. Please check the form.');
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleAiGenerate = (data: GeneratedBlogData) => {
        // Populate form with AI-generated content
        form.setValue('blog_title', data.title, { shouldDirty: true });
        form.setValue('description', data.content, { shouldDirty: true });
        form.setValue('meta_title', data.title, { shouldDirty: true });
        form.setValue('meta_description', data.meta_description, {
            shouldDirty: true,
        });
        form.setValue('meta_keyword', data.keywords.join(', '), {
            shouldDirty: true,
        });

        toast.success('AI content loaded! Review and edit as needed.');
    };

    const handleCancel = () => {
        if (hasUnsavedChanges) {
            setPendingNavigationUrl('/admin/cms/blog');
            setLeaveConfirmOpen(true);
            return;
        }

        bypassNavigationGuardRef.current = true;
        router.visit('/admin/cms/blog');
    };

    const handleConfirmLeave = () => {
        if (!pendingNavigationUrl) {
            setLeaveConfirmOpen(false);
            return;
        }

        bypassNavigationGuardRef.current = true;
        setLeaveConfirmOpen(false);
        router.visit(pendingNavigationUrl);
        setPendingNavigationUrl(null);
    };

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="Add Blog" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Add Blog
                        </h2>
                        <p className="text-muted-foreground dark:text-zinc-400">
                            Create a new blog post
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
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
                                                        Thumbnail *
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
                                                        Banner *
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
                                                            Publish Date *
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
                                                            Post By *
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
                                                                    {
                                                                        shouldDirty:
                                                                            true,
                                                                    },
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
                                                        Meta Title *
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
                                                        Meta Description *
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
                                                        Seo Url *
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
                                {isSubmitting ? 'Creating...' : 'Create Blog'}
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

            <ConfirmDialog
                open={leaveConfirmOpen}
                onOpenChange={setLeaveConfirmOpen}
                onConfirm={handleConfirmLeave}
                title="Discard blog draft?"
                description="The draft will be lost. Are you sure you want to leave this page?"
                confirmText="Leave page"
                cancelText="Stay here"
            />
        </AdminLayout>
    );
}
