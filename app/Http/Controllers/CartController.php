<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

final class CartController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'productId' => 'required',
            'quantity' => 'required|integer|min:1',
            'measurementValue' => 'nullable|numeric',
        ]);

        $productId = (string) $request->productId;
        $quantity = (int) $request->quantity;
        $measurementValue = $request->filled('measurementValue') ? (float) $request->measurementValue : null;

        $product = Product::active()->where('_id', $productId)->first();

        if (! $product) {
            return back()->with('error', 'Product not found.');
        }

        $measurement = $this->measurementOption($product, $measurementValue);
        if ($product->measurementOptions() !== [] && $measurement === null) {
            return back()->with('error', 'Please select a valid product quantity.');
        }

        $maxOrderableQuantity = $this->getMaxOrderableQuantity($product);

        if ($maxOrderableQuantity < $quantity) {
            return back()->with('error', 'Not enough stock available.');
        }

        $cart = Session::get('cart', []);
        $categorySlug = null;
        if ($product->category_id) {
            $category = Category::active()
                ->where('_id', $product->category_id)
                ->first(['slug']);
            $categorySlug = $category?->slug;
        }

        $cartKey = $this->resolveCartKey($cart, $productId, $measurementValue) ?? ($measurementValue === null ? $productId : $productId.'::'.$measurementValue);

        if (isset($cart[$cartKey])) {
            if (($cart[$cartKey]['quantity'] + $quantity) > $maxOrderableQuantity) {
                return back()->with('error', 'Maximum stock reached.');
            }

            $cart[$cartKey]['quantity'] += $quantity;
            if (! isset($cart[$cartKey]['categorySlug']) && $categorySlug) {
                $cart[$cartKey]['categorySlug'] = $categorySlug;
            }
            if (! isset($cart[$cartKey]['categoryId']) && $product->category_id) {
                $cart[$cartKey]['categoryId'] = (string) $product->category_id;
            }
        } else {
            $cart[$cartKey] = [
                'id' => $productId,
                'name' => $product->name,
                'price' => $measurement['price'] ?? $product->sell_price,
                'quantity' => $quantity,
                'image' => $product->primary_image,
                'slug' => $product->slug,
                'categorySlug' => $categorySlug,
                'categoryId' => $product->category_id ? (string) $product->category_id : null,
                'measurement_value' => $measurement['value'] ?? null,
                'measurement_label' => $measurement['label'] ?? null,
            ];
        }

        Session::put('cart', $cart);
        Session::forget('applied_coupon');

        return back()->with('success', 'Product added to cart!');
    }

    public function update(Request $request)
    {
        $request->validate([
            'productId' => 'required',
            'action' => 'required|in:increase,decrease',
            'measurementValue' => 'nullable|numeric',
        ]);

        $productId = (string) $request->productId;
        $action = $request->action;
        $measurementValue = $request->filled('measurementValue') ? (float) $request->measurementValue : null;
        $cart = Session::get('cart', []);
        $cartKey = $this->resolveCartKey($cart, $productId, $measurementValue);

        if ($cartKey !== null && isset($cart[$cartKey])) {
            $product = Product::active()->where('_id', $productId)->first();
            $maxOrderableQuantity = $product
                ? $this->getMaxOrderableQuantity($product)
                : 0;

            if ($action === 'increase') {
                if ($product && $maxOrderableQuantity > $cart[$cartKey]['quantity']) {
                    $cart[$cartKey]['quantity'] += 1;
                } else {
                    return back()->with('error', 'Maximum stock reached.');
                }
            } elseif ($cart[$cartKey]['quantity'] > 1) {
                $cart[$cartKey]['quantity'] -= 1;
            } else {
                unset($cart[$cartKey]);
            }

            Session::put('cart', $cart);
            Session::forget('applied_coupon');

            return back()->with('success', 'Cart updated!');
        }

        return back()->with('error', 'Item not found in cart.');
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'productId' => 'required',
            'redirectWhenEmpty' => 'sometimes|boolean',
            'measurementValue' => 'nullable|numeric',
        ]);

        $productId = (string) $request->productId;
        $redirectWhenEmpty = (bool) $request->boolean('redirectWhenEmpty');
        $measurementValue = $request->filled('measurementValue') ? (float) $request->measurementValue : null;
        $cart = Session::get('cart', []);
        $cartKey = $this->resolveCartKey($cart, $productId, $measurementValue);

        if ($cartKey !== null && isset($cart[$cartKey])) {
            unset($cart[$cartKey]);
            Session::put('cart', $cart);
            Session::forget('applied_coupon');

            if ($redirectWhenEmpty && empty($cart)) {
                return redirect()->route('product.index')
                    ->with('success', 'Item removed from cart!');
            }

            return back()->with('success', 'Item removed from cart!');
        }

        return back()->with('error', 'Item not found in cart.');
    }

    /**
     * Resolve cart key while handling older sessions where key typing may differ.
     *
     * @param  array<array-key, mixed>  $cart
     */
    private function resolveCartKey(array $cart, string $productId, ?float $measurementValue = null): string|int|null
    {
        if (array_key_exists($productId, $cart)) {
            return $productId;
        }

        foreach ($cart as $key => $item) {
            if ((string) $key === $productId) {
                return $key;
            }

            if (is_array($item) && isset($item['id']) && (string) $item['id'] === $productId && ($item['measurement_value'] ?? null) === $measurementValue) {
                return $key;
            }
        }

        return null;
    }

    /** @return array{value: float, label: string, price: int}|null */
    private function measurementOption(Product $product, ?float $value): ?array
    {
        foreach ($product->measurementOptions() as $option) {
            if ($value !== null && abs($option['value'] - $value) < 0.0001) {
                return $option;
            }
        }

        return null;
    }

    private function getMaxOrderableQuantity(Product $product): int
    {
        $stock = (int) $product->stock;

        if ($stock <= 0) {
            return 0;
        }

        // Legacy admin forms store stock as a boolean (1/0). Treat 1 as "available"
        // and allow practical multi-quantity ordering from storefront.
        if ($stock === 1) {
            return 99;
        }

        return $stock;
    }
}
