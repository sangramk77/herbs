<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\CarbonImmutable;
use Inertia\Inertia;
use Inertia\Response;

final class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(): Response
    {
        $user = auth('admin')->user();

        $todayStart = CarbonImmutable::now()->startOfDay();
        $todayEnd = CarbonImmutable::now()->endOfDay();

        // Get statistics
        $stats = [
            'total_admins' => User::admins()->count(),
            'total_products' => Product::count(),
            'total_orders' => Order::whereBetween('created_at', [$todayStart, $todayEnd])->count(),
            'total_orders_cod' => Order::whereBetween('created_at', [$todayStart, $todayEnd])
                ->whereIn('payment_method', ['cod', 'COD'])
                ->count(),
            'total_orders_online' => Order::whereBetween('created_at', [$todayStart, $todayEnd])
                ->whereIn('payment_method', ['online', 'ONLINE'])
                ->count(),
        ];

        // If super admin, show admins they created
        if ($user->isSuperAdmin()) {
            $stats['admins_created'] = $user->createdAdmins()->count();
        }

        $startDay = CarbonImmutable::now()->subDays(29)->startOfDay();
        $days = collect(range(0, 29))->map(
            fn (int $offset) => $startDay->addDays($offset)
        );

        $orders = Order::where('created_at', '>=', $startDay)
            ->get(['created_at', 'total_price']);

        $orderCounts = $orders
            ->groupBy(fn ($order) => $order->created_at?->format('Y-m-d'))
            ->map(fn ($group) => $group->count());

        $orderRevenue = $orders
            ->groupBy(fn ($order) => $order->created_at?->format('Y-m-d'))
            ->map(fn ($group) => $group->sum('total_price'));

        $ordersChart = $days->map(fn (CarbonImmutable $day) => [
            'day' => $day->format('d M'),
            'orders' => (int) ($orderCounts[$day->format('Y-m-d')] ?? 0),
            'revenue' => (float) ($orderRevenue[$day->format('Y-m-d')] ?? 0),
        ]);

        $users = User::users()
            ->where('created_at', '>=', $startDay)
            ->get(['created_at']);

        $userCounts = $users
            ->groupBy(fn ($user) => $user->created_at?->format('Y-m-d'))
            ->map(fn ($group) => $group->count());

        $usersChart = $days->map(fn (CarbonImmutable $day) => [
            'day' => $day->format('d M'),
            'users' => (int) ($userCounts[$day->format('Y-m-d')] ?? 0),
        ]);

        $products = Product::where('created_at', '>=', $startDay)
            ->get(['created_at']);

        $productCounts = $products
            ->groupBy(fn ($product) => $product->created_at?->format('Y-m-d'))
            ->map(fn ($group) => $group->count());

        $productsChart = $days->map(fn (CarbonImmutable $day) => [
            'day' => $day->format('d M'),
            'products' => (int) ($productCounts[$day->format('Y-m-d')] ?? 0),
        ]);

        return Inertia::render('admin/Dashboard', [
            'stats' => $stats,
            'charts' => [
                'orders' => $ordersChart,
                'users' => $usersChart,
                'products' => $productsChart,
            ],
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_super_admin' => $user->isSuperAdmin(),
            ],
        ]);
    }
}
