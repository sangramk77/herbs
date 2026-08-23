import { Head, router } from '@inertiajs/react';
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

interface Testimonial {
    id: string;
    name: string;
    designation?: string;
    image?: string;
    status: boolean;
}

interface TestimonialProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    testimonials: Testimonial[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Testimonial({
    auth,
    testimonials = [],
    flash,
}: TestimonialProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] =
        useState<Testimonial | null>(null);

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
            `/admin/cms/testimonial/${id}/toggle-status`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Testimonial status updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update testimonial status');
                },
            },
        );
    };

    const handleDelete = (testimonial: Testimonial) => {
        setSelectedTestimonial(testimonial);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedTestimonial) return;

        router.delete(`/admin/cms/testimonial/${selectedTestimonial.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Testimonial deleted successfully');
                setDeleteDialogOpen(false);
                setSelectedTestimonial(null);
            },
            onError: () => {
                toast.error('Failed to delete testimonial');
            },
        });
    };

    const columns: DataTableColumn<Testimonial>[] = [
        {
            key: 'id',
            label: 'Sl.No',
            className: 'w-16',
            render: (_, index) => (
                <span className="font-medium">{index + 1}</span>
            ),
        },
        {
            key: 'image',
            label: 'Image',
            className: 'w-24',
            render: (testimonial) => (
                <div className="flex items-center justify-center">
                    {testimonial.image ? (
                        <img
                            src={`/uploads/testimonials/${testimonial.image}`}
                            alt={testimonial.name}
                            className="h-12 w-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-zinc-700">
                            <span className="text-xs text-gray-500 dark:text-zinc-400">
                                No Image
                            </span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            render: (testimonial) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                        {testimonial.name}
                    </div>
                    {testimonial.designation && (
                        <div className="text-sm text-gray-500 dark:text-zinc-400">
                            {testimonial.designation}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            className: 'w-24',
            render: (testimonial) => (
                <Switch
                    checked={testimonial.status}
                    onCheckedChange={() => toggleStatus(testimonial.id)}
                />
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'w-32',
            render: (testimonial) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            router.visit(
                                `/admin/cms/testimonial/${testimonial.id}/edit`,
                            )
                        }
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(testimonial)}
                    >
                        <Trash2 className="h-4 w-4 text-red-500" />
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
            <Head title="Testimonials" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Testimonials
                        </h2>
                        <p className="text-muted-foreground dark:text-zinc-400">
                            Manage customer testimonials
                        </p>
                    </div>
                    <Button
                        onClick={() =>
                            router.visit('/admin/cms/testimonial/create')
                        }
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Testimonial
                    </Button>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    data={testimonials}
                    searchable
                    searchPlaceholder="Search testimonials..."
                />
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the testimonial from "
                            {selectedTestimonial?.name}". This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
