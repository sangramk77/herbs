import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowLeft,
    CalendarIcon,
    Check,
    ChevronsUpDown,
    RefreshCcw,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/AdminLayout';
import { cn } from '@/lib/utils';

interface Option {
    id: string;
    name: string;
}

interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    applies_to: 'entire_store' | 'category' | 'product';
    category_id: string | null;
    product_id: string | null;
    is_active: boolean;
    usage_limit: number | null;
    usage_per_user: number | null;
    expires_at: string | null;
}

interface EditCouponProps {
    coupon: Coupon;
    categories: Option[];
    products: Option[];
    auth?: {
        user?: {
            name: string;
        };
    };
    errors?: Record<string, string>;
}

type DiscountType = 'percentage' | 'fixed';
type AppliesTo = 'entire_store' | 'category' | 'product';

export default function EditCoupon({
    coupon,
    categories,
    products,
    auth,
    errors = {},
}: EditCouponProps) {
    const [productOpen, setProductOpen] = useState(false);
    const [form, setForm] = useState({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: String(coupon.discount_value),
        applies_to: coupon.applies_to,
        category_id: coupon.category_id ?? '',
        product_id: coupon.product_id ?? '',
        is_active: coupon.is_active,
        usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
        usage_per_user: coupon.usage_per_user
            ? String(coupon.usage_per_user)
            : '',
        expires_at: coupon.expires_at ?? '',
    });

    const formErrors = useMemo(() => errors ?? {}, [errors]);

    const generateCode = () => {
        const value = `NR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        setForm((prev) => ({ ...prev, code: value }));
    };

    const submit = () => {
        router.put(`/admin/coupons/${coupon.id}`, form, {
            onSuccess: () => toast.success('Coupon updated successfully'),
            onError: () => toast.error('Failed to update coupon'),
        });
    };

    return (
        <AdminLayout userName={auth?.user?.name}>
            <Head title="Edit Coupon" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.visit('/admin/coupons')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Edit Coupon
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Update coupon rules and discount configuration
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border bg-white p-6 dark:bg-zinc-900">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Coupon Code</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={form.code}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            code: e.target.value.toUpperCase(),
                                        }))
                                    }
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={generateCode}
                                >
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    Auto
                                </Button>
                            </div>
                            {formErrors.code && (
                                <p className="text-sm text-red-500">{formErrors.code}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Discount Type</Label>
                            <Select
                                value={form.discount_type}
                                onValueChange={(value) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        discount_type: value as DiscountType,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="fixed">Fixed amount</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Discount Value</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.discount_value}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        discount_value: e.target.value,
                                    }))
                                }
                            />
                            {formErrors.discount_value && (
                                <p className="text-sm text-red-500">
                                    {formErrors.discount_value}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Apply Coupon On</Label>
                            <Select
                                value={form.applies_to}
                                onValueChange={(value) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        applies_to: value as AppliesTo,
                                        category_id:
                                            value === 'category'
                                                ? prev.category_id
                                                : '',
                                        product_id:
                                            value === 'product' ? prev.product_id : '',
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="entire_store">
                                        Entire Store
                                    </SelectItem>
                                    <SelectItem value="category">Category</SelectItem>
                                    <SelectItem value="product">Product</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {form.applies_to === 'category' && (
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select
                                    value={form.category_id}
                                    onValueChange={(value) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            category_id: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formErrors.category_id && (
                                    <p className="text-sm text-red-500">
                                        {formErrors.category_id}
                                    </p>
                                )}
                            </div>
                        )}

                        {form.applies_to === 'product' && (
                            <div className="space-y-2">
                                <Label>Product</Label>
                                <Popover
                                    open={productOpen}
                                    onOpenChange={setProductOpen}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={productOpen}
                                            className="w-full justify-between"
                                        >
                                            {form.product_id
                                                ? products.find(
                                                      (product) =>
                                                          product.id ===
                                                          form.product_id,
                                                  )?.name
                                                : 'Select product'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        side="bottom"
                                        align="start"
                                        sideOffset={8}
                                        className="w-[--radix-popover-trigger-width] p-0"
                                    >
                                        <Command>
                                            <CommandInput placeholder="Search product..." />
                                            <CommandList>
                                                <CommandEmpty>
                                                    No product found.
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {products.map((product) => (
                                                        <CommandItem
                                                            key={product.id}
                                                            value={`${product.name} ${product.id}`}
                                                            onSelect={() => {
                                                                setForm(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        product_id:
                                                                            product.id,
                                                                    }),
                                                                );
                                                                setProductOpen(
                                                                    false,
                                                                );
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-4 w-4',
                                                                    form.product_id ===
                                                                        product.id
                                                                        ? 'opacity-100'
                                                                        : 'opacity-0',
                                                                )}
                                                            />
                                                            {product.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {formErrors.product_id && (
                                    <p className="text-sm text-red-500">
                                        {formErrors.product_id}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Expiry Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !form.expires_at &&
                                                'text-muted-foreground',
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {form.expires_at ? (
                                            format(
                                                new Date(
                                                    `${form.expires_at}T00:00:00`,
                                                ),
                                                'dd-MM-yyyy',
                                            )
                                        ) : (
                                            <span>Pick expiry date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={
                                            form.expires_at
                                                ? new Date(
                                                      `${form.expires_at}T00:00:00`,
                                                  )
                                                : undefined
                                        }
                                        onSelect={(date) => {
                                            if (date) {
                                                const year =
                                                    date.getFullYear();
                                                const month = String(
                                                    date.getMonth() + 1,
                                                ).padStart(2, '0');
                                                const day = String(
                                                    date.getDate(),
                                                ).padStart(2, '0');
                                                setForm((prev) => ({
                                                    ...prev,
                                                    expires_at: `${year}-${month}-${day}`,
                                                }));
                                            } else {
                                                setForm((prev) => ({
                                                    ...prev,
                                                    expires_at: '',
                                                }));
                                            }
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>Total Usage Limit</Label>
                            <Input
                                type="number"
                                min="1"
                                value={form.usage_limit}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        usage_limit: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Per User Usage Limit</Label>
                            <Input
                                type="number"
                                min="1"
                                value={form.usage_per_user}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        usage_per_user: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="block">Status</Label>
                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={form.is_active}
                                    onCheckedChange={(checked) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            is_active: checked,
                                        }))
                                    }
                                />
                                <span className="text-sm text-muted-foreground">
                                    {form.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/admin/coupons')}
                        >
                            Cancel
                        </Button>
                        <Button type="button" onClick={submit}>
                            Update Coupon
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
