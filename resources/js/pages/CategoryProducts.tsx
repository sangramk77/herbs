import { Head } from '@inertiajs/react';

import { ProductCard } from '@/components/site/ProductCard';
import SiteLayout from '@/layouts/SiteLayout';
import type { CartItem, Product, Settings } from '@/types/site-types';

interface CategoryProductsProps {
    settings: Settings;
    category: {
        id: string;
        name: string;
        slug: string;
        description?: string | null;
        banner_url?: string | null;
        show_banner: boolean;
    };
    products: Product[];
    cart_count: number;
    cart_price: number;
    cart_items: CartItem[];
    wishlist_count: number;
    wishlist_items: {
        id: string;
        productsName: string;
        seoUrl: string;
        image1: string;
        price: number;
        mrp: number;
        categoryId?: string | null;
        categoryName?: string | null;
        categorySlug?: string | null;
    }[];
    wishlist_ids: string[];
    auth?: {
        user?: {
            name: string;
        };
    };
}

export default function CategoryProductsPage({
    settings,
    category,
    products,
    cart_count,
    cart_price,
    cart_items,
    wishlist_count,
    wishlist_items,
    wishlist_ids,
    auth,
}: CategoryProductsProps) {
    return (
        <SiteLayout
            settings={settings}
            cart={{
                count: cart_count,
                price: cart_price,
                items: cart_items,
            }}
            wishlist={{
                count: wishlist_count,
                items: wishlist_items,
            }}
            user={auth?.user}
            title={`${category.name} | Natural Rudraksh`}
            metaDescription={
                category.description ??
                `Browse all products in ${category.name}.`
            }
        >
            <Head title={category.name} />

            {category.show_banner && category.banner_url && (
                <section className="bg-white px-4 pt-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-[92rem] overflow-hidden rounded-2xl">
                        <img
                            src={category.banner_url}
                            alt="Category offer banner"
                            className="h-[17rem] w-full object-cover sm:h-[21rem] md:h-[26rem]"
                        />
                    </div>
                </section>
            )}

            <section className="pt-4 pb-12 md:pt-6 md:pb-16">
                <div className="container mx-auto px-4">
                    <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-6 shadow-sm md:p-8">
                        <div className="mb-6 text-center">
                            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/70 px-3 py-1 text-[10px] font-semibold tracking-[0.25em] text-amber-700 uppercase">
                                Category
                            </div>
                            <h3 className="mt-4 bg-gradient-to-r from-amber-700 via-orange-500 to-amber-200 bg-clip-text font-display text-2xl font-semibold tracking-tight text-transparent drop-shadow-[0_6px_14px_rgba(251,191,36,0.35)] md:text-3xl">
                                {category.name}
                            </h3>
                            <div className="mt-3 flex items-center justify-center gap-2">
                                <span className="h-px w-8 bg-amber-300/80" />
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                <span className="h-1 w-10 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                <span className="h-px w-8 bg-amber-300/80" />
                            </div>
                            <p className="mt-3 text-sm text-amber-900/70">
                                Explore handpicked selections from this
                                category.
                            </p>
                        </div>

                        {products.length === 0 ? (
                            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-8 text-center text-muted-foreground">
                                No products found in this category.
                            </div>
                        ) : (
                            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                                {products.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="w-full max-w-[230px] sm:w-[calc((100%-1rem)/2)] sm:max-w-none md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)] xl:w-[calc((100%-6rem)/5)]"
                                    >
                                        <ProductCard
                                            product={product}
                                            index={index}
                                            size="compact"
                                            isWishlisted={wishlist_ids.includes(
                                                String(product.id),
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
