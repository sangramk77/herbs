import { ProductCard } from '@/components/site/ProductCard';
import type { Product } from '@/types/site-types';

interface FeaturedProductsProps {
    products: Product[];
    wishlistIds?: string[];
}

const EMPTY_WISHLIST_IDS: string[] = [];

export function FeaturedProducts({
    products,
    wishlistIds = EMPTY_WISHLIST_IDS,
}: FeaturedProductsProps) {
    return (
        <section className="pt-12 pb-0 md:pt-16">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="mb-10 text-center md:mb-12">
                    <div className="relative mx-auto inline-flex flex-col items-center">
                        <div className="absolute -top-6 h-16 w-40 rounded-full bg-primary/20 blur-2xl" />
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-300/70 bg-linear-to-r from-emerald-50 via-teal-100 to-cyan-100 px-3 py-1 text-[10px] font-semibold tracking-[0.3em] text-teal-900 uppercase mix-blend-multiply shadow-sm dark:border-emerald-300/30 dark:from-emerald-300/10 dark:via-teal-200/10 dark:to-cyan-300/10 dark:text-emerald-100 dark:mix-blend-normal">
                            Handpicked
                        </div>
                        <h2 className="relative bg-linear-to-r from-teal-700 via-cyan-600 to-sky-600 bg-clip-text font-display text-3xl font-semibold tracking-tight text-transparent mix-blend-multiply drop-shadow-[0_6px_16px_rgba(8,145,178,0.28)] md:text-4xl lg:text-5xl dark:mix-blend-normal">
                            Featured Products
                        </h2>
                        <div className="mt-4 flex items-center gap-3">
                            <span className="h-px w-10 bg-primary/40" />
                            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                            <span className="h-1 w-16 rounded-full bg-linear-to-r from-primary/80 via-primary to-primary/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                            <span className="h-px w-10 bg-primary/40" />
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid justify-center gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
                    {products.slice(0, 8).map((product, i) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            index={i}
                            size="compact"
                            isWishlisted={wishlistIds.includes(
                                String(product.id),
                            )}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
