<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Faq;
use App\Models\Product;
use App\Services\SettingsService;
use Inertia\Inertia;
use Inertia\Response;

final class FaqController extends Controller
{
    public function index(): Response
    {
        $faqs = Faq::visible()
            ->orderBy('created_at', 'asc')
            ->get(['_id', 'question', 'answer', 'created_at'])
            ->map(fn ($faq) => [
                '_id' => (string) $faq->_id,
                'question' => $faq->question,
                'answer' => $faq->answer,
                'created_at' => $faq->created_at,
            ]);

        $products = Product::active()
            ->orderBy('name')
            ->get(['_id', 'name', 'slug', 'primary_image'])
            ->map(fn ($product) => [
                'id' => $product->_id,
                'productsName' => $product->name,
                'seoUrl' => $product->slug,
                'image1' => $product->primary_image,
            ]);

        $wishlist = session()->get('wishlist', []);
        $wishlistCount = count($wishlist);
        $wishlistItems = [];

        if ($wishlistCount > 0) {
            $wishlistProducts = Product::active()
                ->whereIn('_id', $wishlist)
                ->get(['_id', 'name', 'slug', 'primary_image', 'sell_price', 'mrp']);

            $wishlistItems = $wishlistProducts->map(fn ($product) => [
                'id' => (string) $product->_id,
                'productsName' => $product->name,
                'seoUrl' => $product->slug,
                'image1' => $product->primary_image,
                'price' => (float) $product->sell_price,
                'mrp' => (float) ($product->mrp ?? 0),
            ])->values();
        }

        $cart = session()->get('cart', []);
        $cartCount = 0;
        $cartPrice = 0;
        foreach ($cart as $item) {
            $quantity = (int) ($item['quantity'] ?? 0);
            $price = (float) ($item['price'] ?? 0);
            $cartCount += $quantity;
            $cartPrice += $price * $quantity;
        }

        return Inertia::render('Faq', [
            'faqs' => $faqs,
            'settings' => (object) SettingsService::getSettingsData(),
            'products' => $products,
            'wishlist' => [
                'count' => $wishlistCount,
                'items' => $wishlistItems,
            ],
            'cart' => [
                'count' => $cartCount,
                'price' => $cartPrice,
                'items' => array_values($cart),
            ],
            'user' => auth()->user(),
        ]);
    }
}
