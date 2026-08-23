import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import LazyMDEditor from '@/components/admin/lazy-md-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';

interface Setting {
    phone: string;
    phone2?: string;
    email?: string;
    email2?: string;
    address?: string;
    cod_charge?: number;
    facebook_link?: string;
    twitter_link?: string;
    instagram_link?: string;
    youtube_link?: string;
    active_clients?: number;
    varieties_of_rudraksha?: number;
    active_products?: number;
    country_cover?: number;
    header_scripts?: string;
    footer_scripts?: string;
}

interface SettingsProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    settings?: Setting;
    flash?: {
        success?: string;
        error?: string;
    };
}

// Phone regex pattern for validation
const phoneRegex =
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

// General Settings Schema
const generalSchema = z.object({
    phone: z
        .string()
        .min(1, 'Phone number is required')
        .regex(phoneRegex, 'Invalid phone format. Example: +91 9437 060 170'),
    phone2: z
        .string()
        .regex(phoneRegex, 'Invalid phone format')
        .optional()
        .or(z.literal('')),
    email: z
        .string()
        .email('Invalid email format')
        .optional()
        .or(z.literal('')),
    email2: z
        .string()
        .email('Invalid email format')
        .optional()
        .or(z.literal('')),
    address: z.string().optional(),
    cod_charge: z
        .number()
        .int('Must be a whole number')
        .min(0, 'Must be at least 0'),
});

// Counter Settings Schema
const counterSchema = z.object({
    active_clients: z
        .number()
        .int('Must be a whole number')
        .min(0, 'Must be at least 0')
        .optional()
        .or(z.literal(0)),
    varieties_of_rudraksha: z
        .number()
        .int('Must be a whole number')
        .min(0, 'Must be at least 0')
        .optional()
        .or(z.literal(0)),
    active_products: z
        .number()
        .int('Must be a whole number')
        .min(0, 'Must be at least 0')
        .optional()
        .or(z.literal(0)),
    country_cover: z
        .number()
        .int('Must be a whole number')
        .min(0, 'Must be at least 0')
        .optional()
        .or(z.literal(0)),
});

// Social Media Settings Schema
const socialMediaSchema = z.object({
    facebook_link: z
        .string()
        .url('Invalid URL format')
        .optional()
        .or(z.literal('')),
    twitter_link: z
        .string()
        .url('Invalid URL format')
        .optional()
        .or(z.literal('')),
    instagram_link: z
        .string()
        .url('Invalid URL format')
        .optional()
        .or(z.literal('')),
    youtube_link: z
        .string()
        .url('Invalid URL format')
        .optional()
        .or(z.literal('')),
});

const parseScriptValue = (value?: string) =>
    (value ?? '')
        .split(',')
        .map((script) => script.trim())
        .filter(Boolean);

const isValidHttpUrl = (value: string) => /^https?:\/\//i.test(value.trim());

// Scripts Settings Schema
const scriptsSchema = z.object({
    header_scripts: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) =>
                parseScriptValue(value).every((item) => isValidHttpUrl(item)),
            {
                message: 'Only http/https URLs are allowed.',
            },
        ),
    footer_scripts: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine(
            (value) =>
                parseScriptValue(value).every((item) => isValidHttpUrl(item)),
            {
                message: 'Only http/https URLs are allowed.',
            },
        ),
});

type GeneralFormValues = z.infer<typeof generalSchema>;
type CounterFormValues = z.infer<typeof counterSchema>;
type SocialMediaFormValues = z.infer<typeof socialMediaSchema>;
type ScriptsFormValues = z.infer<typeof scriptsSchema>;

