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

interface FAQ {
    id: number;
    question: string;
    answer: string;
    is_visible: boolean;
    sort_order?: number;
}

interface FAQProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    faqs: FAQ[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function FAQ({ auth, faqs = [], flash }: FAQProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);

    // Show flash messages as toasts
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const toggleVisibility = (id: number) => {
        router.post(
            `/admin/cms/faq/${id}/toggle-visibility`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('FAQ visibility updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update FAQ visibility');
                },
            },
        );
    };

    const handleDelete = (faq: FAQ) => {
        setSelectedFaq(faq);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedFaq) return;

        router.delete(`/admin/cms/faq/${selectedFaq.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('FAQ deleted successfully');
                setDeleteDialogOpen(false);
                setSelectedFaq(null);
            },
            onError: () => {
                toast.error('Failed to delete FAQ');
            },
        });
    };

    const columns: DataTableColumn<FAQ>[] = [
        {
            key: 'id',
            label: 'Sl.No',
            className: 'w-16',
            render: (_, index) => (
                <span className="font-medium">{index + 1}</span>
            ),
        },
        {
            key: 'question',
            label: 'Question',
            className: 'max-w-xs',
            render: (item) => <span>{item.question}</span>,
        },
        {
            key: 'answer',
            label: 'Answer',
            className: 'max-w-md',
            render: (item) => (
                <span className="line-clamp-2">{item.answer}</span>
            ),
        },
        {
            key: 'is_visible',
            label: 'Visible',
            render: (item) => (
                <Switch
                    checked={item.is_visible}
                    onCheckedChange={() => toggleVisibility(item.id)}
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
                            router.visit(`/admin/cms/faq/${item.id}/edit`)
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
            <Head title="CMS FAQ" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            CMS FAQ
                        </h2>
                        <p className="text-muted-foreground dark:text-zinc-400">
                            Manage frequently asked questions
                        </p>
                    </div>
                    <Button
                        className="gap-2"
                        onClick={() => router.visit('/admin/cms/faq/create')}
                    >
                        <Plus className="h-4 w-4" />
                        Add FAQ
                    </Button>
                </div>

                {/* Data Table */}
                <DataTable
                    data={faqs}
                    columns={columns}
                    searchable={true}
                    searchPlaceholder="Search FAQs..."
                    searchKeys={['question', 'answer']}
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
                            Delete FAQ
                        </AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-zinc-400">
                            Are you sure you want to delete the FAQ "
                            {selectedFaq?.question}"? This action cannot be
                            undone.
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
