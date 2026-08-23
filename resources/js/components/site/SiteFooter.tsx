import { Link, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    Heart,
    Mail,
    MapPin,
    Phone,
    Send,
    ShieldCheck,
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
    { href: '/about', label: 'Our story' },
    { href: '/product', label: 'Shop all herbs' },
    { href: '/popular-products', label: 'Popular products' },
    { href: '/blog', label: 'Journal' },
    { href: '/faq', label: 'Frequently asked questions' },
    { href: '/contact', label: 'Contact us' },
];

const accountLinks = [
    { href: '/dashboard', label: 'My account' },
    { href: '/wishlist', label: 'Wishlist' },
    { href: '/cart', label: 'Shopping bag' },
    { href: '/login', label: 'Sign in' },
];

const assurances = [
    { title: 'Authentically sourced', detail: 'Thoughtfully chosen with care' },
    { title: 'Packed with care', detail: 'Prepared for a safe journey' },
    { title: 'Easy returns', detail: 'Simple support when you need it' },
    { title: 'Secure checkout', detail: 'Payments protected at every step' },
];

export function SiteFooter({
    settings,
    footerAbout = 'We carefully source nature-led essentials for everyday rituals and mindful living.',
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

    const handleSubscribe = (event: FormEvent) => {
        event.preventDefault();
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
            onError: () => toast.error('Please fix the errors and try again.'),
        });
    };

    const currentYear = new Date().getFullYear();
    const legalLinks = footerPages.slice(0, 6);
    const customerLinks = [
        ...accountLinks,
        ...legalLinks.map((page) => ({
            href: `/${page.seoUrl}`,
            label: page.pageName,
        })),
    ];
    const socialLinks = [
        {
            href: settings.fbLink,
            label: 'Facebook',
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
    ].filter((social) => Boolean(social.href));

    return (
        <footer className="herbs-footer-flow overflow-hidden text-[#173c28]">
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
            >
                <div className="absolute -top-40 left-[8%] h-96 w-96 rounded-full bg-[#9ad454]/15 blur-3xl" />
                <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#97b5de]/18 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#3e8e4f]/25 to-transparent" />
            </div>

            <div className="relative container mx-auto px-4 py-12 md:px-6 md:py-16">
                <section className="grid gap-10 border-b border-[#3e8e4f]/20 pb-12 lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-4">
                        <img
                            src="/assets/brand/herbs-logo.svg"
                            alt="Herbs"
                            className="h-14 w-auto rounded-xl bg-[#f8fbf3] px-3 py-2"
                        />
                        <h2 className="mt-6 max-w-sm text-3xl leading-tight font-semibold tracking-tight text-[#173c28] md:text-4xl">
                            Small rituals. A more grounded day.
                        </h2>
                        <p className="mt-4 max-w-md text-sm leading-7 text-[#4c6651]">
                            {footerAbout}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#3e8e4f]/20 bg-white/35 text-[#285f38] transition hover:-translate-y-0.5 hover:border-[#3e8e4f]/45 hover:bg-[#3e8e4f] hover:text-white"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    <FooterLinks title="Explore" links={quickLinks} />
                    <FooterLinks title="Your account" links={customerLinks} />

                    <section
                        className="lg:col-span-4"
                        aria-labelledby="footer-newsletter-heading"
                    >
                        <div className="rounded-3xl border border-[#3e8e4f]/20 bg-white/45 p-6 shadow-[0_18px_50px_-30px_rgba(20,83,45,0.38)] backdrop-blur-sm">
                            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-[#9ad454] uppercase">
                                <ShieldCheck className="h-4 w-4" />
                                The herbs letter
                            </div>
                            <h3
                                id="footer-newsletter-heading"
                                className="mt-4 text-2xl font-semibold text-[#173c28]"
                            >
                                A little more calm, delivered monthly.
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-[#4c6651]">
                                New arrivals, thoughtful guides, and offers
                                worth opening.
                            </p>

                            <form
                                onSubmit={handleSubscribe}
                                className="mt-5"
                                noValidate
                            >
                                <div className="flex rounded-xl bg-white p-1.5 shadow-lg shadow-black/10">
                                    <Input
                                        type="email"
                                        placeholder="Email address"
                                        value={data.email}
                                        onChange={(event) => {
                                            setData(
                                                'email',
                                                event.target.value,
                                            );
                                            clearErrors('email');
                                        }}
                                        className="h-11 flex-1 border-0 bg-transparent px-3 text-[#173c28] placeholder:text-[#78907d] focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="h-11 rounded-lg bg-[#9ad454] px-4 font-semibold text-[#123321] transition hover:bg-[#b0e274]"
                                    >
                                        <Send className="h-4 w-4" />
                                        <span className="sr-only">
                                            Subscribe
                                        </span>
                                    </Button>
                                </div>
                                <FormError message={errors.email} />
                                <p className="mt-3 text-xs text-[#59725e]">
                                    No noise. Unsubscribe whenever you like.
                                </p>
                            </form>
                        </div>
                    </section>
                </section>

                <section className="grid gap-5 border-b border-[#3e8e4f]/20 py-8 sm:grid-cols-2 lg:grid-cols-4">
                    {assurances.map((assurance, index) => (
                        <div key={assurance.title} className="flex gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#9ad454]/15 text-xs font-bold text-[#9ad454]">
                                0{index + 1}
                            </span>
                            <div>
                                <p className="text-sm font-medium text-[#173c28]">
                                    {assurance.title}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-[#59725e]">
                                    {assurance.detail}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="grid gap-8 pt-8 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                        <p className="text-xs font-semibold tracking-[0.2em] text-[#9ad454] uppercase">
                            We are here to help
                        </p>
                        <div className="mt-4 space-y-3 text-sm text-[#345b3d]">
                            <a
                                href={`tel:${settings.phone1}`}
                                className="flex items-center gap-3 transition hover:text-[#173c28]"
                            >
                                <Phone className="h-4 w-4 text-[#3e8e4f]" />
                                {settings.phone1}
                            </a>
                            <a
                                href={`mailto:${settings.email1}`}
                                className="flex items-center gap-3 transition hover:text-[#173c28]"
                            >
                                <Mail className="h-4 w-4 text-[#3e8e4f]" />
                                {settings.email1}
                            </a>
                        </div>
                    </div>
                    <div className="lg:col-span-5">
                        <p className="text-xs font-semibold tracking-[0.2em] text-[#9ad454] uppercase">
                            Find us
                        </p>
                        <div className="mt-4 flex items-start gap-3 text-sm leading-6 text-[#345b3d]">
                            <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#3e8e4f]" />
                            <p
                                dangerouslySetInnerHTML={{
                                    __html: settings.address,
                                }}
                            />
                        </div>
                    </div>
                    <div className="lg:col-span-3 lg:text-right">
                        <p className="text-xs font-semibold tracking-[0.2em] text-[#9ad454] uppercase">
                            Secure payments
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 lg:justify-end">
                            {['Visa', 'Mastercard', 'UPI'].map((payment) => (
                                <span
                                    key={payment}
                                    className="rounded-md border border-[#3e8e4f]/20 bg-white/35 px-2.5 py-1.5 text-xs font-semibold text-[#345b3d]"
                                >
                                    {payment}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mt-10 flex flex-col gap-3 border-t border-[#3e8e4f]/20 pt-6 text-xs text-[#59725e] sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-center gap-2">
                        <Heart className="h-3.5 w-3.5 fill-[#6b9bd2] text-[#6b9bd2]" />
                        © {currentYear} Herbs. Naturally good.
                    </p>
                    <p>
                        Developed by{' '}
                        <a
                            href="https://meinstyn.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[#345b3d] transition hover:text-[#173c28]"
                        >
                            Meinstyn
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

function FooterLinks({
    title,
    links,
}: {
    title: string;
    links: { href: string; label: string }[];
}) {
    return (
        <nav className="lg:col-span-2" aria-label={title}>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#2e7b43] uppercase">
                {title}
            </p>
            <ul className="mt-5 space-y-3">
                {links.map((item) => (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#345b3d] transition-[color,filter] duration-200 hover:text-[#2f9e5b] hover:drop-shadow-[0_0_10px_rgba(47,158,91,0.38)]"
                        >
                            {item.label}
                            <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
