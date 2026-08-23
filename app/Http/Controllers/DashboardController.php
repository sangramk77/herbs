<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $showConfetti = false;
        $confettiReason = null;

        if ($request->session()->pull('show_confetti_register')) {
            $showConfetti = true;
            $confettiReason = 'register';
        } elseif ($request->session()->pull('show_confetti_login')) {
            $showConfetti = true;
            $confettiReason = 'login';
        }

        $orders = Order::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(6);

        $orders->getCollection()->transform(function (Order $order) {
            $items = collect($order->items ?? []);
            $productIds = $items
                ->map(fn (array $item) => $item['id'] ?? $item['product_id'] ?? $item['productId'] ?? null)
                ->filter()
                ->unique()
                ->values();

            $productsById = $productIds->isNotEmpty()
                ? Product::whereIn('_id', $productIds)
                    ->get(['_id', 'name', 'primary_image'])
                    ->keyBy('_id')
                : collect();

            $mappedItems = $items->map(function (array $item) use ($productsById) {
                $productId = $item['id'] ?? $item['product_id'] ?? $item['productId'] ?? null;
                $product = $productId ? $productsById->get($productId) : null;
                $primaryImage = $product?->primary_image ?? $item['image'] ?? null;
                $imageUrl = null;

                if (is_string($primaryImage) && $primaryImage !== '') {
                    $imageUrl = str_starts_with($primaryImage, 'http')
                        || str_starts_with($primaryImage, '/')
                        ? $primaryImage
                        : asset('uploads/products/'.$primaryImage);
                }

                return [
                    'id' => $productId,
                    'name' => $product?->name ?? ($item['name'] ?? 'N/A'),
                    'quantity' => (int) ($item['quantity'] ?? 1),
                    'price' => (float) ($item['price'] ?? 0),
                    'image' => $imageUrl,
                ];
            });

            $shipping = $order->shipping_address;
            $formattedAddress = is_array($shipping)
                ? array_filter([
                    $shipping['line1'] ?? null,
                    $shipping['line2'] ?? null,
                    mb_trim(implode(' ', array_filter([
                        $shipping['city'] ?? null,
                        $shipping['state'] ?? null,
                        $shipping['postal_code'] ?? $shipping['zip'] ?? null,
                    ]))),
                    $shipping['country'] ?? null,
                ])
                : $shipping;

            return [
                'order_id' => $order->order_id,
                'status' => $order->status ?? 'Order Placed',
                'payment_method' => $order->payment_method,
                'total_price' => (float) $order->total_price,
                'customer_name' => $order->customer_name,
                'shipping_address' => $formattedAddress,
                'shipping_address_fields' => is_array($shipping) ? $shipping : null,
                'items' => $mappedItems->values(),
                'created_at' => optional($order->created_at)->toISOString(),
                'bill_url' => $order->bill_pdf_path ? asset($order->bill_pdf_path) : null,
            ];
        });

        return Inertia::render('dashboard', [
            'orders' => $orders,
            'confetti' => [
                'show' => $showConfetti,
                'reason' => $confettiReason,
            ],
        ]);
    }
}
