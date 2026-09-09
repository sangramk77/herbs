import { Head } from '@inertiajs/react';
import { Banknote, CreditCard, Package, ShoppingCart } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis } from 'recharts';

import LoginGreetingToast from '@/components/LoginGreetingToast';
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
    flash?: {
        login_greeting?: boolean;
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

export default function Dashboard({
    auth,
    flash,
    stats,
    charts,
}: DashboardProps) {
    const statCards = [
        {
            key: 'total_products',
            title: 'Total Products',
            value: stats.total_products.toLocaleString('en-IN'),
            icon: Package,
            glassTint:
                'from-blue-400/20 via-sky-200/10 to-indigo-400/20 dark:from-blue-400/25 dark:via-sky-300/10 dark:to-indigo-400/25',
            iconHover:
                'group-hover:bg-blue-500/15 group-hover:text-blue-600 dark:group-hover:text-blue-300',
        },
        {
            key: 'total_orders_today',
            title: 'Total Orders',
            badge: 'Today',
            value: stats.total_orders.toLocaleString('en-IN'),
            icon: ShoppingCart,
            glassTint:
                'from-emerald-400/20 via-teal-200/10 to-lime-400/20 dark:from-emerald-400/25 dark:via-teal-300/10 dark:to-lime-400/25',
            iconHover:
                'group-hover:bg-emerald-500/15 group-hover:text-emerald-600 dark:group-hover:text-emerald-300',
            badgeHover:
                'group-hover:border-emerald-400/40 group-hover:bg-emerald-500/10 group-hover:text-emerald-700 dark:group-hover:text-emerald-300',
        },
        {
            key: 'total_orders_cod_today',
            title: 'COD',
            badge: 'Today',
            value: stats.total_orders_cod.toLocaleString('en-IN'),
            icon: Banknote,
            glassTint:
                'from-amber-300/25 via-orange-200/10 to-yellow-400/20 dark:from-amber-300/25 dark:via-orange-300/10 dark:to-yellow-400/20',
            iconHover:
                'group-hover:bg-amber-500/15 group-hover:text-amber-700 dark:group-hover:text-amber-300',
            badgeHover:
                'group-hover:border-amber-400/40 group-hover:bg-amber-500/10 group-hover:text-amber-800 dark:group-hover:text-amber-300',
        },
        {
            key: 'total_orders_online_today',
            title: 'Online',
            badge: 'Today',
            value: stats.total_orders_online.toLocaleString('en-IN'),
            icon: CreditCard,
            glassTint:
                'from-fuchsia-400/20 via-violet-200/10 to-pink-400/20 dark:from-fuchsia-400/25 dark:via-violet-300/10 dark:to-pink-400/25',
            iconHover:
                'group-hover:bg-fuchsia-500/15 group-hover:text-fuchsia-700 dark:group-hover:text-fuchsia-300',
            badgeHover:
                'group-hover:border-fuchsia-400/40 group-hover:bg-fuchsia-500/10 group-hover:text-fuchsia-800 dark:group-hover:text-fuchsia-300',
        },
    ];

    return (
        <AdminLayout
            userName={auth?.user?.name}
            userAvatar={auth?.user?.avatar}
        >
            <Head title="Admin Dashboard" />
            <LoginGreetingToast
                show={Boolean(flash?.login_greeting)}
                name={auth?.user?.name}
            />

            <div className="relative isolate -m-6 min-h-[calc(100%+3rem)] overflow-hidden p-6">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-linear-to-br from-sky-100/70 via-white/50 to-violet-100/60 backdrop-blur-sm dark:from-sky-950/30 dark:via-zinc-950/50 dark:to-violet-950/30"
                />
                <div
                    aria-hidden="true"
                    className="dashboard-glass-shimmer pointer-events-none absolute"
                />
                <div className="relative z-10 space-y-6">
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
                                <Card
                                    key={stat.key}
                                    className="group relative overflow-hidden bg-card/85 backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl"
                                >
                                    <div
                                        aria-hidden="true"
                                        className={`pointer-events-none absolute inset-0 bg-linear-to-br opacity-0 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-100 dark:mix-blend-screen ${stat.glassTint}`}
                                    />
                                    <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="inline-flex items-center gap-2 text-sm font-medium">
                                            {stat.title}
                                            {stat.badge && (
                                                <Badge
                                                    variant="outline"
                                                    className={`rounded-full border-border/70 bg-background/50 text-muted-foreground transition-colors duration-300 ${stat.badgeHover ?? ''}`}
                                                >
                                                    {stat.badge}
                                                </Badge>
                                            )}
                                        </CardTitle>
                                        <div
                                            className={`rounded-full bg-muted p-2 text-muted-foreground transition-colors duration-300 ${stat.iconHover}`}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="relative z-10">
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
            </div>
        </AdminLayout>
    );
}
