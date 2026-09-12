import { Link } from '@inertiajs/react';
import {
    ChevronDown,
    Folder,
    Heart,
    Menu,
    ShoppingCart,
    User,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import type {
    MegaMenuItem,
    NavCategory,
    SiteNavItem,
    SocialLinks as SocialLinksType,
} from '@/types/site-types';

import { SocialLinks } from './SocialLinks';

interface MobileMenuProps {
    navItems: SiteNavItem[];
    products: MegaMenuItem[];
    categories: NavCategory[];
    cartCount: number;
    isAuthenticated: boolean;
    socialLinks: SocialLinksType;
}

const menuIconColors = [
    'bg-orange-500 text-white',
    'bg-amber-600 text-white',
    'bg-rose-500 text-white',
    'bg-violet-600 text-white',
    'bg-emerald-600 text-white',
];

/** Expandable mobile navigation matching the Natural Rudraksh storefront. */
export function MobileMenu({
    navItems,
    products,
    categories,
    cartCount,
    isAuthenticated,
    socialLinks,
}: MobileMenuProps) {
    const [open, setOpen] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(
        null,
    );

    const categoryProducts = useMemo(
        () =>
            categories
                .map((category) => ({
                    ...category,
                    products: products.filter(
                        (product) => product.categoryId === category.id,
                    ),
                }))
                .filter((category) => category.products.length > 0),
        [categories, products],
    );

    const closeMenu = () => {
        setOpen(false);
        setExpandedMenu(null);
        setExpandedCategory(null);
    };

    return (
        <div className="relative z-40 border-b border-orange-200 bg-gradient-to-r from-orange-100 via-amber-50 to-rose-100 shadow-sm shadow-orange-950/10 lg:hidden">
            <div className="container mx-auto px-4 py-3.5">
                <button
                    type="button"
                    onClick={() => {
                        if (open) {
                            setExpandedMenu(null);
                            setExpandedCategory(null);
                        }

                        setOpen(!open);
                    }}
                    aria-controls="mobile-site-menu"
                    aria-expanded={open}
                    className="group flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-orange-200/70 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 px-5 text-sm font-bold tracking-[0.16em] text-stone-800 shadow-[0_10px_30px_-20px_rgba(124,45,18,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:from-orange-100 hover:via-amber-50 hover:to-orange-100 hover:shadow-[0_18px_36px_-20px_rgba(124,45,18,0.6)] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    {open ? (
                        <X className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
                    ) : (
                        <Menu className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    )}
                    {open ? 'CLOSE' : 'MENU'}
                </button>

                {open && (
                    <div
                        id="mobile-site-menu"
                        className="absolute top-full right-4 left-4 z-50 mt-2.5 max-h-[calc(100vh-9.5rem)] overflow-y-auto rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100 p-2 shadow-[0_24px_65px_-28px_rgba(67,20,7,0.55)] ring-1 ring-orange-200/70"
                    >
                        <nav aria-label="Mobile navigation">
                            <ul className="space-y-1">
                                {navItems.map((item, index) => {
                                    const isProductMenu =
                                        Boolean(item.megaMenu) &&
                                        categoryProducts.length > 0;
                                    const isExpanded =
                                        expandedMenu === item.label;

                                    if (isProductMenu) {
                                        return (
                                            <li key={item.label}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setExpandedMenu(
                                                            isExpanded
                                                                ? null
                                                                : item.label,
                                                        );
                                                        setExpandedCategory(
                                                            null,
                                                        );
                                                    }}
                                                    aria-expanded={isExpanded}
                                                    className={cn(
                                                        'flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-semibold text-stone-800 transition-all hover:bg-orange-50 hover:text-orange-800 active:scale-[0.99]',
                                                        isExpanded &&
                                                            'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-900 shadow-sm',
                                                    )}
                                                >
                                                    {item.icon && (
                                                        <span
                                                            className={cn(
                                                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-sm shadow-orange-950/15',
                                                                menuIconColors[
                                                                    index %
                                                                        menuIconColors.length
                                                                ],
                                                            )}
                                                        >
                                                            <img
                                                                src={item.icon}
                                                                alt=""
                                                                className="h-4 w-4"
                                                            />
                                                        </span>
                                                    )}
                                                    <span className="flex-1">
                                                        {item.label}
                                                    </span>
                                                    <ChevronDown
                                                        className={cn(
                                                            'h-4 w-4 text-orange-700 transition-transform',
                                                            isExpanded &&
                                                                'rotate-180',
                                                        )}
                                                    />
                                                </button>
                                                {isExpanded && (
                                                    <div className="px-2 pt-1 pb-2">
                                                        <div className="space-y-2 rounded-2xl bg-gradient-to-b from-orange-50/70 to-amber-50/40 p-2.5">
                                                            {categoryProducts.map(
                                                                (category) => {
                                                                    const categoryOpen =
                                                                        expandedCategory ===
                                                                        category.id;
                                                                    return (
                                                                        <section
                                                                            key={
                                                                                category.id
                                                                            }
                                                                            className="overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-100 shadow-[0_10px_24px_-18px_rgba(124,45,18,0.6)]"
                                                                        >
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    setExpandedCategory(
                                                                                        categoryOpen
                                                                                            ? null
                                                                                            : category.id,
                                                                                    )
                                                                                }
                                                                                aria-expanded={
                                                                                    categoryOpen
                                                                                }
                                                                                className={cn(
                                                                                    'flex min-h-12 w-full items-center gap-3 px-3.5 py-3 text-left text-[15px] font-bold text-stone-800 transition-all hover:bg-orange-100/70 hover:text-orange-900',
                                                                                    categoryOpen &&
                                                                                        'border-b border-orange-100 bg-gradient-to-r from-orange-100/80 to-amber-50',
                                                                                )}
                                                                            >
                                                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-600 text-white shadow-sm shadow-amber-950/20">
                                                                                    <Folder className="h-4 w-4" />
                                                                                </span>
                                                                                <span className="min-w-0 flex-1">
                                                                                    {
                                                                                        category.name
                                                                                    }
                                                                                </span>
                                                                                <ChevronDown
                                                                                    className={cn(
                                                                                        'h-4 w-4 shrink-0 text-orange-700 transition-transform',
                                                                                        categoryOpen &&
                                                                                            'rotate-180',
                                                                                    )}
                                                                                />
                                                                            </button>
                                                                            {categoryOpen && (
                                                                                <div className="divide-y divide-orange-100 bg-amber-50">
                                                                                    {category.products.map(
                                                                                        (
                                                                                            product,
                                                                                        ) => (
                                                                                            <Link
                                                                                                key={
                                                                                                    product.id
                                                                                                }
                                                                                                href={
                                                                                                    product.categorySlug
                                                                                                        ? `/category/${product.categorySlug}/product/${product.url}`
                                                                                                        : `/product/${product.url}`
                                                                                                }
                                                                                                onClick={
                                                                                                    closeMenu
                                                                                                }
                                                                                                className="block px-3.5 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-orange-50 hover:text-orange-800"
                                                                                            >
                                                                                                {
                                                                                                    product.name
                                                                                                }
                                                                                            </Link>
                                                                                        ),
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </section>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    }

                                    return (
                                        <li key={item.label}>
                                            <Link
                                                href={item.url}
                                                onClick={closeMenu}
                                                className="flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold text-stone-800 transition-all hover:bg-orange-50 hover:text-orange-800 active:scale-[0.99]"
                                            >
                                                {item.icon && (
                                                    <span
                                                        className={cn(
                                                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-sm shadow-orange-950/15',
                                                            menuIconColors[
                                                                index %
                                                                    menuIconColors.length
                                                            ],
                                                        )}
                                                    >
                                                        <img
                                                            src={item.icon}
                                                            alt=""
                                                            className="h-4 w-4"
                                                        />
                                                    </span>
                                                )}
                                                <span>{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>

                        <div className="mt-1 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-100 p-2 shadow-sm shadow-orange-950/10">
                            <Link
                                href={isAuthenticated ? '/account' : '/login'}
                                onClick={closeMenu}
                                className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-orange-50 hover:text-orange-800"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm shadow-violet-950/20">
                                    <User className="h-4 w-4" />
                                </span>
                                My Account
                            </Link>
                            <Link
                                href="/wishlist"
                                onClick={closeMenu}
                                className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-orange-50 hover:text-orange-800"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white shadow-sm shadow-rose-950/20">
                                    <Heart className="h-4 w-4" />
                                </span>
                                Wishlist
                            </Link>
                            <Link
                                href="/cart"
                                onClick={closeMenu}
                                className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-orange-50 hover:text-orange-800"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shadow-emerald-950/20">
                                    <ShoppingCart className="h-4 w-4" />
                                </span>
                                <span className="flex-1">Your Cart</span>
                                {cartCount > 0 && (
                                    <span className="rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                        <div className="mt-2 border-t border-orange-100/70 px-3 pt-3 pb-2">
                            <SocialLinks
                                links={socialLinks}
                                className="justify-center"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
