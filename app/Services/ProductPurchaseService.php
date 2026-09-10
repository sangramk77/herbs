<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Product;

/** Builds a server-authoritative purchase snapshot for Herbs' measurement-based products. */
final class ProductPurchaseService
{
    /**
     * @param  array<int|string, array<string, mixed>>  $cart
     * @return array{items: array<int, array<string, mixed>>, cart: array<string, array<string, mixed>>, inventory: array<int, array{product_id: string, quantity: int}>}
     */
    public function revalidateCart(array $cart): array
    {
        if ($cart === []) {
            throw new PurchaseUnavailableException('Your cart is empty.');
        }

        $productIds = collect($cart)->pluck('id')->filter()->map(strval(...))->unique()->values();
        $products = Product::active()->whereIn('_id', $productIds)->get()->keyBy(fn (Product $product) => (string) $product->getKey());
        $items = [];
        $normalizedCart = [];
        $inventory = [];

        foreach ($cart as $cartItem) {
            $productId = (string) ($cartItem['id'] ?? '');
            $quantity = (int) ($cartItem['quantity'] ?? 0);
            $product = $products->get($productId);
            if (! $product || $quantity < 1) {
                throw new PurchaseUnavailableException('One or more products are no longer available.');
            }

            $measurementValue = isset($cartItem['measurement_value']) ? (float) $cartItem['measurement_value'] : null;
            $measurement = $this->measurementOption($product, $measurementValue);
            if ($product->measurementOptions() !== [] && $measurement === null) {
                throw new PurchaseUnavailableException("The selected quantity for {$product->name} is no longer available.");
            }

            // A legacy stock value of 1 denotes availability rather than one physical unit.
            $availableStock = (int) $product->stock;
            if ($availableStock <= 0 || ($availableStock > 1 && $availableStock < $quantity)) {
                throw new PurchaseUnavailableException("{$product->name} is out of stock or has insufficient quantity.");
            }

            $price = (float) ($measurement['price'] ?? $product->sell_price);
            $mrp = isset($measurement['mrp']) ? (float) $measurement['mrp'] : ($product->mrp ? (float) $product->mrp : null);
            $item = [
                'id' => $productId,
                'product_id' => $productId,
                'name' => $product->name,
                'price' => $price,
                'mrp' => $mrp,
                'quantity' => $quantity,
                'image' => $product->primary_image,
                'slug' => $product->slug,
                'category_id' => $product->category_id ? (string) $product->category_id : null,
                'categorySlug' => $cartItem['categorySlug'] ?? null,
                'measurement_value' => $measurement['value'] ?? null,
                'measurement_label' => $measurement['label'] ?? null,
            ];
            $items[] = $item;
            $key = $measurementValue === null ? $productId : $productId.'::'.$measurementValue;
            $normalizedCart[$key] = $item;

            if ($availableStock > 1) {
                $inventory[$productId] ??= ['product_id' => $productId, 'quantity' => 0];
                $inventory[$productId]['quantity'] += $quantity;
            }
        }

        foreach ($inventory as $requirement) {
            if ((int) $products->get($requirement['product_id'])->stock < $requirement['quantity']) {
                throw new PurchaseUnavailableException('One or more selected products no longer have enough stock.');
            }
        }

        return ['items' => $items, 'cart' => $normalizedCart, 'inventory' => array_values($inventory)];
    }

    /** @param array<int, array{product_id: string, quantity: int}> $inventory */
    public function decrementInventory(array $inventory): void
    {
        $decremented = [];
        foreach ($inventory as $requirement) {
            $updated = Product::active()->whereKey($requirement['product_id'])->where('stock', '>=', $requirement['quantity'])->update(['$inc' => ['stock' => -$requirement['quantity']]]);
            if ($updated === 1) {
                $decremented[] = $requirement;

                continue;
            }
            foreach ($decremented as $completed) {
                $this->restoreInventory($completed['product_id'], $completed['quantity']);
            }
            throw new PurchaseUnavailableException('One or more selected products just sold out. Please review your cart and try again.');
        }
    }

    public function restoreInventory(string $productId, int $quantity): void
    {
        Product::query()->whereKey($productId)->update(['$inc' => ['stock' => $quantity]]);
    }

    /** @return array<string, mixed>|null */
    private function measurementOption(Product $product, ?float $value): ?array
    {
        foreach ($product->measurementOptions() as $option) {
            if ($value !== null && abs((float) $option['value'] - $value) < 0.0001) {
                return $option;
            }
        }

        return null;
    }
}
