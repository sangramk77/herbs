import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

import { cn } from '@/lib/utils';
import type {
    CartItem,
    MegaMenuItem,
    NavCategory,
    SiteNavItem,
} from '@/types/site-types';

import { CartIcon } from './CartIcon';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';
import { WishlistIcon } from './WishlistIcon';

interface WishlistItem {
    id: string;
    productsName: string;
    seoUrl: string;
    image1: string;
    price: number;
    mrp: number;
}

interface MainNavigationProps {
    navItems: SiteNavItem[];
    products: MegaMenuItem[];
    categories: NavCategory[];
    phoneNumber: string;
    logoUrl: string;
    cartCount: number;
    cartPrice: number;
    cartItems: CartItem[];
    wishlistCount: number;
    wishlistItems: WishlistItem[];
    isAuthenticated: boolean;
    userName?: string;
    userAvatar?: string;
    isHomePage?: boolean;
}

export function MainNavigation({
    navItems,
    products,
    categories,
    logoUrl,
    cartCount,
    cartPrice,
    cartItems,
    wishlistCount,
    wishlistItems,
    isAuthenticated,
    userName,
    userAvatar,
}: MainNavigationProps) {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
        null,
    );

    const productsByCategory = useMemo(() => {
        return products.reduce<Record<string, MegaMenuItem[]>>(
            (acc, product) => {
                const key = product.categoryId ?? 'uncategorized';
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(product);
                return acc;
            },
            {},
        );
    }, [products]);

    const visibleCategories = useMemo(() => {
        const categoryIds = new Set(
            Object.keys(productsByCategory).filter(
                (key) => key !== 'uncategorized',
            ),
        );
        const mapped = categories.filter((category) =>
            categoryIds.has(category.id),
        );

        if (mapped.length > 0) {
            return mapped;
        }

        return [];
    }, [categories, products, productsByCategory]);

    const activeProducts = useMemo(() => {
        if (!activeCategoryId) {
            return products;
        }

        return productsByCategory[activeCategoryId] ?? [];
    }, [activeCategoryId, products, productsByCategory]);

    const defaultCategoryId = visibleCategories[0]?.id ?? null;
    const activeCategory =
        visibleCategories.find(
            (category) =>
                category.id === (activeCategoryId ?? defaultCategoryId),
        ) ?? null;

    return (
        /* ─── Outer wrapper — white bg, tinted shadow ───────────────────────── */
        <div
            className="relative hidden bg-white lg:block"
            style={{
                boxShadow:
                    '0 2px 0 0 rgba(245,158,11,0.45), 0 4px 16px 0 rgba(245,158,11,0.22), 0 8px 40px 0 rgba(0,0,0,0.14)',
            }}
        >
            <div className="container mx-auto px-6">
                <div className="flex h-17 items-center gap-6">
                    {/* ── Logo ─────────────────────────────────────────────── */}
                    <Link href="/" className="flex shrink-0 items-center">
                        <img
                            src={logoUrl}
                            alt="Natural Rudraksh"
                            className="h-12 w-auto"
                        />
                    </Link>

                    {/* ── Primary nav links (center) ───────────────────────── */}
                    <nav className="flex flex-1 items-center justify-center">
                        <ul className="flex items-center gap-0.5">
                            {navItems.map((item) => (
                                <li
                                    key={item.label}
                                    className="group relative"
                                    onMouseEnter={() => {
                                        if (!item.megaMenu) return;
                                        setActiveMenu(item.label);
                                        setActiveCategoryId(defaultCategoryId);
                                    }}
                                    onMouseLeave={() => setActiveMenu(null)}
                                >
                                    {item.megaMenu ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveMenu((current) => {
                                                    const next =
                                                        current === item.label
                                                            ? null
                                                            : item.label;
                                                    if (next) {
                                                        setActiveCategoryId(
                                                            defaultCategoryId,
                                                        );
                                                    }
                                                    return next;
                                                })
                                            }
                                            onMouseEnter={() =>
                                                setActiveCategoryId(
                                                    defaultCategoryId,
                                                )
                                            }
                                            className="flex items-center gap-1 rounded-lg px-3.5 py-2 text-[0.875rem] font-medium text-gray-700 transition-colors hover:bg-amber-50 hover:text-amber-700"
                                        >
                                            {item.label}
                                            <ChevronDown className="h-3.5 w-3.5 text-gray-400 transition-transform duration-200 group-hover:rotate-180" />
                                        </button>
                                    ) : (
                                        <Link
                                            href={item.url}
                                            className="flex items-center gap-1 rounded-lg px-3.5 py-2 text-[0.875rem] font-medium text-gray-700 transition-colors hover:bg-amber-50 hover:text-amber-700"
                                        >
                                            {item.label}
                                        </Link>
                                    )}

                                    {/* ── Mega Menu ─────────────────────────── */}
                                    {item.megaMenu &&
                                        products.length > 0 &&
                                        visibleCategories.length > 0 && (
                                            <div
                                                className={cn(
                                                    'absolute top-full left-1/2 z-50 w-[min(90vw,60rem)] -translate-x-1/2 overflow-hidden rounded-b-2xl border border-t-2 border-border border-t-amber-400 bg-white shadow-2xl transition-all duration-200',
                                                    activeMenu === item.label
                                                        ? 'visible opacity-100'
                                                        : 'invisible opacity-0',
                                                )}
                                            >
                                                <div className="max-h-125 overflow-y-auto">
                                                    <div className="p-5">
                                                        <div className="grid gap-6 md:grid-cols-12">
                                                            {/* Categories sidebar */}
                                                            <div className="md:col-span-3">
                                                                <div className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-gray-400 uppercase">
                                                                    Categories
                                                                </div>
                                                                <div className="max-h-90 space-y-1 overflow-y-auto pr-1">
                                                                    {visibleCategories.map(
                                                                        (
                                                                            category,
                                                                        ) => (
                                                                            <button
                                                                                key={
                                                                                    category.id
                                                                                }
                                                                                type="button"
                                                                                onMouseEnter={() =>
                                                                                    setActiveCategoryId(
                                                                                        category.id,
                                                                                    )
                                                                                }
                                                                                onClick={() =>
                                                                                    setActiveCategoryId(
                                                                                        category.id,
                                                                                    )
                                                                                }
                                                                                className={cn(
                                                                                    'w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200',
                                                                                    activeCategoryId ===
                                                                                        category.id
                                                                                        ? 'scale-[1.02] bg-linear-to-r from-amber-400 to-amber-500 text-amber-950 shadow-[0_4px_14px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/50'
                                                                                        : 'text-gray-700 hover:bg-amber-50 hover:text-amber-800',
                                                                                )}
                                                                            >
                                                                                {
                                                                                    category.name
                                                                                }
                                                                            </button>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Products grid */}
                                                            <div className="md:col-span-9">
                                                                <div className="mb-3 flex items-center justify-between">
                                                                    <div className="text-sm font-semibold text-gray-800">
                                                                        {activeCategory?.name ??
                                                                            'Products'}
                                                                    </div>
                                                                    <Link
                                                                        href={
                                                                            activeCategory?.slug
                                                                                ? `/category/${activeCategory.slug}`
                                                                                : '/product'
                                                                        }
                                                                        className="text-xs font-medium text-amber-600 hover:text-amber-700"
                                                                    >
                                                                        View all
                                                                    </Link>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 lg:grid-cols-3">
                                                                    {activeProducts.map(
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
                                                                                className="group/item relative flex items-center gap-3 rounded-xl border border-transparent p-2 transition-all duration-200 hover:border-amber-200/60 hover:bg-amber-50/70 hover:shadow-sm"
                                                                            >
                                                                                <img
                                                                                    src={
                                                                                        product.image
                                                                                    }
                                                                                    alt={
                                                                                        product.name
                                                                                    }
                                                                                    className="h-10 w-10 shrink-0 rounded-md object-cover ring-1 ring-black/5 group-hover/item:ring-amber-500/20"
                                                                                />
                                                                                <span className="text-sm font-medium text-gray-700 transition-colors group-hover/item:text-amber-800">
                                                                                    {
                                                                                        product.name
                                                                                    }
                                                                                </span>
                                                                            </Link>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* ── Right-side: Search + User Actions ────────────────── */}
                    <div className="flex shrink-0 items-center gap-1">
                        {/* Inline search bar */}
                        <div className="w-52 xl:w-64">
                            <SearchBar className="w-full" />
                        </div>

                        <UserMenu
                            isAuthenticated={isAuthenticated}
                            userName={userName}
                            userAvatar={userAvatar}
                        />
                        <WishlistIcon
                            count={wishlistCount}
                            items={wishlistItems}
                        />
                        <CartIcon
                            count={cartCount}
                            price={cartPrice}
                            items={cartItems}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
