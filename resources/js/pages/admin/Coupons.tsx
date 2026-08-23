import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/AdminLayout';

interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    applies_to: 'entire_store' | 'category' | 'product';
    is_active: boolean;
    usage_limit: number | null;
    usage_per_user: number | null;
    used_count: number;
    expires_at: string | null;
    is_expired: boolean;
}

interface CouponsProps {
    coupons: {
        data: Coupon[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
    };
    auth?: {
        user?: {
            name: string;
        };
    };
}

const scopeLabel: Record<Coupon['applies_to'], string> = {
    entire_store: 'Entire Store',
    category: 'Category',
    product: 'Product',
};

export default function Coupons({ coupons, filters, auth }: CouponsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get(
                '/admin/coupons',
                search ? { search } : {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search]);

    const toggleStatus = (id: string) => {
        router.post(
            `/admin/coupons/${id}/toggle-status`,
            {},
            {
                onSuccess: () => toast.success('Coupon status updated'),
            },
        );
    };

    const confirmDelete = () => {
        if (!selectedCoupon) return;

        router.delete(`/admin/coupons/${selectedCoupon.id}`, {
            onSuccess: () => {
                toast.success('Coupon deleted successfully');
                setDeleteDialogOpen(false);
                setSelectedCoupon(null);
            },
            onError: () => toast.error('Failed to delete coupon'),
        });
    };

    return (
        <AdminLayout userName={auth?.user?.name}>
            <Head title="Coupons" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Coupons
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Create and manage discount coupons
                        </p>
                    </div>
                    <Link href="/admin/coupons/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Coupon
                        </Button>
                    </Link>
                </div>

                <div className="relative max-w-md">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search coupon code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-80 pr-10 pl-10"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="rounded-lg border bg-white dark:bg-zinc-900">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Scope</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        No coupons found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                coupons.data.map((coupon) => (
                                    <TableRow key={coupon.id}>
                                        <TableCell className="font-semibold">
                                            {coupon.code}
                                        </TableCell>
                                        <TableCell>
                                            {coupon.discount_type === 'percentage'
                                                ? `${coupon.discount_value}%`
                                                : `₹${coupon.discount_value.toLocaleString('en-IN')}`}
                                        </TableCell>
                                        <TableCell>{scopeLabel[coupon.applies_to]}</TableCell>
                                        <TableCell>
                                            {coupon.used_count}
                                            {coupon.usage_limit
                                                ? ` / ${coupon.usage_limit}`
                                                : ''}
                                        </TableCell>
                                        <TableCell>
                                            {coupon.expires_at
                                                ? new Date(
                                                      coupon.expires_at,
                                                  ).toLocaleDateString('en-IN')
                                                : 'No expiry'}
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => toggleStatus(coupon.id)}
                                                className="cursor-pointer"
                                            >
                                                <Badge
                                                    variant={
                                                        coupon.is_active &&
                                                        !coupon.is_expired
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {coupon.is_expired
                                                        ? 'Expired'
                                                        : coupon.is_active
                                                          ? 'Active'
                                                          : 'Inactive'}
                                                </Badge>
                                            </button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/coupons/${coupon.id}/edit`}
                                                >
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedCoupon(coupon);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {coupons.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {coupons.data.length} of {coupons.total} coupons
                        </p>
                        <div className="flex gap-2">
                            {Array.from(
                                { length: coupons.last_page },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <Link
                                    key={page}
                                    href={`/admin/coupons?page=${page}`}
                                    preserveState
                                >
                                    <Button
                                        variant={
                                            page === coupons.current_page
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                    >
                                        {page}
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Delete Coupon"
                description={`Delete ${selectedCoupon?.code ?? 'this coupon'}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
            />
        </AdminLayout>
    );
}
