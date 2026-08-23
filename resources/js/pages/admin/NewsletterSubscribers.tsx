import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import AdminLayout from '@/layouts/AdminLayout';

interface NewsletterSubscriber {
    id: string;
    email: string;
    createdAt: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedSubscribers {
    data: NewsletterSubscriber[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface NewsletterSubscribersProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    subscribers: PaginatedSubscribers;
    filters: {
        search?: string;
    };
}

export default function NewsletterSubscribers({
    auth,
    subscribers,
    filters,
}: NewsletterSubscribersProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedSubscriber, setSelectedSubscriber] =
        useState<NewsletterSubscriber | null>(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get(
                '/admin/newsletter-subscribers',
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

    const handleDelete = (subscriber: NewsletterSubscriber) => {
        setSelectedSubscriber(subscriber);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedSubscriber) return;

        router.delete(
            `/admin/newsletter-subscribers/${selectedSubscriber.id}`,
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success('Subscriber deleted.');
                    setDeleteDialogOpen(false);
                    setSelectedSubscriber(null);
                },
                onError: () => {
                    toast.error('Failed to delete subscriber.');
                },
            },
        );
    };

    const columns: DataTableColumn<NewsletterSubscriber>[] = [
        {
            key: 'id',
            label: 'Sl.No',
            className: 'w-16',
            render: (_, index) => (
                <span className="font-medium">{index + 1}</span>
            ),
        },
        {
            key: 'email',
            label: 'Email',
            render: (item) => (
                <span className="text-sm text-gray-600 dark:text-zinc-400">
                    {item.email}
                </span>
            ),
        },
        {
            key: 'date',
            label: 'Date',
            render: (item) =>
                item.createdAt
                    ? format(new Date(item.createdAt), 'dd MMM yyyy, hh:mm a')
                    : '—',
        },
        {
            key: 'action',
            label: 'Action',
            className: 'text-right',
            render: (item) => (
                <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 text-red-600 hover:text-red-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-red-400"
                    onClick={() => handleDelete(item)}
                >
                    <Trash2 className="h-4 w-4" />
                    Delete
                </Button>
            ),
        },
    ];

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="Newsletter Subscribers" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Newsletter Subscribers
                    </h2>
                    <p className="text-muted-foreground dark:text-zinc-400">
                        People who subscribed from the website footer.
                    </p>
                </div>

                <Card className="mx-auto max-w-4xl border border-slate-200/70 shadow-sm dark:border-zinc-800">
                    <CardContent className="p-6">
                        <DataTable
                            data={subscribers.data}
                            columns={columns}
                            searchable={true}
                            searchPlaceholder="Search subscribers..."
                            searchKeys={['email']}
                            searchValue={search}
                            onSearchChange={setSearch}
                            showItemsPerPage={false}
                            compact={true}
                            containerClassName="space-y-3"
                            serverPagination={{
                                currentPage: subscribers.current_page,
                                lastPage: subscribers.last_page,
                                total: subscribers.total,
                                perPage: subscribers.per_page,
                                links: subscribers.links,
                            }}
                            onPageChange={(url) =>
                                router.get(
                                    url,
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                )
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Delete Subscriber"
                description={`Are you sure you want to delete ${selectedSubscriber?.email}? This action cannot be undone.`}
                confirmText="Delete"
            />
        </AdminLayout>
    );
}
