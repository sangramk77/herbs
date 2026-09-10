import { Link, router } from '@inertiajs/react';
import { Minus, Plus, ShoppingBag, ShoppingCart, X } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CartItem } from '@/types/site-types';

interface CartIconProps {
    count: number;
    price: number;
    items: CartItem[];
}

export function CartIcon({ count, price, items }: CartIconProps) {
    const updateCartQuantity = (
        productId: string,
        measurementValue: number | null | undefined,
        action: 'increase' | 'decrease',
    ) => {
        router.post(
            '/cart/update',
            {
                productId,
                measurementValue,
                action,
            },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-white">
                    <div className="relative">
                        <ShoppingCart className="h-6 w-6" />
                        {count > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full px-1 text-xs"
                            >
                                {count}
                            </Badge>
                        )}
                    </div>
                    <div className="hidden flex-col lg:flex">
                        <span className="text-xs font-medium text-[#2e7b43]">
                            Your Cart
                        </span>
                        <span className="text-sm font-extrabold tracking-tight text-[#173c28]">
                            ₹{price.toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-[260px] max-w-[calc(100vw-2rem)] p-0 sm:w-80"
            >
                <div className="flex items-center justify-between border-b p-3 sm:p-4">
                    <h3 className="text-sm font-semibold sm:text-base">
                        Shopping Cart ({count})
                    </h3>
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                    {items && items.length > 0 ? (
                        items.map((item) => {
                            const productHref = item.categorySlug
                                ? `/category/${item.categorySlug}/product/${item.slug}`
                                : `/product/${item.slug}`;

                            return (
                                <div
                                    key={`${item.id}-${item.measurement_value ?? 'default'}`}
                                    className="flex gap-3 border-b p-3 transition-colors last:border-0 hover:bg-muted/50 sm:gap-4 sm:p-4"
                                >
                                    <Link
                                        href={productHref}
                                        className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted sm:h-16 sm:w-16"
                                    >
                                        <img
                                            src={`/uploads/products/${item.image}`}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </Link>
                                    <div className="flex flex-1 flex-col justify-between py-0.5">
                                        <div>
                                            <div className="flex items-start justify-between gap-2">
                                                <Link
                                                    href={productHref}
                                                    className="line-clamp-1 text-xs font-medium transition-colors hover:text-primary sm:text-sm"
                                                >
                                                    {item.name}
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        router.post(
                                                            '/cart/remove',
                                                            {
                                                                productId:
                                                                    item.id,
                                                                measurementValue:
                                                                    item.measurement_value,
                                                            },
                                                            {
                                                                preserveScroll: true,
                                                                onSuccess:
                                                                    () => {
                                                                        toast.error(
                                                                            'Removed from cart',
                                                                        );
                                                                    },
                                                            },
                                                        )
                                                    }
                                                    className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-muted-foreground sm:text-xs">
                                                <div className="flex items-center rounded-md border">
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();

                                                            if (
                                                                item.quantity >
                                                                1
                                                            ) {
                                                                updateCartQuantity(
                                                                    item.id,
                                                                    item.measurement_value,
                                                                    'decrease',
                                                                );
                                                            } else {
                                                                toast.info(
                                                                    'Use the remove button to delete this item',
                                                                );
                                                            }
                                                        }}
                                                        disabled={
                                                            item.quantity <= 1
                                                        }
                                                        className="border-r p-1 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="px-2">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            updateCartQuantity(
                                                                item.id,
                                                                item.measurement_value,
                                                                'increase',
                                                            );
                                                        }}
                                                        className="border-l p-1 transition-colors hover:bg-muted"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <span>
                                                    × ₹
                                                    {item.price.toLocaleString(
                                                        'en-IN',
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-1 text-sm font-semibold">
                                            ₹
                                            {(
                                                item.price * item.quantity
                                            ).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-6 text-center sm:p-8">
                            <ShoppingBag className="mx-auto mb-3 h-9 w-9 text-muted-foreground/50 sm:h-10 sm:w-10" />
                            <p className="text-sm text-muted-foreground">
                                Your cart is empty
                            </p>
                        </div>
                    )}
                </div>

                {items && items.length > 0 && (
                    <div className="border-t bg-muted/30 p-3 sm:p-4">
                        <div className="mb-3 flex items-center justify-between sm:mb-4">
                            <span className="text-sm font-medium sm:text-base">
                                Total
                            </span>
                            <span className="text-base font-bold sm:text-lg">
                                ₹{price.toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" asChild size="sm">
                                <Link href="/cart">View Cart</Link>
                            </Button>
                            <Button asChild size="sm">
                                <Link href="/checkout">Checkout</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
