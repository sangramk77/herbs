import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { useState } from 'react';

import { DataTable, DataTableColumn } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AdminLayout from '@/layouts/AdminLayout';

interface ContactSubmission {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
    createdAt: string | null;
}

interface ContactSubmissionsProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    submissions: ContactSubmission[];
}

export default function ContactSubmissions({
    auth,
    submissions,
}: ContactSubmissionsProps) {
    const [selected, setSelected] = useState<ContactSubmission | null>(null);

    const columns: DataTableColumn<ContactSubmission>[] = [
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
            render: (item) => (
                <span className="font-medium">
                    {item.firstName} {item.lastName}
                </span>
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
            key: 'phone',
            label: 'Phone',
            render: (item) => (
                <span className="text-sm text-gray-600 dark:text-zinc-400">
                    {item.phone}
                </span>
            ),
        },
        {
            key: 'message',
            label: 'Message',
            render: (item) => (
                <span className="line-clamp-2 text-sm text-gray-600 dark:text-zinc-400">
                    {item.message}
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
                    className="gap-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                    onClick={() => setSelected(item)}
                >
                    <Eye className="h-4 w-4" />
                    View
                </Button>
            ),
        },
    ];

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="Contact Submissions" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Contact Submissions
                    </h2>
                    <p className="text-muted-foreground dark:text-zinc-400">
                        Messages submitted from the contact form.
                    </p>
                </div>

                <DataTable
                    data={submissions}
                    columns={columns}
                    searchable={true}
                    searchPlaceholder="Search submissions..."
                    searchKeys={['firstName', 'lastName', 'email', 'phone']}
                    itemsPerPageOptions={[10, 25, 50]}
                    defaultItemsPerPage={10}
                />
            </div>

            <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
                <DialogContent className="max-w-xl dark:border-zinc-800 dark:bg-black">
                    <DialogHeader>
                        <DialogTitle className="text-2xl dark:text-white">
                            Contact Message
                        </DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4 text-sm text-gray-600 dark:text-zinc-400">
                            <div>
                                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                    Name
                                </p>
                                <p className="text-base font-semibold text-gray-900 dark:text-zinc-100">
                                    {selected.firstName} {selected.lastName}
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                        Email
                                    </p>
                                    <p>{selected.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                        Phone
                                    </p>
                                    <p>{selected.phone}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                    Message
                                </p>
                                <p className="whitespace-pre-line">
                                    {selected.message}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
