import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowUpRight,
    CheckCircle2,
    Clock,
    HelpCircle,
    Home,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Map,
    MapMarker,
    MapPopup,
    MapTileLayer,
    MapZoomControl,
} from '@/components/ui/map';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import SiteLayout from '@/layouts/SiteLayout';
import type { Product, Settings } from '@/types/site-types';

interface ContactProps {
    settings: Settings;
    products?: Product[];
    wishlist?: {
        count: number;
        items: any[];
    };
    cart?: {
        count: number;
        price: number;
        items: any[];
    };
    user?: {
        name: string;
    };
}

export default function Contact({
    settings,
    products = [],
    wishlist = { count: 0, items: [] },
    cart = { count: 0, price: 0, items: [] },
    user,
}: ContactProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        setError,
    } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        message: '',
    });
    const maxMessageLength = 250;
    const messageLeft = maxMessageLength - data.message.length;
    const storeLocation: [number, number] = [20.2956535, 85.8459737];

    const validateForm = () => {
        const nextErrors: Record<string, string> = {};
        const firstName = data.first_name.trim();
        const lastName = data.last_name.trim();
        const email = data.email.trim();
        const phone = data.phone.trim();
        const message = data.message.trim();
        const digitsOnly = phone.replace(/\D/g, '');

        if (!firstName) {
            nextErrors.first_name = 'First name is required.';
        }

        if (!lastName) {
            nextErrors.last_name = 'Last name is required.';
        }

        if (!email) {
            nextErrors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nextErrors.email = 'Enter a valid email address.';
        }

        if (!phone) {
            nextErrors.phone = 'Phone number is required.';
        } else if (digitsOnly.length < 7) {
            nextErrors.phone = 'Enter a valid phone number.';
        }

        if (!message) {
            nextErrors.message = 'Message is required.';
        }

        if (Object.keys(nextErrors).length > 0) {
            setError(nextErrors);
            return false;
        }

        return true;
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        post('/contact', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Thanks! We will reach out soon.');
                reset();
            },
            onError: () => {
                toast.error('Please fix the errors and try again.');
            },
        });
    };

    return (
        <SiteLayout
            settings={settings}
            products={products}
            wishlist={wishlist}
            cart={cart}
            user={user}
            title="Contact Us - Natural Rudraksh"
            metaDescription="Get in touch with Natural Rudraksh for product queries, bulk orders, or support."
        >
            <Head title="Contact Us" />

            {/* Breadcrumb */}
            <div className="border-b bg-gray-50">
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link
                            href="/"
                            className="flex items-center text-muted-foreground transition-colors hover:text-primary"
                        >
                            <Home className="h-4 w-4" />
                        </Link>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-gray-900">
                            Contact Us
                        </span>
                    </nav>
                </div>
            </div>

            {/* Hero */}
            <div className="border-b bg-gradient-to-r from-orange-50 to-orange-100">
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 md:text-5xl">
                        Let’s talk about your needs
                    </h1>
                    <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-600">
                        We’re here to help with product selection, bulk orders,
                        or general questions. Reach us by phone, email, or send
                        a message.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Button asChild>
                            <a href={`tel:${settings.phone1}`}>Call now</a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href={`mailto:${settings.email1}`}>Email us</a>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    {/* Contact form */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Send us a message</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form
                                onSubmit={submit}
                                className="space-y-6"
                                noValidate
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="first-name">
                                            First name *
                                        </Label>
                                        <Input
                                            id="first-name"
                                            placeholder="Ravi"
                                            value={data.first_name}
                                            onChange={(e) => {
                                                setData(
                                                    'first_name',
                                                    e.target.value,
                                                );
                                                clearErrors('first_name');
                                            }}
                                        />
                                        <FormError
                                            message={errors.first_name}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last-name">
                                            Last name *
                                        </Label>
                                        <Input
                                            id="last-name"
                                            placeholder="Sharma"
                                            value={data.last_name}
                                            onChange={(e) => {
                                                setData(
                                                    'last_name',
                                                    e.target.value,
                                                );
                                                clearErrors('last_name');
                                            }}
                                        />
                                        <FormError message={errors.last_name} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={data.email}
                                        onChange={(e) => {
                                            setData('email', e.target.value);
                                            clearErrors('email');
                                        }}
                                    />
                                    <FormError message={errors.email} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone *</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        value={data.phone}
                                        onChange={(e) => {
                                            setData('phone', e.target.value);
                                            clearErrors('phone');
                                        }}
                                    />
                                    <FormError message={errors.phone} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message">Message *</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Tell us about your requirement..."
                                        rows={6}
                                        value={data.message}
                                        onChange={(e) => {
                                            const value = e.target.value.slice(
                                                0,
                                                maxMessageLength,
                                            );
                                            setData('message', value);
                                            clearErrors('message');
                                        }}
                                    />
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Max 250 characters.</span>
                                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-gray-100 px-2 text-[11px] font-semibold text-gray-700">
                                            {messageLeft}
                                        </span>
                                    </div>
                                    <FormError message={errors.message} />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Spinner className="mr-2" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send message'
                                    )}
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    We typically respond within 24 hours.
                                </p>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Contact details */}
                    <div className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle>Contact details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm text-gray-600">
                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 h-5 w-5 text-orange-500" />
                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html: settings.address,
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-orange-500" />
                                    <a
                                        href={`tel:${settings.phone1}`}
                                        className="font-medium text-gray-900"
                                    >
                                        {settings.phone1}
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-orange-500" />
                                    <a
                                        href={`mailto:${settings.email1}`}
                                        className="font-medium text-gray-900"
                                    >
                                        {settings.email1}
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-orange-500" />
                                    <span>Mon – Sat, 10:00 AM – 7:00 PM</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle>Why reach out?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-gray-600">
                                {[
                                    'Personalized Rudraksha recommendations',
                                    'Bulk order pricing and timelines',
                                    'Order tracking and support',
                                    'Custom consultations for rituals',
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-start gap-2"
                                    >
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle>Quick actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    asChild
                                >
                                    <Link href="/faq">
                                        <HelpCircle className="mr-2 h-4 w-4" />
                                        Visit FAQ
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    asChild
                                >
                                    <Link href="/wishlist">
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        View wishlist
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="mt-10">
                    <Card className="overflow-hidden shadow-sm">
                        <CardHeader>
                            <CardTitle>Visit us</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[420px] w-full overflow-hidden rounded-lg">
                                <Map center={storeLocation}>
                                    <MapTileLayer />
                                    <MapZoomControl />
                                    <MapMarker position={storeLocation}>
                                        <MapPopup>
                                            Rudraksha & Gemstone Wholesale Store
                                        </MapPopup>
                                    </MapMarker>
                                </Map>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SiteLayout>
    );
}
