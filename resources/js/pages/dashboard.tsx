import { Head, usePage } from '@inertiajs/react';
import JSConfetti from 'js-confetti';
import { Heart, ShoppingBag, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface OrderItem {
    id?: string | null;
    name: string;
    quantity: number;
    price: number;
    image?: string | null;
}

interface Order {
    order_id: string;
    status: string;
    payment_method: string;
    total_price: number;
    customer_name: string;
    shipping_address: string | string[];
    shipping_address_fields?: Record<string, string> | null;
    items: OrderItem[];
    created_at?: string | null;
    bill_url?: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface DashboardProps {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: PaginationLink[];
    };
    confetti?: {
        show: boolean;
        reason?: 'register' | 'login' | null;
    };
}

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const { orders, confetti } = usePage<SharedData & DashboardProps>().props;
    const confettiRef = useRef<JSConfetti | null>(null);
    const billIframeRef = useRef<HTMLIFrameElement | null>(null);
    const [billViewOpen, setBillViewOpen] = useState(false);
    const [billView, setBillView] = useState<{
        orderId: string;
        url: string;
    } | null>(null);

    useEffect(() => {
        confettiRef.current = new JSConfetti();
    }, []);

    useEffect(() => {
        if (!confetti?.show) return;

        const palette =
            confetti.reason === 'register'
                ? ['#FF8A00', '#FFB347', '#FFD27D', '#FFA94D']
                : ['#F97316', '#FB923C', '#FDBA74', '#FDE68A'];

        confettiRef.current?.addConfetti({
            confettiColors: palette,
            confettiNumber: 120,
        });
    }, [confetti?.show, confetti?.reason]);

    const orderRows = useMemo(
        () =>
            orders.data.map((order) => {
                const firstItem = order.items[0];

                return {
                    orderId: order.order_id,
                    productName: firstItem?.name ?? 'N/A',
                    status: order.status ?? 'Processing',
                    paymentMethod: order.payment_method ?? 'COD',
                    price: order.total_price ?? 0,
                    image: firstItem?.image ?? null,
                    customerName: order.customer_name,
                    address: order.shipping_address,
                    addressFields: order.shipping_address_fields,
                    billUrl: order.bill_url ?? null,
                };
            }),
        [orders],
    );

    const formatAddress = (
        address: Order['shipping_address'],
        fields?: Order['shipping_address_fields'],
    ) => {
        if (Array.isArray(address)) {
            return address;
        }

        if (fields) {
            return [
                fields.line1,
                fields.line2,
                [fields.city, fields.state, fields.postal_code ?? fields.zip]
                    .filter(Boolean)
                    .join(' ')
                    .trim(),
                fields.country,
            ].filter(Boolean) as string[];
        }

        return address ? [address] : [];
    };

    const actionCards = [
        {
            title: 'My Orders',
            description: 'View and track your current and past orders.',
            icon: ShoppingBag,
            href: '/orders',
            color: 'bg-blue-500',
        },
        {
            title: 'Profile Settings',
            description: 'Update your personal information and password.',
            icon: User,
            href: '/profile',
            color: 'bg-orange-500',
        },
        {
            title: 'My Wishlist',
            description: 'Check out the items you have saved for later.',
            icon: Heart,
            href: '/wishlist',
            color: 'bg-red-500',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="relative flex h-full flex-1 flex-col gap-6 overflow-hidden p-6">
                {/* Decorative blobs – cool indigo/violet/teal mesh */}
                <div className="pointer-events-none absolute -top-32 -right-32 h-112 w-md rounded-full bg-indigo-400/35 blur-[130px]" />
                <div className="pointer-events-none absolute -bottom-32 -left-32 h-128 w-lg rounded-full bg-violet-400/28 blur-[150px]" />
                <div className="pointer-events-none absolute top-1/3 left-1/4 h-88 w-88 rounded-full bg-teal-300/28 blur-[110px]" />
                <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-sky-300/22 blur-[100px]" />

                {/* Welcome Section */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Welcome back,{' '}
                        <span className="text-orange-600">
                            {auth.user.name}
                        </span>
                        !
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your account, view your orders, and update your
                        profile from your personal dashboard.
                    </p>
                </div>

                {/* Dashboard Stats / Quick Info (Summary Cards) */}
                <div
                    className={`mx-auto grid w-full gap-6 md:grid-cols-2 ${actionCards.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} ${actionCards.length === 3 ? 'place-items-center' : ''}`}
                >
                    {actionCards.map((card) => (
                        <a
                            key={card.title}
                            href={card.href}
                            className={`group relative w-full overflow-hidden rounded-2xl border border-white/50 bg-white/40 p-6 shadow-[0_4px_24px_-6px_rgba(99,102,241,0.15)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:border-indigo-300/70 hover:bg-white/55 hover:shadow-[0_20px_48px_-12px_rgba(99,102,241,0.28)] dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-400/40 dark:hover:bg-white/10 ${actionCards.length === 3 ? 'max-w-sm' : ''}`}
                        >
                            {/* subtle inner glow on hover */}
                            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-white/30 via-transparent to-indigo-100/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="relative flex flex-col gap-4">
                                <div
                                    className={`flex size-11 items-center justify-center rounded-xl ${card.color} bg-opacity-90 text-white shadow-md`}
                                >
                                    <card.icon className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                        {card.title}
                                    </h3>
                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                        {card.description}
                                    </p>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                {/* My Orders */}
                <div className="flex-1 rounded-2xl border border-white/50 bg-white/45 p-6 shadow-[0_4px_32px_-8px_rgba(99,102,241,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    My Orders
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Track your recent orders and payment
                                    details.
                                </p>
                            </div>
                            <Button variant="outline" asChild>
                                <a href="/orders">View all</a>
                            </Button>
                        </div>
                        <Separator className="my-2" />
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[90px]">
                                    Product
                                </TableHead>
                                <TableHead>Product Name</TableHead>
                                <TableHead>Order Status</TableHead>
                                <TableHead className="text-right">
                                    View Details
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orderRows.length > 0 ? (
                                orderRows.map((order) => {
                                    const addressLines = formatAddress(
                                        order.address,
                                        order.addressFields,
                                    );

                                    return (
                                        <TableRow key={order.orderId}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-12 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                                                        {order.image ? (
                                                            <img
                                                                src={
                                                                    order.image
                                                                }
                                                                alt={
                                                                    order.productName
                                                                }
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <ShoppingBag className="size-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-foreground">
                                                {order.productName}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        order.status ===
                                                        'Delivered'
                                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                            : order.status ===
                                                                    'Shipped' ||
                                                                order.status ===
                                                                    'Order Accepted' ||
                                                                order.status ===
                                                                    'Out for Delivery'
                                                              ? 'border-blue-200 bg-blue-50 text-blue-700'
                                                              : order.status ===
                                                                  'Order Rejected'
                                                                ? 'border-red-200 bg-red-50 text-red-700'
                                                                : 'border-orange-200 bg-orange-50 text-orange-700'
                                                    }
                                                >
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {order.billUrl && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => {
                                                                setBillView({
                                                                    orderId:
                                                                        order.orderId,
                                                                    url: order.billUrl!,
                                                                });
                                                                setBillViewOpen(
                                                                    true,
                                                                );
                                                            }}
                                                        >
                                                            View Bill
                                                        </Button>
                                                    )}

                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                View Details
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-2xl">
                                                            <DialogHeader>
                                                                <DialogTitle>
                                                                    Order
                                                                    Details
                                                                </DialogTitle>
                                                                <DialogDescription>
                                                                    Order ID{' '}
                                                                    <span className="font-medium text-foreground">
                                                                        {
                                                                            order.orderId
                                                                        }
                                                                    </span>{' '}
                                                                    • Payment:{' '}
                                                                    <span className="font-medium text-foreground">
                                                                        {
                                                                            order.paymentMethod
                                                                        }
                                                                    </span>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="grid gap-6 md:grid-cols-[200px_1fr]">
                                                                <div className="flex flex-col items-center gap-3 rounded-xl border bg-muted/40 p-4 text-center">
                                                                    <div className="flex size-36 items-center justify-center overflow-hidden rounded-lg border bg-background">
                                                                        {order.image ? (
                                                                            <img
                                                                                src={
                                                                                    order.image
                                                                                }
                                                                                alt={
                                                                                    order.productName
                                                                                }
                                                                                className="h-full w-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <ShoppingBag className="size-10 text-muted-foreground" />
                                                                        )}
                                                                    </div>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={
                                                                            order.status ===
                                                                            'Delivered'
                                                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                                : order.status ===
                                                                                        'Shipped' ||
                                                                                    order.status ===
                                                                                        'Order Accepted' ||
                                                                                    order.status ===
                                                                                        'Out for Delivery'
                                                                                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                                                                                  : order.status ===
                                                                                      'Order Rejected'
                                                                                    ? 'border-red-200 bg-red-50 text-red-700'
                                                                                    : 'border-orange-200 bg-orange-50 text-orange-700'
                                                                        }
                                                                    >
                                                                        {
                                                                            order.status
                                                                        }
                                                                    </Badge>
                                                                </div>
                                                                <div className="space-y-4">
                                                                    <div className="space-y-1">
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Product
                                                                        </p>
                                                                        <p className="text-base font-semibold text-foreground">
                                                                            {
                                                                                order.productName
                                                                            }
                                                                        </p>
                                                                        <p className="text-sm font-medium text-foreground">
                                                                            ₹
                                                                            {order.price.toLocaleString(
                                                                                'en-IN',
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <Separator />
                                                                    <div className="space-y-1">
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Shipping
                                                                            Address
                                                                        </p>
                                                                        <p className="text-sm font-medium text-foreground">
                                                                            {
                                                                                order.customerName
                                                                            }
                                                                        </p>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {addressLines.length >
                                                                            0 ? (
                                                                                <ul className="space-y-1">
                                                                                    {addressLines.map(
                                                                                        (
                                                                                            line,
                                                                                        ) => (
                                                                                            <li
                                                                                                key={
                                                                                                    line
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    line
                                                                                                }
                                                                                            </li>
                                                                                        ),
                                                                                    )}
                                                                                </ul>
                                                                            ) : (
                                                                                'Address not available'
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <DialogClose
                                                                    asChild
                                                                >
                                                                    <Button variant="outline">
                                                                        Close
                                                                    </Button>
                                                                </DialogClose>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="h-40 text-center text-sm text-muted-foreground"
                                    >
                                        No orders yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {orders.last_page > 1 && (
                        <div className="mt-6">
                            <Pagination>
                                <PaginationContent>
                                    {orders.links[0]?.url && (
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href={orders.links[0].url}
                                            />
                                        </PaginationItem>
                                    )}

                                    {orders.links
                                        .slice(1, -1)
                                        .map((link, index) => (
                                            <PaginationItem
                                                key={`page-${link.url || index}-${link.label}`}
                                            >
                                                {link.label === '...' ? (
                                                    <PaginationEllipsis />
                                                ) : (
                                                    <PaginationLink
                                                        href={link.url || '#'}
                                                        isActive={link.active}
                                                    >
                                                        {link.label}
                                                    </PaginationLink>
                                                )}
                                            </PaginationItem>
                                        ))}

                                    {orders.links[orders.links.length - 1]
                                        ?.url && (
                                        <PaginationItem>
                                            <PaginationNext
                                                href={
                                                    orders.links[
                                                        orders.links.length - 1
                                                    ].url || '#'
                                                }
                                            />
                                        </PaginationItem>
                                    )}
                                </PaginationContent>
                            </Pagination>

                            <p className="mt-4 text-center text-sm text-muted-foreground">
                                Showing {orders.data.length} of {orders.total}{' '}
                                orders
                            </p>
                        </div>
                    )}
                </div>

                {/* Bill Viewer Modal */}
                <Dialog open={billViewOpen} onOpenChange={setBillViewOpen}>
                    <DialogContent showClose={false} className="max-w-5xl p-0">
                        <DialogHeader className="sr-only">
                            <DialogTitle>
                                Bill PDF
                                {billView?.orderId
                                    ? ` - ${billView.orderId}`
                                    : ''}
                            </DialogTitle>
                            <DialogDescription>
                                Preview, print, or download the bill PDF.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                            <div className="min-w-0">
                                <h3 className="truncate text-lg font-semibold text-foreground">
                                    Bill PDF
                                    {billView?.orderId
                                        ? ` - ${billView.orderId}`
                                        : ''}
                                </h3>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    PDF preview
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!billView?.url}
                                    onClick={() => {
                                        const win =
                                            billIframeRef.current
                                                ?.contentWindow ?? null;

                                        try {
                                            if (!win) {
                                                throw new Error(
                                                    'No print window',
                                                );
                                            }
                                            win.focus();
                                            win.print();
                                        } catch {
                                            if (billView?.url) {
                                                window.location.href =
                                                    billView.url;
                                            }
                                        }
                                    }}
                                >
                                    Print
                                </Button>
                                {billView?.url && (
                                    <Button variant="outline" size="sm" asChild>
                                        <a
                                            href={billView.url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Download
                                        </a>
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    onClick={() => setBillViewOpen(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>

                        <div className="h-[75vh] bg-gradient-to-b from-muted/20 to-muted/40 p-4">
                            {billView?.url ? (
                                <iframe
                                    title={`Bill PDF - ${billView.orderId}`}
                                    src={`${billView.url}#view=FitH&toolbar=0&navpanes=0`}
                                    ref={billIframeRef}
                                    className="h-full w-full rounded-lg border border-border bg-white shadow-sm"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                                    No bill to preview.
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
