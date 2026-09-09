import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import BlogEditor from '@/components/admin/BlogEditor';
import { ImageUpload } from '@/components/admin/ImageUpload';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import { cn } from '@/lib/utils';

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Product {
    _id?: string; // MongoDB uses _id
    id?: string; // May also have id
    name: string;
    slug: string;
    category_id: string;
    discount_percentage?: number;
    mrp?: number;
    sell_price?: number;
    stock?: number;
    measurement_unit_id?: string;
    measurement_minimum?: number;
    measurement_maximum?: number;
    measurement_increment?: number;
    primary_image?: string;
    images?: string[];
    sort_order?: number;
    description?: string;
    description_json?: object | null;
    meta_title?: string;
    meta_description?: string;
    og_title?: string;
    og_description?: string;
    twitter_title?: string;
    twitter_description?: string;
    seo_url?: string;
    meta_keywords?: string[];
    videos?: string[];
    video_conversion_status?: {
        id: string;
        status: 'queued' | 'processing' | 'completed' | 'failed';
        progress?: number;
        output?: string | null;
    }[];
    status?: string;
}

interface EditProductProps {
    product: Product;
    categories?: Category[];
    units?: { id: string; name: string; symbol: string }[];
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    errors?: Record<string, string>;
}

const formSchema = z.object({
    // Step 1: General
    productName: z.string().min(1, 'Product name is required'),
    category_id: z.string().min(1, 'Category is required'),
    discount: z.string().optional(),
    mrp: z.string().min(1, 'MRP is required'),
    sellPrice: z.string().min(1, 'Sell price is required'),
    stock: z.string().min(1, 'Stock quantity is required'),
    measurementUnitId: z.string().optional(),
    measurementMinimum: z.string().optional(),
    measurementMaximum: z.string().optional(),
    measurementIncrement: z.string().optional(),
    // Allow existing image path (string) or new file upload
    image1: z.union([z.string().optional(), z.instanceof(File)]).optional(),
    sortOrder: z.string().optional(),

    // Step 2: Additional Images - all optional
    image2: z.union([z.string(), z.instanceof(File)]).optional(),
    image3: z.union([z.string(), z.instanceof(File)]).optional(),
    image4: z.union([z.string(), z.instanceof(File)]).optional(),

    // Step 3: Description
    description: z.string().min(1, 'Description is required'),
    description_json: z.any().optional(),

    // Step 4: SEO (optional since they auto-fill)
    metaTitle: z
        .string()
        .max(120, 'Meta title must be 120 characters or less')
        .optional(),
    metaDescription: z.string().optional(),
    ogTitle: z.string().max(120).optional(),
    ogDescription: z.string().max(160).optional(),
    twitterTitle: z.string().max(120).optional(),
    twitterDescription: z.string().max(160).optional(),
    seoUrl: z.string().optional(), // Optional for edit, will be auto-generated
    metaKeyword: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type EditedField = 'description' | 'metaTitle' | 'metaDescription';

const steps = [
    { id: 1, name: 'General', description: 'Basic product information' },
    { id: 2, name: 'Images', description: 'Additional product images' },
    { id: 3, name: 'Description', description: 'Product description' },
    { id: 4, name: 'SEO', description: 'SEO optimization' },
];

const EMPTY_CATEGORIES: Category[] = [];
const EMPTY_ERRORS: Record<string, string> = {};

export default function EditProduct({
    product,
    categories = EMPTY_CATEGORIES,
    units = [],
    auth,
    errors = EMPTY_ERRORS,
}: EditProductProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const productForForm: Product = product ?? {
        name: '',
        slug: '',
        category_id: '',
        images: [],
        meta_keywords: [],
    };

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: 'onChange', // Clear errors as user types
        defaultValues: {
            productName: productForForm.name || '',
            category_id: productForForm.category_id || '',
            discount: productForForm.discount_percentage?.toString() || '0',
            mrp: productForForm.mrp?.toString() || '',
            sellPrice: productForForm.sell_price?.toString() || '',
            stock:
                typeof productForForm.stock === 'number'
                    ? productForForm.stock.toString()
                    : '0',
            measurementUnitId: productForForm.measurement_unit_id || '',
            measurementMinimum:
                productForForm.measurement_minimum?.toString() || '',
            measurementMaximum:
                productForForm.measurement_maximum?.toString() || '',
            measurementIncrement:
                productForForm.measurement_increment?.toString() || '',
            // Add /uploads/products/ prefix for existing images
            image1: productForForm.primary_image
                ? `/uploads/products/${productForForm.primary_image}`
                : '',
            sortOrder: productForForm.sort_order?.toString() || '0',
            image2: productForForm.images?.[0]
                ? `/uploads/products/${productForForm.images[0]}`
                : '',
            image3: productForForm.images?.[1]
                ? `/uploads/products/${productForForm.images[1]}`
                : '',
            image4: productForForm.images?.[2]
                ? `/uploads/products/${productForForm.images[2]}`
                : '',
            description: productForForm.description || '',
            description_json: productForForm.description_json || null,
            metaTitle: productForForm.meta_title || productForForm.name || '',
            metaDescription: productForForm.meta_description || '',
            ogTitle: productForForm.og_title || '',
            ogDescription: productForForm.og_description || '',
            twitterTitle: productForForm.twitter_title || '',
            twitterDescription: productForForm.twitter_description || '',
            seoUrl: productForForm.slug || productForForm.seo_url || '',
            metaKeyword: productForForm.meta_keywords?.join(', ') || '',
        },
    });

    const [tags, setTags] = useState<string[]>([]);
    const [videos, setVideos] = useState<File[]>([]);
    const [userEditedFields, setUserEditedFields] = useState({
        description: !!productForForm.description,
        metaTitle: !!productForForm.meta_title,
        metaDescription: !!productForForm.meta_description,
    });
    const watchedMrp = useWatch({ control: form.control, name: 'mrp' });
    const watchedSellPrice = useWatch({
        control: form.control,
        name: 'sellPrice',
    });
    const watchedProductName = useWatch({
        control: form.control,
        name: 'productName',
    });
    const metaTitleValue =
        useWatch({ control: form.control, name: 'metaTitle' }) || '';
    const markFieldAsEdited = (field: EditedField) => {
        setUserEditedFields((prev) => {
            if (prev[field]) return prev;
            return { ...prev, [field]: true };
        });
    };

    useEffect(() => {
        const errorMap: Partial<Record<string, keyof FormValues>> = {
            name: 'productName',
            category_id: 'category_id',
            mrp: 'mrp',
            sell_price: 'sellPrice',
            stock: 'stock',
            primary_image: 'image1',
            image2: 'image2',
            image3: 'image3',
            image4: 'image4',
            description: 'description',
            meta_title: 'metaTitle',
            meta_description: 'metaDescription',
            seo_url: 'seoUrl',
            meta_keywords: 'metaKeyword',
        };

        const entries = Object.entries(errors ?? {});
        if (entries.length === 0) return;

        form.clearErrors();

        entries.forEach(([key, message]) => {
            const fieldName = errorMap[key] ?? null;
            if (!fieldName) return;
            form.setError(fieldName, {
                type: 'server',
                message,
            });
        });
    }, [errors, form]);

    // Auto-calculate discount when price values change.
    useEffect(() => {
        const mrp = parseFloat(watchedMrp || '0');
        const sellPrice = parseFloat(watchedSellPrice || '0');

        if (mrp > 0 && sellPrice > 0 && sellPrice < mrp) {
            const discountPercentage = Math.round(
                ((mrp - sellPrice) / mrp) * 100,
            );
            form.setValue('discount', discountPercentage.toString());
            return;
        }

        form.setValue('discount', '0');
    }, [form, watchedMrp, watchedSellPrice]);

    // Auto-generate slug and optional SEO fields when product name changes.
    useEffect(() => {
        const productName = watchedProductName || '';

        const slug = productName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        form.setValue('seoUrl', slug);

        if (!userEditedFields.description && productName) {
            form.setValue(
                'description',
                `${productName} - High quality rudraksha beads sourced directly from Nepal and Indonesia.`,
            );
        }

        if (!userEditedFields.metaTitle && productName) {
            form.setValue(
                'metaTitle',
                `Buy ${productName} Online | Natural Rudraksh`,
            );
        }

        if (!userEditedFields.metaDescription && productName) {
            form.setValue(
                'metaDescription',
                `Shop authentic ${productName} at Natural Rudraksh. Premium quality rudraksha beads with certification. Free shipping available.`,
            );
        }
    }, [form, userEditedFields, watchedProductName]);

    // If no product data, show error
    if (!product) {
        return (
            <AdminLayout
                userName={auth?.user?.name}
                userAvatar={auth?.user?.avatar}
            >
                <Head title="Edit Product" />
                <div className="flex min-h-screen items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-600">
                            Error
                        </h2>
                        <p className="text-gray-600">
                            Product not found or failed to load.
                        </p>
                        <Button
                            onClick={() => router.visit('/admin/products')}
                            className="mt-4"
                        >
                            Back to Products
                        </Button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    // Handle tag additions
    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            const newTags = [...tags, trimmed];
            setTags(newTags);
            // Join with comma for the form value
            form.setValue('metaKeyword', newTags.join(','));
        }
    };

    const removeTag = (indexToRemove: number) => {
        const newTags = tags.filter((_, index) => index !== indexToRemove);
        setTags(newTags);
        form.setValue('metaKeyword', newTags.join(','));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = e.currentTarget.value;
            if (val) {
                addTag(val);
                e.currentTarget.value = '';
            }
        } else if (
            e.key === 'Backspace' &&
            !e.currentTarget.value &&
            tags.length > 0
        ) {
            removeTag(tags.length - 1);
        }
    };

    const onSubmit = (data: FormValues) => {
        // Only submit if we're on the last step
        if (currentStep !== steps.length) {
            console.log(
                'Not on last step, preventing submission. Current:',
                currentStep,
                'Total:',
                steps.length,
            );
            return;
        }

        console.log('Submitting form...');

        // Map frontend fields to backend expected fields
        const formData: Record<string, any> = {
            name: data.productName,
            category_id: data.category_id,
            description: data.description,
            description_json: data.description_json
                ? JSON.stringify(data.description_json)
                : null,
            short_description: data.description
                ? data.description.substring(0, 150)
                : '',
            sell_price: parseFloat(data.sellPrice),
            mrp: data.mrp ? parseFloat(data.mrp) : null,
            discount_percentage: parseFloat(data.discount || '0'),
            stock: data.stock ? parseInt(data.stock) : 0,
            measurement_unit_id: data.measurementUnitId || null,
            measurement_minimum: data.measurementUnitId
                ? Number(data.measurementMinimum)
                : null,
            measurement_maximum: data.measurementUnitId
                ? Number(data.measurementMaximum)
                : null,
            measurement_increment: data.measurementUnitId
                ? Number(data.measurementIncrement)
                : null,
            meta_title: data.metaTitle,
            meta_description: data.metaDescription,
            og_title: data.ogTitle,
            og_description: data.ogDescription,
            twitter_title: data.twitterTitle,
            twitter_description: data.twitterDescription,
            meta_keywords: data.metaKeyword,
            status: 'active', // Required by backend
        };

        if (
            data.sortOrder &&
            !Number.isNaN(Number.parseInt(data.sortOrder, 10))
        ) {
            formData.sort_order = Number.parseInt(data.sortOrder, 10);
        }

        // Only include primary_image if it's a File (new upload)
        if (data.image1 instanceof File) {
            formData.primary_image = data.image1;
        }

        // Only include additional images if they are Files (new uploads)
        const newImages = [data.image2, data.image3, data.image4].filter(
            (img): img is File => img instanceof File,
        );

        if (newImages.length > 0) {
            formData.images = newImages;
        }

        if (videos.length > 0) {
            formData.videos = videos;
        }

        // Submit the form using Inertia's router
        // We use router.post with _method: 'put' because PHP doesn't handle
        // multipart/form-data with PUT requests natively
        formData._method = 'put';

        const productId = product._id || product.id;

        router.post(`/admin/products/${productId}`, formData, {
            onSuccess: () => {
                toast.success('Product updated successfully');
                // Delay redirect to show toast
                setTimeout(() => {
                    router.visit('/admin/products');
                }, 1000);
            },
            onError: (errors) => {
                console.error('Backend errors:', errors);
                toast.error('Failed to update product', {
                    description: 'Please check the form for errors.',
                });
            },
            // Force FormData for consistency since we might have files
            forceFormData: true,
        });
    };

    const nextStep = async () => {
        let fieldsToValidate: (keyof FormValues)[] = [];

        switch (currentStep) {
            case 1:
                fieldsToValidate = [
                    'productName',
                    'category_id',
                    'mrp',
                    'sellPrice',
                    'image1',
                ];
                break;
            case 2:
                // Images are optional, so no validation needed
                break;
            case 3:
                fieldsToValidate = ['description'];
                break;
            case 4:
                // SEO fields are optional (auto-filled), no validation needed
                break;
        }

        const isValid = await form.trigger(fieldsToValidate);

        if (isValid) {
            if (currentStep < steps.length) {
                setCurrentStep((prev) => prev + 1);
            }
        } else {
            toast.error('Please fill in all required fields', {
                description: 'Check the highlighted fields for errors.',
            });
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="Edit Product" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Edit Product
                        </h2>
                        <p className="text-muted-foreground dark:text-zinc-400">
                            Update product information
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/admin/products')}
                    >
                        Cancel
                    </Button>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-1 items-center">
                            <div className="flex flex-col items-center">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(step.id)}
                                    className="group flex flex-col items-center"
                                >
                                    <div
                                        className={cn(
                                            'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 group-hover:scale-110 group-hover:border-primary',
                                            currentStep >= step.id
                                                ? 'scale-110 border-primary bg-primary text-primary-foreground'
                                                : 'border-gray-300 bg-white text-gray-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400',
                                        )}
                                    >
                                        {step.id}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <p
                                            className={cn(
                                                'text-sm font-medium transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-white',
                                                currentStep >= step.id
                                                    ? 'text-gray-900 dark:text-white'
                                                    : 'text-gray-500 dark:text-zinc-400',
                                            )}
                                        >
                                            {step.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-zinc-500">
                                            {step.description}
                                        </p>
                                    </div>
                                </button>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        'mx-4 h-0.5 flex-1 transition-all duration-500',
                                        currentStep > step.id
                                            ? 'bg-primary'
                                            : 'bg-gray-300 dark:bg-zinc-700',
                                    )}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form */}
                <Form {...form}>
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        onKeyDown={(e) => {
                            // Prevent Enter key from submitting form in input fields
                            // Allow Enter in textarea for multi-line input
                            if (
                                e.key === 'Enter' &&
                                e.target instanceof HTMLElement &&
                                e.target.tagName !== 'TEXTAREA' &&
                                e.target.tagName !== 'BUTTON'
                            ) {
                                e.preventDefault();
                            }
                        }}
                        className="space-y-6"
                    >
                        <Card className="overflow-hidden dark:border-zinc-800 dark:bg-black">
                            <CardHeader>
                                <CardTitle className="dark:text-white">
                                    {steps[currentStep - 1].name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="relative min-h-[400px]">
                                    {/* Step 1: General */}
                                    <div
                                        className={cn(
                                            'space-y-6 transition-all duration-500 ease-in-out',
                                            currentStep === 1
                                                ? 'translate-x-0 opacity-100'
                                                : currentStep > 1
                                                  ? 'pointer-events-none absolute inset-0 -translate-x-full opacity-0'
                                                  : 'pointer-events-none absolute inset-0 translate-x-full opacity-0',
                                        )}
                                    >
                                        <FormField
                                            control={form.control}
                                            name="productName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Product Name *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter product name"
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
                                            name="category_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Category *
                                                    </FormLabel>
                                                    <Select
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                        defaultValue={
                                                            field.value
                                                        }
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                                                                <SelectValue placeholder="Select a category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {categories?.map(
                                                                (category) => (
                                                                    <SelectItem
                                                                        key={
                                                                            category.id
                                                                        }
                                                                        value={
                                                                            category.id
                                                                        }
                                                                    >
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid gap-4 md:grid-cols-4">
                                            <div className="flex flex-col gap-2">
                                                <FormLabel>Unit</FormLabel>
                                                <select
                                                    className="h-9 rounded-md border bg-background px-3"
                                                    {...form.register(
                                                        'measurementUnitId',
                                                    )}
                                                >
                                                    <option value="">
                                                        No measurement selector
                                                    </option>
                                                    {units.map((unit) => (
                                                        <option
                                                            key={unit.id}
                                                            value={unit.id}
                                                        >
                                                            {unit.name} (
                                                            {unit.symbol})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <FormLabel>
                                                    Minimum value
                                                </FormLabel>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="any"
                                                    placeholder="500"
                                                    {...form.register(
                                                        'measurementMinimum',
                                                    )}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <FormLabel>
                                                    Maximum value
                                                </FormLabel>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="any"
                                                    placeholder="1500"
                                                    {...form.register(
                                                        'measurementMaximum',
                                                    )}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <FormLabel>Increment</FormLabel>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="any"
                                                    placeholder="250"
                                                    {...form.register(
                                                        'measurementIncrement',
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-6 md:grid-cols-3">
                                            <FormField
                                                control={form.control}
                                                name="discount"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="dark:text-zinc-300">
                                                            Discount (%)
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="0"
                                                                {...field}
                                                                disabled
                                                                readOnly
                                                                className="cursor-not-allowed bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="dark:text-zinc-500">
                                                            Auto-calculated from
                                                            MRP and Sell Price
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="mrp"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="dark:text-zinc-300">
                                                            MRP *
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="0.00"
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
                                                name="sellPrice"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="dark:text-zinc-300">
                                                            Sell Price *
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="0.00"
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
                                                name="stock"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="dark:text-zinc-300">
                                                            Stock Quantity
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                step={1}
                                                                placeholder="0"
                                                                {...field}
                                                                className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="dark:text-zinc-500">
                                                            Set exact available
                                                            units. Use 0 for out
                                                            of stock.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                                            <FormField
                                                control={form.control}
                                                name="image1"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="dark:text-zinc-300">
                                                            Main Image *
                                                        </FormLabel>
                                                        <FormControl>
                                                            <ImageUpload
                                                                value={
                                                                    field.value
                                                                }
                                                                onChange={
                                                                    field.onChange
                                                                }
                                                                onRemove={() =>
                                                                    field.onChange(
                                                                        '',
                                                                    )
                                                                }
                                                                label="Upload Main Image"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="sortOrder"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="dark:text-zinc-300">
                                                            Sort Order
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                placeholder="0"
                                                                {...field}
                                                                className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="dark:text-zinc-500">
                                                            Lower numbers appear
                                                            first
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-3 rounded-lg border p-4">
                                            <FormLabel htmlFor="product-videos">
                                                Product videos
                                            </FormLabel>
                                            <Input
                                                id="product-videos"
                                                type="file"
                                                accept="video/mp4,video/quicktime,video/webm"
                                                multiple
                                                onChange={(event) =>
                                                    setVideos(
                                                        Array.from(
                                                            event.target
                                                                .files ?? [],
                                                        ).slice(0, 2),
                                                    )
                                                }
                                            />
                                            <FormDescription>
                                                Upload up to two additional
                                                videos. They are converted in
                                                the background after saving.
                                            </FormDescription>
                                            {videos.length > 0 && (
                                                <ul className="space-y-1 text-sm text-muted-foreground">
                                                    {videos.map((video) => (
                                                        <li
                                                            key={`${video.name}-${video.lastModified}`}
                                                        >
                                                            {video.name} — ready
                                                            to upload
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {(productForForm
                                                .video_conversion_status
                                                ?.length ?? 0) > 0 && (
                                                <ul className="space-y-1 text-sm text-muted-foreground">
                                                    {productForForm.video_conversion_status?.map(
                                                        (video) => (
                                                            <li key={video.id}>
                                                                Video
                                                                conversion:{' '}
                                                                {video.status}
                                                                {video.status ===
                                                                'processing'
                                                                    ? ` (${video.progress ?? 0}%)`
                                                                    : ''}
                                                                {video.status ===
                                                                'failed'
                                                                    ? ' — upload a replacement to retry.'
                                                                    : ''}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            )}
                                            {(productForForm.videos?.length ??
                                                0) > 0 && (
                                                <p className="text-sm text-emerald-600">
                                                    {
                                                        productForForm.videos
                                                            ?.length
                                                    }{' '}
                                                    video(s) ready for
                                                    storefront playback.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Step 2: Additional Images */}
                                    <div
                                        className={cn(
                                            'space-y-6 transition-all duration-500 ease-in-out',
                                            currentStep === 2
                                                ? 'translate-x-0 opacity-100'
                                                : currentStep > 2
                                                  ? 'pointer-events-none absolute inset-0 -translate-x-full opacity-0'
                                                  : 'pointer-events-none absolute inset-0 translate-x-full opacity-0',
                                        )}
                                    >
                                        <div className="grid gap-6 md:grid-cols-3">
                                            <FormField
                                                control={form.control}
                                                name="image2"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="dark:text-zinc-300">
                                                            Image 2
                                                        </FormLabel>
                                                        <FormControl>
                                                            <ImageUpload
                                                                value={
                                                                    field.value
                                                                }
                                                                onChange={
                                                                    field.onChange
                                                                }
                                                                onRemove={() =>
                                                                    field.onChange(
                                                                        '',
                                                                    )
                                                                }
                                                                label="Upload Image 2"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="image3"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="dark:text-zinc-300">
                                                            Image 3
                                                        </FormLabel>
                                                        <FormControl>
                                                            <ImageUpload
                                                                value={
                                                                    field.value
                                                                }
                                                                onChange={
                                                                    field.onChange
                                                                }
                                                                onRemove={() =>
                                                                    field.onChange(
                                                                        '',
                                                                    )
                                                                }
                                                                label="Upload Image 3"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="image4"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="dark:text-zinc-300">
                                                            Image 4
                                                        </FormLabel>
                                                        <FormControl>
                                                            <ImageUpload
                                                                value={
                                                                    field.value
                                                                }
                                                                onChange={
                                                                    field.onChange
                                                                }
                                                                onRemove={() =>
                                                                    field.onChange(
                                                                        '',
                                                                    )
                                                                }
                                                                label="Upload Image 4"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Step 3: Description */}
                                    <div
                                        className={cn(
                                            'space-y-6 transition-all duration-500 ease-in-out',
                                            currentStep === 3
                                                ? 'translate-x-0 opacity-100'
                                                : currentStep > 3
                                                  ? 'pointer-events-none absolute inset-0 -translate-x-full opacity-0'
                                                  : 'pointer-events-none absolute inset-0 translate-x-full opacity-0',
                                        )}
                                    >
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Product Description *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <BlogEditor
                                                            value={field.value}
                                                            valueJson={
                                                                product?.description_json
                                                            }
                                                            onChange={(
                                                                data,
                                                            ) => {
                                                                markFieldAsEdited(
                                                                    'description',
                                                                );
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
                                                    <FormDescription className="dark:text-zinc-500">
                                                        Use the rich text editor
                                                        for formatting
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Step 4: SEO */}
                                    <div
                                        className={cn(
                                            'space-y-6 transition-all duration-500 ease-in-out',
                                            currentStep === 4
                                                ? 'translate-x-0 opacity-100'
                                                : currentStep > 4
                                                  ? 'pointer-events-none absolute inset-0 -translate-x-full opacity-0'
                                                  : 'pointer-events-none absolute inset-0 translate-x-full opacity-0',
                                        )}
                                    >
                                        <FormField
                                            control={form.control}
                                            name="metaTitle"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Meta Title *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter meta title"
                                                            maxLength={120}
                                                            value={
                                                                field.value ||
                                                                ''
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) => {
                                                                markFieldAsEdited(
                                                                    'metaTitle',
                                                                );
                                                                field.onChange(
                                                                    event,
                                                                );
                                                            }}
                                                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormDescription
                                                        className={cn(
                                                            'dark:text-zinc-500',
                                                            metaTitleValue.length >=
                                                                120 &&
                                                                'text-red-600 dark:text-red-400',
                                                            metaTitleValue.length >=
                                                                100 &&
                                                                metaTitleValue.length <
                                                                    120 &&
                                                                'text-amber-600 dark:text-amber-400',
                                                        )}
                                                    >
                                                        Recommended: up to 120
                                                        characters ·{' '}
                                                        {metaTitleValue.length}
                                                        /120
                                                    </FormDescription>
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
                                                        Meta Description *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Enter meta description"
                                                            value={
                                                                field.value ||
                                                                ''
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) => {
                                                                markFieldAsEdited(
                                                                    'metaDescription',
                                                                );
                                                                field.onChange(
                                                                    event,
                                                                );
                                                            }}
                                                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="dark:text-zinc-500">
                                                        Recommended: 150-160
                                                        characters
                                                    </FormDescription>
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
                                                        SEO URL *
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="product-name-slug"
                                                            {...field}
                                                            readOnly
                                                            className="cursor-not-allowed bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="dark:text-zinc-500">
                                                        Auto-generated from
                                                        product name
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="metaKeyword"
                                            render={() => (
                                                <FormItem>
                                                    <FormLabel className="dark:text-zinc-300">
                                                        Meta Keywords
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="flex flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900">
                                                            {tags.map(
                                                                (
                                                                    tag,
                                                                    index,
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                                                    >
                                                                        {tag}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                removeTag(
                                                                                    index,
                                                                                )
                                                                            }
                                                                            className="ml-1 rounded-full p-0.5 hover:bg-primary/20"
                                                                        >
                                                                            <X className="h-3 w-3" />
                                                                        </button>
                                                                    </span>
                                                                ),
                                                            )}
                                                            <input
                                                                type="text"
                                                                placeholder={
                                                                    tags.length ===
                                                                    0
                                                                        ? 'keyword1, keyword2'
                                                                        : ''
                                                                }
                                                                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground dark:text-zinc-100"
                                                                onKeyDown={
                                                                    handleKeyDown
                                                                }
                                                                onBlur={(e) => {
                                                                    const val =
                                                                        e.target.value.trim();
                                                                    if (val) {
                                                                        addTag(
                                                                            val,
                                                                        );
                                                                        e.target.value =
                                                                            '';
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormDescription className="dark:text-zinc-500">
                                                        Type and press comma or
                                                        enter to add keywords
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid gap-6 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name="ogTitle"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Open Graph title
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                maxLength={120}
                                                                placeholder="Defaults to Meta Title"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="twitterTitle"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Twitter title
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                maxLength={120}
                                                                placeholder="Defaults to Open Graph title"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="ogDescription"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Open Graph
                                                            description
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                maxLength={160}
                                                                placeholder="Defaults to Meta Description"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="twitterDescription"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Twitter description
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                maxLength={160}
                                                                placeholder="Defaults to Open Graph description"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>

                            {currentStep < steps.length ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="gap-2"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={form.handleSubmit(onSubmit)}
                                    className="gap-2"
                                >
                                    Update Product
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </div>
        </AdminLayout>
    );
}
