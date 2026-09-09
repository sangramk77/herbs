import { Head, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/AdminLayout';

type Unit = {
    id: string;
    name: string;
    symbol: string;
    status: 'active' | 'inactive';
    sort_order: number;
};
type UnitsProps = {
    units: { data: Unit[] };
    auth?: { user?: { name: string; avatar?: string } };
};
type UnitForm = {
    name: string;
    symbol: string;
    status: 'active' | 'inactive';
    sort_order: string;
};

const emptyForm: UnitForm = {
    name: '',
    symbol: '',
    status: 'active',
    sort_order: '0',
};

export default function Units({ units, auth }: UnitsProps) {
    const [form, setForm] = useState<UnitForm>(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);

    const save = () => {
        const data = { ...form, sort_order: Number(form.sort_order || 0) };
        const options = {
            onSuccess: () => {
                toast.success(
                    editingId
                        ? 'Unit updated successfully'
                        : 'Unit created successfully',
                );
                setForm(emptyForm);
                setEditingId(null);
            },
            onError: () => toast.error('Please check the unit details.'),
        };

        if (editingId) router.put(`/admin/units/${editingId}`, data, options);
        else router.post('/admin/units', data, options);
    };

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="Units" />
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold">Units</h1>
                    <p className="text-muted-foreground">
                        Manage the weight and volume units available in product
                        forms.
                    </p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {editingId ? 'Edit unit' : 'Add unit'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="unit-name">Name</Label>
                            <Input
                                id="unit-name"
                                value={form.name}
                                placeholder="Millilitre"
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        name: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="unit-symbol">Symbol</Label>
                            <Input
                                id="unit-symbol"
                                value={form.symbol}
                                placeholder="ml"
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        symbol: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>Status</Label>
                            <Select
                                value={form.status}
                                onValueChange={(status: UnitForm['status']) =>
                                    setForm({ ...form, status })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Inactive
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="unit-order">Sort order</Label>
                            <Input
                                id="unit-order"
                                type="number"
                                min="0"
                                value={form.sort_order}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        sort_order: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex gap-2 md:col-span-4">
                            <Button onClick={save}>
                                <Plus data-icon="inline-start" />
                                {editingId ? 'Save unit' : 'Create unit'}
                            </Button>
                            {editingId && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setForm(emptyForm);
                                        setEditingId(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Symbol</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Order</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {units.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center text-muted-foreground"
                                        >
                                            No units created yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    units.data.map((unit) => (
                                        <TableRow key={unit.id}>
                                            <TableCell className="font-medium">
                                                {unit.name}
                                            </TableCell>
                                            <TableCell>{unit.symbol}</TableCell>
                                            <TableCell className="capitalize">
                                                {unit.status}
                                            </TableCell>
                                            <TableCell>
                                                {unit.sort_order}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => {
                                                            setEditingId(
                                                                unit.id,
                                                            );
                                                            setForm({
                                                                name: unit.name,
                                                                symbol: unit.symbol,
                                                                status: unit.status,
                                                                sort_order:
                                                                    String(
                                                                        unit.sort_order,
                                                                    ),
                                                            });
                                                        }}
                                                        aria-label={`Edit ${unit.name}`}
                                                    >
                                                        <Pencil />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            router.delete(
                                                                `/admin/units/${unit.id}`,
                                                                {
                                                                    onSuccess:
                                                                        () =>
                                                                            toast.success(
                                                                                'Unit deleted successfully',
                                                                            ),
                                                                    onError:
                                                                        () =>
                                                                            toast.error(
                                                                                'This unit is still in use.',
                                                                            ),
                                                                },
                                                            )
                                                        }
                                                        aria-label={`Delete ${unit.name}`}
                                                    >
                                                        <Trash2 className="text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
