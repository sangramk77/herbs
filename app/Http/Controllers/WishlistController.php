<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

final class WishlistController extends Controller
{
    public function index(): Response
    {
        $wishlist = Session::get('wishlist', []);
        $categories = Category::active()
            ->get(['_id', 'slug'])
            ->mapWithKeys(fn (Category $category) => [
                (string) $category->_id => $category->slug,
            ]);

        $products = empty($wishlist)
            ? collect()
            : Product::active()
                ->whereIn('_id', $wishlist)
                ->get(['_id', 'name', 'slug', 'primary_image', 'sell_price', 'mrp', 'category_id'])
                ->keyBy('_id');

        $items = collect($wishlist)
            ->map(function (string $productId) use ($products) {
                $product = $products->get($productId);

                if (! $product) {
                    return null;
                }

                return [
                    'id' => (string) $product->_id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'categorySlug' => $product->category_id
                        ? ($categories[(string) $product->category_id] ?? null)
                        : null,
                    'image' => $product->primary_image
                        ? asset('uploads/products/'.$product->primary_image)
                        : null,
                    'price' => (float) $product->sell_price,
                    'mrp' => (float) ($product->mrp ?? 0),
                ];
            })
            ->filter()
            ->values();

        return Inertia::render('Wishlist', [
            'items' => $items,
            'count' => $items->count(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'productId' => 'required',
        ]);

        $productId = $request->productId;

        $product = Product::active()->where('_id', $productId)->first();

        if (! $product) {
            return back()->with('error', 'Product not found.');
        }

        // For now, using session-based wishlist if guest, or DB if authenticated
        // But the user request implies a simple addition for now.
        $wishlist = Session::get('wishlist', []);
        $index = array_search($productId, $wishlist);

        if ($index === false) {
            $wishlist[] = $productId;
            Session::put('wishlist', $wishlist);

            return back()->with('success', 'Product added to wishlist!');
        }
        unset($wishlist[$index]);
        Session::put('wishlist', array_values($wishlist));

        return back()->with('success', 'Product removed from wishlist!');
    }
}
