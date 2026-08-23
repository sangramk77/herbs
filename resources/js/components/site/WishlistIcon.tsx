import { router } from '@inertiajs/react';
import { Heart, ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface WishlistItem {
    id: string;
    productsName: string;
    seoUrl: string;
    categorySlug?: string | null;
    image1: string;
    price: number;
    mrp: number;
}

interface WishlistIconProps {
    count: number;
    items: WishlistItem[];
}

export function WishlistIcon({ count, items }: WishlistIconProps) {
    const [isOpen, setIsOpen] = useState(false);

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
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Wishlist"
                >
                    <Heart className="h-5 w-5" />
                    {count > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {count > 9 ? '9+' : count}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-[260px] max-w-[calc(100vw-2rem)] p-0 sm:w-80"
                sideOffset={8}
            >
                <div className="border-b p-3 sm:p-4">
                    <h3 className="text-sm font-semibold sm:text-base">
                        Wishlist ({count} {count === 1 ? 'item' : 'items'})
                    </h3>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 p-6 text-center sm:p-8">
                        <Heart className="h-10 w-10 text-muted-foreground/30 sm:h-12 sm:w-12" />
                        <p className="text-sm text-muted-foreground">
                            Your wishlist is empty
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Add items you love to your wishlist
                        </p>
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        {items.map((item) => {
                            const productHref = item.categorySlug
                                ? `/category/${item.categorySlug}/product/${item.seoUrl}`
                                : `/product/${item.seoUrl}`;

                            return (
                                <div
                                    key={item.id}
                                    className="flex gap-3 border-b p-3 last:border-b-0 hover:bg-muted/50"
                                >
                                    <a href={productHref} className="shrink-0">
                                        <img
                                            src={`/uploads/products/${item.image1}`}
                                            alt={item.productsName}
                                            className="h-14 w-14 rounded-md object-cover sm:h-16 sm:w-16"
                                        />
                                    </a>
                                    <div className="flex flex-1 flex-col justify-between gap-2">
                                        <div>
                                            <a
                                                href={productHref}
                                                className="line-clamp-2 text-xs font-medium hover:text-primary sm:text-sm"
                                            >
                                                {item.productsName}
                                            </a>
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold">
                                                    ₹{item.price}
                                                </span>
                                                {item.mrp > item.price && (
                                                    <span className="text-xs text-muted-foreground line-through">
                                                        ₹{item.mrp}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 shrink-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                    onClick={() =>
                                                        addToCart(
                                                            item.id,
                                                            item.productsName,
                                                        )
                                                    }
                                                    title="Add to cart"
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() =>
                                                        removeFromWishlist(
                                                            item.id,
                                                        )
                                                    }
                                                    title="Remove from wishlist"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
