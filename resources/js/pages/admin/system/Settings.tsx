import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import { Trash2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import LazyMDEditor from '@/components/admin/lazy-md-editor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import axios from '@/lib/http-client';

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
    default_video_1?: string;
    default_video_2?: string;
    homepage_video?: string;
    category_video?: string;
    trust_features?: TrustFeature[];
    ticker_text?: string;
    ticker_enabled?: boolean;
    global_meta_title?: string;
    global_meta_description?: string;
    global_meta_keywords?: string;
    global_og_title?: string;
    global_og_description?: string;
    global_og_image_url?: string;
    global_twitter_title?: string;
    global_twitter_description?: string;
    global_twitter_image_url?: string;
    verification_files?: VerificationFile[];
}

interface VerificationFile {
    filename: string;
    url: string;
    size?: number;
    uploaded_at?: string;
}

interface TrustFeature {
    id: string;
    filename?: string;
    url?: string;
    image_url?: string;
    uploaded_at?: string;
}

interface SettingsProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    settings?: Setting;
    adsTxt?: string;
    flash?: {
        success?: string;
        error?: string;
    };
}

// Phone regex pattern for validation
const phoneRegex =
    /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;

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

const seoSchema = z.object({
    global_meta_title: z.string().max(120).optional().or(z.literal('')),
    global_meta_description: z.string().max(160).optional().or(z.literal('')),
    global_meta_keywords: z.string().max(500).optional().or(z.literal('')),
    global_og_title: z.string().max(120).optional().or(z.literal('')),
    global_og_description: z.string().max(160).optional().or(z.literal('')),
    global_og_image_url: z
        .string()
        .url('Invalid URL format')
        .optional()
        .or(z.literal('')),
    global_twitter_title: z.string().max(120).optional().or(z.literal('')),
    global_twitter_description: z
        .string()
        .max(160)
        .optional()
        .or(z.literal('')),
    global_twitter_image_url: z
        .string()
        .url('Invalid URL format')
        .optional()
        .or(z.literal('')),
});

// Scripts Settings Schema
const scriptsSchema = z.object({
    header_scripts: z.string().max(100000).optional().or(z.literal('')),
    footer_scripts: z.string().max(100000).optional().or(z.literal('')),
});

const adsTxtSchema = z.object({
    ads_txt: z
        .string()
        .max(20000, 'ads.txt content must not exceed 20,000 characters')
        .optional()
        .or(z.literal('')),
});

const tickerSchema = z.object({
    ticker_text: z.string().max(255).optional().or(z.literal('')),
    ticker_enabled: z.boolean(),
});

type GeneralFormValues = z.infer<typeof generalSchema>;
type CounterFormValues = z.infer<typeof counterSchema>;
type SocialMediaFormValues = z.infer<typeof socialMediaSchema>;
type SeoFormValues = z.infer<typeof seoSchema>;
type ScriptsFormValues = z.infer<typeof scriptsSchema>;
type AdsTxtFormValues = z.infer<typeof adsTxtSchema>;
type TickerFormValues = z.infer<typeof tickerSchema>;

