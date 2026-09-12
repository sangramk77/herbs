import { Head, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { WhatsAppOverlay } from '@/components/site/WhatsAppOverlay';
import type {
    CartInfo,
    NavCategory,
    Product,
    Settings,
} from '@/types/site-types';

interface SiteLayoutProps {
    children: ReactNode;
    title?: string;
    settings: Settings;
    metaDescription?: string;
    metaKeywords?: string;
    ogType?: 'website' | 'article' | 'product';
    ogImage?: string;
    canonicalUrl?: string;
    cart?: CartInfo;
    wishlist?: {
        count: number;
        items: any[];
    };
    products?: Product[];
    user?: {
        name: string;
    };
    cmsPages?: {
        pageName: string;
        seoUrl: string;
    }[];
    footerPages?: {
        pageName: string;
        seoUrl: string;
    }[];
}

export default function SiteLayout({
    children,
    title,
    settings,
    metaDescription,
    metaKeywords,
    ogType = 'website',
    ogImage,
    canonicalUrl,
    cart,
    wishlist,
    products = [],
    user,
    cmsPages,
    footerPages,
}: SiteLayoutProps) {
    const page = usePage();
    const {
        cmsPages: sharedPages,
        footerPages: sharedFooterPages,
        navProducts,
        navCategories,
        cart: sharedCart,
        wishlist: sharedWishlist,
        auth: sharedAuth,
    } = page.props as {
        cmsPages?: { pageName: string; seoUrl: string }[];
        footerPages?: { pageName: string; seoUrl: string }[];
        navProducts?: Product[];
        navCategories?: NavCategory[];
        cart?: CartInfo;
        wishlist?: { count: number; items: any[] };
        auth?: { user?: { name: string } | null };
    };

    const resolvedPages = cmsPages ?? sharedPages ?? [];
    const resolvedFooterPages = footerPages ?? sharedFooterPages ?? [];
    const headerProducts = navProducts ?? products;
    const headerCategories = navCategories ?? [];
    const normalizeCart = (value?: Partial<CartInfo>): CartInfo => ({
        count: value?.count ?? 0,
        price: value?.price ?? 0,
        items: Array.isArray(value?.items) ? value.items : [],
    });
    const normalizedSharedCart = normalizeCart(sharedCart);
    const normalizedPageCart = cart ? normalizeCart(cart) : undefined;
    const resolvedCart = (() => {
        if (
            normalizedSharedCart.items.length > 0 &&
            (!normalizedPageCart || normalizedPageCart.items.length === 0)
        ) {
            return normalizedSharedCart;
        }

        return normalizedPageCart ?? normalizedSharedCart;
    })();
    const resolvedWishlist = wishlist ??
        sharedWishlist ?? { count: 0, items: [] };
    const resolvedUser = user ?? sharedAuth?.user ?? undefined;
    const isHomePage = page.component === 'Home';
    const pageUrl =
        canonicalUrl ||
        (typeof window !== 'undefined' ? window.location.href : undefined);
    const resolvedTitle =
        title || settings.globalMetaTitle || settings.site_name || 'Herbs';
    const resolvedMetaDescription =
        metaDescription || settings.globalMetaDescription || undefined;
    const resolvedMetaKeywords =
        metaKeywords || settings.globalMetaKeywords || undefined;
    const resolvedOgTitle =
        title ||
        settings.globalOgTitle ||
        settings.globalMetaTitle ||
        resolvedTitle;
    const resolvedOgDescription =
        metaDescription ||
        settings.globalOgDescription ||
        settings.globalMetaDescription ||
        undefined;
    const resolvedOgImage = ogImage || settings.globalOgImageUrl || undefined;
    const resolvedTwitterTitle =
        title ||
        settings.globalTwitterTitle ||
        settings.globalOgTitle ||
        settings.globalMetaTitle ||
        resolvedTitle;
    const resolvedTwitterDescription =
        metaDescription ||
        settings.globalTwitterDescription ||
        settings.globalOgDescription ||
        settings.globalMetaDescription ||
        undefined;
    const resolvedTwitterImage =
        ogImage ||
        settings.globalTwitterImageUrl ||
        settings.globalOgImageUrl ||
        undefined;
    const twitterCard = resolvedTwitterImage
        ? 'summary_large_image'
        : 'summary';

    const parseScripts = (value?: string) =>
        (value ?? '')
            .split(',')
            .map((script) => script.trim())
            .filter(Boolean);

    const headerScripts = isHomePage
        ? parseScripts(settings.headerScripts)
        : [];
    const footerScripts = isHomePage
        ? parseScripts(settings.footerScripts)
        : [];

    return (
        <>
            <Head>
                <title>{resolvedTitle}</title>
                {resolvedMetaDescription && (
                    <meta
                        name="description"
                        content={resolvedMetaDescription}
                    />
                )}
                {resolvedMetaKeywords && (
                    <meta name="keywords" content={resolvedMetaKeywords} />
                )}
                <meta property="og:type" content={ogType} />
                <meta property="og:title" content={resolvedOgTitle} />
                {resolvedOgDescription && (
                    <meta
                        property="og:description"
                        content={resolvedOgDescription}
                    />
                )}
                {pageUrl && <meta property="og:url" content={pageUrl} />}
                {resolvedOgImage && (
                    <meta property="og:image" content={resolvedOgImage} />
                )}
                <meta name="twitter:card" content={twitterCard} />
                <meta name="twitter:title" content={resolvedTwitterTitle} />
                {resolvedTwitterDescription && (
                    <meta
                        name="twitter:description"
                        content={resolvedTwitterDescription}
                    />
                )}
                {resolvedTwitterImage && (
                    <meta name="twitter:image" content={resolvedTwitterImage} />
                )}
                {pageUrl && <link rel="canonical" href={pageUrl} />}
                {headerScripts.map((script) => (
                    <script key={script} src={script} />
                ))}
            </Head>

            <div className="flex min-h-screen flex-col">
                <SiteHeader
                    settings={settings}
                    cart={resolvedCart}
                    wishlist={resolvedWishlist}
                    products={headerProducts}
                    categories={headerCategories}
                    user={resolvedUser}
                    pages={resolvedPages}
                />

                <main className="flex-1">{children}</main>

                <SiteFooter
                    settings={settings}
                    footerPages={resolvedFooterPages}
                />
                <WhatsAppOverlay phone={settings.phone1} />
            </div>

            {footerScripts.map((script) => (
                <script key={script} src={script} />
            ))}
        </>
    );
}
