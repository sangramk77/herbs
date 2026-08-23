import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
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
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/AdminLayout';

interface Blog {
    id: string;
    blog_title: string;
    thumbnail?: string;
    publish_date?: string;
    status: boolean;
    post_by?: string;
}

interface BlogProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    blogs: Blog[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Blog({ auth, blogs = [], flash }: BlogProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

    // Show flash messages as toasts
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const toggleStatus = (id: string) => {
        router.post(
            `/admin/cms/blog/${id}/toggle-status`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Blog status updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update blog status');
                },
            },
        );
    };

    const handleDelete = (blog: Blog) => {
        setSelectedBlog(blog);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedBlog) return;

        router.delete(`/admin/cms/blog/${selectedBlog.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Blog deleted successfully');
                setDeleteDialogOpen(false);
                setSelectedBlog(null);
            },
            onError: () => {
                toast.error('Failed to delete blog');
            },
        });
    };

    const columns: DataTableColumn<Blog>[] = [
        {
            key: 'id',
            label: 'Sl.No',
            className: 'w-16',
            render: (_, index) => (
                <span className="font-medium">{index + 1}</span>
            ),
        },
        {
            key: 'thumbnail',
            label: 'Thumbnail',
            className: 'w-24',
            render: (item) => (
                <div className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900">
                    {item.thumbnail ? (
                        <img
                            src={`/uploads/blogs/thumbnails/${item.thumbnail}`}
                            alt={item.blog_title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src =
                                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" y="3" rx="2" ry="2"/%3E%3Ccircle cx="9" cy="9" r="2"/%3E%3Cpath d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/%3E%3C/svg%3E';
                            }}
                        />
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400"
                        >
                            <rect
                                width="18"
                                height="18"
                                x="3"
                                y="3"
                                rx="2"
                                ry="2"
                            />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                    )}
                </div>
            ),
        },
        {
            key: 'blog_title',
            label: 'Blog Title',
            className: 'max-w-md',
            render: (item) => (
                <div>
                    <div className="font-medium">{item.blog_title}</div>
                    {item.post_by && (
                        <div className="text-sm text-gray-500 dark:text-zinc-400">
                            By {item.post_by}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'publish_date',
            label: 'Publish Date',
            render: (item) => (
                <span>
                    {item.publish_date
                        ? format(new Date(item.publish_date), 'dd/MM/yyyy')
                        : '-'}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (item) => (
                <Switch
                    checked={item.status}
                    onCheckedChange={() => toggleStatus(item.id)}
                />
            ),
        },
        {
            key: 'action',
            label: 'Action',
            className: 'text-right',
            render: (item) => (
                <div className="flex justify-end gap-2">
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 border-green-600 text-green-600 hover:bg-green-600 hover:text-white dark:border-green-500 dark:text-green-500 dark:hover:bg-green-500"
                        onClick={() =>
                            router.visit(`/admin/cms/blog/${item.id}/edit`)
                        }
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 border-red-600 text-red-600 hover:bg-red-600 hover:text-white dark:border-red-500 dark:text-red-500 dark:hover:bg-red-500"
                        onClick={() => handleDelete(item)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="CMS Blog" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            CMS Blog
                        </h2>
                        <p className="text-muted-foreground dark:text-zinc-400">
                            Manage your blog posts
                        </p>
                    </div>
                    <Button
                        className="gap-2"
                        onClick={() => router.visit('/admin/cms/blog/create')}
                    >
                        <Plus className="h-4 w-4" />
                        Add Blog
                    </Button>
                </div>

                {/* Data Table */}
                <DataTable
                    data={blogs}
                    columns={columns}
                    searchable={true}
                    searchPlaceholder="Search blogs..."
                    searchKeys={['blog_title', 'post_by']}
                    itemsPerPageOptions={[5, 10, 25, 50]}
                    defaultItemsPerPage={10}
                />
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent className="dark:border-zinc-800 dark:bg-black">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-white">
                            Delete Blog
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-zinc-400">
                            Are you sure you want to delete the blog "
                            {selectedBlog?.blog_title}"? This action cannot be
                            undone and will also delete all associated images.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
