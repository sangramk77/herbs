import { ProductCard } from '@/components/site/ProductCard';
import SiteLayout from '@/layouts/SiteLayout';
import type { CartItem, Product, Settings } from '@/types/site-types';
import { Head } from '@inertiajs/react';

interface SearchResultsProps {
    settings: Settings;
    query: string;
    products: Product[];
    cart_count: number;
    cart_price: number;
    cart_items: CartItem[];
    wishlist_count: number;
    wishlist_items: CartItem[];
    wishlist_ids: string[];
    auth?: { user?: { name: string } };
}

export default function SearchResults({
    settings,
    query,
    products,
    cart_count,
    cart_price,
    cart_items,
    wishlist_count,
    wishlist_items,
    wishlist_ids,
    auth,
}: SearchResultsProps) {
    const heading = query ? 'Results for “' + query + '”' : 'Search Products';
    return (
        <SiteLayout
            settings={settings}
            cart={{ count: cart_count, price: cart_price, items: cart_items }}
            wishlist={{ count: wishlist_count, items: wishlist_items }}
            user={auth?.user}
            title={heading}
            metaDescription={
                query
                    ? 'Browse Herbs search results for ' + query + '.'
                    : 'Search Herbs products.'
            }
        >
            <Head title={heading} />
            <section className="container mx-auto px-4 py-12 md:py-16">
                <div className="rounded-3xl border border-primary/15 bg-card p-6 shadow-sm md:p-8">
                    <div className="mb-8 text-center">
                        <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
                            Search
                        </p>
                        <h1 className="mt-3 text-2xl font-bold md:text-3xl">
                            {heading}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {query
                                ? String(products.length) +
                                  ' product' +
                                  (products.length === 1 ? '' : 's') +
                                  ' found.'
                                : 'Use the search bar to find products.'}
                        </p>
                    </div>
                    {query && products.length === 0 ? (
                        <p className="rounded-xl bg-muted p-8 text-center text-muted-foreground">
                            No products found for “{query}”.
                        </p>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {products.map((product, index) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    index={index}
                                    isWishlisted={wishlist_ids.includes(
                                        String(product.id),
                                    )}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-xl bg-muted p-8 text-center text-muted-foreground">
                            Enter a product name above to begin.
                        </p>
                    )}
                </div>
            </section>
        </SiteLayout>
    );
}
