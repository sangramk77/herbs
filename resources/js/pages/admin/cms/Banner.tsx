import { Head, router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';

import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/AdminLayout';

interface Banner {
    id: number;
    heading1: string;
    main_heading: string;
    image: string;
    mobile_image?: string;
    description: string;
    status: boolean;
}

interface BannerProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    banners: {
        data: Banner[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function Banner({ auth, banners }: BannerProps) {
    const toggleStatus = (id: number) => {
        router.post(
            `/admin/cms/banner/${id}/toggle-status`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Status will be updated via Inertia re-render
                },
            },
        );
    };

    const deleteBanner = (id: number) => {
        if (confirm('Are you sure you want to delete this banner?')) {
            router.delete(`/admin/cms/banner/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const columns: DataTableColumn<Banner>[] = [
        {
            key: 'id',
            label: 'Sl.No',
            className: 'w-16',
            render: (_, index) => (
                <span className="font-medium">{index + 1}</span>
            ),
        },
        {
            key: 'heading1',
            label: 'Heading 1',
            render: (item) => <span>{item.heading1 || ''}</span>,
        },
        {
            key: 'main_heading',
            label: 'Main Heading',
            render: (item) => (
                <span
                    dangerouslySetInnerHTML={{
                        __html: (item.main_heading || '').replace('<br>', ' '),
                    }}
                />
            ),
        },
        {
            key: 'image',
            label: 'Desktop Image',
            render: (item) => (
                <div className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900">
                    <img
                        src={`/uploads/banners/${item.image}`}
                        alt={item.main_heading}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" y="3" rx="2" ry="2"/%3E%3Ccircle cx="9" cy="9" r="2"/%3E%3Cpath d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/%3E%3C/svg%3E';
                        }}
                    />
                </div>
            ),
        },
        {
            key: 'mobile_image',
            label: 'Mobile Image',
            render: (item) =>
                item.mobile_image ? (
                    <div className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900">
                        <img
                            src={`/uploads/banners/${item.mobile_image}`}
                            alt={item.main_heading}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src =
                                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" y="3" rx="2" ry="2"/%3E%3Ccircle cx="9" cy="9" r="2"/%3E%3Cpath d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/%3E%3C/svg%3E';
                            }}
                        />
                    </div>
                ) : (
                    <span className="text-xs text-gray-500">Not set</span>
                ),
        },
        {
            key: 'description',
            label: 'Description',
            render: (item) => (
                <span className="line-clamp-2 max-w-xs">
                    {item.description || ''}
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
                            router.visit(`/admin/cms/banner/${item.id}/edit`)
                        }
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 border-red-600 text-red-600 hover:bg-red-600 hover:text-white dark:border-red-500 dark:text-red-500 dark:hover:bg-red-500"
                        onClick={() => deleteBanner(item.id)}
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
            <Head title="CMS Banner" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            CMS Banner
                        </h2>
                        <p className="text-muted-foreground dark:text-zinc-400">
                            Manage your website banners
                        </p>
                    </div>
                    <Button
                        className="gap-2"
                        onClick={() => router.visit('/admin/cms/banner/create')}
                    >
                        <Plus className="h-4 w-4" />
                        Add Banner
                    </Button>
                </div>

                {/* Data Table */}
                <DataTable
                    data={banners.data}
                    columns={columns}
                    searchable={true}
                    searchPlaceholder="Search banners..."
                    searchKeys={['heading1', 'main_heading', 'description']}
                    itemsPerPageOptions={[5, 10, 25, 50]}
                    defaultItemsPerPage={5}
                />
            </div>
        </AdminLayout>
    );
}
