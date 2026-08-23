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

interface AddProductProps {
    categories?: Category[];
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
    image1: z.union([
        z.string().min(1, 'Main image is required'),
        z.instanceof(File, { message: 'Main image is required' }),
    ]),
    sortOrder: z.string().optional(),

    // Step 2: Additional Images
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
    seoUrl: z.string().min(1, 'SEO URL is required'),
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

export default function AddProduct({
    categories = EMPTY_CATEGORIES,
    auth,
    errors = EMPTY_ERRORS,
}: AddProductProps) {
    const [currentStep, setCurrentStep] = useState(1);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: 'onChange', // Clear errors as user types
        defaultValues: {
            productName: '',
            category_id: '',
            discount: '0',
            mrp: '',
            sellPrice: '',
            stock: '10',
            image1: '',
            sortOrder: '0',
            image2: '',
            image3: '',
            image4: '',
            description: '',
            description_json: null,
            metaTitle: '',
            metaDescription: '',
            seoUrl: '',
            metaKeyword: '',
        },
    });

    const [tags, setTags] = useState<string[]>([]);
    const [userEditedFields, setUserEditedFields] = useState({
        description: false,
        metaTitle: false,
        metaDescription: false,
    });
    const watchedMrp = useWatch({ control: form.control, name: 'mrp' });
    const watchedSellPrice = useWatch({ control: form.control, name: 'sellPrice' });
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
            const discountPercentage = Math.round(((mrp - sellPrice) / mrp) * 100);
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
            form.setValue('metaTitle', `Buy ${productName} Online | Natural Rudraksh`);
        }

        if (!userEditedFields.metaDescription && productName) {
            form.setValue(
                'metaDescription',
                `Shop authentic ${productName} at Natural Rudraksh. Premium quality rudraksha beads with certification. Free shipping available.`,
            );
        }
    }, [form, userEditedFields, watchedProductName]);

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
        const formData = {
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
            primary_image: data.image1,
            images: [data.image2, data.image3, data.image4].filter(Boolean),
            meta_title: data.metaTitle,
            meta_description: data.metaDescription,
            meta_keywords: tags,
            seo_url: data.seoUrl,
            status: 'active', // Default status
            is_featured: false,
            sort_order: data.sortOrder ? parseInt(data.sortOrder) : 0,
        };

        // Submit the form using Inertia's router
        router.post('/admin/products', formData, {
            onSuccess: () => {
                toast.success('Product created successfully!');
            },
            onError: (errors) => {
                console.error('Submission errors:', errors);
                toast.error('Failed to create product', {
                    description: 'Please check the form for errors.',
                });
            },
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
                // SEO fields are optional (auto-filled), only validate seoUrl
                fieldsToValidate = ['seoUrl'];
                break;
        }

        const isValid = await form.trigger(fieldsToValidate);

        if (isValid || fieldsToValidate.length === 0) {
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
            <Head title="Add Product" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Add Product
                        </h2>
                        <p className="text-muted-foreground dark:text-zinc-400">
                            Create a new product in your inventory
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
                                <div
                                    className={cn(
                                        'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300',
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
                                            'text-sm font-medium transition-colors duration-300',
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
                                        </div>

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
                                                            placeholder="10"
                                                            {...field}
                                                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="dark:text-zinc-500">
                                                        Set exact available units.
                                                        Use 0 for out of stock.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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
                                                                field.value || ''
                                                            }
                                                            onChange={(event) => {
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
                                                                field.value || ''
                                                            }
                                                            onChange={(event) => {
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
                                    Create Product
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </div>
        </AdminLayout>
    );
}
