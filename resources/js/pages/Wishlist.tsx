import { Head, router } from '@inertiajs/react';
import { Heart, ShoppingBag, ShoppingCart, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface WishlistItem {
    id: string;
    name: string;
    slug: string;
    categorySlug?: string | null;
    image?: string | null;
    price: number;
    mrp: number;
}

interface WishlistProps {
    items: WishlistItem[];
    count: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Wishlist',
        href: '/wishlist',
    },
];

export default function Wishlist({ items, count }: WishlistProps) {
    const removeFromWishlist = (productId: string) => {
        router.post(
            '/wishlist',
            { productId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.error('Removed from wishlist');
                },
            },
        );
    };

    const addToCart = (productId: string, productName: string) => {
        router.post(
            '/add-to-cart',
            { productId, quantity: 1 },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Remove from wishlist after adding to cart
                    router.post(
                        '/wishlist',
                        { productId },
                        {
                            preserveScroll: true,
                            onSuccess: () => {
                                toast.success(`${productName} added to cart!`);
                            },
                        },
                    );
                },
                onError: () => {
                    toast.error('Failed to add to cart');
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Wishlist" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground">
                        <Heart className="size-8 text-orange-600" />
                        My Wishlist
                    </h1>
                    <p className="text-muted-foreground">
                        {count > 0
                            ? `You have ${count} item${count === 1 ? '' : 's'} saved.`
                            : 'Save items you love for later.'}
                    </p>
                </div>

                {items.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => {
                            const productHref = item.categorySlug
                                ? `/category/${item.categorySlug}/product/${item.slug}`
                                : `/product/${item.slug}`;

                            return (
                                <div
                                    key={item.id}
                                    className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm"
                                >
                                    <a
                                        href={productHref}
                                        className="group relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-muted"
                                    >
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <ShoppingBag className="size-10 text-muted-foreground" />
                                        )}
                                    </a>

                                    <div className="flex-1 space-y-2">
                                        <a
                                            href={productHref}
                                            className="line-clamp-2 text-base font-semibold text-foreground hover:text-orange-600"
                                        >
                                            {item.name}
                                        </a>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-foreground">
                                                ₹{item.price}
                                            </span>
                                            {item.mrp > item.price && (
                                                <span className="text-sm text-muted-foreground line-through">
                                                    ₹{item.mrp}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center gap-2">
                                        <Button
                                            className="flex-1"
                                            onClick={() =>
                                                addToCart(item.id, item.name)
                                            }
                                        >
                                            <ShoppingCart className="mr-2 size-4" />
                                            Add to Cart
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={() =>
                                                removeFromWishlist(item.id)
                                            }
                                            title="Remove from wishlist"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
                        <Heart className="mb-3 size-12 text-muted-foreground/40" />
                        <h2 className="text-xl font-semibold text-foreground">
                            Your wishlist is empty
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Browse products and add your favorites to save them
                            here.
                        </p>
                        <Button variant="outline" asChild className="mt-4">
                            <a href="/">Continue shopping</a>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