export default function Settings({ auth, settings, flash }: SettingsProps) {
    const [isSubmittingGeneral, setIsSubmittingGeneral] = useState(false);
    const [isSubmittingCounter, setIsSubmittingCounter] = useState(false);
    const [isSubmittingSocialMedia, setIsSubmittingSocialMedia] =
        useState(false);
    const [isSubmittingScripts, setIsSubmittingScripts] = useState(false);

    const parseScriptList = (value?: string) => parseScriptValue(value ?? '');

    // Show flash messages as toasts
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // General Settings Form
    const generalForm = useForm<GeneralFormValues>({
        resolver: zodResolver(generalSchema),
        defaultValues: {
            phone: settings?.phone || '',
            phone2: settings?.phone2 || '',
            email: settings?.email || '',
            email2: settings?.email2 || '',
            address: settings?.address || '',
            cod_charge: settings?.cod_charge ?? 50,
        },
    });

    // Counter Settings Form
    const counterForm = useForm<CounterFormValues>({
        resolver: zodResolver(counterSchema),
        defaultValues: {
            active_clients: settings?.active_clients || 0,
            varieties_of_rudraksha: settings?.varieties_of_rudraksha || 0,
            active_products: settings?.active_products || 0,
            country_cover: settings?.country_cover || 0,
        },
    });

    // Social Media Settings Form
    const socialMediaForm = useForm<SocialMediaFormValues>({
        resolver: zodResolver(socialMediaSchema),
        defaultValues: {
            facebook_link: settings?.facebook_link || '',
            twitter_link: settings?.twitter_link || '',
            instagram_link: settings?.instagram_link || '',
            youtube_link: settings?.youtube_link || '',
        },
    });

    const scriptsForm = useForm<ScriptsFormValues>({
        resolver: zodResolver(scriptsSchema),
        defaultValues: {
            header_scripts: settings?.header_scripts || '',
            footer_scripts: settings?.footer_scripts || '',
        },
    });

    const onGeneralSubmit = (data: GeneralFormValues) => {
        setIsSubmittingGeneral(true);

        router.post('/admin/system/settings/general', data, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('General settings updated successfully');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error(
                    'Failed to update settings. Please check the form.',
                );

                // Set server-side validation errors
                Object.keys(errors).forEach((key) => {
                    generalForm.setError(key as keyof GeneralFormValues, {
                        type: 'server',
                        message: errors[key] as string,
                    });
                });
            },
            onFinish: () => {
                setIsSubmittingGeneral(false);
            },
        });
    };

    const onCounterSubmit = (data: CounterFormValues) => {
        setIsSubmittingCounter(true);

        router.post('/admin/system/settings/counter', data, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Counter settings updated successfully');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error(
                    'Failed to update settings. Please check the form.',
                );

                // Set server-side validation errors
                Object.keys(errors).forEach((key) => {
                    counterForm.setError(key as keyof CounterFormValues, {
                        type: 'server',
                        message: errors[key] as string,
                    });
                });
            },
            onFinish: () => {
                setIsSubmittingCounter(false);
            },
        });
    };

    const onSocialMediaSubmit = (data: SocialMediaFormValues) => {
        setIsSubmittingSocialMedia(true);

        router.post('/admin/system/settings/social-media', data, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Social media settings updated successfully');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error(
                    'Failed to update settings. Please check the form.',
                );

                // Set server-side validation errors
                Object.keys(errors).forEach((key) => {
                    socialMediaForm.setError(
                        key as keyof SocialMediaFormValues,
                        {
                            type: 'server',
                            message: errors[key] as string,
                        },
                    );
                });
            },
            onFinish: () => {
                setIsSubmittingSocialMedia(false);
            },
        });
    };

    const onScriptsSubmit = (data: ScriptsFormValues) => {
        setIsSubmittingScripts(true);

        router.post('/admin/system/settings/scripts', data, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Scripts updated successfully');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error(
                    'Failed to update settings. Please check the form.',
                );

                Object.keys(errors).forEach((key) => {
                    scriptsForm.setError(key as keyof ScriptsFormValues, {
                        type: 'server',
                        message: errors[key] as string,
                    });
                });
            },
            onFinish: () => {
                setIsSubmittingScripts(false);
            },
        });
    };

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="Settings" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Settings
                        </h2>
                        <p className="text-muted-foreground dark:text-zinc-400">
                            Manage contact information, social media, and
                            counter settings
                        </p>
                    </div>
                </div>

                {/* Settings Tabs */}
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full max-w-3xl grid-cols-4 dark:bg-zinc-900">
                        <TabsTrigger
                            value="general"
                            className="dark:data-[state=active]:bg-black dark:data-[state=active]:text-white"
                        >
                            General
                        </TabsTrigger>
                        <TabsTrigger
                            value="social-media"
                            className="dark:data-[state=active]:bg-black dark:data-[state=active]:text-white"
                        >
                            Social Media
                        </TabsTrigger>
                        <TabsTrigger
                            value="scripts"
                            className="dark:data-[state=active]:bg-black dark:data-[state=active]:text-white"
                        >
                            Scripts
                        </TabsTrigger>
                        <TabsTrigger
                            value="counter"
                            className="dark:data-[state=active]:bg-black dark:data-[state=active]:text-white"
                        >
                            Counter
                        </TabsTrigger>
                    </TabsList>

                    {/* General Tab */}
                    <TabsContent value="general" className="mt-6">
                        <Card className="p-6 dark:border-zinc-800 dark:bg-black">
                            <Form {...generalForm}>
                                <form
                                    onSubmit={generalForm.handleSubmit(
                                        onGeneralSubmit,
                                    )}
                                    className="space-y-6"
                                >
                                    {/* Phone */}
                                    <FormField
                                        control={generalForm.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base dark:text-zinc-300">
                                                    Phone{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="tel"
                                                        placeholder="+91 9437 060 170"
                                                        {...field}
                                                        className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Phone-2 */}
                                    <FormField
                                        control={generalForm.control}
                                        name="phone2"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base dark:text-zinc-300">
                                                    Phone-2
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="tel"
                                                        placeholder="Phone-2"
                                                        {...field}
                                                        className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Email */}
                                    <FormField
                                        control={generalForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base dark:text-zinc-300">
                                                    Email
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="naturalrudraksh@gmail.com"
                                                        {...field}
                                                        className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Email2 */}
                                    <FormField
                                        control={generalForm.control}
                                        name="email2"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base dark:text-zinc-300">
                                                    Email2
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="naturalrudraksh@gmail.com"
                                                        {...field}
                                                        className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Address */}
                                    <FormField
                                        control={generalForm.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base dark:text-zinc-300">
                                                    Address
                                                </FormLabel>
                                                <FormControl>
                                                    <div data-color-mode="light">
                                                        <LazyMDEditor
                                                            value={field.value}
                                                            onChange={(val) =>
                                                                field.onChange(
                                                                    val || '',
                                                                )
                                                            }
                                                            preview="edit"
                                                            height={200}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* COD Charge */}
                                    <FormField
                                        control={generalForm.control}
                                        name="cod_charge"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base dark:text-zinc-300">
                                                    COD Delivery Charge (₹)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="50"
                                                        value={field.value ?? 0}
                                                        onChange={(e) =>
                                                            field.onChange(
                                                                e.target.value
                                                                    ? parseInt(
                                                                          e
                                                                              .target
                                                                              .value,
                                                                      )
                                                                    : 0,
                                                            )
                                                        }
                                                        className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={isSubmittingGeneral}
                                    >
                                        {isSubmittingGeneral
                                            ? 'Updating...'
                                            : 'Update Setting'}
                                    </Button>
                                </form>
                            </Form>
                        </Card>
                    </TabsContent>

                    {/* Counter Tab */}
                    <TabsContent value="counter" className="mt-6">
                        <Card className="p-6 dark:border-zinc-800 dark:bg-black">
                            <Form {...counterForm}>
                                <form
                                    onSubmit={counterForm.handleSubmit(
                                        onCounterSubmit,
                                    )}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                        {/* Active Clients */}
                                        <FormField
                                            control={counterForm.control}
                                            name="active_clients"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base dark:text-zinc-300">
                                                        Active Clients
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="733"
                                                            value={
                                                                field.value || 0
                                                            }
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target
                                                                        .value
                                                                        ? parseInt(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          )
                                                                        : 0,
                                                                )
                                                            }
                                                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Varieties Of Rudraksha */}
                                        <FormField
                                            control={counterForm.control}
                                            name="varieties_of_rudraksha"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base dark:text-zinc-300">
                                                        Varieties Of Rudraksha
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="25"
                                                            value={
                                                                field.value || 0
                                                            }
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target
                                                                        .value
                                                                        ? parseInt(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          )
                                                                        : 0,
                                                                )
                                                            }
                                                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Active Products */}
                                        <FormField
                                            control={counterForm.control}
                                            name="active_products"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base dark:text-zinc-300">
                                                        Active Products
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="50"
                                                            value={
                                                                field.value || 0
                                                            }
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target
                                                                        .value
                                                                        ? parseInt(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          )
                                                                        : 0,
                                                                )
                                                            }
                                                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Country Cover */}
                                        <FormField
                                            control={counterForm.control}
                                            name="country_cover"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base dark:text-zinc-300">
                                                        Country Cover
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="10"
                                                            value={
                                                                field.value || 0
                                                            }
                                                            onChange={(e) =>
                                                                field.onChange(
                                                                    e.target
                                                                        .value
                                                                        ? parseInt(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          )
                                                                        : 0,
                                                                )
                                                            }
                                                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={isSubmittingCounter}
                                    >
                                        {isSubmittingCounter
                                            ? 'Updating...'
                                            : 'Update Setting'}
                                    </Button>
                                </form>
                            </Form>
                        </Card>
                    </TabsContent>

                    {/* Scripts Tab */}
                    <TabsContent value="scripts" className="mt-6">
                        <Card className="p-6 dark:border-zinc-800 dark:bg-black">
                            <Form {...scriptsForm}>
                                <form
                                    onSubmit={scriptsForm.handleSubmit(
                                        onScriptsSubmit,
                                        () => {
                                            toast.error(
                                                'Please use only http/https URLs.',
                                            );
                                        },
                                    )}
                                    className="space-y-6"
                                >
                                    <FormField
                                        control={scriptsForm.control}
                                        name="header_scripts"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base dark:text-zinc-300">
                                                    Header Scripts
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        rows={4}
                                                        placeholder="https://example.com/script1.js, https://example.com/script2.js"
                                                        {...field}
                                                        className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                    />
                                                </FormControl>
                                                <div className="flex flex-wrap gap-2">
                                                    {parseScriptList(
                                                        field.value,
                                                    ).map((script) => (
                                                        <Badge
                                                            key={script}
                                                            variant="outline"
                                                            className="gap-1 rounded-full border-amber-200 bg-amber-50 text-amber-800"
                                                        >
                                                            <span className="max-w-[280px] truncate">
                                                                {script}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const next =
                                                                        parseScriptList(
                                                                            field.value,
                                                                        ).filter(
                                                                            (
                                                                                item,
                                                                            ) =>
                                                                                item !==
                                                                                script,
                                                                        );
                                                                    scriptsForm.setValue(
                                                                        'header_scripts',
                                                                        next.join(
                                                                            ', ',
                                                                        ),
                                                                        {
                                                                            shouldDirty: true,
                                                                        },
                                                                    );
                                                                }}
                                                                className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-amber-700 transition-colors hover:bg-amber-200/60"
                                                                aria-label="Remove script"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Enter script URLs separated
                                                    by commas. These are
                                                    injected into the site
                                                    &lt;head&gt;.
                                                </p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={scriptsForm.control}
                                        name="footer_scripts"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base dark:text-zinc-300">
                                                    Footer Scripts
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        rows={4}
                                                        placeholder="https://example.com/script3.js, https://example.com/script4.js"
                                                        {...field}
                                                        className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                    />
                                                </FormControl>
                                                <div className="flex flex-wrap gap-2">
                                                    {parseScriptList(
                                                        field.value,
                                                    ).map((script) => (
                                                        <Badge
                                                            key={script}
                                                            variant="outline"
                                                            className="gap-1 rounded-full border-amber-200 bg-amber-50 text-amber-800"
                                                        >
                                                            <span className="max-w-[280px] truncate">
                                                                {script}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const next =
                                                                        parseScriptList(
                                                                            field.value,
                                                                        ).filter(
                                                                            (
                                                                                item,
                                                                            ) =>
                                                                                item !==
                                                                                script,
                                                                        );
                                                                    scriptsForm.setValue(
                                                                        'footer_scripts',
                                                                        next.join(
                                                                            ', ',
                                                                        ),
                                                                        {
                                                                            shouldDirty: true,
                                                                        },
                                                                    );
                                                                }}
                                                                className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-amber-700 transition-colors hover:bg-amber-200/60"
                                                                aria-label="Remove script"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Enter script URLs separated
                                                    by commas. These are
                                                    injected before the closing
                                                    &lt;/body&gt;.
                                                </p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={isSubmittingScripts}
                                    >
                                        {isSubmittingScripts
                                            ? 'Updating...'
                                            : 'Update Scripts'}
                                    </Button>
                                </form>
                            </Form>
                        </Card>
                    </TabsContent>

                    {/* Social Media Tab */}
                    <TabsContent value="social-media" className="mt-6">
                        <Card className="p-6 dark:border-zinc-800 dark:bg-black">
                            <Form {...socialMediaForm}>
                                <form
                                    onSubmit={socialMediaForm.handleSubmit(
                                        onSocialMediaSubmit,
                                    )}
                                    className="space-y-6"
                                >
                                    {/* Facebook Link */}
                                    <FormField
                                        control={socialMediaForm.control}
                                        name="facebook_link"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base dark:text-zinc-300">
                                                    Facebook Link
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="url"
                                                        placeholder="https://facebook.com/yourpage"
                                                        {...field}
                                                        className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Twitter Link */}
                                    <FormField
                                        control={socialMediaForm.control}
                                        name="twitter_link"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base dark:text-zinc-300">
                                                    Twitter Link
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="url"
                                                        placeholder="https://twitter.com/yourhandle"
                                                        {...field}
                                                        className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Instagram Link */}
                                    <FormField
                                        control={socialMediaForm.control}
                                        name="instagram_link"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base dark:text-zinc-300">
                                                    Instagram Link
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="url"
                                                        placeholder="https://instagram.com/yourprofile"
                                                        {...field}
                                                        className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* YouTube Link */}
                                    <FormField
                                        control={socialMediaForm.control}
                                        name="youtube_link"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base dark:text-zinc-300">
                                                    YouTube Link
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="url"
                                                        placeholder="https://youtube.com/@yourchannel"
                                                        {...field}
                                                        className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={isSubmittingSocialMedia}
                                    >
                                        {isSubmittingSocialMedia
                                            ? 'Updating...'
                                            : 'Update Setting'}
                                    </Button>
                                </form>
                            </Form>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
