import { Head, Link, router } from '@inertiajs/react';
import { Edit, Plus, Power, PowerOff, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/AdminLayout';

interface Admin {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
    created_by: {
        name: string;
        email: string;
    } | null;
}

interface Props {
    admins: Admin[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function AdminManagement({ admins, flash }: Props) {
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleDelete = (id: string) => {
        router.delete(`/admin/admins/${id}`, {
            onSuccess: () => setDeleteId(null),
        });
    };

    const handleToggleStatus = (id: string) => {
        router.post(`/admin/admins/${id}/toggle-status`);
    };

    return (
        <AdminLayout>
            <Head title="Admin Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Admin Management
                        </h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            Manage admin users and their permissions
                        </p>
                    </div>
                    <Link href="/admin/admins/create">
                        <Button className="bg-orange-500 hover:bg-orange-600">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Admin
                        </Button>
                    </Link>
                </div>

                {/* Admins Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Admin Users</CardTitle>
                        <CardDescription>
                            List of all admin users in the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead>Created By</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {admins.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="py-8 text-center text-slate-500"
                                            >
                                                No admins found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        admins.map((admin) => (
                                            <TableRow key={admin.id}>
                                                <TableCell className="font-medium">
                                                    {admin.name}
                                                </TableCell>
                                                <TableCell>
                                                    {admin.email}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            admin.is_active
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className={
                                                            admin.is_active
                                                                ? 'bg-green-500 hover:bg-green-600'
                                                                : 'bg-slate-500 hover:bg-slate-600'
                                                        }
                                                    >
                                                        {admin.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {admin.last_login_at ||
                                                        'Never'}
                                                </TableCell>
                                                <TableCell>
                                                    {admin.created_by ? (
                                                        <div className="text-sm">
                                                            <div className="font-medium">
                                                                {
                                                                    admin
                                                                        .created_by
                                                                        .name
                                                                }
                                                            </div>
                                                            <div className="text-slate-500">
                                                                {
                                                                    admin
                                                                        .created_by
                                                                        .email
                                                                }
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-500">
                                                            System
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {admin.created_at}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleToggleStatus(
                                                                    admin.id,
                                                                )
                                                            }
                                                            title={
                                                                admin.is_active
                                                                    ? 'Deactivate'
                                                                    : 'Activate'
                                                            }
                                                        >
                                                            {admin.is_active ? (
                                                                <PowerOff className="h-4 w-4 text-slate-600" />
                                                            ) : (
                                                                <Power className="h-4 w-4 text-green-600" />
                                                            )}
                                                        </Button>
                                                        <Link
                                                            href={`/admin/admins/${admin.id}/edit`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                            >
                                                                <Edit className="h-4 w-4 text-blue-600" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                setDeleteId(
                                                                    admin.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open: boolean) => !open && setDeleteId(null)}
                onConfirm={() => deleteId && handleDelete(deleteId)}
                title="Delete Admin"
                description="Are you sure you want to delete this admin? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </AdminLayout>
    );
}
