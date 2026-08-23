import { Link } from '@inertiajs/react';
import { useMemo } from 'react';

import { ProductCard } from '@/components/site/ProductCard';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/site-types';

interface LatestProductsProps {
    categories: {
        id: string;
        name: string;
        slug: string;
        total: number;
        has_more: boolean;
        products: Product[];
    }[];
    wishlistIds?: string[];
}

const EMPTY_WISHLIST_IDS: string[] = [];

export function LatestProducts({
    categories,
    wishlistIds = EMPTY_WISHLIST_IDS,
}: LatestProductsProps) {
    const visibleProducts = useMemo(() => {
        return categories.reduce<Record<string, Product[]>>((acc, category) => {
            acc[category.id] = category.products;
            return acc;
        }, {});
    }, [categories]);

    return (
        <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="mb-10 text-center md:mb-12">
                    <div className="relative mx-auto inline-flex flex-col items-center">
                        <div className="absolute -top-6 h-16 w-40 rounded-full bg-rose-300/30 blur-2xl dark:bg-rose-400/20" />
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-rose-300/70 bg-linear-to-r from-rose-50 via-orange-50 to-amber-100 px-3 py-1 text-[10px] font-semibold tracking-[0.3em] text-rose-900 uppercase mix-blend-multiply shadow-sm dark:border-rose-300/30 dark:from-rose-300/10 dark:via-orange-300/10 dark:to-amber-300/10 dark:text-rose-100 dark:mix-blend-normal">
                            Fresh Drops
                        </div>
                        <h2 className="relative bg-linear-to-r from-rose-700 via-orange-600 to-amber-600 bg-clip-text font-display text-3xl font-semibold tracking-tight text-transparent mix-blend-multiply drop-shadow-[0_6px_16px_rgba(244,63,94,0.28)] md:text-4xl lg:text-5xl dark:mix-blend-normal">
                            Our Latest Products
                        </h2>
                        <div className="mt-4 flex items-center gap-3">
                            <span className="h-px w-10 bg-primary/40" />
                            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                            <span className="h-1 w-16 rounded-full bg-linear-to-r from-primary/80 via-primary to-accent/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                            <span className="h-px w-10 bg-primary/40" />
                        </div>
                    </div>
                </div>

                {categories.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground">
                        No products found.
                    </div>
                ) : (
                    <div className="space-y-10">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="relative overflow-hidden rounded-3xl border border-primary/20 p-6 shadow-[0_4px_32px_-8px_rgba(197,145,60,0.25),0_1px_8px_-2px_rgba(0,0,0,0.08)] md:p-8"
                                style={{
                                    background:
                                        'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(251,191,36,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 90% 100%, rgba(217,119,6,0.12) 0%, transparent 60%), linear-gradient(160deg, #fffdf5 0%, #fef9ec 40%, #fff8e8 70%, #fdf6e3 100%)',
                                }}
                            >
                                {/* Decorative glowing orb top-center */}
                                <div className="pointer-events-none absolute -top-10 left-1/2 h-40 w-60 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

                                {/* ── Traversing aurora wave (mix-blend-multiply) ── */}
                                <div
                                    className="pointer-events-none absolute inset-0 rounded-3xl opacity-60"
                                    style={{
                                        background:
                                            'radial-gradient(ellipse 55% 70% at 0% 50%, rgba(251,191,36,0.55) 0%, transparent 60%), radial-gradient(ellipse 55% 70% at 50% 50%, rgba(139,92,246,0.35) 0%, transparent 60%), radial-gradient(ellipse 55% 70% at 100% 50%, rgba(245,158,11,0.45) 0%, transparent 60%)',
                                        backgroundSize: '300% 100%',
                                        animation:
                                            'color-wave 8s ease-in-out infinite',
                                        mixBlendMode: 'multiply',
                                    }}
                                />

                                {/* ── Frosted glass sheet on top — no backdrop-filter (perf) ── */}
                                <div
                                    className="pointer-events-none absolute inset-0 rounded-3xl"
                                    style={{
                                        background: 'rgba(255,255,255,0.07)',
                                        boxShadow:
                                            'inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(255,255,255,0.18)',
                                    }}
                                />

                                {/* Inner shimmer border */}
                                <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-primary/10 ring-inset" />

                                <div className="relative mb-6 text-center">
                                    {/* Vibrant Category pill */}
                                    <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-violet-600 via-purple-500 to-indigo-500 px-3.5 py-1 text-[10px] font-bold tracking-[0.3em] text-white uppercase shadow-[0_2px_12px_rgba(139,92,246,0.5)] ring-2 ring-white/50">
                                        <span>✦</span>
                                        Category
                                    </div>
                                    <h3 className="mt-4 bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text font-display text-2xl font-semibold tracking-tight text-transparent drop-shadow-[0_4px_14px_rgba(249,115,22,0.4)] md:text-3xl">
                                        {category.name}
                                    </h3>
                                    <div className="mt-3 flex items-center justify-center gap-2">
                                        <span className="h-px w-8 bg-primary/40" />
                                        <span className="h-2 w-2 rounded-full bg-primary" />
                                        <span className="h-1 w-10 rounded-full bg-linear-to-r from-primary/80 via-primary to-primary/80" />
                                        <span className="h-2 w-2 rounded-full bg-primary" />
                                        <span className="h-px w-8 bg-primary/40" />
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-cyan-700 dark:text-cyan-400">
                                        Explore handpicked selections from this
                                        category.
                                    </p>
                                </div>

                                <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                                    {visibleProducts[category.id]
                                        ?.slice(0, 5)
                                        .map((product, i) => (
                                            <div
                                                key={product.id}
                                                className="w-full max-w-[230px] sm:w-[calc((100%-1rem)/2)] sm:max-w-none md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)] xl:w-[calc((100%-6rem)/5)]"
                                            >
                                                <ProductCard
                                                    product={product}
                                                    index={i}
                                                    size="compact"
                                                    isWishlisted={wishlistIds.includes(
                                                        String(product.id),
                                                    )}
                                                />
                                            </div>
                                        ))}
                                </div>
                                {category.slug &&
                                    (category.total > 5 ||
                                        category.has_more) && (
                                    <div className="mt-6 flex justify-center">
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="rounded-full border-primary/40 bg-primary/10 px-6 py-2 text-primary shadow-sm backdrop-blur-md transition-all hover:border-primary/60 hover:bg-primary/20 hover:shadow-md"
                                        >
                                            <Link
                                                href={`/category/${category.slug}`}
                                            >
                                                View More
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
