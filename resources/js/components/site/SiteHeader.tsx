import { usePage } from '@inertiajs/react';

import type {
    CartInfo,
    NavCategory,
    Product,
    Settings,
} from '@/types/site-types';

import { MainNavigation } from './MainNavigation';
import { MobileMenu } from './MobileMenu';
import { TopBar } from './TopBar';

interface SiteHeaderProps {
    settings: Settings;
    cart: CartInfo;
    wishlist: {
        count: number;
        items: any[];
    };
    products: Product[];
    categories?: NavCategory[];
    user?: {
        name: string;
        avatar?: string;
    };
    pages?: {
        pageName: string;
        seoUrl: string;
    }[];
}

export function SiteHeader({
    settings,
    cart,
    wishlist,
    products,
    categories = [],
    user,
    pages = [],
}: SiteHeaderProps) {
    const page = usePage<{
        auth?: {
            user?: {
                name?: string;
                avatar?: string;
            };
        };
    }>();
    const isHomePage = page.component === 'Home';
    const logoUrl = '/assets/img/logos.png';
    const resolvedIsAuthenticated = Boolean(user ?? page.props.auth?.user);
    const resolvedUserName = user?.name ?? page.props.auth?.user?.name;
    const resolvedUserAvatar = user?.avatar ?? page.props.auth?.user?.avatar;

    // Transform products for mega menu
    const megaMenuProducts = products.map((p) => ({
        id: p.id,
        name: p.productsName,
        url: p.seoUrl,
        image: `/uploads/products/${p.image1}`,
        categoryId: p.categoryId,
        categoryName: p.categoryName,
        categorySlug: p.categorySlug,
    }));

    // Navigation items
    const hiddenSlugs = new Set([
        'about',
        'blog',
        'product',
        'contact',
        'home',
    ]);
    const cmsNavPages = pages.filter(
        (page) => !hiddenSlugs.has(page.seoUrl.toLowerCase()),
    );

    const navItems = [
        {
            label: 'Home',
            url: '/',
            icon: '/assets/img/menu-icon/home-icon.png',
        },
        {
            label: 'About',
            url: '/about',
            icon: '/assets/img/menu-icon/about-icon.png',
        },
        {
            label: 'Products',
            url: '/product',
            icon: '/assets/img/menu-icon/rudraksha-icon.png',
            megaMenu: megaMenuProducts,
        },
        {
            label: 'Blog',
            url: '/blog',
            icon: '/assets/img/menu-icon/blog-icon.png',
        },
        {
            label: 'Contact',
            url: '/contact',
            icon: '/assets/img/menu-icon/contact-icon.png',
        },
        ...cmsNavPages.map((page) => ({
            label: page.pageName,
            url: `/${page.seoUrl}`,
        })),
    ];

    const socialLinks = {
        facebook: settings.fbLink,
        twitter: settings.twitterLink,
        instagram: settings.instaLink,
        youtube: settings.youtubeLink,
    };

    return (
        <header className="z-50 bg-white shadow-sm">
            {/* Top Bar */}
            <TopBar
                message="For Bulk Order (B2B Business)"
                linkText="Contact Us Directly Via(Call/Whatsapp)"
                linkUrl="/contact"
            />

            {/* Main unified navigation bar */}
            <MainNavigation
                navItems={navItems}
                products={megaMenuProducts}
                categories={categories}
                phoneNumber={settings.phone1}
                logoUrl={logoUrl}
                cartCount={cart.count}
                cartPrice={cart.price}
                cartItems={cart.items}
                wishlistCount={wishlist.count}
                wishlistItems={wishlist.items}
                isAuthenticated={resolvedIsAuthenticated}
                userName={resolvedUserName}
                userAvatar={resolvedUserAvatar}
                isHomePage={isHomePage}
            />

            {/* Mobile Menu */}
            <MobileMenu
                navItems={navItems}
                products={megaMenuProducts}
                cartCount={cart.count}
                isAuthenticated={resolvedIsAuthenticated}
                socialLinks={socialLinks}
                logoUrl={logoUrl}
                isHomePage={isHomePage}
            />
        </header>
    );
}
