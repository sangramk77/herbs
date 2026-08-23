import { Link } from '@inertiajs/react';

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import type { Product } from '@/types/site-types';

interface CategoryCarouselProps {
    products: Product[];
}

export function CategoryCarousel({ products }: CategoryCarouselProps) {
    return (
        <section className="border-b py-8 md:py-10">
            <div className="container mx-auto px-4">
                <Carousel
                    opts={{
                        align: 'start',
                        loop: false,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2 md:-ml-3">
                        {products.map((product) => {
                            const productHref = product.categorySlug
                                ? `/category/${product.categorySlug}/product/${product.seoUrl}`
                                : `/product/${product.seoUrl}`;

                            return (
                                <CarouselItem
                                    key={product.id}
                                    className="basis-1/3 pl-2 md:basis-1/5 md:pl-3 lg:basis-1/6"
                                >
                                    <Link
                                        href={productHref}
                                        className="group block text-center"
                                    >
                                        <div className="mb-2 overflow-hidden rounded-full bg-muted">
                                            <img
                                                src={`/uploads/products/${product.image1}`}
                                                alt={product.productsName}
                                                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            />
                                        </div>
                                        <h6 className="text-xs font-medium transition-colors group-hover:text-primary">
                                            {product.productsName}
                                        </h6>
                                    </Link>
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>
                    <CarouselPrevious className="left-0" />
                    <CarouselNext className="right-0" />
                </Carousel>
            </div>
        </section>
    );
}
