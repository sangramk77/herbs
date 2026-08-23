<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Services\SettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $orders->getCollection()->transform(function (Order $order) {
            $items = collect($order->items ?? []);
            $productIds = $items
                ->map(fn (array $item) => $item['id'] ?? $item['product_id'] ?? $item['productId'] ?? null)
                ->filter()
                ->unique()
                ->values();

            $productsById = $productIds->isNotEmpty()
                ? Product::whereIn('_id', $productIds)
                    ->get(['_id', 'name', 'primary_image', 'category_id'])
                    ->keyBy('_id')
                : collect();
            $categories = Category::active()
                ->get(['_id', 'slug'])
                ->mapWithKeys(fn (Category $category) => [
                    (string) $category->_id => $category->slug,
                ]);

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
                    'categorySlug' => $product?->category_id
                        ? ($categories[(string) $product->category_id] ?? null)
                        : ($item['categorySlug'] ?? null),
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
                'id' => (string) $order->getKey(),
                'order_id' => $order->order_id,
                'customer_name' => $order->customer_name,
                'shipping_address' => $formattedAddress,
                'shipping_address_fields' => is_array($shipping) ? $shipping : null,
                'total_price' => (float) $order->total_price,
                'status' => $order->status ?? 'Order Placed',
                'payment_method' => $order->payment_method,
                'courier_name' => $order->courier_name,
                'tracking_id' => $order->tracking_id,
                'received_by' => $order->received_by,
                'items' => $mappedItems->values(),
                'created_at' => optional($order->created_at)->toISOString(),
            ];
        });

        return Inertia::render('Orders', [
            'orders' => $orders,
        ]);
    }

    public function success(Request $request, string $orderId): Response
    {
        $order = Order::where('user_id', $request->user()->id)
            ->where('order_id', $orderId)
            ->firstOrFail();

        $items = collect($order->items ?? []);
        $productIds = $items
            ->map(fn (array $item) => $item['id'] ?? $item['product_id'] ?? $item['productId'] ?? null)
            ->filter()
            ->unique()
            ->values();

        $productsById = $productIds->isNotEmpty()
            ? Product::whereIn('_id', $productIds)
                ->get(['_id', 'name', 'primary_image', 'slug', 'category_id'])
                ->keyBy('_id')
            : collect();
        $categories = Category::active()
            ->get(['_id', 'slug'])
            ->mapWithKeys(fn (Category $category) => [
                (string) $category->_id => $category->slug,
            ]);

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
                'slug' => $product?->slug ?? ($item['slug'] ?? null),
                'categorySlug' => $product?->category_id
                    ? ($categories[(string) $product->category_id] ?? null)
                    : ($item['categorySlug'] ?? null),
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

        $wishlist = session()->get('wishlist', []);
        $wishlistCount = count($wishlist);
        $wishlistItems = [];

        if ($wishlistCount > 0) {
            $categoriesById = Category::active()
                ->get(['_id', 'name', 'slug'])
                ->mapWithKeys(fn (Category $category) => [
                    (string) $category->_id => [
                        'name' => $category->name,
                        'slug' => $category->slug,
                    ],
                ]);
            $wishlistProducts = Product::active()
                ->whereIn('_id', $wishlist)
                ->get(['_id', 'name', 'slug', 'primary_image', 'sell_price', 'mrp', 'category_id']);

            $wishlistItems = $wishlistProducts->map(fn ($product) => [
                'id' => (string) $product->_id,
                'productsName' => $product->name,
                'seoUrl' => $product->slug,
                'image1' => $product->primary_image,
                'price' => (float) $product->sell_price,
                'mrp' => (float) ($product->mrp ?? 0),
                'categoryId' => $product->category_id ? (string) $product->category_id : null,
                'categoryName' => $product->category_id
                    ? ($categoriesById[(string) $product->category_id]['name'] ?? null)
                    : null,
                'categorySlug' => $product->category_id
                    ? ($categoriesById[(string) $product->category_id]['slug'] ?? null)
                    : null,
            ])->values();
        }

        $headerCategories = Category::active()
            ->get(['_id', 'name', 'slug'])
            ->mapWithKeys(fn (Category $category) => [
                (string) $category->_id => [
                    'name' => $category->name,
                    'slug' => $category->slug,
                ],
            ]);
        $headerProducts = Product::active()
            ->orderBy('name')
            ->get(['_id', 'name', 'slug', 'primary_image', 'category_id'])
            ->map(fn ($product) => [
                'id' => $product->_id,
                'productsName' => $product->name,
                'seoUrl' => $product->slug,
                'image1' => $product->primary_image,
                'categoryId' => $product->category_id ? (string) $product->category_id : null,
                'categoryName' => $product->category_id
                    ? ($headerCategories[(string) $product->category_id]['name'] ?? null)
                    : null,
                'categorySlug' => $product->category_id
                    ? ($headerCategories[(string) $product->category_id]['slug'] ?? null)
                    : null,
            ]);
        $cart = session()->get('cart', []);
        $cartCount = 0;
        $cartPrice = 0;
        foreach ($cart as $item) {
            $quantity = (int) ($item['quantity'] ?? 0);
            $price = (float) ($item['price'] ?? 0);
            $cartCount += $quantity;
            $cartPrice += $price * $quantity;
        }

        return Inertia::render('OrderSuccess', [
            'order' => [
                'order_id' => $order->order_id,
                'status' => $order->status,
                'payment_method' => $order->payment_method,
                'total_price' => (float) $order->total_price,
                'customer_name' => $order->customer_name,
                'shipping_address' => $formattedAddress,
                'shipping_address_fields' => is_array($shipping) ? $shipping : null,
                'items' => $mappedItems->values(),
                'created_at' => optional($order->created_at)->toISOString(),
            ],
            'settings' => (object) SettingsService::getSettingsData(),
            'products' => $headerProducts,
            'wishlist' => [
                'count' => $wishlistCount,
                'items' => $wishlistItems,
            ],
            'cart' => [
                'count' => $cartCount,
                'price' => $cartPrice,
                'items' => array_values($cart),
            ],
            'user' => $request->user(),
        ]);
    }
}
