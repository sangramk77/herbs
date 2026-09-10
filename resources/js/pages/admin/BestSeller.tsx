import { Head, router } from '@inertiajs/react';
import { Edit, Search, Star, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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

interface Product {
    id: string;
    name: string;
    slug: string;
    primary_image?: string;
    featured_sort_order?: number | null;
    created_at: string;
    category?: {
        name?: string;
    } | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface BestSellerProps {
    auth?: {
        user?: {
            name: string;
        };
    };
    products: PaginatedProducts;
    filters: {
        search?: string;
    };
}

export default function BestSeller({
    auth,
    products,
    filters,
}: BestSellerProps) {
    const [search, setSearch] = useState(filters.search || '');
    const hasInitializedSearch = useRef(false);
    const [sortOrderDraft, setSortOrderDraft] = useState<
        Record<string, string>
    >({});

    useEffect(() => {
        if (!hasInitializedSearch.current) {
            hasInitializedSearch.current = true;
            return;
        }

        const timeoutId = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;

            router.get('/admin/best-sellers', params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search]);

    useEffect(() => {
        const mapped = products.data.reduce<Record<string, string>>(
            (acc, product) => {
                acc[product.id] =
                    product.featured_sort_order !== null &&
                    product.featured_sort_order !== undefined
                        ? String(product.featured_sort_order)
                        : '';
                return acc;
            },
            {},
        );
        setSortOrderDraft(mapped);
    }, [products.data]);

    const totalShowing = useMemo(
        () =>
            products.data.length === 0
                ? '0'
                : `${(products.current_page - 1) * products.per_page + 1}-${(products.current_page - 1) * products.per_page + products.data.length}`,
        [products.current_page, products.data.length, products.per_page],
    );

    const saveAllSortOrders = () => {
        const items = products.data
            .filter((product) => {
                const value = sortOrderDraft[product.id];
                return value !== undefined && value.trim() !== '';
            })
            .map((product) => {
                const parsed = Number.parseInt(sortOrderDraft[product.id], 10);
                return {
                    id: product.id,
                    featured_sort_order: parsed,
                };
            });

        if (items.length === 0) {
            toast.error('Enter at least one sorting order to save');
            return;
        }

        const hasInvalid = items.some(
            (item) =>
                !Number.isInteger(item.featured_sort_order) ||
                item.featured_sort_order < 1,
        );

        if (hasInvalid) {
            toast.error(
                'Sorting order must be a number greater than or equal to 1',
            );
            return;
        }

        router.put(
            '/admin/best-sellers/sort-orders',
            { items },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Best seller sorting orders updated');
                },
                onError: () => {
                    toast.error('Failed to update sorting orders');
                },
            },
        );
    };

    const removeBestSeller = (productId: string) => {
        router.post(
            `/admin/products/${productId}/toggle-featured`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Product removed from best seller');
                },
                onError: () => {
                    toast.error('Failed to update best seller status');
                },
            },
        );
    };

    return (
        <AdminLayout userName={auth?.user?.name}>
            <Head title="Best Seller Products" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Best Seller
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Manage featured products and their display sorting
                            order
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                        <Star className="h-4 w-4" />
                        {products.total} featured products
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search best sellers..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="w-80 pr-10 pl-10"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <Button type="button" onClick={saveAllSortOrders}>
                        Save Sorting
                    </Button>
                </div>

                <div className="rounded-lg border bg-white dark:bg-zinc-900">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">#</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Sorting Order</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center"
                                    >
                                        No featured products found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.data.map((product, index) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                                            {(products.current_page - 1) *
                                                products.per_page +
                                                index +
                                                1}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {product.primary_image ? (
                                                    <img
                                                        src={`/uploads/products/${product.primary_image}`}
                                                        alt={product.name}
                                                        className="h-12 w-12 rounded object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-200 dark:bg-zinc-800">
                                                        <span className="text-xs text-gray-500">
                                                            No Image
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {product.slug}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                            {product.category?.name || '—'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    placeholder="1"
                                                    value={
                                                        sortOrderDraft[
                                                            product.id
                                                        ] ?? ''
                                                    }
                                                    onChange={(event) =>
                                                        setSortOrderDraft(
                                                            (prev) => ({
                                                                ...prev,
                                                                [product.id]:
                                                                    event.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    className="h-9 w-28"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(
                                                product.created_at,
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        router.visit(
                                                            `/admin/products/${product.id}/edit`,
                                                        )
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                                                    onClick={() =>
                                                        removeBestSeller(
                                                            product.id,
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {products.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-6 py-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {totalShowing} of {products.total}{' '}
                                featured products
                            </div>
                            <div className="flex gap-2">
                                {products.links.map((link, index) => {
                                    if (!link.url) return null;

                                    return (
                                        <Button
                                            key={index}
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            onClick={() =>
                                                router.get(link.url!)
                                            }
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
