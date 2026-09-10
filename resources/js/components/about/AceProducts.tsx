import { Link } from '@inertiajs/react';

interface CategoryItem {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    image_url: string | null;
}

interface AceProductsProps {
    categories: CategoryItem[];
}

export function AceProducts({ categories }: AceProductsProps) {
    if (categories.length === 0) return null;

    return (
        <section className="bg-transparent py-16 md:py-20">
            <div className="container mx-auto px-4">
                <div className="rounded-[2rem] border border-rose-100/80 bg-gradient-to-br from-rose-50/72 via-white/66 to-amber-50/76 p-6 shadow-2xl shadow-rose-950/10 backdrop-blur-xl sm:p-8 md:p-10">
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/75 px-4 py-1.5 text-sm font-medium text-rose-700 shadow-sm">
                            Shop By Category
                        </div>
                        <h2 className="text-3xl font-bold text-stone-800 sm:text-4xl">
                            Our Ace Products
                        </h2>
                        <p className="mt-3 text-lg font-medium text-rose-800/80">
                            Explore our curated range of natural essentials
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-6xl grid-cols-2 justify-center gap-4 sm:grid-cols-[repeat(auto-fit,minmax(220px,260px))] md:gap-5">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/category/${category.slug}`}
                                id={`ace-product-${category.id}`}
                                className="group relative overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br from-white/90 to-amber-50/90 shadow-sm transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
                            >
                                {/* Image */}
                                <div className="relative aspect-square overflow-hidden">
                                    {category.image_url ? (
                                        <img
                                            src={category.image_url}
                                            alt={category.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 text-4xl">
                                            🪬
                                        </div>
                                    )}
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                </div>

                                {/* Name banner */}
                                <div className="border-t border-amber-100 bg-white/90 px-3 py-2.5 backdrop-blur-sm">
                                    <p className="text-center text-sm font-semibold text-stone-700 transition-colors group-hover:text-amber-700">
                                        {category.name}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
