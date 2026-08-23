import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const updateScrollState = () => setIsScrolled(window.scrollY > 16);

        updateScrollState();
        window.addEventListener('scroll', updateScrollState, { passive: true });

        return () => window.removeEventListener('scroll', updateScrollState);
    }, []);

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
        <div
            className={cn(
                'sticky top-0 z-50 hidden border-b border-[#3e8e4f]/10 bg-[#edf5ed]/95 backdrop-blur-xl transition-[padding,background-color,box-shadow] duration-300 lg:block',
                isScrolled
                    ? 'bg-[#edf5ed]/98 py-2 shadow-[0_14px_30px_-22px_rgba(20,83,45,0.55)]'
                    : 'py-3',
            )}
        >
            <div className="container mx-auto px-6">
                <div className="overflow-visible rounded-[1.75rem] border border-[#3e8e4f]/15 bg-white/90 shadow-[0_18px_50px_-30px_rgba(20,83,45,0.42)] backdrop-blur-xl">
                    <div className="flex h-19 items-center gap-6 px-5 xl:px-7">
                        {/* ── Logo ─────────────────────────────────────────────── */}
                        <Link href="/" className="flex shrink-0 items-center">
                            <img
                                src={logoUrl}
                                alt="Herbs"
                                className="h-11 w-auto"
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
                                            setActiveCategoryId(
                                                defaultCategoryId,
                                            );
                                        }}
                                        onMouseLeave={() => setActiveMenu(null)}
                                    >
                                        {item.megaMenu ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveMenu((current) => {
                                                        const next =
                                                            current ===
                                                            item.label
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
                                                className="flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.875rem] font-medium text-[#38513d] transition-[background-color,color] hover:bg-[#eaf5e6] hover:text-[#24723f]"
                                            >
                                                {item.label}
                                                <ChevronDown className="h-3.5 w-3.5 text-[#78907d] transition-transform duration-200 group-hover:rotate-180" />
                                            </button>
                                        ) : (
                                            <Link
                                                href={item.url}
                                                className="flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.875rem] font-medium text-[#38513d] transition-[background-color,color] hover:bg-[#eaf5e6] hover:text-[#24723f]"
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
                                                        'absolute top-full left-1/2 z-50 w-[min(90vw,60rem)] -translate-x-1/2 overflow-hidden rounded-b-2xl border border-t-2 border-[#3e8e4f]/20 border-t-[#3e8e4f] bg-white shadow-2xl transition-all duration-200',
                                                        activeMenu ===
                                                            item.label
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
                                                                                            ? 'scale-[1.02] bg-linear-to-r from-[#3e8e4f] to-[#6eaa71] text-white shadow-[0_4px_14px_rgba(62,142,79,0.3)] ring-1 ring-[#3e8e4f]/40'
                                                                                            : 'text-gray-700 hover:bg-[#eaf5e6] hover:text-[#24723f]',
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
                                                                            className="text-xs font-medium text-[#2e7b43] hover:text-[#14532d]"
                                                                        >
                                                                            View
                                                                            all
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
                                                                                    className="group/item relative flex items-center gap-3 rounded-xl border border-transparent p-2 transition-[background-color,border-color,box-shadow] duration-200 hover:border-[#9ad454]/50 hover:bg-[#eff8e9] hover:shadow-sm"
                                                                                >
                                                                                    <img
                                                                                        src={
                                                                                            product.image
                                                                                        }
                                                                                        alt={
                                                                                            product.name
                                                                                        }
                                                                                        className="h-10 w-10 shrink-0 rounded-md object-cover ring-1 ring-black/5 group-hover/item:ring-[#3e8e4f]/25"
                                                                                    />
                                                                                    <span className="text-sm font-medium text-gray-700 transition-colors group-hover/item:text-[#24723f]">
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

                        <div className="flex shrink-0 items-center gap-1 rounded-2xl bg-[#edf5ed] px-1.5 py-1">
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
                    <div className="flex items-center justify-between gap-6 border-t border-[#3e8e4f]/10 px-5 py-3 xl:px-7">
                        <p className="hidden text-xs font-medium tracking-[0.08em] text-[#59725e] xl:block">
                            THOUGHTFULLY SOURCED · NATURALLY GOOD
                        </p>
                        <div className="mx-auto w-full max-w-md">
                            <SearchBar className="w-full" />
                        </div>
                        <Link
                            href="/contact"
                            className="hidden text-xs font-semibold text-[#2e7b43] transition hover:text-[#14532d] xl:block"
                        >
                            Need help? Contact us →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
