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
    'bg-[#3e8e4f] text-white',
    'bg-[#65a952] text-white',
    'bg-emerald-600 text-white',
    'bg-teal-600 text-white',
    'bg-[#e6b45c] text-[#173c28]',
];

/** Expandable mobile navigation using the Herbs visual system. */
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
        <div className="relative z-40 border-b border-[#3e8e4f]/20 bg-gradient-to-r from-[#edf5ed] via-[#f7fbf3] to-[#e2f0dd] shadow-sm shadow-[#173c28]/10 lg:hidden">
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
                    className="group flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-[#3e8e4f]/25 bg-gradient-to-r from-white via-[#f7fbf3] to-[#edf5ed] px-5 text-sm font-bold tracking-[0.16em] text-[#173c28] shadow-[0_10px_30px_-20px_rgba(20,83,45,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3e8e4f]/45 hover:from-[#edf5ed] hover:via-white hover:to-[#e2f0dd] hover:shadow-[0_18px_36px_-20px_rgba(20,83,45,0.45)] focus-visible:ring-2 focus-visible:ring-[#3e8e4f] focus-visible:ring-offset-2 focus-visible:outline-none"
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
                        className="absolute top-full right-4 left-4 z-50 mt-2.5 max-h-[calc(100vh-9.5rem)] overflow-y-auto rounded-3xl border border-[#3e8e4f]/25 bg-gradient-to-br from-[#edf5ed] via-white to-[#e2f0dd] p-2 shadow-[0_24px_65px_-28px_rgba(20,83,45,0.4)] ring-1 ring-[#3e8e4f]/15"
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
                                                        'flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-semibold text-[#173c28] transition-all hover:bg-[#edf5ed] hover:text-[#14532d] active:scale-[0.99]',
                                                        isExpanded &&
                                                            'bg-gradient-to-r from-[#edf5ed] to-[#e2f0dd] text-[#14532d] shadow-sm',
                                                    )}
                                                >
                                                    {item.icon && (
                                                        <span
                                                            className={cn(
                                                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-sm shadow-[#173c28]/15',
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
                                                            'h-4 w-4 text-[#2e7b43] transition-transform',
                                                            isExpanded &&
                                                                'rotate-180',
                                                        )}
                                                    />
                                                </button>
                                                {isExpanded && (
                                                    <div className="px-2 pt-1 pb-2">
                                                        <div className="space-y-2 rounded-2xl bg-gradient-to-b from-[#edf5ed]/80 to-[#f7fbf3] p-2.5">
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
                                                                            className="overflow-hidden rounded-2xl border border-[#3e8e4f]/20 bg-gradient-to-br from-white to-[#e2f0dd] shadow-[0_10px_24px_-18px_rgba(20,83,45,0.4)]"
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
                                                                                    'flex min-h-12 w-full items-center gap-3 px-3.5 py-3 text-left text-[15px] font-bold text-[#173c28] transition-all hover:bg-[#edf5ed] hover:text-[#14532d]',
                                                                                    categoryOpen &&
                                                                                        'border-b border-[#3e8e4f]/15 bg-gradient-to-r from-[#e2f0dd] to-white',
                                                                                )}
                                                                            >
                                                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#3e8e4f] text-white shadow-sm shadow-[#173c28]/20">
                                                                                    <Folder className="h-4 w-4" />
                                                                                </span>
                                                                                <span className="min-w-0 flex-1">
                                                                                    {
                                                                                        category.name
                                                                                    }
                                                                                </span>
                                                                                <ChevronDown
                                                                                    className={cn(
                                                                                        'h-4 w-4 shrink-0 text-[#2e7b43] transition-transform',
                                                                                        categoryOpen &&
                                                                                            'rotate-180',
                                                                                    )}
                                                                                />
                                                                            </button>
                                                                            {categoryOpen && (
                                                                                <div className="divide-y divide-[#3e8e4f]/10 bg-[#f7fbf3]">
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
                                                                                                className="block px-3.5 py-3 text-sm font-medium text-[#38513d] transition-colors hover:bg-[#edf5ed] hover:text-[#14532d]"
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
                                                className="flex min-h-12 items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold text-[#173c28] transition-all hover:bg-[#edf5ed] hover:text-[#14532d] active:scale-[0.99]"
                                            >
                                                {item.icon && (
                                                    <span
                                                        className={cn(
                                                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-sm shadow-[#173c28]/15',
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

                        <div className="mt-1 rounded-2xl border border-[#3e8e4f]/20 bg-gradient-to-r from-white to-[#e2f0dd] p-2 shadow-sm shadow-[#173c28]/10">
                            <Link
                                href={isAuthenticated ? '/account' : '/login'}
                                onClick={closeMenu}
                                className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-[#38513d] transition-colors hover:bg-[#edf5ed] hover:text-[#14532d]"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm shadow-violet-950/20">
                                    <User className="h-4 w-4" />
                                </span>
                                My Account
                            </Link>
                            <Link
                                href="/wishlist"
                                onClick={closeMenu}
                                className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-[#38513d] transition-colors hover:bg-[#edf5ed] hover:text-[#14532d]"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white shadow-sm shadow-rose-950/20">
                                    <Heart className="h-4 w-4" />
                                </span>
                                Wishlist
                            </Link>
                            <Link
                                href="/cart"
                                onClick={closeMenu}
                                className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-[#38513d] transition-colors hover:bg-[#edf5ed] hover:text-[#14532d]"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shadow-emerald-950/20">
                                    <ShoppingCart className="h-4 w-4" />
                                </span>
                                <span className="flex-1">Your Cart</span>
                                {cartCount > 0 && (
                                    <span className="rounded-full bg-gradient-to-r from-[#3e8e4f] to-[#65a952] px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                        <div className="mt-2 border-t border-[#3e8e4f]/10 px-3 pt-3 pb-2">
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
