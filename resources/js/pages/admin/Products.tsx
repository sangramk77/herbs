import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    sort_order?: number;
    primary_image?: string;
    sell_price: number;
    mrp: number;
    discount_percentage: number;
    stock: number;
    status: 'active' | 'inactive';
    is_featured: boolean;
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

interface ProductsProps {
    auth?: {
        user?: {
            name: string;
        };
    };
    products: PaginatedProducts;
    categories: {
        id: string;
        name: string;
        slug?: string;
    }[];
    filters: {
        search?: string;
        status?: string;
        sort_by?: string;
        sort_order?: string;
        category_id?: string;
    };
}

export default function Products({
    auth,
    products,
    categories,
    filters,
}: ProductsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'name');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
    const [categoryId, setCategoryId] = useState(filters.category_id || 'all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null,
    );

    // Dynamic search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (sortBy) params.sort_by = sortBy;
            if (sortOrder) params.sort_order = sortOrder;
            if (categoryId && categoryId !== 'all') {
                params.category_id = categoryId;
            }

            router.get('/admin/products', params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, sortBy, sortOrder, categoryId]);

    const toggleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            return;
        }

        setSortBy(column);
        setSortOrder('asc');
    };

    const sortLabel = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    const getSortByLabel = () => {
        const labels: Record<string, string> = {
            sort_order: 'Sort Order',
            created_at: 'Created Date',
            name: 'Name',
            sell_price: 'Price',
            stock: 'Stock',
        };
        return labels[sortBy] || 'Sort by...';
    };

    const getSortOrderLabel = () => {
        return sortOrder === 'asc' ? 'Ascending' : 'Descending';
    };

    const getCategoryLabel = () => {
        if (categoryId === 'all') return 'All categories';
        const category = categories.find((c) => c.id === categoryId);
        return category?.name || 'Filter by category...';
    };

    const toggleStatus = (productId: string) => {
        router.post(
            `/admin/products/${productId}/toggle-status`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Product status updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update product status');
                },
            },
        );
    };

    const toggleBestSeller = (productId: string) => {
        router.post(
            `/admin/products/${productId}/toggle-featured`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Best seller status updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update best seller status');
                },
            },
        );
    };

    const toggleStock = (productId: string) => {
        router.post(
            `/admin/products/${productId}/toggle-stock`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Stock status updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update stock status');
                },
            },
        );
    };

    const handleDelete = (product: Product) => {
        setSelectedProduct(product);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedProduct) return;

        router.delete(`/admin/products/${selectedProduct.id}`, {
            onSuccess: () => {
                toast.success('Product deleted successfully');
                setDeleteDialogOpen(false);
                setSelectedProduct(null);
            },
            onError: () => {
                toast.error('Failed to delete product');
            },
        });
    };

    return (
        <AdminLayout userName={auth?.user?.name}>
            <Head title="Products" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Products
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Manage your product catalog
                        </p>
                    </div>
                    <Link href="/admin/products/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search products..."
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
                    <div className="w-48">
                        <Select
                            value={sortBy}
                            onValueChange={(value) => setSortBy(value)}
                        >
                            <SelectTrigger>
                                <SelectValue>{getSortByLabel()}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sort_order">
                                    Sort Order
                                </SelectItem>
                                <SelectItem value="created_at">
                                    Created Date
                                </SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="sell_price">
                                    Price
                                </SelectItem>
                                <SelectItem value="stock">Stock</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-32">
                        <Select
                            value={sortOrder}
                            onValueChange={(value) => setSortOrder(value)}
                        >
                            <SelectTrigger>
                                <SelectValue>{getSortOrderLabel()}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">Ascending</SelectItem>
                                <SelectItem value="desc">Descending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-64">
                        <Select
                            value={categoryId}
                            onValueChange={(value) => setCategoryId(value)}
                        >
                            <SelectTrigger>
                                <SelectValue>{getCategoryLabel()}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All categories
                                </SelectItem>
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-white dark:bg-zinc-900">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">#</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>
                                    <button
                                        type="button"
                                        onClick={() => toggleSort('sort_order')}
                                        className="inline-flex items-center gap-2 text-left font-medium text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-200"
                                    >
                                        Sorting Order
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {sortLabel('sort_order')}
                                        </span>
                                    </button>
                                </TableHead>
                                <TableHead>
                                    <button
                                        type="button"
                                        onClick={() => toggleSort('created_at')}
                                        className="inline-flex items-center gap-2 text-left font-medium text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-200"
                                    >
                                        Created
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {sortLabel('created_at')}
                                        </span>
                                    </button>
                                </TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Best Seller</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={10}
                                        className="text-center"
                                    >
                                        No products found
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
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                            {product.sort_order ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(
                                                product.created_at,
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    ₹{product.sell_price}
                                                </div>
                                                {product.mrp && (
                                                    <div className="text-sm text-gray-500">
                                                        <span className="line-through">
                                                            ₹{product.mrp}
                                                        </span>
                                                        {product.discount_percentage !==
                                                            null &&
                                                            product.discount_percentage !==
                                                                undefined && (
                                                                <span className="ml-1 text-green-600">
                                                                    {
                                                                        product.discount_percentage
                                                                    }
                                                                    % off
                                                                </span>
                                                            )}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() =>
                                                    toggleStock(product.id)
                                                }
                                                className="cursor-pointer"
                                            >
                                                <Badge
                                                    variant={
                                                        product.stock &&
                                                        product.stock > 0
                                                            ? 'default'
                                                            : 'destructive'
                                                    }
                                                    className={
                                                        product.stock &&
                                                        product.stock > 0
                                                            ? 'bg-green-500 hover:bg-green-600'
                                                            : ''
                                                    }
                                                >
                                                    {product.stock &&
                                                    product.stock > 0
                                                        ? 'In Stock'
                                                        : 'Out of Stock'}
                                                </Badge>
                                            </button>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() =>
                                                    toggleStatus(product.id)
                                                }
                                                className="cursor-pointer"
                                            >
                                                <Badge
                                                    variant={
                                                        product.status ===
                                                        'active'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {product.status}
                                                </Badge>
                                            </button>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() =>
                                                    toggleBestSeller(product.id)
                                                }
                                                className="cursor-pointer"
                                            >
                                                <Badge
                                                    variant={
                                                        product.is_featured
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                >
                                                    {product.is_featured
                                                        ? 'Yes'
                                                        : 'No'}
                                                </Badge>
                                            </button>
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
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDelete(product)
                                                    }
                                                    className="hover:bg-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {products.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-6 py-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {products.data.length} of{' '}
                                {products.total} products
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "
                            {selectedProduct?.name}"? This action cannot be
                            undone. The product will be removed from the
                            catalog, but order history will be preserved.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
