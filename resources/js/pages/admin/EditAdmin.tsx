import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/AdminLayout';

interface Admin {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
}

interface Props {
    admin: Admin;
}

export default function EditAdmin({ admin }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: admin.name,
        email: admin.email,
        password: '',
        password_confirmation: '',
        is_active: admin.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/admin/admins/${admin.id}`);
    };

    return (
        <AdminLayout>
            <Head title="Edit Admin" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/admins">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Edit Admin
                        </h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            Update admin user details
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Admin Details</CardTitle>
                        <CardDescription>
                            Update the details for this admin user
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="John Doe"
                                />
                                <FormError message={errors.name} />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    placeholder="admin@example.com"
                                />
                                <FormError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    New Password (leave blank to keep current)
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    placeholder="••••••••"
                                />
                                <FormError message={errors.password} />
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm New Password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="••••••••"
                                />
                                <FormError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label
                                        htmlFor="is_active"
                                        className="text-base"
                                    >
                                        Active Status
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable or disable this admin account
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', checked)
                                    }
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 pt-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-orange-500 hover:bg-orange-600"
                                >
                                    {processing
                                        ? 'Updating...'
                                        : 'Update Admin'}
                                </Button>
                                <Link href="/admin/admins">
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
