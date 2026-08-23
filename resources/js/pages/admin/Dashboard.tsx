import { Head } from '@inertiajs/react';
import { Banknote, CreditCard, Package, ShoppingCart } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartGrid,
    ChartLegend,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import AdminLayout from '@/layouts/AdminLayout';

interface DashboardProps {
    auth?: {
        user?: {
            name: string;
            avatar?: string;
        };
    };
    stats: {
        total_products: number;
        total_orders: number;
        total_orders_cod: number;
        total_orders_online: number;
    };
    charts: {
        orders: { day: string; orders: number; revenue: number }[];
        users: { day: string; users: number }[];
        products: { day: string; products: number }[];
    };
}

export default function Dashboard({ auth, stats, charts }: DashboardProps) {
    const statCards = [
        {
            key: 'total_products',
            title: 'Total Products',
            value: stats.total_products.toLocaleString('en-IN'),
            icon: Package,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            key: 'total_orders_today',
            title: (
                <span className="inline-flex items-center gap-2">
                    Total Orders
                    <Badge
                        variant="outline"
                        className="rounded-full border-emerald-200 bg-emerald-500/15 text-emerald-800 dark:border-emerald-500/30 dark:text-emerald-200"
                    >
                        Today
                    </Badge>
                </span>
            ),
            value: stats.total_orders.toLocaleString('en-IN'),
            icon: ShoppingCart,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            key: 'total_orders_cod_today',
            title: (
                <span className="inline-flex items-center gap-2">
                    COD
                    <Badge
                        variant="outline"
                        className="rounded-full border-amber-200 bg-amber-500/15 text-amber-900 dark:border-amber-500/30 dark:text-amber-200"
                    >
                        Today
                    </Badge>
                </span>
            ),
            value: stats.total_orders_cod.toLocaleString('en-IN'),
            icon: Banknote,
            color: 'text-amber-700',
            bgColor: 'bg-amber-100',
        },
        {
            key: 'total_orders_online_today',
            title: (
                <span className="inline-flex items-center gap-2">
                    Online
                    <Badge
                        variant="outline"
                        className="rounded-full border-fuchsia-200 bg-fuchsia-500/15 text-fuchsia-900 dark:border-fuchsia-500/30 dark:text-fuchsia-200"
                    >
                        Today
                    </Badge>
                </span>
            ),
            value: stats.total_orders_online.toLocaleString('en-IN'),
            icon: CreditCard,
            color: 'text-fuchsia-700',
            bgColor: 'bg-fuchsia-100',
        },
    ];

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Dashboard
                    </h2>
                    <p className="text-muted-foreground dark:text-zinc-400">
                        Welcome back! Here's an overview of your store.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.key}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <div
                                        className={`rounded-full p-2 ${stat.bgColor}`}
                                    >
                                        <Icon
                                            className={`h-4 w-4 ${stat.color}`}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {stat.value}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Charts */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Orders & Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                className="h-72"
                                config={{
                                    orders: { label: 'Orders' },
                                    revenue: { label: 'Revenue' },
                                }}
                            >
                                <AreaChart data={charts.orders}>
                                    <ChartGrid
                                        vertical={false}
                                        strokeDasharray="3 3"
                                    />
                                    <XAxis
                                        dataKey="day"
                                        tickLine={false}
                                        axisLine={false}
                                        interval={4}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        width={32}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <ChartLegend />
                                    <Area
                                        type="monotone"
                                        dataKey="orders"
                                        name="Orders"
                                        stroke="hsl(var(--chart-1))"
                                        fill="hsl(var(--chart-1))"
                                        fillOpacity={0.2}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Revenue"
                                        stroke="hsl(var(--chart-2))"
                                        fill="hsl(var(--chart-2))"
                                        fillOpacity={0.15}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>New Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                className="h-72"
                                config={{
                                    users: { label: 'Users' },
                                }}
                            >
                                <BarChart data={charts.users}>
                                    <ChartGrid
                                        vertical={false}
                                        strokeDasharray="3 3"
                                    />
                                    <XAxis
                                        dataKey="day"
                                        tickLine={false}
                                        axisLine={false}
                                        interval={4}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        width={32}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar
                                        dataKey="users"
                                        name="Users"
                                        fill="hsl(var(--chart-3))"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>New Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                className="h-72"
                                config={{
                                    products: { label: 'Products' },
                                }}
                            >
                                <AreaChart data={charts.products}>
                                    <ChartGrid
                                        vertical={false}
                                        strokeDasharray="3 3"
                                    />
                                    <XAxis
                                        dataKey="day"
                                        tickLine={false}
                                        axisLine={false}
                                        interval={4}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        width={32}
                                    />
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="products"
                                        name="Products"
                                        stroke="hsl(var(--chart-4))"
                                        fill="hsl(var(--chart-4))"
                                        fillOpacity={0.2}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
