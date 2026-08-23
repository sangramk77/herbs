import { Link } from '@inertiajs/react';
import { ArrowRight, ShoppingBag, Star, Tag } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Product } from '@/types/site-types';

import { WishlistButton } from '../shared/WishlistButton';

interface ProductCardProps {
    product: Product;
    isWishlisted?: boolean;
    className?: string;
    size?: 'default' | 'compact';
    /** Card index used to stagger entrance animation (0-based) */
    index?: number;
}

const ease =
    'transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';

export function ProductCard({
    product,
    isWishlisted = false,
    className,
    size = 'default',
    index = 0,
}: ProductCardProps) {
    const discountPercentage = product.discount;
    const hasDiscount = discountPercentage && discountPercentage > 0;
    const productHref = product.categorySlug
        ? `/category/${product.categorySlug}/product/${product.seoUrl}`
        : `/product/${product.seoUrl}`;

    const savings =
        product.mrp > product.price ? product.mrp - product.price : 0;

    const delayMs = Math.min(index, 7) * 50;
    const isCompact = size === 'compact';

    return (
        <div
            className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-2xl',
                'border border-primary/15 bg-white dark:bg-zinc-900/80',
                'shadow-[0_1px_8px_-2px_rgba(0,0,0,0.07)]',
                ease,
                'hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-10px_rgba(197,145,60,0.25),0_0_0_1px_rgba(197,145,60,0.18)]',
                'animate-card-rise',
                className,
            )}
            style={{
                animationDelay: `${delayMs}ms`,
                animationFillMode: 'both',
            }}
        >
            {/* Ambient glow blobs */}
            <div
                className={cn(
                    'pointer-events-none absolute inset-0 z-0 opacity-0',
                    ease,
                    'group-hover:opacity-100',
                )}
            >
                <div className="absolute -top-12 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute right-3 -bottom-12 h-24 w-24 rounded-full bg-accent/20 blur-3xl" />
            </div>

            {/* ─── IMAGE ─── */}
            <Link
                href={productHref}
                className={cn(
                    'relative block overflow-hidden bg-secondary/20',
                    isCompact ? 'aspect-[4/4.2]' : 'aspect-4/5',
                )}
            >
                {/* Image */}
                <img
                    src={`/uploads/products/${product.image1}`}
                    alt={product.productsName}
                    className={cn(
                        'h-full w-full object-cover will-change-transform',
                        // Smooth, slow zoom with warm brightness lift
                        'transition-[transform,filter] duration-850 ease-[cubic-bezier(0.16,1,0.3,1)]',
                        'group-hover:scale-105 group-hover:brightness-[1.06] group-hover:saturate-[1.08]',
                    )}
                />

                {/* Bottom vignette */}
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black/45 via-black/10 to-transparent" />

                {/* ── Badge slot — always occupied ── */}
                <div className="absolute top-2.5 left-2.5">
                    {hasDiscount ? (
                        /* Vivid discount badge — bold, opaque, impossible to miss */
                        <div className="relative flex items-center gap-1 overflow-hidden rounded-full bg-linear-to-br from-orange-500 via-red-500 to-rose-600 px-3 py-1 shadow-[0_3px_16px_rgba(239,68,68,0.65),0_1px_4px_rgba(0,0,0,0.3)] ring-2 ring-white/60">
                            {/* shimmer — skewed so it sweeps diagonally */}
                            <div className="absolute inset-0 -translate-x-full skew-x-[-15deg] animate-shimmer bg-linear-to-r from-transparent via-white/20 to-transparent" />
                            <span className="relative text-[11px] font-black tracking-wider text-white uppercase [text-shadow:0_1px_3px_rgba(0,0,0,0.4)]">
                                ⚡ {discountPercentage}% OFF
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 rounded-full border border-primary/30 bg-white/90 px-2.5 py-0.5 shadow-sm backdrop-blur-sm">
                            <Tag className="h-2.5 w-2.5 text-primary" />
                            <span className="text-[9px] font-bold tracking-widest text-primary uppercase">
                                Best Price
                            </span>
                        </div>
                    )}
                </div>

                {/* Wishlist — visible on mobile, fades in on desktop hover */}
                <div
                    className={cn(
                        'absolute top-2 right-2',
                        // Always visible on mobile; fade+drop-in on desktop
                        'translate-y-0 opacity-100',
                        'sm:translate-y-1.5 sm:opacity-0',
                        ease,
                        'sm:group-hover:translate-y-0 sm:group-hover:opacity-100',
                    )}
                >
                    <WishlistButton
                        productId={String(product.id)}
                        isInWishlist={isWishlisted}
                        size="sm"
                    />
                </div>

                {/* ── Slide-up CTA — desktop hover only ── */}
                <div
                    className={cn(
                        'absolute inset-x-0 bottom-0 px-3 py-2.5',
                        'flex items-center justify-center',
                        'bg-white/10 backdrop-blur-md',
                        // Hidden on mobile (button in info section instead)
                        'hidden sm:flex',
                        'translate-y-full transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
                        'group-hover:translate-y-0',
                    )}
                >
                    <Link
                        href={productHref}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            'group/btn relative flex w-full items-center justify-center gap-1.5 overflow-hidden',
                            'rounded-full px-4 py-2 text-[11px] font-semibold tracking-widest text-white uppercase',
                            // Gradient base
                            'bg-linear-to-r from-amber-500 via-primary to-yellow-500 bg-size-[200%_100%] bg-right',
                            // Smooth gradient slide + glow bloom on hover
                            'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                            'hover:bg-left hover:shadow-[0_0_20px_2px_rgba(197,145,60,0.55),0_4px_16px_-2px_rgba(197,145,60,0.7)]',
                            'hover:scale-[1.03] active:scale-95',
                        )}
                    >
                        {/* Shimmer sweep */}
                        <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-full" />
                        <ShoppingBag className="relative h-3 w-3 transition-transform duration-300 group-hover/btn:scale-110" />
                        <span className="relative">View Product</span>
                    </Link>
                </div>
            </Link>

            {/* ─── INFO ─── */}
            <div
                className={cn(
                    'relative z-10 flex flex-1 flex-col gap-1.5',
                    isCompact ? 'p-2.5' : 'p-3',
                )}
            >
                {/* Category chip */}
                {product.categoryName && (
                    <span className="inline-block w-fit rounded-full border border-primary/20 bg-primary/5 px-2 py-px text-[9px] font-semibold tracking-widest text-primary/70 uppercase">
                        {product.categoryName}
                    </span>
                )}

                {/* Product name */}
                <Link href={productHref}>
                    <h3
                        className={cn(
                            'line-clamp-2 font-semibold tracking-tight text-foreground',
                            isCompact
                                ? 'text-[12px] leading-snug'
                                : 'text-[13px] leading-snug',
                            ease,
                            'hover:text-primary',
                        )}
                    >
                        {product.productsName}
                    </h3>
                </Link>

                {/* Stars */}
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                                'h-2.5 w-2.5',
                                i < 4
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-amber-200 text-amber-200',
                            )}
                        />
                    ))}
                    <span className="ml-1 text-[9px] text-muted-foreground">
                        (4.0)
                    </span>
                </div>

                {/* Price row */}
                <div className="mt-auto flex items-end justify-between pt-0.5">
                    <div className="flex flex-col leading-tight">
                        <span
                            className={cn(
                                'font-bold tracking-tight text-primary',
                                isCompact
                                    ? 'text-sm md:text-[15px]'
                                    : 'text-sm md:text-base',
                            )}
                        >
                            ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.mrp > product.price && (
                            <span className="text-[11px] text-muted-foreground line-through">
                                ₹{product.mrp.toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>

                    {/* Bottom-right slot: savings pill OR a "Shop Now" link */}
                    {savings > 0 ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-px text-[9px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-800">
                            Save ₹{savings.toLocaleString('en-IN')}
                        </span>
                    ) : (
                        <Link
                            href={productHref}
                            className="flex items-center gap-0.5 text-[9px] font-semibold tracking-wide text-primary/70 uppercase transition-colors hover:text-primary"
                        >
                            Shop Now
                            <ArrowRight className="h-2.5 w-2.5" />
                        </Link>
                    )}
                </div>

                {/* ── Mobile-only CTA button (shown below price on touch devices) ── */}
                <Link
                    href={productHref}
                    className={cn(
                        'group/btn relative mt-1 flex items-center justify-center gap-1.5 overflow-hidden sm:hidden',
                        'rounded-full px-4 py-2 text-[11px] font-semibold tracking-widest text-white uppercase',
                        // Same gradient + glow as desktop
                        'bg-linear-to-r from-amber-500 via-primary to-yellow-500 bg-size-[200%_100%] bg-right',
                        'shadow-[0_3px_14px_-2px_rgba(197,145,60,0.45)]',
                        'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                        'active:scale-95',
                    )}
                >
                    {/* Shimmer sweep */}
                    <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-full" />
                    <ShoppingBag className="relative h-3 w-3" />
                    <span className="relative">View Product</span>
                </Link>
            </div>
        </div>
    );
}
