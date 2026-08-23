import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { useForm, useWatch } from 'react-hook-form';
import * as z from 'zod';

import BlogEditor from '@/components/admin/BlogEditor';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AdminLayout from '@/layouts/AdminLayout';

interface EditCMSPageProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    page: {
        id: string;
        pageName: string;
        heading?: string | null;
        description?: string | null;
        description_json?: any;
        image?: string | null;
        onFooter: 'yes' | 'no';
        onTopNav: 'yes' | 'no';
        metaTitle?: string | null;
        metaDescription?: string | null;
        metaKeyword?: string | null;
        seoUrl?: string | null;
    };
}

const formSchema = z.object({
    pageName: z.string().min(1, 'Page name is required'),
    heading: z.string().optional(),
    image: z
        .union([z.instanceof(File), z.string()])
        .optional()
        .refine(
            (value) => {
                if (!value || typeof value === 'string') return true;
                const allowed = ['image/jpeg', 'image/png', 'image/webp'];
                return (
                    allowed.includes(value.type) &&
                    value.size <= 2 * 1024 * 1024
                );
            },
            {
                message: 'Only JPG/PNG/WebP images up to 2MB are allowed',
            },
        ),
    onFooter: z.enum(['yes', 'no']),
    onTopNav: z.enum(['yes', 'no']),
    description: z.string().optional(),
    description_json: z.any().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    seoUrl: z.string().optional(),
    metaKeyword: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditCMSPage({ auth, page }: EditCMSPageProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            pageName: page.pageName,
            heading: page.heading ?? '',
            image: page.image ?? undefined,
            onFooter: page.onFooter ?? 'yes',
            onTopNav: page.onTopNav ?? 'no',
            description: page.description ?? '',
            description_json: page.description_json || null,
            metaTitle: page.metaTitle ?? '',
            metaDescription: page.metaDescription ?? '',
            seoUrl: page.seoUrl ?? '',
            metaKeyword: page.metaKeyword ?? '',
        },
    });
    const descriptionJson =
        useWatch({ control: form.control, name: 'description_json' }) ?? null;

    const onSubmit = (data: FormValues) => {
        const formData = new FormData();
        formData.append('pageName', data.pageName);
        if (data.heading) formData.append('heading', data.heading);
        if (data.description) formData.append('description', data.description);
        if (data.description_json) {
            formData.append(
                'description_json',
                JSON.stringify(data.description_json),
            );
        }
        if (data.onFooter) formData.append('onFooter', data.onFooter);
        if (data.onTopNav) formData.append('onTopNav', data.onTopNav);
        if (data.metaTitle) formData.append('metaTitle', data.metaTitle);
        if (data.metaDescription)
            formData.append('metaDescription', data.metaDescription);
        if (data.metaKeyword) formData.append('metaKeyword', data.metaKeyword);
        if (data.seoUrl) formData.append('seoUrl', data.seoUrl);
        if (data.image instanceof File) formData.append('image', data.image);

        router.post(`/admin/cms/pages/${page.id}`, formData, {
            forceFormData: true,
            onError: (errors) => {
                Object.entries(errors).forEach(([key, message]) => {
                    form.setError(key as keyof FormValues, {
                        type: 'server',
                        message: String(message),
                    });
                });
            },
        });
    };

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="Edit CMS Page" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Edit CMS Page
                        </h2>
                        <p className="text-muted-foreground dark:text-zinc-400">
                            Update content page details
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/admin/cms/pages')}
                    >
                        Cancel
                    </Button>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="space-y-6 lg:col-span-2">
                                <Card className="dark:border-zinc-800 dark:bg-black">
                                    <CardHeader>
                                        <CardTitle className="dark:text-white">
                                            Page Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="pageName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Page Name *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Page Name"
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
                                            name="heading"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Heading
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Heading"
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
                                                            onChange={
                                                                field.onChange
                                                            }
                                                            onRemove={() =>
                                                                field.onChange(
                                                                    undefined,
                                                                )
                                                            }
                                                            label="Choose File"
                                                            maxSizeMB={2}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="onFooter"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        On Footer
                                                    </FormLabel>
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            defaultValue={
                                                                field.value
                                                            }
                                                            className="flex gap-4"
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="yes"
                                                                    id="yes"
                                                                />
                                                                <Label
                                                                    htmlFor="yes"
                                                                    className="cursor-pointer dark:text-zinc-300"
                                                                >
                                                                    Yes
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="no"
                                                                    id="no"
                                                                />
                                                                <Label
                                                                    htmlFor="no"
                                                                    className="cursor-pointer dark:text-zinc-300"
                                                                >
                                                                    No
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="onTopNav"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        On Top Nav
                                                    </FormLabel>
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={
                                                                field.onChange
                                                            }
                                                            defaultValue={
                                                                field.value
                                                            }
                                                            className="flex gap-4"
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="yes"
                                                                    id="top-nav-yes"
                                                                />
                                                                <Label
                                                                    htmlFor="top-nav-yes"
                                                                    className="cursor-pointer dark:text-zinc-300"
                                                                >
                                                                    Yes
                                                                </Label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <RadioGroupItem
                                                                    value="no"
                                                                    id="top-nav-no"
                                                                />
                                                                <Label
                                                                    htmlFor="top-nav-no"
                                                                    className="cursor-pointer dark:text-zinc-300"
                                                                >
                                                                    No
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </FormControl>
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
                                                        Description
                                                    </FormLabel>
                                                    <FormControl>
                                                        <BlogEditor
                                                            value={
                                                                field.value ||
                                                                ''
                                                            }
                                                            valueJson={
                                                                descriptionJson
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
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

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
                                            name="metaTitle"
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
                                            name="metaDescription"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Meta Description
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Meta Description"
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
                                            name="seoUrl"
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
                                            name="metaKeyword"
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

                        <div className="flex justify-end">
                            <Button type="submit" size="lg">
                                Update Page
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </AdminLayout>
    );
}
