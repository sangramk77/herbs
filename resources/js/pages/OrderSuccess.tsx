import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import SiteLayout from '@/layouts/SiteLayout';
import type { CartInfo, Product, Settings } from '@/types/site-types';

interface OrderItem {
    id?: string | null;
    name: string;
    slug?: string | null;
    categorySlug?: string | null;
    quantity: number;
    price: number;
    image?: string | null;
}

interface OrderSuccessProps {
    order: {
        order_id: string;
        status: string;
        payment_method: string;
        total_price: number;
        customer_name: string;
        shipping_address: string | string[];
        shipping_address_fields?: Record<string, string> | null;
        items: OrderItem[];
        created_at?: string | null;
    };
    settings: Settings;
    products?: Product[];
    wishlist?: {
        count: number;
        items: any[];
    };
    cart?: CartInfo;
    user?: {
        name: string;
    };
}

export default function OrderSuccess({
    order,
    settings,
    products = [],
    wishlist = { count: 0, items: [] },
    cart = { count: 0, price: 0, items: [] },
    user,
}: OrderSuccessProps) {
    const addressLines = Array.isArray(order.shipping_address)
        ? order.shipping_address
        : order.shipping_address_fields
          ? [
                order.shipping_address_fields.line1,
                order.shipping_address_fields.line2,
                [
                    order.shipping_address_fields.city,
                    order.shipping_address_fields.state,
                    order.shipping_address_fields.postal_code ??
                        order.shipping_address_fields.zip,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .trim(),
                order.shipping_address_fields.country,
            ].filter(Boolean)
          : order.shipping_address
            ? [order.shipping_address]
            : [];

    return (
        <SiteLayout
            settings={settings}
            products={products}
            wishlist={wishlist}
            cart={cart}
            user={user}
            title="Order Success"
        >
            <Head title="Order Success" />
            <div className="container mx-auto px-4 py-12">
                <div className="mx-auto max-w-3xl space-y-8">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-emerald-700">
                                    Order placed successfully
                                </h1>
                                <p className="text-sm text-emerald-700/80">
                                    Order ID: #{order.order_id}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Order Summary
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Payment: {order.payment_method}
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className="border-orange-200 bg-orange-50 text-orange-700"
                            >
                                {order.status}
                            </Badge>
                        </div>

                        <Separator className="my-4" />

                        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div
                                        key={`${item.id ?? item.name}-${index}`}
                                        className="flex items-start gap-4 rounded-xl border border-border/60 p-3"
                                    >
                                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="font-semibold">
                                                    {item.name}
                                                </p>
                                                <p className="font-semibold">
                                                    ₹
                                                    {(
                                                        item.price *
                                                        item.quantity
                                                    ).toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Qty: {item.quantity} · ₹
                                                {item.price.toLocaleString(
                                                    'en-IN',
                                                )}{' '}
                                                each
                                            </p>
                                            {item.slug && (
                                                <Link
                                                    href={
                                                        item.categorySlug
                                                            ? `/category/${item.categorySlug}/product/${item.slug}`
                                                            : `/product/${item.slug}`
                                                    }
                                                    className="text-sm text-orange-600"
                                                >
                                                    View product
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 rounded-xl border bg-muted/30 p-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Delivering to
                                    </p>
                                    <p className="font-semibold">
                                        {order.customer_name}
                                    </p>
                                    {addressLines.length > 0 ? (
                                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                            {addressLines.map((line) => (
                                                <li key={line}>{line}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Address not available
                                        </p>
                                    )}
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between text-base font-semibold">
                                    <span>Total</span>
                                    <span>
                                        ₹
                                        {order.total_price.toLocaleString(
                                            'en-IN',
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Button asChild>
                                <Link href="/orders">View my orders</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/">Continue shopping</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </SiteLayout>
    );
}
