import { Link, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    Heart,
    Mail,
    MapPin,
    Phone,
    Send,
    ShieldCheck,
    Star,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import type { Settings } from '@/types/site-types';

interface FooterPage {
    pageName: string;
    seoUrl: string;
}

interface SiteFooterProps {
    settings: Settings;
    footerAbout?: string;
    footerPages?: FooterPage[];
}

const EMPTY_FOOTER_PAGES: FooterPage[] = [];

const quickLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/blog', label: 'Blog' },
    { href: '/popular-products', label: 'Popular Products' },
    { href: '/product', label: 'Rudraksha' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
];

const accountLinks = [
    { href: '/wishlist', label: 'My Wishlist' },
    { href: '/login', label: 'Sign In' },
    { href: '/dashboard', label: 'My Account' },
    { href: '/cart', label: 'My Cart' },
];

const stats = [
    { value: '10,000+', label: 'Happy Customers' },
    { value: '500+', label: 'Products' },
    { value: '15+', label: 'Years of Trust' },
    { value: '4.9★', label: 'Avg. Rating' },
];

const guarantees = [
    {
        emoji: '🪬',
        title: '100% Authentic',
        desc: 'Ethically sourced from Nepal & Indonesia',
    },
    {
        emoji: '📦',
        title: 'Carefully Packaged',
        desc: 'Sacred items wrapped with reverence',
    },
    {
        emoji: '🔄',
        title: 'Easy Returns',
        desc: 'Hassle-free returns within 7 days',
    },
    {
        emoji: '🔒',
        title: 'Secure Checkout',
        desc: 'Your data & payments always protected',
    },
];

export function SiteFooter({
    settings,
    footerAbout = 'We are dedicated to providing authentic and certified Rudraksha beads sourced directly from Nepal and Indonesia.',
    footerPages = EMPTY_FOOTER_PAGES,
}: SiteFooterProps) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        clearErrors,
        setError,
        reset,
    } = useForm({ email: '' });

    const handleSubscribe = (e: FormEvent) => {
        e.preventDefault();
        const email = data.email.trim();
        if (!email) {
            setError('email', 'Email is required.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('email', 'Enter a valid email address.');
            return;
        }
        post('/newsletter/subscribe', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Thanks for subscribing!');
                reset();
            },
            onError: () => {
                toast.error('Please fix the errors and try again.');
            },
        });
    };

    const currentYear = new Date().getFullYear();

    const socialLinks = [
        {
            href: settings.fbLink,
            label: 'Facebook',
            color: 'hover:bg-blue-500',
            icon: (
                <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.019 4.388 11.017 10.125 11.92v-8.437H7.078v-3.49h3.047V9.41c0-3.017 1.792-4.683 4.533-4.683 1.312 0 2.686.236 2.686.236v2.969H15.83c-1.491 0-1.956.928-1.956 1.88v2.254h3.328l-.532 3.49h-2.796v8.437C19.612 23.09 24 18.091 24 12.073Z" />
                </svg>
            ),
        },
        {
            href: settings.twitterLink,
            label: 'X / Twitter',
            color: 'hover:bg-stone-900',
            icon: (
                <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.847h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.153h7.594l5.243 6.932 6.064-6.932Zm-1.29 19.494h2.039L6.486 3.246H4.298l13.313 17.401Z" />
                </svg>
            ),
        },
        {
            href: settings.instaLink,
            label: 'Instagram',
            color: 'hover:bg-pink-500',
            icon: (
                <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.95 1.35a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Z" />
                </svg>
            ),
        },
        {
            href: settings.youtubeLink,
            label: 'YouTube',
            color: 'hover:bg-red-500',
            icon: (
                <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M23.498 6.186a3.02 3.02 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.376.505A3.02 3.02 0 0 0 .502 6.186 31.79 31.79 0 0 0 0 12a31.79 31.79 0 0 0 .502 5.814 3.02 3.02 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.376-.505a3.02 3.02 0 0 0 2.122-2.136A31.79 31.79 0 0 0 24 12a31.79 31.79 0 0 0-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
                </svg>
            ),
        },
    ].filter((s) => Boolean(s.href));

    const legalLinks = footerPages.slice(0, 6);

    return (
        <footer className="relative overflow-hidden bg-gradient-to-b from-[#fff9f0] via-[#fff6ea] to-[#fef3e2] text-stone-800">
            {/* ── Ambient background blobs ────────────────────────────────── */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-200/35 blur-3xl" />
                <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />
                <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-100/40 blur-3xl" />
                <div className="absolute right-10 bottom-20 h-64 w-64 rounded-full bg-amber-100/50 blur-2xl" />
            </div>

            <div className="relative container mx-auto px-4 md:px-6">
                {/* ══ STATS STRIP ═════════════════════════════════════════════ */}
                <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/70 bg-white/20 shadow-[0_12px_40px_-20px_rgba(120,53,15,0.2)] backdrop-blur-xl md:grid-cols-4">
                    {stats.map((stat, i) => (
                        <div
                            key={stat.label}
                            className={`flex flex-col items-center justify-center bg-white/50 px-6 py-5 text-center backdrop-blur-sm transition-colors hover:bg-white/70 ${i > 0 ? 'border-l border-white/50' : ''}`}
                        >
                            <span className="bg-linear-to-r from-amber-600 to-orange-500 bg-clip-text text-2xl font-black text-transparent md:text-3xl">
                                {stat.value}
                            </span>
                            <span className="mt-1 text-xs font-medium text-stone-500">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ══ MAIN COLUMNS ════════════════════════════════════════════ */}
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-[1.7fr_1fr_1fr_1.6fr]">
                    {/* ── Col 1: Brand ──────────────────────────────────────── */}
                    <div className="relative overflow-hidden rounded-3xl border border-white/65 bg-white/55 p-7 shadow-[0_20px_60px_-20px_rgba(120,53,15,0.22)] backdrop-blur-xl md:col-span-2 xl:col-span-1">
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-amber-400/70 to-transparent" />

                        {/* Logo wordmark */}
                        <img
                            src="/assets/brand/herbs-logo.svg"
                            alt="Herbs"
                            className="h-14 w-auto"
                        />

                        <h2 className="mt-5 text-2xl leading-snug font-bold tracking-tight text-stone-900 md:text-[1.6rem]">
                            Wellness, naturally
                            <br />
                            to end the page.
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-stone-500">
                            {footerAbout}
                        </p>

                        {/* Rating strip */}
                        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/70 px-4 py-3">
                            <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className="h-4 w-4 fill-current"
                                    />
                                ))}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-stone-800">
                                    4.9 / 5 from 2,400+ reviews
                                </p>
                                <p className="text-[11px] text-stone-500">
                                    Trusted by customers across India
                                </p>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="mt-5 space-y-2">
                            <div className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/50 px-4 py-3 backdrop-blur-sm">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                <p
                                    className="text-sm leading-6 text-stone-600"
                                    dangerouslySetInnerHTML={{
                                        __html: settings.address,
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <a
                                    href={`tel:${settings.phone1}`}
                                    className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/50 px-3 py-3 text-sm text-stone-700 backdrop-blur-sm transition-all hover:border-teal-300/60 hover:bg-teal-50/50 hover:text-teal-900"
                                >
                                    <Phone className="h-4 w-4 shrink-0 text-teal-600" />
                                    <span>{settings.phone1}</span>
                                </a>
                                <a
                                    href={`mailto:${settings.email1}`}
                                    className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/50 px-3 py-3 text-sm text-stone-700 backdrop-blur-sm transition-all hover:border-teal-300/60 hover:bg-teal-50/50 hover:text-teal-900"
                                >
                                    <Mail className="h-4 w-4 shrink-0 text-teal-600" />
                                    <span className="truncate">
                                        {settings.email1}
                                    </span>
                                </a>
                            </div>
                        </div>

                        {/* Socials */}
                        {socialLinks.length > 0 && (
                            <div className="mt-5 flex flex-wrap gap-2">
                                {socialLinks.map((s) => (
                                    <a
                                        key={s.label}
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`group inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/60 text-stone-600 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:text-white hover:shadow-lg ${s.color}`}
                                        title={s.label}
                                    >
                                        {s.icon}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Col 2: Quick Links ────────────────────────────────── */}
                    <div className="flex flex-col rounded-3xl border border-white/65 bg-white/50 p-6 shadow-[0_16px_50px_-22px_rgba(120,53,15,0.18)] backdrop-blur-xl">
                        <div className="inline-flex items-center rounded-full border border-amber-300/55 bg-amber-50/80 px-3 py-1 text-[10px] font-bold tracking-[0.3em] text-amber-700 uppercase">
                            Navigate
                        </div>
                        <h3 className="mt-3 text-lg font-bold text-stone-900">
                            Quick links
                        </h3>
                        <nav className="mt-3 flex-1 space-y-0.5">
                            {quickLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="group/link flex items-center justify-between rounded-xl border border-transparent px-3 py-2.5 text-sm text-stone-600 transition-all duration-200 hover:border-teal-200/70 hover:bg-teal-50/60 hover:pl-4 hover:text-teal-900"
                                >
                                    <span>{item.label}</span>
                                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-amber-600 opacity-0 transition-all duration-200 group-hover/link:translate-x-0.5 group-hover/link:opacity-100" />
                                </Link>
                            ))}
                        </nav>

                        {/* Authenticity badge */}
                        <div className="mt-4 overflow-hidden rounded-2xl border border-amber-200/70 bg-linear-to-br from-amber-50 to-orange-50/80 p-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-xl">
                                    🪬
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-amber-900">
                                        100% Authentic
                                    </p>
                                    <p className="mt-0.5 text-[11px] leading-4 text-stone-500">
                                        Certified, ethically sourced from Nepal
                                        & Indonesia
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/about"
                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 transition-colors hover:text-amber-900"
                            >
                                Learn more <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>

                    {/* ── Col 3: Account & Policies ─────────────────────────── */}
                    <div className="flex flex-col rounded-3xl border border-white/65 bg-white/50 p-6 shadow-[0_16px_50px_-22px_rgba(120,53,15,0.18)] backdrop-blur-xl">
                        <div className="inline-flex items-center rounded-full border border-amber-300/55 bg-amber-50/80 px-3 py-1 text-[10px] font-bold tracking-[0.3em] text-amber-700 uppercase">
                            Support
                        </div>
                        <h3 className="mt-3 text-lg font-bold text-stone-900">
                            Account & Policies
                        </h3>
                        <nav className="mt-3 space-y-0.5">
                            {accountLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="group/link flex items-center justify-between rounded-xl border border-transparent px-3 py-2.5 text-sm text-stone-600 transition-all duration-200 hover:border-teal-200/70 hover:bg-teal-50/60 hover:pl-4 hover:text-teal-900"
                                >
                                    <span>{item.label}</span>
                                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-amber-600 opacity-0 transition-all duration-200 group-hover/link:translate-x-0.5 group-hover/link:opacity-100" />
                                </Link>
                            ))}
                            {legalLinks.map((page) => (
                                <Link
                                    key={page.seoUrl}
                                    href={`/${page.seoUrl}`}
                                    className="group/link flex items-center justify-between rounded-xl border border-transparent px-3 py-2.5 text-sm text-stone-600 transition-all duration-200 hover:border-teal-200/70 hover:bg-teal-50/60 hover:pl-4 hover:text-teal-900"
                                >
                                    <span>{page.pageName}</span>
                                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-amber-600 opacity-0 transition-all duration-200 group-hover/link:translate-x-0.5 group-hover/link:opacity-100" />
                                </Link>
                            ))}
                        </nav>

                        {/* Guarantee mini-cards */}
                        <div className="mt-4 flex-1 space-y-2">
                            {guarantees.slice(2).map((g) => (
                                <div
                                    key={g.title}
                                    className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/60 px-4 py-3 backdrop-blur-sm"
                                >
                                    <span className="mt-0.5 text-base leading-none">
                                        {g.emoji}
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-stone-800">
                                            {g.title}
                                        </p>
                                        <p className="mt-0.5 text-[11px] leading-4 text-stone-500">
                                            {g.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Col 4: Newsletter + Payments ──────────────────────── */}
                    <div className="relative overflow-hidden rounded-3xl border border-white/65 bg-white/50 p-6 shadow-[0_16px_50px_-22px_rgba(120,53,15,0.18)] backdrop-blur-xl md:col-span-2 xl:col-span-1">
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-orange-400/50 to-transparent" />

                        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/55 bg-amber-50/80 px-3 py-1 text-[10px] font-bold tracking-[0.3em] text-amber-700 uppercase">
                            <ShieldCheck className="h-3 w-3" />
                            Stay Connected
                        </div>

                        <h3 className="mt-4 text-2xl font-bold tracking-tight text-stone-900">
                            Join the weekly circle.
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-stone-500">
                            Thoughtful updates on new arrivals, featured
                            collections, and seasonal offers.
                        </p>

                        {/* Newsletter form */}
                        <form
                            onSubmit={handleSubscribe}
                            className="mt-5"
                            noValidate
                        >
                            <div className="flex gap-2 rounded-2xl border border-white/80 bg-white/70 p-1.5 shadow-sm backdrop-blur-sm">
                                <Input
                                    type="email"
                                    placeholder="Your email address"
                                    value={data.email}
                                    onChange={(e) => {
                                        setData('email', e.target.value);
                                        clearErrors('email');
                                    }}
                                    className="h-11 flex-1 rounded-xl border-0 bg-transparent text-stone-900 placeholder:text-stone-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-11 shrink-0 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 px-5 text-sm font-semibold text-white shadow-[0_6px_20px_-6px_rgba(234,88,12,0.55)] transition-all hover:scale-[1.02] hover:brightness-110"
                                >
                                    <Send className="mr-1.5 h-3.5 w-3.5" />
                                    Subscribe
                                </Button>
                            </div>
                            <FormError message={errors.email} />
                            <p className="mt-2 text-[11px] text-stone-400">
                                No spam. Unsubscribe anytime.
                            </p>
                        </form>

                        {/* Payments */}
                        <div className="mt-5 rounded-2xl border border-white/70 bg-white/60 p-4 backdrop-blur-sm">
                            <p className="text-[10px] font-bold tracking-[0.28em] text-amber-700 uppercase">
                                We Accept
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {[
                                    { name: 'Visa', bg: 'bg-blue-600' },
                                    { name: 'Mastercard', bg: 'bg-red-500' },
                                    { name: 'UPI', bg: 'bg-violet-600' },
                                ].map((pm) => (
                                    <span
                                        key={pm.name}
                                        className="inline-flex items-center rounded-lg border border-white/80 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 shadow-sm"
                                    >
                                        <span
                                            className={`mr-1.5 h-2 w-2 rounded-full ${pm.bg}`}
                                        />
                                        {pm.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Promise strip */}
                        <div className="mt-3 rounded-2xl border border-amber-200/60 bg-linear-to-r from-amber-50/80 to-orange-50/60 px-4 py-3">
                            <p className="text-[10px] font-bold tracking-[0.28em] text-amber-700 uppercase">
                                Our Promise
                            </p>
                            <p className="mt-1.5 text-xs leading-5 text-stone-600">
                                Designed for trust, clarity, and a calmer
                                shopping experience — from first click to
                                checkout.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ══ GUARANTEES ROW ══════════════════════════════════════════ */}
                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {guarantees.map((g) => (
                        <div
                            key={g.title}
                            className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/50 px-4 py-3.5 backdrop-blur-sm transition-all hover:bg-white/70 hover:shadow-md"
                        >
                            <span className="text-xl leading-none">
                                {g.emoji}
                            </span>
                            <div>
                                <p className="text-xs font-bold text-stone-800">
                                    {g.title}
                                </p>
                                <p className="mt-0.5 text-[11px] leading-4 text-stone-500">
                                    {g.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ══ BOTTOM BAR ══════════════════════════════════════════════ */}
                <div className="mt-4 mb-6 flex flex-col items-center gap-3 rounded-2xl border border-white/60 bg-white/45 px-5 py-4 backdrop-blur-sm sm:flex-row sm:justify-between">
                    <p className="flex items-center gap-2 text-sm text-stone-500">
                        <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
                        © {currentYear} Herbs. Crafted with care.
                    </p>
                    <p className="text-sm text-stone-400">
                        Developed by{' '}
                        <a
                            href="https://meinstyn.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-stone-700 transition-colors hover:text-orange-600"
                        >
                            Meinstyn
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
