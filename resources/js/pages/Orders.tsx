import { Head } from '@inertiajs/react';
import { Eye, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

interface OrderItem {
    id?: string | null;
    name: string;
    quantity: number;
    price: number;
    image?: string | null;
}

interface Order {
    id: string;
    order_id: string;
    customer_name: string;
    shipping_address: string | string[];
    total_price: number;
    status: string;
    payment_method: string;
    items: OrderItem[];
    created_at: string;
    shipping_address_fields?: Record<string, string> | null;
    courier_name?: string | null;
    tracking_id?: string | null;
    received_by?: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface OrdersProps {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: PaginationLink[];
    };
}

export default function Orders({ orders }: OrdersProps) {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'border-emerald-200 bg-emerald-500/15 text-emerald-800 dark:border-emerald-500/30 dark:text-emerald-200';
            case 'order accepted':
            case 'processing':
                return 'border-sky-200 bg-sky-500/15 text-sky-800 dark:border-sky-500/30 dark:text-sky-200';
            case 'shipped':
                return 'border-indigo-200 bg-indigo-500/15 text-indigo-800 dark:border-indigo-500/30 dark:text-indigo-200';
            case 'out for delivery':
                return 'border-amber-200 bg-amber-500/15 text-amber-900 dark:border-amber-500/30 dark:text-amber-200';
            case 'order placed':
            case 'pending':
                return 'border-slate-200 bg-slate-500/10 text-slate-800 dark:border-slate-500/30 dark:text-slate-200';
            case 'cancelled':
            case 'failed':
                return 'border-rose-200 bg-rose-500/15 text-rose-800 dark:border-rose-500/30 dark:text-rose-200';
            case 'refunded':
            case 'returned':
                return 'border-purple-200 bg-purple-500/15 text-purple-800 dark:border-purple-500/30 dark:text-purple-200';
            case 'order rejected':
                return 'border-red-200 bg-red-500/15 text-red-800 dark:border-red-500/30 dark:text-red-200';
            default:
                return 'border-zinc-200 bg-zinc-500/10 text-zinc-800 dark:border-zinc-500/30 dark:text-zinc-200';
        }
    };

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

    const selectedOrderAddress = selectedOrder
        ? formatAddress(
              selectedOrder.shipping_address,
              selectedOrder.shipping_address_fields,
          )
        : [];

    return (
        <AppLayout>
            <Head title="My Orders" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground">
                        <ShoppingBag className="size-8 text-orange-600" />
                        My Orders
                    </h1>
                    <p className="text-muted-foreground">
                        Track and manage your order history.
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20">Product</TableHead>
                                <TableHead>Order Info</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.length > 0 ? (
                                orders.data.map((order) => (
                                    <TableRow key={order.id} className="group">
                                        <TableCell>
                                            <div className="flex size-12 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                                {order.items[0]?.image ? (
                                                    <img
                                                        src={
                                                            order.items[0].image
                                                        }
                                                        alt={
                                                            order.items[0].name
                                                        }
                                                        className="size-full object-cover"
                                                    />
                                                ) : (
                                                    <ShoppingBag className="size-6 text-muted-foreground" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold text-foreground">
                                                    {order.items[0]?.name ||
                                                        'N/A'}
                                                    {order.items.length > 1 &&
                                                        ` +${order.items.length - 1} more`}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    ID: #{order.order_id} • ₹
                                                    {order.total_price}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={getStatusBadgeClass(
                                                    order.status,
                                                )}
                                            >
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="hover:text-orange-600"
                                                onClick={() =>
                                                    openDetails(order)
                                                }
                                            >
                                                <Eye className="mr-2 size-4" />
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="h-48 text-center text-muted-foreground"
                                    >
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {orders.last_page > 1 && (
                    <div className="mt-6">
                        <Pagination>
                            <PaginationContent>
                                {orders.links[0]?.url && (
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={
                                                orders.links[0].url ?? undefined
                                            }
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

                                {orders.links[orders.links.length - 1]?.url && (
                                    <PaginationItem>
                                        <PaginationNext
                                            href={
                                                orders.links[
                                                    orders.links.length - 1
                                                ].url ?? undefined
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

            {/* Order Details Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between text-2xl font-bold">
                            Order Details
                            <span className="text-sm font-normal text-muted-foreground">
                                ID: #{selectedOrder?.order_id}
                            </span>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 gap-4 border-b pb-4">
                                <div>
                                    <h4 className="mb-1 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                        Customer
                                    </h4>
                                    <p className="font-medium">
                                        {selectedOrder.customer_name}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="mb-1 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                        Payment Method
                                    </h4>
                                    <Badge
                                        variant="outline"
                                        className="font-bold"
                                    >
                                        {selectedOrder.payment_method}
                                    </Badge>
                                </div>
                                <div>
                                    <h4 className="mb-1 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                        Order Date
                                    </h4>
                                    <p className="font-medium">
                                        {selectedOrder.created_at
                                            ? new Date(
                                                  selectedOrder.created_at,
                                              ).toLocaleDateString('en-IN', {
                                                  day: '2-digit',
                                                  month: 'short',
                                                  year: 'numeric',
                                              })
                                            : '—'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="mb-1 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                        Status
                                    </h4>
                                    <Badge
                                        variant="outline"
                                        className={getStatusBadgeClass(
                                            selectedOrder.status,
                                        )}
                                    >
                                        {selectedOrder.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="mb-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                        Shipping Address
                                    </h4>
                                    <div className="rounded-lg bg-muted p-3 text-sm leading-relaxed text-foreground">
                                        {selectedOrderAddress.length > 0 ? (
                                            <ul className="space-y-1">
                                                {selectedOrderAddress.map(
                                                    (line) => (
                                                        <li key={line}>
                                                            {line}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                Address not available
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="mb-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                        Shipping Details
                                    </h4>
                                    <div className="rounded-lg bg-muted p-3 text-sm leading-relaxed text-foreground">
                                        <p>
                                            Courier:{' '}
                                            {selectedOrder.courier_name || '—'}
                                        </p>
                                        <p>
                                            Tracking ID:{' '}
                                            {selectedOrder.tracking_id || '—'}
                                        </p>
                                        <p>
                                            Received By:{' '}
                                            {selectedOrder.received_by || '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                    Items Ordered
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedOrder.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-2"
                                        >
                                            <div className="size-14 shrink-0 overflow-hidden rounded bg-muted">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="size-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                                        <ShoppingBag className="size-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-foreground">
                                                    ₹
                                                    {item.price * item.quantity}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    ₹{item.price} each
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Grand Total */}
                            <div className="flex items-center justify-between border-t border-border pt-3">
                                <p className="text-lg font-bold">Grand Total</p>
                                <p className="text-2xl font-black text-orange-600">
                                    ₹{selectedOrder.total_price}
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            <X className="mr-2 size-4" />
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
