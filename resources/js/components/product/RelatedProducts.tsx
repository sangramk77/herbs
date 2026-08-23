import { ProductCard } from '@/components/site/ProductCard';
import type { Product } from '@/types/site-types';

interface RelatedProductsProps {
    products: Product[];
    wishlistIds: string[];
    heading?: string;
    subheading?: string;
    description?: string;
    className?: string;
}

export function RelatedProducts({
    products,
    wishlistIds,
    heading = 'Related Products',
    subheading = 'Curated For You',
    description = 'Thoughtfully paired Rudraksha selections to deepen your practice, balance your energy, and support your intentions.',
    className = 'mt-16 border-t pt-12',
}: RelatedProductsProps) {
    if (products.length === 0) return null;
    const shouldCenter = products.length < 4;

    return (
        <div className={className}>
            <div className="mb-8 text-center">
                <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-primary/80 uppercase">
                    {subheading}
                </p>
                <div className="mx-auto mb-3 inline-flex items-center justify-center">
                    <h3 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                        <span className="text-[#5F80C5]">{heading}</span>
                    </h3>
                </div>
                <div className="mx-auto mb-4 h-[2px] w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
                <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                    {description}
                </p>
            </div>

            <div
                className={
                    shouldCenter
                        ? 'flex flex-wrap justify-center gap-4 md:gap-6'
                        : 'flex flex-wrap justify-center gap-4 md:gap-6'
                }
            >
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className="w-full max-w-[230px] sm:w-[calc((100%-1rem)/2)] sm:max-w-none md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)] xl:w-[calc((100%-6rem)/5)]"
                    >
                        <ProductCard
                            product={product}
                            index={index}
                            size="compact"
                            isWishlisted={wishlistIds.includes(
                                String(product.id),
                            )}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
