import { Head } from '@inertiajs/react';

import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
import AdminLayout from '@/layouts/AdminLayout';

interface Customer {
    id: string;
    name: string;
    email: string;
    registeredAt?: string | null;
}

interface CustomersProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    customers?: Customer[];
}

export default function Customers({ auth, customers = [] }: CustomersProps) {
    // Sample data for demonstration
    const customerList: Customer[] = customers;

    const formatDate = (value?: string | null) => {
        if (!value) return '—';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleDateString('en-GB');
    };

    const formatTime = (value?: string | null) => {
        if (!value) return '—';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const columns: DataTableColumn<Customer>[] = [
        {
            key: 'id',
            label: 'Sl.No',
            className: 'w-16',
            render: (_, index) => (
                <span className="font-medium">{index + 1}</span>
            ),
        },
        {
            key: 'name',
            label: 'Name',
            render: (item) => <span>{item.name}</span>,
        },
        {
            key: 'email',
            label: 'Email',
            className: 'max-w-md',
            render: (item) => (
                <span className="text-gray-600 dark:text-zinc-400">
                    {item.email}
                </span>
            ),
        },
        {
            key: 'registeredAt',
            label: 'Registered On',
            render: (item) => (
                <span className="text-gray-700 dark:text-zinc-300">
                    {formatDate(item.registeredAt)}
                </span>
            ),
        },
        {
            key: 'registeredTime',
            label: 'Time',
            render: (item) => (
                <span className="text-gray-600 dark:text-zinc-400">
                    {formatTime(item.registeredAt)}
                </span>
            ),
        },
    ];

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="Customers" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Customers
                        </h2>
                        <p className="text-muted-foreground dark:text-zinc-400">
                            Manage registered users
                        </p>
                    </div>
                </div>

                {/* Data Table */}
                <DataTable
                    data={customerList}
                    columns={columns}
                    searchable={true}
                    searchPlaceholder="Search customers..."
                    searchKeys={['name', 'email']}
                    itemsPerPageOptions={[5, 10, 25, 50]}
                    defaultItemsPerPage={50}
                />
            </div>
        </AdminLayout>
    );
}
