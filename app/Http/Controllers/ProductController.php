<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Services\SettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

final class ProductController extends Controller
{
    public function index(): RedirectResponse
    {
        $firstCategory = Category::active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->first();

        if (! $firstCategory) {
            return redirect()->route('home');
        }

        return redirect()->route('category.show', [
            'categorySlug' => $firstCategory->slug,
        ]);
    }

    public function category(string $categorySlug): Response
    {
        $category = Category::active()->where('slug', $categorySlug)->firstOrFail();

        $products = Product::sortStorefrontCategory(
            Product::active()
                ->where('category_id', $category->_id)
                ->get(['_id', 'name', 'slug', 'primary_image', 'sell_price', 'mrp', 'discount_percentage', 'category_id', 'sort_order', 'created_at', 'updated_at'])
        )
            ->map(fn (Product $product) => [
                'id' => (string) $product->_id,
                'productsName' => $product->name,
                'seoUrl' => $product->slug,
                'image1' => $product->primary_image,
                'price' => $product->sell_price,
                'mrp' => $product->mrp,
                'discount' => $product->discount_percentage,
                'categoryId' => $product->category_id ? (string) $product->category_id : null,
                'categoryName' => $category->name,
                'categorySlug' => $category->slug,
            ])
            ->values();

        $cart = session()->get('cart', []);
        $cartCount = 0;
        $cartPrice = 0;
        foreach ($cart as $item) {
            $cartCount += $item['quantity'];
            $cartPrice += $item['price'] * $item['quantity'];
        }

        $wishlist = session()->get('wishlist', []);
        $wishlistCount = count($wishlist);
        $wishlistItems = [];

        if ($wishlistCount > 0) {
            $wishlistProducts = Product::active()
                ->whereIn('_id', $wishlist)
                ->get(['_id', 'name', 'slug', 'primary_image', 'sell_price', 'mrp', 'category_id']);

            $categories = Category::active()
                ->get(['_id', 'name', 'slug'])
                ->mapWithKeys(fn (Category $c) => [
                    (string) $c->_id => [
                        'name' => $c->name,
                        'slug' => $c->slug,
                    ],
                ]);

            $wishlistItems = $wishlistProducts->map(fn (Product $product) => [
                'id' => (string) $product->_id,
                'productsName' => $product->name,
                'seoUrl' => $product->slug,
                'image1' => $product->primary_image,
                'price' => $product->sell_price,
                'mrp' => $product->mrp,
                'categoryId' => $product->category_id ? (string) $product->category_id : null,
                'categoryName' => $product->category_id
                    ? ($categories[(string) $product->category_id]['name'] ?? null)
                    : null,
                'categorySlug' => $product->category_id
                    ? ($categories[(string) $product->category_id]['slug'] ?? null)
                    : null,
            ])->toArray();
        }

        return Inertia::render('CategoryProducts', [
            'settings' => (object) SettingsService::getSettingsData(),
            'category' => [
                'id' => (string) $category->_id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
            ],
            'products' => $products,
            'cart_count' => $cartCount,
            'cart_price' => $cartPrice,
            'cart_items' => array_values($cart),
            'wishlist_count' => $wishlistCount,
            'wishlist_items' => array_values($wishlistItems),
            'wishlist_ids' => $wishlist,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    public function popular(): Response
    {
        $products = Product::active()
            ->featured()
            ->orderBy('created_at', 'desc')
            ->get(['_id', 'name', 'slug', 'primary_image', 'sell_price', 'mrp', 'discount_percentage', 'category_id'])
            ->map(fn (Product $product) => [
                'id' => (string) $product->_id,
                'productsName' => $product->name,
                'seoUrl' => $product->slug,
                'image1' => $product->primary_image,
                'price' => $product->sell_price,
                'mrp' => $product->mrp,
                'discount' => $product->discount_percentage,
                'categoryId' => $product->category_id ? (string) $product->category_id : null,
            ])
            ->values();

        $cart = session()->get('cart', []);
        $cartCount = 0;
        $cartPrice = 0;
        foreach ($cart as $item) {
            $cartCount += $item['quantity'];
            $cartPrice += $item['price'] * $item['quantity'];
        }

        $wishlist = session()->get('wishlist', []);
        $wishlistCount = count($wishlist);
        $wishlistItems = [];

        if ($wishlistCount > 0) {
            $wishlistProducts = Product::active()
                ->whereIn('_id', $wishlist)
                ->get(['_id', 'name', 'slug', 'primary_image', 'sell_price', 'mrp', 'category_id']);

            $categories = Category::active()
                ->get(['_id', 'name', 'slug'])
                ->mapWithKeys(fn (Category $c) => [
                    (string) $c->_id => [
                        'name' => $c->name,
                        'slug' => $c->slug,
                    ],
                ]);

            $wishlistItems = $wishlistProducts->map(fn (Product $product) => [
                'id' => (string) $product->_id,
                'productsName' => $product->name,
                'seoUrl' => $product->slug,
                'image1' => $product->primary_image,
                'price' => $product->sell_price,
                'mrp' => $product->mrp,
                'categoryId' => $product->category_id ? (string) $product->category_id : null,
                'categoryName' => $product->category_id
                    ? ($categories[(string) $product->category_id]['name'] ?? null)
                    : null,
                'categorySlug' => $product->category_id
                    ? ($categories[(string) $product->category_id]['slug'] ?? null)
                    : null,
            ])->toArray();
        }

        return Inertia::render('PopularProducts', [
            'settings' => (object) SettingsService::getSettingsData(),
            'products' => $products,
            'cart_count' => $cartCount,
            'cart_price' => $cartPrice,
            'cart_items' => array_values($cart),
            'wishlist_count' => $wishlistCount,
            'wishlist_items' => array_values($wishlistItems),
            'wishlist_ids' => $wishlist,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }

    public function show(string $slug): Response|RedirectResponse
    {
        $product = Product::active()
            ->with('category')
            ->where('slug', $slug)
            ->firstOrFail();

        $categorySlug = $product->category?->slug;
        if ($categorySlug) {
            return redirect()->route('product.show.category', [
                'categorySlug' => $categorySlug,
                'slug' => $slug,
            ]);
        }

        return $this->renderProductDetail($product);
    }

    public function showByCategory(string $categorySlug, string $slug): Response|RedirectResponse
    {
        $product = Product::active()
            ->with('category')
            ->where('slug', $slug)
            ->firstOrFail();

        $actualCategorySlug = $product->category?->slug;

        if (! $actualCategorySlug) {
            return redirect()->route('product.show', [
                'slug' => $slug,
            ]);
        }

        if ($actualCategorySlug && $actualCategorySlug !== $categorySlug) {
            return redirect()->route('product.show.category', [
                'categorySlug' => $actualCategorySlug,
                'slug' => $slug,
            ]);
        }

        return $this->renderProductDetail($product);
    }

    private function renderProductDetail(Product $product): Response
    {
        $categories = Category::active()
            ->get(['_id', 'name', 'slug'])
            ->mapWithKeys(fn (Category $category) => [
                (string) $category->_id => [
                    'name' => $category->name,
                    'slug' => $category->slug,
                ],
            ]);

        $currentCategoryName = $product->category_id
            ? ($categories[(string) $product->category_id]['name'] ?? null)
            : null;
        $currentCategorySlug = $product->category_id
            ? ($categories[(string) $product->category_id]['slug'] ?? null)
            : null;

        // Related products (latest 4 from same category, excluding current)
        $relatedProducts = Product::active()
            ->where('category_id', $product->category_id)
            ->where('_id', '!=', $product->_id)
            ->orderBy('created_at', 'desc')
            ->limit(4)
            ->get()
            ->map(fn (Product $p) => [
                'id' => (string) $p->_id,
                'productsName' => $p->name,
                'seoUrl' => $p->slug,
                'image1' => $p->primary_image,
                'price' => $p->sell_price,
                'mrp' => $p->mrp,
                'discount' => $p->discount_percentage,
                'categoryId' => $p->category_id ? (string) $p->category_id : null,
                'categoryName' => $p->category_id
                    ? ($categories[(string) $p->category_id]['name'] ?? null)
                    : null,
                'categorySlug' => $p->category_id
                    ? ($categories[(string) $p->category_id]['slug'] ?? null)
                    : null,
            ]);

        $popularProducts = Product::active()
            ->featured()
            ->where('_id', '!=', $product->_id)
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get(['_id', 'name', 'slug', 'primary_image', 'sell_price', 'mrp', 'discount_percentage', 'category_id'])
            ->map(fn (Product $p) => [
                'id' => (string) $p->_id,
                'productsName' => $p->name,
                'seoUrl' => $p->slug,
                'image1' => $p->primary_image,
                'price' => $p->sell_price,
                'mrp' => $p->mrp,
                'discount' => $p->discount_percentage,
                'categoryId' => $p->category_id ? (string) $p->category_id : null,
                'categoryName' => $p->category_id
                    ? ($categories[(string) $p->category_id]['name'] ?? null)
                    : null,
                'categorySlug' => $p->category_id
                    ? ($categories[(string) $p->category_id]['slug'] ?? null)
                    : null,
            ]);

        // Featured products for sidebar
        // Featured products for sidebar
        $featuredProductsCollection = Product::active()->featured()->get();

        // Fallback to any active products if no featured ones exist
        if ($featuredProductsCollection->isEmpty()) {
            $featuredProductsCollection = Product::active()->get();
        }

        $featuredProducts = $featuredProductsCollection
            ->shuffle()
            ->take(3)
            ->map(fn (Product $p) => [
                'id' => (string) $p->_id,
                'productsName' => $p->name,
                'seoUrl' => $p->slug,
                'image1' => $p->primary_image,
                'price' => $p->sell_price,
                'mrp' => $p->mrp,
                'discount' => $p->discount_percentage,
                'categoryId' => $p->category_id ? (string) $p->category_id : null,
                'categoryName' => $p->category_id
                    ? ($categories[(string) $p->category_id]['name'] ?? null)
                    : null,
                'categorySlug' => $p->category_id
                    ? ($categories[(string) $p->category_id]['slug'] ?? null)
                    : null,
            ])
            ->values();

        // All active products for navbar (copied from HomeController logic)
        $allProducts = Product::active()
            ->orderBy('created_at', 'desc')
            ->get(['_id', 'name', 'slug', 'primary_image', 'sell_price', 'mrp', 'discount_percentage', 'category_id'])
            ->map(fn (Product $p) => [
                'id' => (string) $p->_id,
                'productsName' => $p->name,
                'seoUrl' => $p->slug,
                'image1' => $p->primary_image,
                'price' => $p->sell_price,
                'mrp' => $p->mrp,
                'discount' => $p->discount_percentage,
                'categoryId' => $p->category_id ? (string) $p->category_id : null,
                'categoryName' => $p->category_id
                    ? ($categories[(string) $p->category_id]['name'] ?? null)
                    : null,
                'categorySlug' => $p->category_id
                    ? ($categories[(string) $p->category_id]['slug'] ?? null)
                    : null,
            ]);

        // Map images array
        $images = [];

        // Add legacy image fields if they exist
        if ($product->image2) {
            $images[] = $product->image2;
        }
        if ($product->image3) {
            $images[] = $product->image3;
        }
        if ($product->image4) {
            $images[] = $product->image4;
        }

        // Add additional images from array
        if ($product->images && is_array($product->images)) {
            foreach ($product->images as $img) {
                if ($img !== $product->primary_image) {
                    $images[] = $img;
                }
            }
        }
        // Ensure unique images, remove empty values, and remove primary image from secondary list
        $images = array_filter($images, fn ($img) => $img !== $product->primary_image && ! empty($img));
        $images = array_values(array_unique($images));

        $cart = session()->get('cart', []);
        $cartCount = 0;
        $cartPrice = 0;
        foreach ($cart as $item) {
            $cartCount += $item['quantity'];
            $cartPrice += $item['price'] * $item['quantity'];
        }

        // Get wishlist data
        $wishlist = session()->get('wishlist', []);
        $wishlistCount = count($wishlist);
        $wishlistItems = [];

        if ($wishlistCount > 0) {
            $wishlistProducts = Product::active()
                ->whereIn('_id', $wishlist)
                ->get(['_id', 'name', 'slug', 'primary_image', 'sell_price', 'mrp', 'category_id']);

            $wishlistItems = $wishlistProducts->map(fn (Product $wishlistProduct) => [
                'id' => (string) $wishlistProduct->_id,
                'productsName' => $wishlistProduct->name,
                'seoUrl' => $wishlistProduct->slug,
                'image1' => $wishlistProduct->primary_image,
                'price' => $wishlistProduct->sell_price,
                'mrp' => $wishlistProduct->mrp,
                'categoryId' => $wishlistProduct->category_id
                    ? (string) $wishlistProduct->category_id
                    : null,
                'categoryName' => $wishlistProduct->category_id
                    ? ($categories[(string) $wishlistProduct->category_id]['name'] ?? null)
                    : null,
                'categorySlug' => $wishlistProduct->category_id
                    ? ($categories[(string) $wishlistProduct->category_id]['slug'] ?? null)
                    : null,
            ])->toArray();
        }

        return Inertia::render('ProductDetail', [
            'settings' => (object) SettingsService::getSettingsData(),
            'cart_count' => $cartCount,
            'cart_price' => $cartPrice,
            'cart_items' => array_values($cart),
            'wishlist_count' => $wishlistCount,
            'wishlist_items' => array_values($wishlistItems),
            'wishlist_ids' => $wishlist,
            'product_details' => [
                'id' => (string) $product->_id,
                'productsName' => $product->name,
                'seoUrl' => $product->slug,
                'image1' => $product->primary_image,
                'image1Url' => $product->primary_image ? asset('uploads/products/'.$product->primary_image) : null,
                'images' => $images,
                'price' => $product->sell_price,
                'mrp' => $product->mrp,
                'discount' => $product->discount_percentage,
                'description' => $product->description,
                'short_description' => $product->short_description,
                'metaTitle' => $product->meta_title,
                'metaDescription' => $product->meta_description,
                'metaKeyword' => $product->meta_keywords,
                'stock' => $product->stock,
                'categoryId' => $product->category_id ? (string) $product->category_id : null,
                'categoryName' => $currentCategoryName,
                'categorySlug' => $currentCategorySlug,
                'is_in_wishlist' => in_array($product->_id, session()->get('wishlist', [])),
            ],
            'related_product' => $relatedProducts,
            'popular_product' => $popularProducts,
            'featured_product' => $featuredProducts,
            'all_product' => $allProducts,
            'auth' => [
                'user' => Auth::user(),
            ],
        ]);
    }
}
