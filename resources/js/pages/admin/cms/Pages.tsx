import { Head, router } from '@inertiajs/react';
import { Edit, ImageOff, Plus } from 'lucide-react';

import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/AdminLayout';

interface CMSPage {
    id: string;
    page: string;
    image?: string | null;
    isActive: boolean;
    seoUrl?: string | null;
    showInFooter?: boolean;
}

interface CMSPagesProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    pages?: CMSPage[];
}

export default function CMSPages({ auth, pages = [] }: CMSPagesProps) {
    const toggleStatus = (id: string) => {
        router.post(
            `/admin/cms/pages/${id}/toggle`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['pages'] }),
            },
        );
    };

    const columns: DataTableColumn<CMSPage>[] = [
        {
            key: 'id',
            label: 'Sl.No',
            className: 'w-16',
            render: (_, index) => (
                <span className="font-medium">{index + 1}</span>
            ),
        },
        {
            key: 'page',
            label: 'Page',
            render: (item) => <span>{item.page}</span>,
        },
        {
            key: 'image',
            label: 'Image',
            render: (item) => (
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900">
                    {item.image ? (
                        <img
                            src={item.image}
                            alt={item.page}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src =
                                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" y="3" rx="2" ry="2"/%3E%3Ccircle cx="9" cy="9" r="2"/%3E%3Cpath d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/%3E%3C/svg%3E';
                            }}
                        />
                    ) : (
                        <ImageOff className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>
            ),
        },
        {
            key: 'isActive',
            label: 'Status',
            render: (item) => (
                <Switch
                    checked={item.isActive}
                    onCheckedChange={() => toggleStatus(item.id)}
                />
            ),
        },
        {
            key: 'action',
            label: 'Action',
            className: 'text-right',
            render: (item) => (
                <div className="flex justify-end">
                    <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 border-green-600 text-green-600 hover:bg-green-600 hover:text-white dark:border-green-500 dark:text-green-500 dark:hover:bg-green-500"
                        onClick={() =>
                            router.visit(`/admin/cms/pages/${item.id}/edit`)
                        }
                    >
                        <Edit className="h-4 w-4" />
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
            <Head title="CMS Pages" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            CMS Pages
                        </h2>
                        <p className="text-muted-foreground dark:text-zinc-400">
                            Manage your website content pages
                        </p>
                    </div>
                    <Button
                        className="gap-2"
                        onClick={() => router.visit('/admin/cms/pages/add')}
                    >
                        <Plus className="h-4 w-4" />
                        Add Page
                    </Button>
                </div>

                {/* Data Table */}
                <DataTable
                    data={pages}
                    columns={columns}
                    searchable={true}
                    searchPlaceholder="Search pages..."
                    searchKeys={['page']}
                    itemsPerPageOptions={[5, 10, 25, 50]}
                    defaultItemsPerPage={5}
                />
            </div>
        </AdminLayout>
    );
}
