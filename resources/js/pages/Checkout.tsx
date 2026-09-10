import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown, ShoppingBag, Trash2 } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import SiteLayout from '@/layouts/SiteLayout';
import type { CartItem, Product, Settings } from '@/types/site-types';

interface CheckoutProps {
    cart: CartItem[];
    cartTotal: number;
    cartCount: number;
    appliedCoupon?: {
        code: string;
        discount: number;
        discountType: 'percentage' | 'fixed';
        discountValue: number;
        appliesTo: 'entire_store' | 'category' | 'product';
    } | null;
    settings: Settings;
    products?: Product[];
    user?: {
        name: string;
        email: string;
        phone: string;
    };
}

type CheckoutDraft = {
    address: string;
    city: string;
    state: string;
    pincode: string;
    paymentMethod: '' | 'cod' | 'online';
};

// Razorpay types
interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    order_id: string;
    name: string;
    description: string;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    handler: (response: RazorpayResponse) => void;
    modal: {
        ondismiss: () => void;
    };
    theme: {
        color: string;
    };
}

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => {
            open: () => void;
        };
    }
}

export default function Checkout({
    cart,
    cartTotal,
    cartCount,
    appliedCoupon: initialAppliedCoupon = null,
    settings,
    products = [],
    user,
}: CheckoutProps) {
    const { props } = usePage<{ csrf_token?: string }>();
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [isCouponSubmitting, setIsCouponSubmitting] = React.useState(false);
    const [appliedCoupon, setAppliedCoupon] =
        React.useState(initialAppliedCoupon);
    const [couponCode, setCouponCode] = React.useState(
        initialAppliedCoupon?.code ?? '',
    );
    const [stateOpen, setStateOpen] = React.useState(false);
    const isAuthenticated = Boolean(user);
    const checkoutDraftKey = 'checkout_form_draft';
    const emptyDraft: CheckoutDraft = {
        address: '',
        city: '',
        state: '',
        pincode: '',
        paymentMethod: '',
    };

    const sanitizeCheckoutDraft = (
        value: Partial<Record<string, unknown>>,
    ): CheckoutDraft => ({
        address: typeof value.address === 'string' ? value.address : '',
        city: typeof value.city === 'string' ? value.city : '',
        state: typeof value.state === 'string' ? value.state : '',
        pincode: typeof value.pincode === 'string' ? value.pincode : '',
        paymentMethod:
            value.paymentMethod === 'cod' || value.paymentMethod === 'online'
                ? value.paymentMethod
                : '',
    });

    const persistCheckoutDraft = (draft: CheckoutDraft) => {
        if (typeof window === 'undefined') {
            return;
        }

        window.sessionStorage.setItem(checkoutDraftKey, JSON.stringify(draft));
    };

    const handleRemoveItem = (
        productId: string,
        measurementValue?: number | null,
    ) => {
        router.post(
            '/cart/remove',
            { productId, measurementValue, redirectWhenEmpty: true },
            {
                preserveScroll: true,
                preserveState: false,
                onSuccess: (page) => {
                    const updatedCoupon = (
                        page.props as {
                            appliedCoupon?: CheckoutProps['appliedCoupon'];
                        }
                    ).appliedCoupon;
                    setAppliedCoupon(updatedCoupon ?? null);
                    if (!updatedCoupon) {
                        setCouponCode('');
                    }

                    if (page.component !== 'Checkout') {
                        toast.success(
                            'Product removed from cart. Redirecting to products...',
                        );
                        return;
                    }

                    const updatedTotal = Number(
                        (page.props as { cartTotal?: number }).cartTotal ?? 0,
                    );

                    toast.success(
                        `Product removed. New subtotal: ₹${updatedTotal.toLocaleString(
                            'en-IN',
                        )}`,
                    );
                },
            },
        );
    };

    // Load Razorpay script
    React.useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Form state
    const [formData, setFormData] = React.useState<CheckoutDraft>(() => {
        if (typeof window === 'undefined') {
            return emptyDraft;
        }

        try {
            const raw = window.sessionStorage.getItem(checkoutDraftKey);
            if (!raw) {
                return emptyDraft;
            }

            const parsed = JSON.parse(raw) as Partial<Record<string, unknown>>;
            return sanitizeCheckoutDraft(parsed);
        } catch {
            return emptyDraft;
        }
    });

    const [errors, setErrors] = React.useState({
        address: '',
        city: '',
        state: '',
        pincode: '',
        paymentMethod: '',
    });

    React.useEffect(() => {
        persistCheckoutDraft(formData);
    }, [formData]);

    React.useEffect(() => {
        setAppliedCoupon(initialAppliedCoupon);
        setCouponCode(initialAppliedCoupon?.code ?? '');
    }, [initialAppliedCoupon]);

    if (!cart || cart.length === 0) {
        return (
            <SiteLayout settings={settings} products={products} user={user}>
                <Head title="Checkout" />
                <div className="container mx-auto px-4 py-16">
                    <div className="mx-auto max-w-2xl text-center">
                        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
                        <h1 className="mb-2 text-2xl font-bold">
                            Your cart is empty
                        </h1>
                        <p className="mb-6 text-muted-foreground">
                            Add some products to your cart before checking out.
                        </p>
                        <Button asChild>
                            <Link href="/">Continue Shopping</Link>
                        </Button>
                    </div>
                </div>
            </SiteLayout>
        );
    }

    // Indian states list
    const indianStates = [
        'Andhra Pradesh',
        'Arunachal Pradesh',
        'Assam',
        'Bihar',
        'Chhattisgarh',
        'Goa',
        'Gujarat',
        'Haryana',
        'Himachal Pradesh',
        'Jharkhand',
        'Karnataka',
        'Kerala',
        'Madhya Pradesh',
        'Maharashtra',
        'Manipur',
        'Meghalaya',
        'Mizoram',
        'Nagaland',
        'Odisha',
        'Punjab',
        'Rajasthan',
        'Sikkim',
        'Tamil Nadu',
        'Telangana',
        'Tripura',
        'Uttar Pradesh',
        'Uttarakhand',
        'West Bengal',
        'Andaman and Nicobar Islands',
        'Chandigarh',
        'Dadra and Nagar Haveli and Daman and Diu',
        'Delhi',
        'Jammu and Kashmir',
        'Ladakh',
        'Lakshadweep',
        'Puducherry',
    ];

    // Validation functions
    const validateCity = (value: string) => {
        if (!value.trim()) {
            return 'City is required';
        }
        if (!/^[a-zA-Z\s]+$/.test(value)) {
            return 'City must contain only letters and spaces';
        }
        return '';
    };

    const validatePincode = (value: string) => {
        if (!value.trim()) {
            return 'Pincode is required';
        }
        if (!/^\d{6}$/.test(value)) {
            return 'Pincode must be exactly 6 digits';
        }
        return '';
    };

    const validateAddress = (value: string) => {
        if (!value.trim()) {
            return 'Address is required';
        }
        return '';
    };

    const validateState = (value: string) => {
        if (!value) {
            return 'State is required';
        }
        return '';
    };

    const validatePaymentMethod = (value: string) => {
        if (!value) {
            return 'Please select a payment method';
        }
        return '';
    };

    const couponDiscount = appliedCoupon?.discount ?? 0;

    // Calculate delivery charge based on payment method
    const deliveryCharge =
        formData.paymentMethod === 'cod' ? settings.cod_charge : 0;
    const finalTotal = Math.max(0, cartTotal - couponDiscount + deliveryCharge);

    // Handle input changes
    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const getCsrfToken = () =>
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ||
        props.csrf_token ||
        '';

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }

        setIsCouponSubmitting(true);

        try {
            const response = await fetch('/checkout/coupon/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    code: couponCode.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                toast.error(data.message || 'Failed to apply coupon');
                return;
            }

            setAppliedCoupon(data.appliedCoupon);
            setCouponCode(data.appliedCoupon.code);
            toast.success(data.message || 'Coupon applied successfully');
        } catch {
            toast.error('Unable to apply coupon right now');
        } finally {
            setIsCouponSubmitting(false);
        }
    };

    const handleRemoveCoupon = async () => {
        setIsCouponSubmitting(true);

        try {
            const response = await fetch('/checkout/coupon/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                toast.error(data.message || 'Failed to remove coupon');
                return;
            }

            setAppliedCoupon(null);
            setCouponCode('');
            toast.success(data.message || 'Coupon removed successfully');
        } catch {
            toast.error('Unable to remove coupon right now');
        } finally {
            setIsCouponSubmitting(false);
        }
    };

    // Handle Razorpay payment
    const handleRazorpayPayment = async () => {
        if (!isAuthenticated) {
            toast.error('Please log in to place your order');
            persistCheckoutDraft(formData);
            router.get('/login', { redirect: '/checkout' });
            return;
        }

        setIsProcessing(true);

        // Track if payment handler was called (payment succeeded)
        const paymentSuccessfulRef = { current: false };

        try {
            const csrfToken = getCsrfToken();

            // Create Razorpay order
            const response = await fetch('/payment/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    customerName: user?.name || '',
                    customerEmail: user?.email || '',
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                toast.error(data.message || 'Failed to create payment order');
                setIsProcessing(false);
                return;
            }

            // Open Razorpay checkout
            const options: RazorpayOptions = {
                key: data.key_id,
                amount: data.amount,
                currency: data.currency,
                order_id: data.order_id,
                name: settings.site_name || 'Herbs',
                description: `Order for ${cartCount} items`,
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phone || '',
                },
                handler: async (response: RazorpayResponse) => {
                    // CRITICAL: Set flag IMMEDIATELY before any async work
                    // This prevents ondismiss from calling /payment/failure
                    // if user closes modal while verification is in progress
                    paymentSuccessfulRef.current = true;

                    // Verify payment
                    try {
                        const csrfToken = getCsrfToken();

                        const verifyResponse = await fetch('/payment/verify', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken || '',
                                Accept: 'application/json',
                            },
                            credentials: 'same-origin',
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id:
                                    response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyData.success) {
                            if (typeof window !== 'undefined') {
                                window.sessionStorage.removeItem(
                                    checkoutDraftKey,
                                );
                            }
                            toast.success('Payment successful!');
                            window.location.href = `/orders/success/${verifyData.order_id}`;
                        } else {
                            toast.error(
                                verifyData.message ||
                                    'Payment verification failed',
                            );
                            setIsProcessing(false);
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        toast.error(
                            'An error occurred during payment verification',
                        );
                        setIsProcessing(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        // Only mark as cancelled if payment didn't succeed
                        if (!paymentSuccessfulRef.current) {
                            toast.error('Payment cancelled');
                            setIsProcessing(false);

                            // Add grace period to allow webhook to process
                            // If payment succeeded, webhook will handle order creation
                            setTimeout(() => {
                                // Double-check flag after delay
                                if (!paymentSuccessfulRef.current) {
                                    // Log payment cancellation
                                    const csrfToken = getCsrfToken();

                                    fetch('/payment/failure', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'X-CSRF-TOKEN': csrfToken || '',
                                            Accept: 'application/json',
                                        },
                                        credentials: 'same-origin',
                                        body: JSON.stringify({
                                            razorpay_order_id: data.order_id,
                                            error: {
                                                description:
                                                    'Payment cancelled by user',
                                            },
                                        }),
                                    });
                                }
                            }, 2000); // 2 second grace period for webhook
                        } else {
                            // Payment succeeded but modal was dismissed
                            toast.info(
                                'Payment is being processed. Please check your orders.',
                            );
                            setIsProcessing(false);
                        }
                    },
                },
                theme: {
                    color: '#2e7b43',
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('An error occurred while processing payment');
            setIsProcessing(false);
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('Please log in to place your order');
            persistCheckoutDraft(formData);
            router.get('/login', { redirect: '/checkout' });
            return;
        }

        // Validate all fields
        const newErrors = {
            address: validateAddress(formData.address),
            city: validateCity(formData.city),
            state: validateState(formData.state),
            pincode: validatePincode(formData.pincode),
            paymentMethod: validatePaymentMethod(formData.paymentMethod),
        };

        setErrors(newErrors);

        // Check if there are any errors
        if (Object.values(newErrors).some((error) => error !== '')) {
            return;
        }

        // Handle online payment
        if (formData.paymentMethod === 'online') {
            await handleRazorpayPayment();
            return;
        }

        // Handle COD payment
        setIsProcessing(true);
        router.post(
            '/checkout',
            {
                customerName: user?.name || '',
                customerEmail: user?.email || '',
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                paymentMethod: formData.paymentMethod,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (typeof window !== 'undefined') {
                        window.sessionStorage.removeItem(checkoutDraftKey);
                    }
                },
                onError: (serverErrors) => {
                    setErrors((prev) => ({
                        ...prev,
                        address: serverErrors.address ?? prev.address,
                        city: serverErrors.city ?? prev.city,
                        state: serverErrors.state ?? prev.state,
                        pincode: serverErrors.pincode ?? prev.pincode,
                        paymentMethod:
                            serverErrors.paymentMethod ?? prev.paymentMethod,
                    }));
                    setIsProcessing(false);
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    return (
        <SiteLayout settings={settings} products={products} user={user}>
            <Head title="Checkout" />
            <div className="container mx-auto px-4 py-8">
                <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
                {!isAuthenticated && (
                    <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/35 bg-linear-to-br from-orange-500/15 via-white/35 to-amber-500/20 px-5 py-5 shadow-[0_10px_40px_rgba(249,115,22,0.25)] backdrop-blur-xl sm:px-6">
                        <div className="pointer-events-none absolute -top-16 -right-12 h-44 w-44 rounded-full bg-orange-400/30 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-amber-300/25 blur-3xl" />
                        <div className="relative">
                            <div className="mb-2 inline-flex items-center rounded-full border border-white/50 bg-white/45 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-orange-700 uppercase shadow-sm">
                                Checkout Access
                            </div>
                            <p className="text-base font-semibold text-orange-950 sm:text-lg">
                                Please login/signup to continue checkout.
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-orange-900/80">
                                Your cart and address details are saved
                                automatically and will be restored after login.
                            </p>
                        </div>
                        <div className="relative mt-4 flex flex-wrap gap-3">
                            <Button
                                type="button"
                                size="sm"
                                className="rounded-xl bg-linear-to-r from-orange-600 to-amber-500 text-white shadow-[0_6px_20px_rgba(249,115,22,0.35)] transition hover:from-orange-500 hover:to-amber-400"
                                onClick={() => {
                                    persistCheckoutDraft(formData);
                                    router.get('/login', {
                                        redirect: '/checkout',
                                    });
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="rounded-xl border-orange-300/70 bg-white/65 text-orange-900 shadow-sm transition hover:bg-white/85"
                                onClick={() => {
                                    persistCheckoutDraft(formData);
                                    router.get('/register', {
                                        redirect: '/checkout',
                                    });
                                }}
                            >
                                Sign Up
                            </Button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <fieldset
                        disabled={!isAuthenticated || isProcessing}
                        className="disabled:cursor-not-allowed disabled:opacity-80"
                    >
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Left Column - Delivery Details */}
                            <div className="lg:col-span-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Delivery Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">
                                                    Full Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={user?.name || ''}
                                                    readOnly
                                                    className="cursor-not-allowed bg-muted"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">
                                                    Phone Number
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={user?.phone || ''}
                                                    readOnly
                                                    className="cursor-not-allowed bg-muted"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">
                                                    Email
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={user?.email || ''}
                                                    readOnly
                                                    className="cursor-not-allowed bg-muted"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="address">
                                                    Street Address
                                                </Label>
                                                <Input
                                                    id="address"
                                                    placeholder="123 Main Street, Apartment 4B"
                                                    value={formData.address}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            'address',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={
                                                        errors.address
                                                            ? 'border-red-500'
                                                            : ''
                                                    }
                                                    disabled={isProcessing}
                                                />
                                                {errors.address && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.address}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">
                                                    City
                                                </Label>
                                                <Input
                                                    id="city"
                                                    placeholder="Mumbai"
                                                    value={formData.city}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            'city',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={
                                                        errors.city
                                                            ? 'border-red-500'
                                                            : ''
                                                    }
                                                    disabled={isProcessing}
                                                />
                                                {errors.city && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.city}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="state">
                                                    State
                                                </Label>
                                                <Popover
                                                    open={stateOpen}
                                                    onOpenChange={setStateOpen}
                                                >
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            id="state"
                                                            type="button"
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={
                                                                stateOpen
                                                            }
                                                            className={`w-full justify-between ${
                                                                errors.state
                                                                    ? 'border-red-500'
                                                                    : ''
                                                            }`}
                                                            disabled={
                                                                isProcessing
                                                            }
                                                        >
                                                            {formData.state ||
                                                                'Select State'}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        side="bottom"
                                                        align="start"
                                                        sideOffset={8}
                                                        className="w-[--radix-popover-trigger-width] rounded-xl border-white/20 bg-white/70 p-0 shadow-[0_12px_40px_rgba(0,0,0,0.15)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/70"
                                                    >
                                                        <Command>
                                                            <CommandInput
                                                                placeholder="Search state..."
                                                                className="text-sm"
                                                            />
                                                            <CommandList>
                                                                <CommandEmpty>
                                                                    No state
                                                                    found.
                                                                </CommandEmpty>
                                                                <CommandGroup>
                                                                    {indianStates.map(
                                                                        (
                                                                            state,
                                                                        ) => (
                                                                            <CommandItem
                                                                                key={
                                                                                    state
                                                                                }
                                                                                value={
                                                                                    state
                                                                                }
                                                                                className="rounded-md data-[selected=true]:bg-orange-500/15 data-[selected=true]:text-orange-900 dark:data-[selected=true]:text-orange-100"
                                                                                onSelect={() => {
                                                                                    handleInputChange(
                                                                                        'state',
                                                                                        state,
                                                                                    );
                                                                                    setStateOpen(
                                                                                        false,
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <span className="flex-1">
                                                                                    {
                                                                                        state
                                                                                    }
                                                                                </span>
                                                                                {formData.state ===
                                                                                    state && (
                                                                                    <Check className="h-4 w-4 text-orange-600" />
                                                                                )}
                                                                            </CommandItem>
                                                                        ),
                                                                    )}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                {errors.state && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.state}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pincode">
                                                    Pincode
                                                </Label>
                                                <Input
                                                    id="pincode"
                                                    placeholder="400001"
                                                    value={formData.pincode}
                                                    onChange={(e) => {
                                                        // Only allow numbers
                                                        const value =
                                                            e.target.value.replace(
                                                                /\D/g,
                                                                '',
                                                            );
                                                        // Limit to 6 digits
                                                        if (value.length <= 6) {
                                                            handleInputChange(
                                                                'pincode',
                                                                value,
                                                            );
                                                        }
                                                    }}
                                                    maxLength={6}
                                                    className={
                                                        errors.pincode
                                                            ? 'border-red-500'
                                                            : ''
                                                    }
                                                    disabled={isProcessing}
                                                />
                                                {errors.pincode && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.pincode}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Payment Method Selection */}
                                        <div className="space-y-3">
                                            <Label>Payment Method</Label>
                                            <RadioGroup
                                                value={formData.paymentMethod}
                                                onValueChange={(value) =>
                                                    handleInputChange(
                                                        'paymentMethod',
                                                        value,
                                                    )
                                                }
                                                className="grid gap-3 sm:grid-cols-2"
                                                disabled={isProcessing}
                                            >
                                                <Label
                                                    htmlFor="payment-online"
                                                    className="cursor-pointer"
                                                >
                                                    <div
                                                        className={`relative flex items-start gap-3 rounded-xl border border-white/20 bg-linear-to-br from-orange-500/10 via-white/10 to-amber-500/10 p-4 shadow-[0_0_28px_rgba(249,115,22,0.28)] backdrop-blur-md transition-all hover:border-orange-400/70 hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] dark:border-white/10 dark:from-orange-400/15 dark:via-white/5 dark:to-amber-400/15 ${
                                                            formData.paymentMethod ===
                                                            'online'
                                                                ? 'border-orange-500/80 bg-linear-to-br from-orange-500/25 via-white/10 to-amber-500/25 shadow-[0_0_50px_rgba(249,115,22,0.55)]'
                                                                : ''
                                                        }`}
                                                    >
                                                        {formData.paymentMethod ===
                                                            'online' && (
                                                            <span className="absolute -top-2 right-10 rounded-full border border-red-500/30 bg-white/80 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-red-600 uppercase shadow-sm backdrop-blur-sm">
                                                                Selected
                                                            </span>
                                                        )}
                                                        <RadioGroupItem
                                                            value="online"
                                                            id="payment-online"
                                                            className="mt-1"
                                                            disabled={
                                                                isProcessing
                                                            }
                                                        />
                                                        <div className="grid gap-1">
                                                            <span className="text-sm font-medium">
                                                                Online Payment
                                                            </span>
                                                            <p className="text-sm text-muted-foreground">
                                                                FREE delivery
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Label>

                                                <Label
                                                    htmlFor="payment-cod"
                                                    className="cursor-pointer"
                                                >
                                                    <div
                                                        className={`relative flex items-start gap-3 rounded-xl border border-white/20 bg-linear-to-br from-sky-500/10 via-white/10 to-emerald-500/10 p-4 shadow-[0_0_28px_rgba(56,189,248,0.28)] backdrop-blur-md transition-all hover:border-sky-400/70 hover:shadow-[0_0_40px_rgba(56,189,248,0.4)] dark:border-white/10 dark:from-sky-400/15 dark:via-white/5 dark:to-emerald-400/15 ${
                                                            formData.paymentMethod ===
                                                            'cod'
                                                                ? 'border-sky-500/80 bg-linear-to-br from-sky-500/25 via-white/10 to-emerald-500/25 shadow-[0_0_50px_rgba(56,189,248,0.55)]'
                                                                : ''
                                                        }`}
                                                    >
                                                        {formData.paymentMethod ===
                                                            'cod' && (
                                                            <span className="absolute -top-2 right-10 rounded-full border border-red-500/30 bg-white/80 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-red-600 uppercase shadow-sm backdrop-blur-sm">
                                                                Selected
                                                            </span>
                                                        )}
                                                        <RadioGroupItem
                                                            value="cod"
                                                            id="payment-cod"
                                                            className="mt-1"
                                                            disabled={
                                                                isProcessing
                                                            }
                                                        />
                                                        <div className="grid gap-1">
                                                            <span className="text-sm font-medium">
                                                                Cash on Delivery
                                                            </span>
                                                            <p className="text-sm text-muted-foreground">
                                                                Delivery charge
                                                                ₹
                                                                {
                                                                    settings.cod_charge
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Label>
                                            </RadioGroup>
                                            {errors.paymentMethod && (
                                                <p className="text-sm text-red-500">
                                                    {errors.paymentMethod}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Order Summary */}
                            <div className="lg:col-span-1">
                                <Card className="sticky top-4">
                                    <CardHeader>
                                        <CardTitle>Order Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            {cart.map((item) => (
                                                <div
                                                    key={`${item.id}-${item.measurement_value ?? 'default'}`}
                                                    className="flex items-start gap-3"
                                                >
                                                    <img
                                                        src={`/uploads/products/${item.image}`}
                                                        alt={item.name}
                                                        className="h-16 w-16 rounded-md border object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="line-clamp-1 text-sm font-medium">
                                                            {item.name}
                                                        </h4>
                                                        {item.measurement_label && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    item.measurement_label
                                                                }
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground">
                                                            Qty: {item.quantity}{' '}
                                                            × ₹
                                                            {item.price.toLocaleString(
                                                                'en-IN',
                                                            )}
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold">
                                                            ₹
                                                            {(
                                                                item.price *
                                                                item.quantity
                                                            ).toLocaleString(
                                                                'en-IN',
                                                            )}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveItem(
                                                                item.id,
                                                                item.measurement_value,
                                                            )
                                                        }
                                                        className="text-muted-foreground transition-colors hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <Separator />

                                        <div className="space-y-2">
                                            <Label htmlFor="couponCode">
                                                Coupon Code
                                            </Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="couponCode"
                                                    placeholder="Enter coupon code"
                                                    value={couponCode}
                                                    onChange={(e) =>
                                                        setCouponCode(
                                                            e.target.value.toUpperCase(),
                                                        )
                                                    }
                                                    disabled={
                                                        isCouponSubmitting ||
                                                        isProcessing
                                                    }
                                                />
                                                {appliedCoupon ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={
                                                            handleRemoveCoupon
                                                        }
                                                        disabled={
                                                            isCouponSubmitting ||
                                                            isProcessing
                                                        }
                                                    >
                                                        Remove
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        onClick={
                                                            handleApplyCoupon
                                                        }
                                                        disabled={
                                                            isCouponSubmitting ||
                                                            isProcessing
                                                        }
                                                    >
                                                        Apply
                                                    </Button>
                                                )}
                                            </div>
                                            {appliedCoupon && (
                                                <p className="text-xs text-green-600">
                                                    {appliedCoupon.code} applied
                                                    successfully.
                                                </p>
                                            )}
                                        </div>

                                        <Separator />

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Subtotal ({cartCount} items)
                                                </span>
                                                <span>
                                                    ₹
                                                    {cartTotal.toLocaleString(
                                                        'en-IN',
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    Delivery
                                                </span>
                                                {formData.paymentMethod ===
                                                'cod' ? (
                                                    <span>
                                                        ₹
                                                        {deliveryCharge.toLocaleString(
                                                            'en-IN',
                                                        )}
                                                    </span>
                                                ) : formData.paymentMethod ===
                                                  'online' ? (
                                                    <span className="text-green-600">
                                                        FREE
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        Select payment method
                                                    </span>
                                                )}
                                            </div>
                                            {appliedCoupon && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Coupon (
                                                        {appliedCoupon.code})
                                                    </span>
                                                    <span className="text-green-600">
                                                        -₹
                                                        {couponDiscount.toLocaleString(
                                                            'en-IN',
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            <Separator />
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Total</span>
                                                <span>
                                                    ₹
                                                    {finalTotal.toLocaleString(
                                                        'en-IN',
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full"
                                            size="lg"
                                            disabled={
                                                !isAuthenticated || isProcessing
                                            }
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Spinner data-icon="inline-start" />
                                                    Processing...
                                                </>
                                            ) : (
                                                'Place Order'
                                            )}
                                        </Button>

                                        <p className="text-center text-xs text-muted-foreground">
                                            By placing your order, you agree to
                                            our terms and conditions.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </fieldset>
                </form>
            </div>
        </SiteLayout>
    );
}
