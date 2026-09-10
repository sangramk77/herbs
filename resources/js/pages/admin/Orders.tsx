import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import { cn } from '@/lib/utils';

interface OrderProduct {
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    orderId: string;
    date: string | null;
    price: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    status: string;
    paymentMethod?: string | null;
    paymentStatus?: string | null;
    shippingAddress: string | string[];
    shippingAddressFields?: Record<string, string> | null;
    products: OrderProduct[];
    courierName?: string | null;
    trackingId?: string | null;
    receivedBy?: string | null;
    comment: string;
    billUrl?: string | null;
}

interface OrdersProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    orders?: Order[];
}

export default function Orders({ auth, orders = [] }: OrdersProps) {
    const [orderList, setOrderList] = useState<Order[]>(orders);
    useEffect(() => {
        setOrderList(orders);
    }, [orders]);

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [billUploadOpen, setBillUploadOpen] = useState(false);
    const [billUploadOrder, setBillUploadOrder] = useState<Order | null>(null);
    const [billViewOpen, setBillViewOpen] = useState(false);
    const [billViewOrder, setBillViewOrder] = useState<Order | null>(null);
    const billIframeRef = useRef<HTMLIFrameElement | null>(null);
    const [billFile, setBillFile] = useState<File | null>(null);
    const [billError, setBillError] = useState<string | null>(null);
    const [billUploadProgress, setBillUploadProgress] = useState<number>(0);
    const [billUploading, setBillUploading] = useState(false);
    const [statusForm, setStatusForm] = useState({
        status: '',
        notes: '',
        courierName: '',
        trackingId: '',
        receivedBy: '',
        refundAmount: '',
        refundDate: '',
    });
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string;
        description: string;
        confirmLabel: string;
        tone?: 'default' | 'destructive';
        onConfirm: () => void;
    } | null>(null);

    // Filter states
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [selectedStatus, setSelectedStatus] = useState<string>('All');

    const normalizeStatus = (status: string) => {
        if (status === 'Processing' || status === 'Pending') {
            return 'Order Placed';
        }
        return status;
    };

    const getStatusColor = (status: string) => {
        switch (normalizeStatus(status)) {
            case 'Out for Delivery':
                return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30';
            case 'Shipped':
                return 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30';
            case 'Order Accepted':
                return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30';
            case 'Order Placed':
                return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md shadow-yellow-500/30';
            case 'Order Rejected':
                return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/30';
            case 'Cancelled':
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md shadow-gray-500/30';
            case 'Refunded':
                return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md shadow-purple-500/30';
            case 'Delivered':
                return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30';
            default:
                return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md shadow-gray-500/30';
        }
    };

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setDetailsOpen(true);
    };

    const openBillUploadModal = (order: Order) => {
        setBillUploadOrder(order);
        setBillFile(null);
        setBillError(null);
        setBillUploadProgress(0);
        setBillUploading(false);
        setBillUploadOpen(true);
    };

    const openBillViewer = (order: Order) => {
        if (!order.billUrl) {
            return;
        }
        setBillViewOrder(order);
        setBillViewOpen(true);
    };

    const submitBillUpload = () => {
        if (!billUploadOrder) {
            return;
        }

        if (!billFile) {
            setBillError('Please select a PDF file.');
            return;
        }

        const formData = new FormData();
        formData.append('bill', billFile);

        setBillUploading(true);
        setBillError(null);
        setBillUploadProgress(0);

        router.post(`/admin/orders/${billUploadOrder.orderId}/bill`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onProgress: (progress) => {
                const percentage =
                    typeof (progress as any)?.percentage === 'number'
                        ? (progress as any).percentage
                        : 0;
                setBillUploadProgress(percentage);
            },
            onSuccess: () => {
                setBillUploadOpen(false);
                setBillUploadOrder(null);
                setBillFile(null);
                router.reload({ only: ['orders'] });
            },
            onError: (errors) => {
                const message =
                    (errors as any)?.bill ||
                    (errors as any)?.error ||
                    'Upload failed. Please try again.';
                setBillError(String(message));
            },
            onFinish: () => {
                setBillUploading(false);
            },
        });
    };

    const deleteExistingBill = () => {
        if (!billUploadOrder) {
            return;
        }

        setBillError(null);
        setBillUploading(true);

        router.delete(`/admin/orders/${billUploadOrder.orderId}/bill`, {
            preserveScroll: true,
            onSuccess: () => {
                setBillFile(null);
                // Optimistically clear billUrl so UI updates immediately (modal + table).
                setBillUploadOrder((prev) =>
                    prev ? { ...prev, billUrl: null } : prev,
                );
                setOrderList((prev) =>
                    prev.map((order) =>
                        order.orderId === billUploadOrder.orderId
                            ? { ...order, billUrl: null }
                            : order,
                    ),
                );
                router.reload({ only: ['orders'] });
                // Keep the modal open and let the user upload a replacement if they want.
            },
            onError: (errors) => {
                const message =
                    (errors as any)?.error ||
                    'Failed to remove bill. Please try again.';
                setBillError(String(message));
            },
            onFinish: () => {
                setBillUploading(false);
                setBillUploadProgress(0);
            },
        });
    };

    const openStatusModal = (order: Order, status: string) => {
        setSelectedOrder(order);
        setStatusForm({
            status,
            notes: order.comment,
            courierName: order.courierName ?? '',
            trackingId: order.trackingId ?? '',
            receivedBy: order.receivedBy ?? '',
            refundAmount: '',
            refundDate: '',
        });
        setStatusOpen(true);
    };

    const openConfirm = (config: {
        title: string;
        description: string;
        confirmLabel: string;
        tone?: 'default' | 'destructive';
        onConfirm: () => void;
    }) => {
        setConfirmConfig(config);
        setConfirmOpen(true);
    };

    const handleStatusSubmit = () => {
        if (selectedOrder) {
            const submit = () => {
                router.post(
                    `/admin/orders/${selectedOrder.orderId}/status`,
                    {
                        status: statusForm.status,
                        notes: statusForm.notes,
                        courier_name: statusForm.courierName,
                        tracking_id: statusForm.trackingId,
                        received_by: statusForm.receivedBy,
                    },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setStatusOpen(false);
                            router.reload({ only: ['orders'] });
                        },
                    },
                );
            };

            if (statusForm.status === 'Shipped') {
                openConfirm({
                    title: 'Confirm shipment',
                    description: 'Mark this order as Shipped?',
                    confirmLabel: 'Mark Shipped',
                    onConfirm: submit,
                });
                return;
            }

            if (statusForm.status === 'Delivered') {
                openConfirm({
                    title: 'Confirm delivery',
                    description:
                        'Mark this order as Delivered? This cannot be changed.',
                    confirmLabel: 'Mark Delivered',
                    tone: 'destructive',
                    onConfirm: submit,
                });
                return;
            }

            submit();
        }
    };

    const updateStatus = (order: Order, status: string) => {
        const submit = () => {
            router.post(
                `/admin/orders/${order.orderId}/status`,
                {
                    status,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        router.reload({ only: ['orders'] });
                    },
                },
            );
        };

        if (status === 'Out for Delivery') {
            openConfirm({
                title: 'Confirm dispatch',
                description: 'Mark this order as Out for Delivery?',
                confirmLabel: 'Mark Out for Delivery',
                onConfirm: submit,
            });
            return;
        }

        if (status === 'Order Rejected') {
            openConfirm({
                title: 'Reject order',
                description: 'Reject this order? This cannot be changed.',
                confirmLabel: 'Reject Order',
                tone: 'destructive',
                onConfirm: submit,
            });
            return;
        }

        submit();
    };

    const formatAddress = (order: Order) => {
        if (Array.isArray(order.shippingAddress)) {
            return order.shippingAddress;
        }

        if (order.shippingAddressFields) {
            return [
                order.shippingAddressFields.line1,
                order.shippingAddressFields.line2,
                [
                    order.shippingAddressFields.city,
                    order.shippingAddressFields.state,
                    order.shippingAddressFields.postal_code ??
                        order.shippingAddressFields.zip,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .trim(),
                order.shippingAddressFields.country,
            ].filter(Boolean) as string[];
        }

        return order.shippingAddress ? [order.shippingAddress] : [];
    };

    // Filter orders based on date range and status
    const filteredOrders = orderList.filter((order) => {
        // Filter by status
        if (
            selectedStatus !== 'All' &&
            normalizeStatus(order.status) !== selectedStatus
        ) {
            return false;
        }

        // Filter by date range
        if (dateRange?.from) {
            // Parse the order date (format: "06:38 AM, 06 Jan 24")
            const orderDate = order.date ? new Date(order.date) : null;
            if (!orderDate || Number.isNaN(orderDate.getTime())) {
                return false;
            }
            const orderDateOnly = new Date(
                orderDate.getFullYear(),
                orderDate.getMonth(),
                orderDate.getDate(),
            );

            const fromDate = new Date(
                dateRange.from.getFullYear(),
                dateRange.from.getMonth(),
                dateRange.from.getDate(),
            );

            // Check if order date is before the start date
            if (orderDateOnly < fromDate) {
                return false;
            }

            // If there's a 'to' date, check if order date is after it
            if (dateRange.to) {
                const toDate = new Date(
                    dateRange.to.getFullYear(),
                    dateRange.to.getMonth(),
                    dateRange.to.getDate(),
                );
                if (orderDateOnly > toDate) {
                    return false;
                }
            }
        }

        return true;
    });

    const columns: DataTableColumn<Order>[] = [
        {
            key: 'id',
            label: 'Sl.No',
            className: 'w-16',
            render: (_, index) => (
                <span className="font-medium">{index + 1}</span>
            ),
        },
        {
            key: 'orderId',
            label: 'Order Id',
            render: (item) => (
                <div>
                    <div className="font-medium">{item.orderId}</div>
                    <div className="text-xs text-gray-500 dark:text-zinc-500">
                        {item.date
                            ? format(new Date(item.date), 'hh:mm a, dd MMM yy')
                            : '—'}
                    </div>
                </div>
            ),
        },
        {
            key: 'customer',
            label: 'Customer',
            render: (item) => (
                <div>
                    <div className="font-medium">{item.customerName}</div>
                    <div className="text-sm text-gray-600 dark:text-zinc-400">
                        {item.customerPhone}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-zinc-400">
                        {item.customerEmail}
                    </div>
                </div>
            ),
        },
        {
            key: 'price',
            label: 'Amount',
            render: (item) => (
                <span className="font-medium">₹ {item.price.toFixed(2)}</span>
            ),
        },
        {
            key: 'paymentMethod',
            label: 'Payment Mode',
            render: (item) => (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {item.paymentMethod || '—'}
                </span>
            ),
        },
        {
            key: 'paymentStatus',
            label: 'Payment Status',
            render: (item) => {
                const status = item.paymentStatus || 'pending';
                const isPaid = status === 'completed';
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold shadow-md ${
                            isPaid
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30'
                                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/30'
                        }`}
                    >
                        {isPaid ? 'Paid' : 'Pending'}
                    </span>
                );
            },
        },
        {
            key: 'status',
            label: 'Status',
            render: (item) => {
                const status = normalizeStatus(item.status);

                // Show Accept/Reject buttons for Order Placed
                if (status === 'Order Placed') {
                    return (
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() =>
                                    updateStatus(item, 'Order Accepted')
                                }
                                className="h-8 bg-gradient-to-r from-green-500 to-green-600 px-3 text-xs font-semibold text-white hover:from-green-600 hover:to-green-700"
                            >
                                Accept
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                    updateStatus(item, 'Order Rejected')
                                }
                                className="h-8 px-3 text-xs font-semibold"
                            >
                                Reject
                            </Button>
                        </div>
                    );
                }

                // Show status pill for all other statuses
                return (
                    <span
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusColor(item.status)}`}
                    >
                        {status}
                    </span>
                );
            },
        },
        {
            key: 'action',
            label: 'Action',
            className: 'text-right',
            render: (item) => {
                const status = normalizeStatus(item.status);

                // Don't show actions for Order Placed or Order Rejected
                if (status === 'Order Placed' || status === 'Order Rejected') {
                    return (
                        <span className="text-sm text-gray-400 dark:text-zinc-600">
                            —
                        </span>
                    );
                }

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                            >
                                Action
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => handleViewDetails(item)}
                            >
                                View Details
                            </DropdownMenuItem>
                            {status === 'Order Accepted' &&
                                (item.billUrl ? (
                                    <DropdownMenuItem
                                        onClick={() => openBillViewer(item)}
                                    >
                                        View Bill
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem
                                        onClick={() =>
                                            openBillUploadModal(item)
                                        }
                                    >
                                        Upload Bill
                                    </DropdownMenuItem>
                                ))}
                            {status === 'Order Accepted' && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        openStatusModal(item, 'Shipped')
                                    }
                                >
                                    Mark as Shipped
                                </DropdownMenuItem>
                            )}
                            {status === 'Shipped' && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        updateStatus(item, 'Out for Delivery')
                                    }
                                >
                                    Mark Out for Delivery
                                </DropdownMenuItem>
                            )}
                            {status === 'Out for Delivery' && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        openStatusModal(item, 'Delivered')
                                    }
                                >
                                    Mark as Delivered
                                </DropdownMenuItem>
                            )}
                            {status !== 'Order Accepted' && item.billUrl && (
                                <DropdownMenuItem
                                    onClick={() => openBillViewer(item)}
                                >
                                    View Bill
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="Orders" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Orders
                        </h2>
                        <p className="text-muted-foreground dark:text-zinc-400">
                            Manage customer orders
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Date Range Picker */}
                    <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium dark:text-zinc-300">
                            Filter by Date Range:
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-[300px] justify-start text-left font-normal dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
                                        !dateRange &&
                                            'text-muted-foreground dark:text-zinc-500',
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(
                                                    dateRange.from,
                                                    'LLL dd, y',
                                                )}{' '}
                                                -{' '}
                                                {format(
                                                    dateRange.to,
                                                    'LLL dd, y',
                                                )}
                                            </>
                                        ) : (
                                            format(dateRange.from, 'LLL dd, y')
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0 dark:border-zinc-800 dark:bg-black"
                                align="start"
                            >
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    initialFocus
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                        {dateRange?.from && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDateRange(undefined)}
                                className="h-8 px-2 dark:text-zinc-400 dark:hover:text-zinc-100"
                            >
                                Clear
                            </Button>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium dark:text-zinc-300">
                            Filter by Status:
                        </Label>
                        <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                        >
                            <SelectTrigger className="w-[200px] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All</SelectItem>
                                <SelectItem value="Order Placed">
                                    Order Placed
                                </SelectItem>
                                <SelectItem value="Order Accepted">
                                    Order Accepted
                                </SelectItem>
                                <SelectItem value="Shipped">Shipped</SelectItem>
                                <SelectItem value="Out for Delivery">
                                    Out for Delivery
                                </SelectItem>
                                <SelectItem value="Delivered">
                                    Delivered
                                </SelectItem>
                                <SelectItem value="Order Rejected">
                                    Order Rejected
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Data Table */}
                <DataTable
                    data={filteredOrders}
                    columns={columns}
                    searchable={true}
                    searchPlaceholder="Search orders..."
                    searchKeys={['orderId', 'customerName', 'customerEmail']}
                    itemsPerPageOptions={[5, 10, 25, 50]}
                    defaultItemsPerPage={50}
                />
            </div>

            {/* View Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-3xl dark:border-zinc-800 dark:bg-black">
                    <DialogHeader>
                        <DialogTitle className="text-2xl dark:text-white">
                            Details
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Order details dialog.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="mb-2 text-lg font-semibold dark:text-white">
                                        Order ID: {selectedOrder.orderId}
                                    </h3>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-lg font-semibold dark:text-white">
                                        Payment Method:
                                    </h3>
                                    <p className="text-gray-600 dark:text-zinc-400">
                                        {selectedOrder.paymentMethod ?? '—'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-3">
                                <div>
                                    <h3 className="mb-2 text-lg font-semibold dark:text-white">
                                        Shipping Address
                                    </h3>
                                    <div className="space-y-1 text-gray-600 dark:text-zinc-400">
                                        {formatAddress(selectedOrder).length >
                                        0 ? (
                                            formatAddress(selectedOrder).map(
                                                (line) => (
                                                    <p key={line}>{line}</p>
                                                ),
                                            )
                                        ) : (
                                            <p>—</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-lg font-semibold dark:text-white">
                                        User
                                    </h3>
                                    <p className="text-gray-600 dark:text-zinc-400">
                                        {selectedOrder.customerName}
                                    </p>
                                    <p className="text-gray-600 dark:text-zinc-400">
                                        {selectedOrder.customerPhone}
                                    </p>
                                    <p className="text-gray-600 dark:text-zinc-400">
                                        {selectedOrder.customerEmail}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-lg font-semibold dark:text-white">
                                        Shipping Details
                                    </h3>
                                    <div className="space-y-1 text-gray-600 dark:text-zinc-400">
                                        <p>
                                            Courier:{' '}
                                            {selectedOrder.courierName || '—'}
                                        </p>
                                        <p>
                                            Tracking:{' '}
                                            {selectedOrder.trackingId || '—'}
                                        </p>
                                        <p>
                                            Received by:{' '}
                                            {selectedOrder.receivedBy || '—'}
                                        </p>
                                        <p>
                                            Notes:{' '}
                                            {selectedOrder.comment || '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-4 text-lg font-semibold dark:text-white">
                                    Products
                                </h3>
                                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-zinc-800">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-zinc-900">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold dark:text-zinc-300">
                                                    Product
                                                </th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold dark:text-zinc-300">
                                                    Quantity
                                                </th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold dark:text-zinc-300">
                                                    Price
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                            {selectedOrder.products.map(
                                                (product, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-3 text-gray-900 dark:text-zinc-300">
                                                            {product.name}
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-gray-900 dark:text-zinc-300">
                                                            {product.quantity}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-gray-900 dark:text-zinc-300">
                                                            ₹{' '}
                                                            {product.price.toFixed(
                                                                2,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Status Modal */}
            <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
                <DialogContent className="dark:border-zinc-800 dark:bg-black">
                    <DialogHeader>
                        <DialogTitle className="text-2xl dark:text-white">
                            Update Status
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Update order status dialog.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-6">
                            <div>
                                <Label
                                    htmlFor="status"
                                    className="text-base dark:text-zinc-300"
                                >
                                    Status
                                </Label>
                                <p className="mt-2 text-sm font-medium text-foreground dark:text-zinc-100">
                                    {statusForm.status}
                                </p>
                            </div>

                            {statusForm.status === 'Shipped' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label
                                            htmlFor="courier-name"
                                            className="text-base dark:text-zinc-300"
                                        >
                                            Courier Name
                                        </Label>
                                        <input
                                            id="courier-name"
                                            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                            value={statusForm.courierName}
                                            onChange={(e) =>
                                                setStatusForm((prev) => ({
                                                    ...prev,
                                                    courierName: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="tracking-id"
                                            className="text-base dark:text-zinc-300"
                                        >
                                            Tracking ID
                                        </Label>
                                        <input
                                            id="tracking-id"
                                            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                            value={statusForm.trackingId}
                                            onChange={(e) =>
                                                setStatusForm((prev) => ({
                                                    ...prev,
                                                    trackingId: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {statusForm.status === 'Delivered' && (
                                <div>
                                    <Label
                                        htmlFor="received-by"
                                        className="text-base dark:text-zinc-300"
                                    >
                                        Received By
                                    </Label>
                                    <input
                                        id="received-by"
                                        className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                        value={statusForm.receivedBy}
                                        onChange={(e) =>
                                            setStatusForm((prev) => ({
                                                ...prev,
                                                receivedBy: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            )}

                            {statusForm.status === 'Refunded' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label
                                            htmlFor="refund-amount"
                                            className="text-base dark:text-zinc-300"
                                        >
                                            Refund Amount
                                        </Label>
                                        <input
                                            id="refund-amount"
                                            type="number"
                                            step="0.01"
                                            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                            value={
                                                statusForm.refundAmount || ''
                                            }
                                            onChange={(e) =>
                                                setStatusForm((prev) => ({
                                                    ...prev,
                                                    refundAmount:
                                                        e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="refund-date"
                                            className="text-base dark:text-zinc-300"
                                        >
                                            Refund Date
                                        </Label>
                                        <input
                                            id="refund-date"
                                            type="date"
                                            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                            value={statusForm.refundDate || ''}
                                            onChange={(e) =>
                                                setStatusForm((prev) => ({
                                                    ...prev,
                                                    refundDate: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <Label
                                    htmlFor="notes"
                                    className="text-base dark:text-zinc-300"
                                >
                                    Notes
                                </Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Enter courier details, tracking number, etc."
                                    value={statusForm.notes}
                                    onChange={(e) =>
                                        setStatusForm((prev) => ({
                                            ...prev,
                                            notes: e.target.value,
                                        }))
                                    }
                                    className="mt-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                    rows={4}
                                />
                            </div>

                            <Button
                                onClick={handleStatusSubmit}
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                Submit
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="dark:border-zinc-800 dark:bg-black">
                    <DialogHeader>
                        <DialogTitle className="text-2xl dark:text-white">
                            {confirmConfig?.title ?? 'Confirm action'}
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Confirmation dialog.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        <p className="text-sm text-muted-foreground dark:text-zinc-400">
                            {confirmConfig?.description ?? ''}
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setConfirmOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={
                                    confirmConfig?.tone === 'destructive'
                                        ? 'destructive'
                                        : 'default'
                                }
                                onClick={() => {
                                    setConfirmOpen(false);
                                    confirmConfig?.onConfirm();
                                }}
                            >
                                {confirmConfig?.confirmLabel ?? 'Confirm'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bill Upload Modal */}
            <Dialog open={billUploadOpen} onOpenChange={setBillUploadOpen}>
                <DialogContent className="max-w-md dark:border-zinc-800 dark:bg-black">
                    <DialogHeader>
                        <DialogTitle className="text-2xl dark:text-white">
                            Upload Bill
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Upload or replace a bill PDF for the order.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground dark:text-zinc-400">
                                {billUploadOrder
                                    ? `Order ID: ${billUploadOrder.orderId}`
                                    : 'Select a bill PDF to upload.'}
                            </p>
                            <p className="text-xs text-muted-foreground dark:text-zinc-500">
                                Only PDF, max size 2MB.
                            </p>
                        </div>

                        {billUploadOrder?.billUrl && (
                            <div className="rounded-lg border border-border bg-muted/30 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={billUploading}
                                        onClick={() => {
                                            setBillUploadOpen(false);
                                            openBillViewer(billUploadOrder);
                                        }}
                                    >
                                        Preview current bill
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        disabled={billUploading}
                                        onClick={deleteExistingBill}
                                    >
                                        Remove bill
                                    </Button>
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground dark:text-zinc-500">
                                    Removing deletes the PDF from storage.
                                </p>
                            </div>
                        )}

                        <Input
                            type="file"
                            accept="application/pdf,.pdf"
                            disabled={billUploading}
                            onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                setBillError(null);
                                setBillFile(null);

                                if (!file) {
                                    return;
                                }

                                const maxBytes = 2 * 1024 * 1024;
                                const isPdf =
                                    file.type === 'application/pdf' ||
                                    file.name.toLowerCase().endsWith('.pdf');

                                if (!isPdf) {
                                    setBillError('Only PDF files are allowed.');
                                    e.target.value = '';
                                    return;
                                }

                                if (file.size > maxBytes) {
                                    setBillError('Max file size is 2MB.');
                                    e.target.value = '';
                                    return;
                                }

                                setBillFile(file);
                            }}
                        />

                        {billUploading && (
                            <Field className="w-full">
                                <FieldLabel htmlFor="progress-upload">
                                    <span>Upload progress</span>
                                    <span className="ml-auto">
                                        {Math.round(billUploadProgress)}%
                                    </span>
                                </FieldLabel>
                                <Progress
                                    value={billUploadProgress}
                                    id="progress-upload"
                                />
                            </Field>
                        )}

                        {billError && (
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                {billError}
                            </p>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={billUploading}
                                onClick={() => setBillUploadOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                disabled={!billFile || billUploading}
                                onClick={submitBillUpload}
                            >
                                {billUploading ? 'Uploading...' : 'Upload'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bill Viewer Modal */}
            <Dialog open={billViewOpen} onOpenChange={setBillViewOpen}>
                <DialogContent
                    showClose={false}
                    className="max-w-5xl p-0 dark:border-zinc-800 dark:bg-black"
                >
                    <DialogHeader className="sr-only">
                        <DialogTitle>
                            Bill PDF
                            {billViewOrder?.orderId
                                ? ` - ${billViewOrder.orderId}`
                                : ''}
                        </DialogTitle>
                        <DialogDescription>
                            Preview, print, or download the bill PDF.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4 dark:border-zinc-800">
                        <div className="min-w-0 flex-1">
                            <h3 className="truncate text-lg font-semibold text-foreground dark:text-white">
                                Bill PDF
                                {billViewOrder?.orderId
                                    ? ` - ${billViewOrder.orderId}`
                                    : ''}
                            </h3>
                            <p className="mt-0.5 text-xs text-muted-foreground dark:text-zinc-400">
                                PDF preview
                            </p>
                        </div>
                        <div className="flex max-w-full flex-wrap items-center justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="shrink-0"
                                disabled={!billViewOrder?.billUrl}
                                onClick={() => {
                                    const win =
                                        billIframeRef.current?.contentWindow ??
                                        null;

                                    // Print the embedded PDF (same-origin). If blocked, fall back to downloading.
                                    try {
                                        if (!win) {
                                            throw new Error('No print window');
                                        }
                                        win.focus();
                                        win.print();
                                    } catch {
                                        if (billViewOrder?.billUrl) {
                                            window.location.href =
                                                billViewOrder.billUrl;
                                        }
                                    }
                                }}
                            >
                                Print
                            </Button>
                            {billViewOrder?.billUrl && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0"
                                    asChild
                                >
                                    <a
                                        href={billViewOrder.billUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Download
                                    </a>
                                </Button>
                            )}
                            {billViewOrder && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0"
                                    onClick={() => {
                                        const order = billViewOrder;
                                        setBillViewOpen(false);
                                        openBillUploadModal(order);
                                    }}
                                >
                                    Replace Bill
                                </Button>
                            )}
                            <Button
                                size="sm"
                                className="shrink-0"
                                onClick={() => setBillViewOpen(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>

                    <div className="h-[75vh] bg-gradient-to-b from-muted/20 to-muted/40 p-4 dark:from-zinc-900/40 dark:to-zinc-950/60">
                        {billViewOrder?.billUrl ? (
                            <iframe
                                title={`Bill PDF - ${billViewOrder.orderId}`}
                                src={`${billViewOrder.billUrl}#view=FitH&toolbar=0&navpanes=0`}
                                ref={billIframeRef}
                                className="h-full w-full rounded-lg border border-border bg-white shadow-sm dark:border-zinc-800"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground dark:border-zinc-800 dark:text-zinc-400">
                                No bill to preview.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