export default function Settings({
    auth,
    settings,
    adsTxt = '',
    flash,
}: SettingsProps) {
    const [isSubmittingGeneral, setIsSubmittingGeneral] = useState(false);
    const [isSubmittingCounter, setIsSubmittingCounter] = useState(false);
    const [isSubmittingSocialMedia, setIsSubmittingSocialMedia] =
        useState(false);
    const [isSubmittingSeo, setIsSubmittingSeo] = useState(false);
    const [isSubmittingScripts, setIsSubmittingScripts] = useState(false);
    const [isSubmittingAdsTxt, setIsSubmittingAdsTxt] = useState(false);
    const [isSubmittingTicker, setIsSubmittingTicker] = useState(false);
    const [isDeletingTicker, setIsDeletingTicker] = useState(false);
    const [verificationFiles, setVerificationFiles] = useState<
        VerificationFile[]
    >(settings?.verification_files ?? []);
    const [verificationUploadProgress, setVerificationUploadProgress] =
        useState(0);
    const [isUploadingVerificationFile, setIsUploadingVerificationFile] =
        useState(false);
    const [deletingVerificationFile, setDeletingVerificationFile] = useState<
        string | null
    >(null);
    const [trustFeatures, setTrustFeatures] = useState<TrustFeature[]>(() =>
        (settings?.trust_features ?? []).slice(0, 4),
    );
    const [isUploadingTrustFeature, setIsUploadingTrustFeature] =
        useState(false);
    const [deletingTrustFeatureId, setDeletingTrustFeatureId] = useState<
        string | null
    >(null);
    const [trustFeatureUploadTarget, setTrustFeatureUploadTarget] = useState<
        string | null
    >(null);
    const [replacingTrustFeatureId, setReplacingTrustFeatureId] = useState<
        string | null
    >(null);
    const [defaultVideos, setDefaultVideos] = useState<{
        default_video_1: string | null;
        default_video_2: string | null;
        homepage_video: string | null;
        category_video: string | null;
    }>({
        default_video_1: settings?.default_video_1 ?? null,
        default_video_2: settings?.default_video_2 ?? null,
        homepage_video: settings?.homepage_video ?? null,
        category_video: settings?.category_video ?? null,
    });
    const [uploadingSlot, setUploadingSlot] = useState<1 | 2 | null>(null);
    const [removingSlot, setRemovingSlot] = useState<1 | 2 | null>(null);
    const fileInput1 = useRef<HTMLInputElement>(null);
    const fileInput2 = useRef<HTMLInputElement>(null);
    const verificationFileInput = useRef<HTMLInputElement>(null);
    const trustFeatureInput = useRef<HTMLInputElement>(null);

    const getTrustFeatureUrl = (feature: TrustFeature) =>
        feature.url ?? feature.image_url ?? '';

    const handleTrustFeatureUpload = async (
        file: File,
        featureId?: string | null,
    ) => {
        if (!featureId && trustFeatures.length >= 4) {
            toast.error('Only four trust feature images are allowed.');
            return;
        }

        setIsUploadingTrustFeature(true);
        setReplacingTrustFeatureId(featureId ?? null);
        const form = new FormData();
        form.append('trust_feature_image', file);

        try {
            const response = await axios.post<{
                features: TrustFeature[];
                message?: string;
            }>(
                featureId
                    ? `/admin/system/settings/trust-features/${featureId}`
                    : '/admin/system/settings/trust-features',
                form,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                },
            );

            setTrustFeatures((response.data.features ?? []).slice(0, 4));
            toast.success(
                response.data.message ||
                    (featureId
                        ? 'Trust feature image replaced successfully.'
                        : 'Trust feature image uploaded successfully.'),
            );
        } catch (error) {
            const message =
                axios.isAxiosError(error) &&
                typeof error.response?.data?.message === 'string'
                    ? error.response.data.message
                    : featureId
                      ? 'Failed to replace trust feature image.'
                      : 'Failed to upload trust feature image.';
            toast.error(message);
        } finally {
            setIsUploadingTrustFeature(false);
            setReplacingTrustFeatureId(null);
            setTrustFeatureUploadTarget(null);
        }
    };

    const handleTrustFeatureDelete = async (featureId: string) => {
        setDeletingTrustFeatureId(featureId);

        try {
            const response = await axios.delete<{
                features: TrustFeature[];
                message?: string;
            }>('/admin/system/settings/trust-features', {
                data: { trust_feature_id: featureId },
            });

            setTrustFeatures((response.data.features ?? []).slice(0, 4));
            toast.success(
                response.data.message ||
                    'Trust feature image deleted successfully.',
            );
        } catch (error) {
            const message =
                axios.isAxiosError(error) &&
                typeof error.response?.data?.message === 'string'
                    ? error.response.data.message
                    : 'Failed to delete trust feature image.';
            toast.error(message);
        } finally {
            setDeletingTrustFeatureId(null);
        }
    };

    const handleDefaultVideoUpload = async (slotNumber: 1 | 2, file: File) => {
        setUploadingSlot(slotNumber);
        const field = `default_video_${slotNumber}` as
            'default_video_1' | 'default_video_2' | 'homepage_video';
        const form = new FormData();
        form.append(field, file);
        try {
            const res = await axios.post<{
                success: boolean;
                default_video_1: string | null;
                default_video_2: string | null;
                homepage_video: string | null;
                category_video: string | null;
            }>('/admin/system/settings/default-videos', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // Update state directly from JSON response
            setDefaultVideos({
                default_video_1: res.data.default_video_1,
                default_video_2: res.data.default_video_2,
                homepage_video: res.data.homepage_video,
                category_video: res.data.category_video,
            });
            toast.success(`Default Video ${slotNumber} uploaded.`);
        } catch {
            toast.error('Upload failed.');
        } finally {
            setUploadingSlot(null);
        }
    };

    const handleDefaultVideoRemove = (slotNumber: 1 | 2) => {
        const field = `default_video_${slotNumber}` as
            'default_video_1' | 'default_video_2';
        const prevValue = defaultVideos[field];
        setRemovingSlot(slotNumber);
        // Optimistic: clear immediately
        setDefaultVideos((prev) => ({ ...prev, [field]: null }));
        void axios
            .delete<{ success: boolean }>(
                '/admin/system/settings/default-videos',
                { data: { field } },
            )
            .then(() => {
                toast.success(`Default Video ${slotNumber} removed.`);
            })
            .catch(() => {
                // Rollback
                setDefaultVideos((prev) => ({ ...prev, [field]: prevValue }));
                toast.error('Failed to remove video.');
            })
            .finally(() => setRemovingSlot(null));
    };

    const [uploadingHomepageVideo, setUploadingHomepageVideo] = useState(false);
    const [homepageVideoProgress, setHomepageVideoProgress] = useState(0);
    const [removingHomepageVideo, setRemovingHomepageVideo] = useState(false);
    const homepageVideoInput = useRef<HTMLInputElement>(null);
    const [uploadingCategoryVideo, setUploadingCategoryVideo] = useState(false);
    const [categoryVideoProgress, setCategoryVideoProgress] = useState(0);
    const [removingCategoryVideo, setRemovingCategoryVideo] = useState(false);
    const categoryVideoInput = useRef<HTMLInputElement>(null);

    const handleHomepageVideoUpload = async (file: File) => {
        setUploadingHomepageVideo(true);
        setHomepageVideoProgress(0);
        const form = new FormData();
        form.append('homepage_video', file);

        try {
            const res = await axios.post<{
                success: boolean;
                default_video_1: string | null;
                default_video_2: string | null;
                homepage_video: string | null;
                category_video: string | null;
            }>('/admin/system/settings/default-videos', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = progressEvent.total
                        ? Math.round(
                              (progressEvent.loaded * 100) /
                                  progressEvent.total,
                          )
                        : 0;
                    setHomepageVideoProgress(percent);
                },
            });

            setDefaultVideos({
                default_video_1: res.data.default_video_1,
                default_video_2: res.data.default_video_2,
                homepage_video: res.data.homepage_video,
                category_video: res.data.category_video,
            });
            toast.success('Homepage video uploaded.');
        } catch {
            toast.error('Homepage video upload failed.');
        } finally {
            setUploadingHomepageVideo(false);
            setHomepageVideoProgress(0);
        }
    };

    const handleHomepageVideoRemove = () => {
        const prevValue = defaultVideos.homepage_video;
        setRemovingHomepageVideo(true);
        setDefaultVideos((prev) => ({ ...prev, homepage_video: null }));

        void axios
            .delete<{ success: boolean }>(
                '/admin/system/settings/default-videos',
                { data: { field: 'homepage_video' } },
            )
            .then(() => {
                toast.success('Homepage video removed.');
            })
            .catch(() => {
                setDefaultVideos((prev) => ({
                    ...prev,
                    homepage_video: prevValue,
                }));
                toast.error('Failed to remove homepage video.');
            })
            .finally(() => setRemovingHomepageVideo(false));
    };

    const handleCategoryVideoUpload = (file: File) => {
        setUploadingCategoryVideo(true);
        setCategoryVideoProgress(0);
        const form = new FormData();
        form.append('category_video', file);

        void axios
            .post<{
                success: boolean;
                default_video_1: string | null;
                default_video_2: string | null;
                homepage_video: string | null;
                category_video: string | null;
            }>('/admin/system/settings/default-videos', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = progressEvent.total
                        ? Math.round(
                              (progressEvent.loaded * 100) /
                                  progressEvent.total,
                          )
                        : 0;
                    setCategoryVideoProgress(percent);
                },
            })
            .then((res) => {
                setDefaultVideos({
                    default_video_1: res.data.default_video_1,
                    default_video_2: res.data.default_video_2,
                    homepage_video: res.data.homepage_video,
                    category_video: res.data.category_video,
                });
                toast.success('Category video uploaded.');
            })
            .catch(() => {
                toast.error('Category video upload failed.');
            })
            .then(() => {
                setUploadingCategoryVideo(false);
                setCategoryVideoProgress(0);
            });
    };

    const handleCategoryVideoRemove = () => {
        const prevValue = defaultVideos.category_video;
        setRemovingCategoryVideo(true);
        setDefaultVideos((prev) => ({ ...prev, category_video: null }));

        void axios
            .delete<{ success: boolean }>(
                '/admin/system/settings/default-videos',
                { data: { field: 'category_video' } },
            )
            .then(() => {
                toast.success('Category video removed.');
            })
            .catch(() => {
                setDefaultVideos((prev) => ({
                    ...prev,
                    category_video: prevValue,
                }));
                toast.error('Failed to remove category video.');
            })
            .then(() => setRemovingCategoryVideo(false));
    };

    const handleVerificationFileUpload = async (files: File[]) => {
        if (files.length === 0) {
            return;
        }

        setIsUploadingVerificationFile(true);
        setVerificationUploadProgress(0);

        const form = new FormData();
        files.forEach((file) => {
            form.append('verification_files[]', file);
        });

        try {
            const response = await axios.post<{
                files: VerificationFile[];
                message?: string;
            }>('/admin/system/settings/verification-files', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (event) => {
                    const total = event.total ?? 0;
                    const loaded = event.loaded ?? 0;
                    setVerificationUploadProgress(
                        total > 0 ? Math.round((loaded / total) * 100) : 0,
                    );
                },
            });

            setVerificationFiles(response.data.files ?? []);
            toast.success(
                response.data.message ||
                    'Verification files uploaded successfully.',
            );
        } catch (error) {
            const message =
                axios.isAxiosError(error) &&
                typeof error.response?.data?.message === 'string'
                    ? error.response.data.message
                    : 'Failed to upload verification file.';
            toast.error(message);
        } finally {
            setIsUploadingVerificationFile(false);
            setVerificationUploadProgress(0);
        }
    };

    const handleVerificationFileDelete = async (filename: string) => {
        setDeletingVerificationFile(filename);

        try {
            const response = await axios.delete<{
                files: VerificationFile[];
                message?: string;
            }>('/admin/system/settings/verification-files', {
                data: { filename },
            });

            setVerificationFiles(response.data.files ?? []);
            toast.success(
                response.data.message ||
                    'Verification file deleted successfully.',
            );
        } catch (error) {
            const message =
                axios.isAxiosError(error) &&
                typeof error.response?.data?.message === 'string'
                    ? error.response.data.message
                    : 'Failed to delete verification file.';
            toast.error(message);
        } finally {
            setDeletingVerificationFile(null);
        }
    };

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

    const seoForm = useForm<SeoFormValues>({
        resolver: zodResolver(seoSchema),
        defaultValues: {
            global_meta_title: settings?.global_meta_title || '',
            global_meta_description: settings?.global_meta_description || '',
            global_meta_keywords: settings?.global_meta_keywords || '',
            global_og_title: settings?.global_og_title || '',
            global_og_description: settings?.global_og_description || '',
            global_og_image_url: settings?.global_og_image_url || '',
            global_twitter_title: settings?.global_twitter_title || '',
            global_twitter_description:
                settings?.global_twitter_description || '',
            global_twitter_image_url: settings?.global_twitter_image_url || '',
        },
    });

    const adsTxtForm = useForm<AdsTxtFormValues>({
        resolver: zodResolver(adsTxtSchema),
        defaultValues: {
            ads_txt: adsTxt,
        },
    });

    const tickerForm = useForm<TickerFormValues>({
        resolver: zodResolver(tickerSchema),
        defaultValues: {
            ticker_text: settings?.ticker_text || '',
            ticker_enabled: settings?.ticker_enabled ?? false,
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

    const onSeoSubmit = (data: SeoFormValues) => {
        setIsSubmittingSeo(true);

        router.post('/admin/system/settings/seo', data, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('SEO defaults updated successfully');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error(
                    'Failed to update SEO defaults. Please check the form.',
                );

                Object.keys(errors).forEach((key) => {
                    seoForm.setError(key as keyof SeoFormValues, {
                        type: 'server',
                        message: errors[key] as string,
                    });
                });
            },
            onFinish: () => {
                setIsSubmittingSeo(false);
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

    const onAdsTxtSubmit = (data: AdsTxtFormValues) => {
        setIsSubmittingAdsTxt(true);

        router.post('/admin/system/settings/ads-txt', data, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('ads.txt updated successfully');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error('Failed to update ads.txt.');

                Object.keys(errors).forEach((key) => {
                    adsTxtForm.setError(key as keyof AdsTxtFormValues, {
                        type: 'server',
                        message: errors[key] as string,
                    });
                });
            },
            onFinish: () => {
                setIsSubmittingAdsTxt(false);
            },
        });
    };

    const onTickerSubmit = (data: TickerFormValues) => {
        setIsSubmittingTicker(true);

        router.post('/admin/system/settings/ticker', data, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Ticker updated successfully');
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
                toast.error('Failed to update ticker.');

                Object.keys(errors).forEach((key) => {
                    tickerForm.setError(key as keyof TickerFormValues, {
                        type: 'server',
                        message: errors[key] as string,
                    });
                });
            },
            onFinish: () => {
                setIsSubmittingTicker(false);
            },
        });
    };

    const deleteTicker = () => {
        if (!confirm('Delete the ticker text?')) {
            return;
        }

        setIsDeletingTicker(true);

        router.delete('/admin/system/settings/ticker', {
            preserveScroll: true,
            onSuccess: () => {
                tickerForm.reset({
                    ticker_text: '',
                    ticker_enabled: false,
                });
                toast.success('Ticker deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete ticker.');
            },
            onFinish: () => {
                setIsDeletingTicker(false);
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
                    <TabsList className="grid w-full max-w-7xl grid-cols-10 gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
                        <TabsTrigger
                            value="general"
                            className="rounded-lg transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow dark:text-zinc-400 dark:data-[state=active]:bg-indigo-600 dark:data-[state=active]:text-white"
                        >
                            General
                        </TabsTrigger>
                        <TabsTrigger
                            value="social-media"
                            className="rounded-lg transition-all data-[state=active]:bg-pink-600 data-[state=active]:text-white data-[state=active]:shadow dark:text-zinc-400 dark:data-[state=active]:bg-pink-600 dark:data-[state=active]:text-white"
                        >
                            Social Media
                        </TabsTrigger>
                        <TabsTrigger
                            value="seo"
                            className="rounded-lg transition-all data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=active]:shadow dark:text-zinc-400 dark:data-[state=active]:bg-sky-600 dark:data-[state=active]:text-white"
                        >
                            SEO
                        </TabsTrigger>
                        <TabsTrigger
                            value="scripts"
                            className="rounded-lg transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow dark:text-zinc-400 dark:data-[state=active]:bg-amber-500 dark:data-[state=active]:text-white"
                        >
                            Scripts
                        </TabsTrigger>
                        <TabsTrigger
                            value="ticker"
                            className="rounded-lg transition-all data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow dark:text-zinc-400 dark:data-[state=active]:bg-orange-600 dark:data-[state=active]:text-white"
                        >
                            Ticker
                        </TabsTrigger>
                        <TabsTrigger
                            value="ads-txt"
                            className="rounded-lg transition-all data-[state=active]:bg-lime-600 data-[state=active]:text-white data-[state=active]:shadow dark:text-zinc-400 dark:data-[state=active]:bg-lime-600 dark:data-[state=active]:text-white"
                        >
                            ads.txt
                        </TabsTrigger>
                        <TabsTrigger
                            value="verification-files"
                            className="rounded-lg transition-all data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow dark:text-zinc-400 dark:data-[state=active]:bg-amber-600 dark:data-[state=active]:text-white"
                        >
                            Verify
                        </TabsTrigger>
                        <TabsTrigger
                            value="counter"
                            className="rounded-lg transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow dark:text-zinc-400 dark:data-[state=active]:bg-emerald-600 dark:data-[state=active]:text-white"
                        >
                            Counter
                        </TabsTrigger>
                        <TabsTrigger
                            value="trust-features"
                            className="rounded-lg transition-all data-[state=active]:bg-cyan-600 data-[state=active]:text-white data-[state=active]:shadow dark:text-zinc-400 dark:data-[state=active]:bg-cyan-600 dark:data-[state=active]:text-white"
                        >
                            Trust
                        </TabsTrigger>
                        <TabsTrigger
                            value="default-videos"
                            className="rounded-lg transition-all data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow dark:text-zinc-400 dark:data-[state=active]:bg-violet-600 dark:data-[state=active]:text-white"
                        >
                            Default Videos
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

                    {/* Ticker Tab */}
                    <TabsContent value="ticker" className="mt-6">
                        <Card className="p-6 dark:border-zinc-800 dark:bg-black">
                            <Form {...tickerForm}>
                                <form
                                    onSubmit={tickerForm.handleSubmit(
                                        onTickerSubmit,
                                    )}
                                    className="space-y-6"
                                >
                                    <FormField
                                        control={tickerForm.control}
                                        name="ticker_enabled"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-xl border p-4 dark:border-zinc-800">
                                                <div className="space-y-1">
                                                    <FormLabel className="text-base dark:text-zinc-300">
                                                        Show ticker
                                                    </FormLabel>
                                                    <FormDescription className="dark:text-zinc-500">
                                                        Turn this off to hide
                                                        the ticker without
                                                        deleting the text.
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={tickerForm.control}
                                        name="ticker_text"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base dark:text-zinc-300">
                                                    Ticker Text
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Announcement text"
                                                        {...field}
                                                        className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                    />
                                                </FormControl>
                                                <FormDescription className="dark:text-zinc-500">
                                                    This appears above the bulk
                                                    order bar and scrolls from
                                                    left to right.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                                        <p className="mb-2 text-xs font-semibold text-amber-800 uppercase dark:text-amber-300">
                                            Preview
                                        </p>
                                        <div className="overflow-hidden rounded-lg bg-white py-2 text-sm font-medium text-amber-900 dark:bg-zinc-950 dark:text-amber-300">
                                            <div className="ticker-track whitespace-nowrap">
                                                <span className="px-8">
                                                    {tickerForm.watch(
                                                        'ticker_text',
                                                    ) || 'Ticker text preview'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            type="submit"
                                            className="bg-green-600 hover:bg-green-700"
                                            disabled={isSubmittingTicker}
                                        >
                                            {isSubmittingTicker
                                                ? 'Saving...'
                                                : 'Save Ticker'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            disabled={isDeletingTicker}
                                            onClick={deleteTicker}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {isDeletingTicker
                                                ? 'Deleting...'
                                                : 'Delete Ticker'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </Card>
                    </TabsContent>

                    {/* ads.txt Tab */}
                    <TabsContent value="ads-txt" className="mt-6">
                        <Card className="p-6 dark:border-zinc-800 dark:bg-black">
                            <Form {...adsTxtForm}>
                                <form
                                    onSubmit={adsTxtForm.handleSubmit(
                                        onAdsTxtSubmit,
                                    )}
                                    className="space-y-6"
                                >
                                    <FormField
                                        control={adsTxtForm.control}
                                        name="ads_txt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base dark:text-zinc-300">
                                                    Paste your ads.txt
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        rows={16}
                                                        placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
                                                        {...field}
                                                        className="font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                    />
                                                </FormControl>
                                                <FormDescription className="dark:text-zinc-500">
                                                    Saves to public/ads.txt. If
                                                    the file does not exist, it
                                                    will be created.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={isSubmittingAdsTxt}
                                    >
                                        {isSubmittingAdsTxt
                                            ? 'Saving...'
                                            : 'Save ads.txt'}
                                    </Button>
                                </form>
                            </Form>
                        </Card>
                    </TabsContent>

                    {/* Verification Files Tab */}
                    <TabsContent value="verification-files" className="mt-6">
                        <Card className="p-6 dark:border-zinc-800 dark:bg-black">
                            <div className="mb-6">
                                <h3 className="text-base font-semibold dark:text-zinc-100">
                                    Site Verification Files
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Upload search/ad platform verification files
                                    to the public root, such as Google HTML
                                    verification files.
                                </p>
                            </div>

                            <input
                                ref={verificationFileInput}
                                type="file"
                                multiple
                                accept=".html,.htm,.txt,.xml,text/html,text/plain,text/xml,application/xml"
                                className="hidden"
                                onChange={(event) => {
                                    const files = Array.from(
                                        event.target.files ?? [],
                                    );
                                    if (files.length > 0) {
                                        void handleVerificationFileUpload(
                                            files,
                                        );
                                        event.target.value = '';
                                    }
                                }}
                            />

                            <div className="space-y-4">
                                <button
                                    type="button"
                                    disabled={isUploadingVerificationFile}
                                    onClick={() =>
                                        verificationFileInput.current?.click()
                                    }
                                    className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-10 text-amber-700 transition-colors hover:border-amber-500 hover:bg-amber-100 hover:text-amber-800 disabled:opacity-60 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-300 dark:hover:border-amber-700 dark:hover:bg-amber-950/30"
                                >
                                    <Upload className="h-6 w-6" />
                                    <span className="text-sm font-medium">
                                        Browse verification files
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        HTML, TXT, or XML up to 1MB each
                                    </span>
                                </button>

                                {isUploadingVerificationFile && (
                                    <div className="space-y-2 rounded-lg border p-4 dark:border-zinc-800">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Uploading files</span>
                                            <span>
                                                {verificationUploadProgress}%
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                            <div
                                                className="h-full rounded-full bg-amber-600 transition-all"
                                                style={{
                                                    width: `${verificationUploadProgress}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 space-y-3">
                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    Uploaded Files
                                </h4>

                                {verificationFiles.length === 0 ? (
                                    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground dark:border-zinc-800">
                                        No verification files uploaded yet.
                                    </p>
                                ) : (
                                    <div className="divide-y rounded-lg border dark:divide-zinc-800 dark:border-zinc-800">
                                        {verificationFiles.map((file) => (
                                            <div
                                                key={file.filename}
                                                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="min-w-0 space-y-1">
                                                    <p className="truncate font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                        {file.filename}
                                                    </p>
                                                    <a
                                                        href={`/${file.filename}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block truncate text-xs text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                                                    >
                                                        /{file.filename}
                                                    </a>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={
                                                        deletingVerificationFile ===
                                                        file.filename
                                                    }
                                                    onClick={() =>
                                                        void handleVerificationFileDelete(
                                                            file.filename,
                                                        )
                                                    }
                                                >
                                                    {deletingVerificationFile ===
                                                    file.filename
                                                        ? 'Deleting...'
                                                        : 'Remove'}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </TabsContent>

                    {/* Trust Features Tab */}
                    <TabsContent value="trust-features" className="mt-6">
                        <Card className="p-6 dark:border-zinc-800 dark:bg-black">
                            <div className="mb-6">
                                <h3 className="text-base font-semibold dark:text-zinc-100">
                                    Home Trust Feature Images
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Upload up to four images for the trust
                                    feature strip on the home page.
                                </p>
                            </div>

                            <input
                                ref={trustFeatureInput}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (file) {
                                        void handleTrustFeatureUpload(
                                            file,
                                            trustFeatureUploadTarget,
                                        );
                                        event.target.value = '';
                                    }
                                }}
                            />

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {Array.from({ length: 4 }).map((_, index) => {
                                    const feature = trustFeatures[index];
                                    const canUpload =
                                        !feature &&
                                        trustFeatures.length === index;
                                    const imageUrl = feature
                                        ? getTrustFeatureUrl(feature)
                                        : '';

                                    return (
                                        <div
                                            key={`trust-feature-slot-${index}`}
                                            className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-cyan-200 bg-cyan-50/50 p-4 text-center dark:border-cyan-900/60 dark:bg-cyan-950/20"
                                        >
                                            {feature && imageUrl ? (
                                                <div className="w-full space-y-3">
                                                    <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg border border-white bg-white dark:border-zinc-800 dark:bg-zinc-950">
                                                        <img
                                                            src={imageUrl}
                                                            alt={`Trust feature ${index + 1}`}
                                                            className="size-full object-contain p-3"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={
                                                                isUploadingTrustFeature ||
                                                                deletingTrustFeatureId ===
                                                                    feature.id
                                                            }
                                                            onClick={() => {
                                                                setTrustFeatureUploadTarget(
                                                                    feature.id,
                                                                );
                                                                trustFeatureInput.current?.click();
                                                            }}
                                                        >
                                                            {replacingTrustFeatureId ===
                                                            feature.id ? (
                                                                <>
                                                                    <Spinner className="mr-2 size-4" />
                                                                    Replacing...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload className="mr-2 size-4" />
                                                                    Replace
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            disabled={
                                                                isUploadingTrustFeature ||
                                                                deletingTrustFeatureId ===
                                                                    feature.id
                                                            }
                                                            onClick={() => {
                                                                void handleTrustFeatureDelete(
                                                                    feature.id,
                                                                );
                                                            }}
                                                        >
                                                            <Trash2 className="mr-2 size-4" />
                                                            {deletingTrustFeatureId ===
                                                            feature.id
                                                                ? 'Deleting...'
                                                                : 'Delete'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        !canUpload ||
                                                        isUploadingTrustFeature
                                                    }
                                                    onClick={() => {
                                                        setTrustFeatureUploadTarget(
                                                            null,
                                                        );
                                                        trustFeatureInput.current?.click();
                                                    }}
                                                    className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg text-cyan-700 transition-colors enabled:hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-cyan-300 dark:enabled:hover:bg-cyan-950/40"
                                                >
                                                    {canUpload &&
                                                    isUploadingTrustFeature ? (
                                                        <Spinner className="size-6" />
                                                    ) : (
                                                        <Upload className="size-6" />
                                                    )}
                                                    <span className="text-sm font-medium">
                                                        {canUpload
                                                            ? isUploadingTrustFeature
                                                                ? 'Uploading...'
                                                                : `Upload Image ${index + 1}`
                                                            : `Slot ${index + 1}`}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        JPG, PNG, WebP or GIF
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
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

                    {/* SEO Tab */}
                    <TabsContent value="seo" className="mt-6">
                        <Card className="p-6 dark:border-zinc-800 dark:bg-black">
                            <Form {...seoForm}>
                                <form
                                    onSubmit={seoForm.handleSubmit(onSeoSubmit)}
                                    className="space-y-6"
                                >
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <FormField
                                            control={seoForm.control}
                                            name="global_meta_title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base dark:text-zinc-300">
                                                        Global SEO Title
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            maxLength={120}
                                                            placeholder="Natural Rudraksh"
                                                            {...field}
                                                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={seoForm.control}
                                            name="global_meta_keywords"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base dark:text-zinc-300">
                                                        Global SEO Keywords
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="rudraksh, rudraksha mala, natural rudraksh"
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
                                        control={seoForm.control}
                                        name="global_meta_description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base dark:text-zinc-300">
                                                    Global SEO Description
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        rows={3}
                                                        maxLength={160}
                                                        placeholder="Default description used when a page has no custom SEO description."
                                                        {...field}
                                                        className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="rounded-lg border p-4 dark:border-zinc-800">
                                        <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                            Global Facebook, LinkedIn &
                                            Instagram Preview
                                        </h3>
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <FormField
                                                control={seoForm.control}
                                                name="global_og_title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base dark:text-zinc-300">
                                                            Global Open Graph
                                                            Title
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                maxLength={120}
                                                                placeholder="Default share title"
                                                                {...field}
                                                                className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={seoForm.control}
                                                name="global_og_image_url"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base dark:text-zinc-300">
                                                            Global Open Graph
                                                            Image URL
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="url"
                                                                placeholder="Leave empty to use /assets/img/og-default.png"
                                                                {...field}
                                                                className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="dark:text-zinc-500">
                                                            Recommended size:
                                                            1200x630. Empty uses
                                                            the logo-based
                                                            default image.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={seoForm.control}
                                            name="global_og_description"
                                            render={({ field }) => (
                                                <FormItem className="mt-6">
                                                    <FormLabel className="text-base dark:text-zinc-300">
                                                        Global Open Graph
                                                        Description
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            rows={3}
                                                            maxLength={160}
                                                            placeholder="Default social preview description."
                                                            {...field}
                                                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="rounded-lg border p-4 dark:border-zinc-800">
                                        <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                            Global X / Twitter Preview
                                        </h3>
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <FormField
                                                control={seoForm.control}
                                                name="global_twitter_title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base dark:text-zinc-300">
                                                            Global Twitter Title
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                maxLength={120}
                                                                placeholder="Default X/Twitter title"
                                                                {...field}
                                                                className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={seoForm.control}
                                                name="global_twitter_image_url"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-base dark:text-zinc-300">
                                                            Global Twitter Image
                                                            URL
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="url"
                                                                placeholder="Leave empty to use /assets/img/og-default.png"
                                                                {...field}
                                                                className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="dark:text-zinc-500">
                                                            Recommended size:
                                                            1200x630. Empty uses
                                                            the logo-based
                                                            default image.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={seoForm.control}
                                            name="global_twitter_description"
                                            render={({ field }) => (
                                                <FormItem className="mt-6">
                                                    <FormLabel className="text-base dark:text-zinc-300">
                                                        Global Twitter
                                                        Description
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            rows={3}
                                                            maxLength={160}
                                                            placeholder="Default X/Twitter card description."
                                                            {...field}
                                                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={isSubmittingSeo}
                                    >
                                        {isSubmittingSeo
                                            ? 'Updating...'
                                            : 'Update SEO Defaults'}
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
                                                'Script code must not exceed 100,000 characters.',
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
                                                        rows={10}
                                                        {...field}
                                                        className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                    />
                                                </FormControl>
                                                <p className="text-xs text-muted-foreground">
                                                    Paste the complete code or
                                                    HTML snippet to add to the
                                                    site &lt;head&gt; (for
                                                    example, analytics, pixels,
                                                    meta tags, or styles).
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
                                                        rows={10}
                                                        {...field}
                                                        className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                                    />
                                                </FormControl>
                                                <p className="text-xs text-muted-foreground">
                                                    Paste the complete code or
                                                    HTML snippet to add before
                                                    the closing &lt;body&gt;
                                                    tag.
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
                    {/* Default Videos Tab */}
                    <TabsContent value="default-videos" className="mt-6">
                        <Card className="p-6 dark:border-zinc-800 dark:bg-black">
                            <div className="mb-4">
                                <h3 className="text-base font-semibold dark:text-zinc-100">
                                    Default Product Videos
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    These videos auto-appear on all product
                                    pages that have no uploaded videos.
                                </p>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                {([1, 2] as const).map((slotNumber) => {
                                    const field =
                                        `default_video_${slotNumber}` as
                                            | 'default_video_1'
                                            | 'default_video_2';
                                    const currentVideo = defaultVideos[field];
                                    const fileInputRef =
                                        slotNumber === 1
                                            ? fileInput1
                                            : fileInput2;
                                    const isUploading =
                                        uploadingSlot === slotNumber;
                                    const isRemoving =
                                        removingSlot === slotNumber;

                                    return (
                                        <div
                                            key={slotNumber}
                                            className="space-y-2"
                                        >
                                            <p className="text-sm font-medium dark:text-zinc-300">
                                                Default Video {slotNumber}
                                            </p>

                                            {currentVideo ? (
                                                <div className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                                                    <video
                                                        src={`/uploads/settings/videos/${currentVideo}#t=0.1`}
                                                        preload="metadata"
                                                        controls
                                                        className="h-36 w-full rounded-xl object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled={isRemoving}
                                                        onClick={() =>
                                                            handleDefaultVideoRemove(
                                                                slotNumber,
                                                            )
                                                        }
                                                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-700 disabled:opacity-50"
                                                        title="Remove video"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                    <div className="px-3 py-1.5">
                                                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                            ✓ Ready
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="video/mp4,video/webm,video/quicktime"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file =
                                                                e.target
                                                                    .files?.[0];
                                                            if (file) {
                                                                void handleDefaultVideoUpload(
                                                                    slotNumber,
                                                                    file,
                                                                );
                                                                e.target.value =
                                                                    '';
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled={isUploading}
                                                        onClick={() =>
                                                            fileInputRef.current?.click()
                                                        }
                                                        className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 text-zinc-400 transition-colors hover:border-primary hover:text-primary disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
                                                    >
                                                        {isUploading ? (
                                                            <>
                                                                <svg
                                                                    className="h-5 w-5 animate-spin"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <circle
                                                                        className="opacity-25"
                                                                        cx="12"
                                                                        cy="12"
                                                                        r="10"
                                                                        stroke="currentColor"
                                                                        strokeWidth="4"
                                                                    />
                                                                    <path
                                                                        className="opacity-75"
                                                                        fill="currentColor"
                                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                                    />
                                                                </svg>
                                                                <span className="text-xs">
                                                                    Uploading…
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="h-5 w-5" />
                                                                <span className="text-xs">
                                                                    Click to
                                                                    upload MP4
                                                                </span>
                                                            </>
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
                                <div className="mb-4">
                                    <h3 className="text-base font-semibold dark:text-zinc-100">
                                        Homepage Video
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        This video appears directly below the
                                        hero slider and auto-plays on the
                                        homepage.
                                    </p>
                                </div>

                                {/* Hidden file input — always mounted so Replace also works */}
                                <input
                                    ref={homepageVideoInput}
                                    type="file"
                                    accept="video/mp4,video/webm,video/quicktime"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            void handleHomepageVideoUpload(
                                                file,
                                            );
                                            e.target.value = '';
                                        }
                                    }}
                                />

                                {defaultVideos.homepage_video &&
                                !uploadingHomepageVideo ? (
                                    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                                        <video
                                            src={`/uploads/settings/videos/${defaultVideos.homepage_video}#t=0.1`}
                                            preload="metadata"
                                            controls
                                            className="aspect-video w-full bg-black object-cover"
                                        />
                                        <button
                                            type="button"
                                            disabled={removingHomepageVideo}
                                            onClick={handleHomepageVideoRemove}
                                            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-700 disabled:opacity-50"
                                            title="Remove homepage video"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                ✓ Ready for homepage playback
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    homepageVideoInput.current?.click()
                                                }
                                                disabled={
                                                    uploadingHomepageVideo
                                                }
                                                className="text-sm font-medium text-violet-600 hover:text-violet-700 disabled:opacity-50"
                                            >
                                                Replace video
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={uploadingHomepageVideo}
                                        onClick={() =>
                                            homepageVideoInput.current?.click()
                                        }
                                        className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 text-zinc-400 transition-colors hover:border-violet-500 hover:text-violet-600 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
                                    >
                                        {uploadingHomepageVideo ? (
                                            <div className="flex w-full flex-col items-center gap-4 py-4">
                                                <style>{`
                                                    @keyframes liquidWave {
                                                        0% { transform: translateX(0); }
                                                        100% { transform: translateX(-50%); }
                                                    }
                                                    @keyframes bucketFloat {
                                                        0%, 100% { transform: translateY(0px); }
                                                        50% { transform: translateY(-6px); }
                                                    }
                                                    @keyframes bubbleRise {
                                                        0% { transform: translateY(0) scale(1); opacity: 0.6; }
                                                        100% { transform: translateY(-60px) scale(0.5); opacity: 0; }
                                                    }
                                                    .liquid-wave { animation: liquidWave 1.8s linear infinite; }
                                                    .bucket-float { animation: bucketFloat 2.5s ease-in-out infinite; }
                                                    .bubble-1 { animation: bubbleRise 2s ease-in infinite; }
                                                    .bubble-2 { animation: bubbleRise 2s ease-in 0.6s infinite; }
                                                    .bubble-3 { animation: bubbleRise 2s ease-in 1.2s infinite; }
                                                `}</style>

                                                {/* Bucket with liquid fill */}
                                                <div
                                                    className="bucket-float relative"
                                                    style={{
                                                        width: 88,
                                                        height: 112,
                                                    }}
                                                >
                                                    {/* Bucket body */}
                                                    <div
                                                        className="absolute inset-0 overflow-hidden rounded-t-md rounded-b-[28px] border-[3px] border-violet-500 bg-white dark:border-violet-400 dark:bg-zinc-900"
                                                        style={{
                                                            boxShadow:
                                                                '0 0 24px rgba(139,92,246,0.25)',
                                                        }}
                                                    >
                                                        {/* Water fill — height rises with progress */}
                                                        <div
                                                            className="absolute right-0 bottom-0 left-0 transition-all duration-700 ease-out"
                                                            style={{
                                                                height: `${homepageVideoProgress}%`,
                                                                background:
                                                                    'rgba(139,92,246,0.18)',
                                                            }}
                                                        >
                                                            {/* Wave surface */}
                                                            <div
                                                                className="liquid-wave absolute -top-3 left-0 h-6"
                                                                style={{
                                                                    width: '200%',
                                                                    willChange:
                                                                        'transform',
                                                                }}
                                                            >
                                                                <svg
                                                                    viewBox="0 0 400 24"
                                                                    className="h-full w-full"
                                                                    preserveAspectRatio="none"
                                                                >
                                                                    <path
                                                                        d="M0,12 C33,0 66,24 100,12 C133,0 166,24 200,12 C233,0 266,24 300,12 C333,0 366,24 400,12 L400,24 L0,24 Z"
                                                                        fill="rgba(139,92,246,0.55)"
                                                                    />
                                                                    <path
                                                                        d="M0,16 C33,4 66,28 100,16 C133,4 166,28 200,16 C233,4 266,28 300,16 C333,4 366,28 400,16 L400,24 L0,24 Z"
                                                                        fill="rgba(139,92,246,0.3)"
                                                                    />
                                                                </svg>
                                                            </div>

                                                            {/* Bubbles */}
                                                            <div className="bubble-1 absolute bottom-2 left-4 h-2 w-2 rounded-full bg-violet-400/50" />
                                                            <div className="bubble-2 absolute bottom-3 left-10 h-1.5 w-1.5 rounded-full bg-violet-300/50" />
                                                            <div className="bubble-3 absolute bottom-1 left-7 h-1 w-1 rounded-full bg-violet-400/40" />
                                                        </div>

                                                        {/* Percentage in center */}
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span
                                                                className="text-lg font-extrabold text-violet-700 tabular-nums dark:text-violet-300"
                                                                style={{
                                                                    textShadow:
                                                                        '0 1px 4px rgba(255,255,255,0.8)',
                                                                }}
                                                            >
                                                                {
                                                                    homepageVideoProgress
                                                                }
                                                                %
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Bucket handle */}
                                                    <div
                                                        className="absolute -top-3 left-1/2 h-4 w-10 -translate-x-1/2 rounded-t-full border-[3px] border-violet-500 dark:border-violet-400"
                                                        style={{
                                                            background:
                                                                'transparent',
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                                                        Uploading video…
                                                    </span>
                                                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                                        Please wait, do not
                                                        close this page
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="h-6 w-6" />
                                                <span className="text-sm font-medium">
                                                    Upload homepage video
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    MP4, MOV, or WEBM — up to
                                                    500MB
                                                </span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            <div className="mt-8 border-t border-zinc-200 pt-8 dark:border-zinc-800">
                                <div className="mb-4">
                                    <h3 className="text-base font-semibold dark:text-zinc-100">
                                        Category Video
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        This video appears on category pages in
                                        the same video card position. It does
                                        not change the homepage video.
                                    </p>
                                </div>

                                <input
                                    ref={categoryVideoInput}
                                    type="file"
                                    accept="video/mp4,video/webm,video/quicktime"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            handleCategoryVideoUpload(file);
                                            e.target.value = '';
                                        }
                                    }}
                                />

                                {defaultVideos.category_video &&
                                !uploadingCategoryVideo ? (
                                    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                                        <video
                                            src={`/uploads/settings/videos/${defaultVideos.category_video}#t=0.1`}
                                            preload="metadata"
                                            controls
                                            className="aspect-video w-full bg-zinc-950 object-cover"
                                        />
                                        <button
                                            type="button"
                                            disabled={removingCategoryVideo}
                                            onClick={handleCategoryVideoRemove}
                                            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-700 disabled:opacity-50"
                                            title="Remove category video"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="flex items-center justify-between px-4 py-3">
                                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                ✓ Ready for category pages
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    categoryVideoInput.current?.click()
                                                }
                                                disabled={
                                                    uploadingCategoryVideo
                                                }
                                                className="text-sm font-medium text-violet-600 hover:text-violet-700 disabled:opacity-50"
                                            >
                                                Replace video
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={uploadingCategoryVideo}
                                        onClick={() =>
                                            categoryVideoInput.current?.click()
                                        }
                                        className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 text-zinc-400 transition-colors hover:border-violet-500 hover:text-violet-600 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
                                    >
                                        {uploadingCategoryVideo ? (
                                            <div className="flex w-full max-w-sm flex-col items-center gap-3 px-6">
                                                <Upload className="h-6 w-6 animate-pulse text-violet-600" />
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                                    <div
                                                        className="h-full rounded-full bg-violet-600 transition-all duration-300"
                                                        style={{
                                                            width: `${categoryVideoProgress}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                                                    Uploading category video…
                                                    {categoryVideoProgress}%
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="h-6 w-6" />
                                                <span className="text-sm font-medium">
                                                    Upload category video
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    MP4, MOV, or WEBM
                                                </span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
