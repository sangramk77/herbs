import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, Edit, Plus, Search, Trash2, X } from 'lucide-react';
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

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    status: 'active' | 'inactive';
    products_count: number;
    sort_order: number;
    created_at: string;
}

interface CategoriesProps {
    categories: {
        data: Category[];
        current_page: number;
        last_page: number;
        per_page: number;
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
    errors?: {
        category?: string;
        [key: string]: any;
    };
}

export default function Categories({
    categories,
    filters,
    auth,
}: CategoriesProps) {
    const { errors } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null,
    );
    const [selectedNewCategory, setSelectedNewCategory] = useState('');

    // Dynamic search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get('/admin/categories', search ? { search } : {}, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [search]);

    const handleDelete = (category: Category) => {
        setSelectedCategory(category);
        if (category.products_count > 0) {
            setReassignDialogOpen(true);
        } else {
            setDeleteDialogOpen(true);
        }
    };

    const confirmDelete = () => {
        if (!selectedCategory) return;

        router.delete(`/admin/categories/${selectedCategory.id}`, {
            onSuccess: () => {
                toast.success('Category deleted successfully');
                setDeleteDialogOpen(false);
                setSelectedCategory(null);
            },
            onError: (errors) => {
                toast.error(errors.category || 'Failed to delete category');
            },
        });
    };

    const handleReassignAndDelete = () => {
        if (!selectedCategory || !selectedNewCategory) {
            toast.error('Please select a category to reassign products to');
            return;
        }

        router.post(
            `/admin/categories/${selectedCategory.id}/reassign-and-delete`,
            { new_category_id: selectedNewCategory },
            {
                onSuccess: () => {
                    toast.success('Category deleted and products reassigned');
                    setReassignDialogOpen(false);
                    setSelectedCategory(null);
                    setSelectedNewCategory('');
                },
                onError: (errors) => {
                    toast.error(
                        errors.new_category_id || 'Failed to reassign products',
                    );
                },
            },
        );
    };

    const toggleStatus = (id: string) => {
        router.post(
            `/admin/categories/${id}/toggle-status`,
            {},
            {
                onSuccess: () => {
                    toast.success('Status updated successfully');
                },
            },
        );
    };

    return (
        <AdminLayout userName={auth?.user?.name}>
            <Head title="Categories" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Categories
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Manage product categories
                        </p>
                    </div>
                    <Link href="/admin/categories/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </Link>
                </div>

                {/* Error Display */}
                {errors?.category && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                {errors.category}
                            </p>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="flex gap-4">
                    <div className="relative max-w-md">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search categories..."
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
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-white dark:bg-zinc-900">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Sort Order</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center"
                                    >
                                        No categories found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.data.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">
                                            {category.name}
                                        </TableCell>
                                        <TableCell className="text-gray-500">
                                            {category.slug}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {category.products_count}{' '}
                                                products
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {category.sort_order}
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() =>
                                                    toggleStatus(category.id)
                                                }
                                                className="cursor-pointer"
                                            >
                                                <Badge
                                                    variant={
                                                        category.status ===
                                                        'active'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {category.status}
                                                </Badge>
                                            </button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/categories/${category.id}/edit`}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDelete(category)
                                                    }
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

                {/* Pagination */}
                {categories.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {categories.data.length} of{' '}
                            {categories.total} categories
                        </p>
                        <div className="flex gap-2">
                            {Array.from(
                                { length: categories.last_page },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <Link
                                    key={page}
                                    href={`/admin/categories?page=${page}`}
                                    preserveState
                                >
                                    <Button
                                        variant={
                                            page === categories.current_page
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

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Delete Category"
                description={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
            />

            {/* Reassignment Dialog */}
            {reassignDialogOpen && selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-zinc-900">
                        <h2 className="text-xl font-bold">Reassign Products</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Category "{selectedCategory.name}" has{' '}
                            {selectedCategory.products_count} product(s). Please
                            select a category to move them to before deletion.
                        </p>
                        <div className="mt-4">
                            <label className="block text-sm font-medium">
                                Select New Category
                            </label>
                            <select
                                className="mt-1 w-full rounded-md border p-2 dark:bg-zinc-800"
                                value={selectedNewCategory}
                                onChange={(e) =>
                                    setSelectedNewCategory(e.target.value)
                                }
                            >
                                <option value="">-- Select Category --</option>
                                {categories.data
                                    .filter((c) => c.id !== selectedCategory.id)
                                    .map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setReassignDialogOpen(false);
                                    setSelectedCategory(null);
                                    setSelectedNewCategory('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleReassignAndDelete}>
                                Reassign & Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
