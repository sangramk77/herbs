<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\CmsPage;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Middleware;

final class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Keep storefront/user auth and admin auth isolated by route context.
        $isAdminRoute = $request->is('admin') || $request->is('admin/*');
        $user = $isAdminRoute ? $request->user('admin') : $request->user();
        $cart = $request->session()->get('cart', []);
        $wishlist = $request->session()->get('wishlist', []);
        $cartCount = 0;
        $cartPrice = 0;

        foreach ($cart as $item) {
            $quantity = (int) ($item['quantity'] ?? 0);
            $price = (float) ($item['price'] ?? 0);

            $cartCount += $quantity;
            $cartPrice += $price * $quantity;
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'flash' => [
                'login_greeting' => fn () => $request->session()->pull('login_greeting'),
            ],
            'auth' => [
                'user' => $user ? [
                    '_id' => $user->_id,
                    'name' => $user->name,
                    'email' => $user->email,
                    // `avatar` is used as an image URL across the frontend.
                    'avatar' => $user->avatar_url,
                    'avatar_url' => $user->avatar_url,
                    'role' => $user->role,
                    'last_login_at' => $user->last_login_at?->toISOString(),
                ] : null,
            ],
            'cart' => [
                'count' => $cartCount,
                'price' => $cartPrice,
                'items' => array_values($cart),
            ],
            'wishlist' => [
                'count' => count($wishlist),
                'items' => array_values($wishlist),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'cmsPages' => CmsPage::active()
                ->where('show_in_navbar', true)
                ->orderBy('page_name')
                ->get(['page_name', 'seo_url'])
                ->map(fn (CmsPage $page) => [
                    'pageName' => $page->page_name,
                    'seoUrl' => $page->seo_url,
                ])
                ->values(),
            'footerPages' => CmsPage::active()
                ->where('show_in_footer', true)
                ->orderBy('page_name')
                ->get(['page_name', 'seo_url'])
                ->map(fn (CmsPage $page) => [
                    'pageName' => $page->page_name,
                    'seoUrl' => $page->seo_url,
                ])
                ->values(),
            'navCategories' => Category::active()
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['_id', 'name', 'slug'])
                ->map(fn (Category $category) => [
                    'id' => (string) $category->_id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                ])
                ->values(),
            'navProducts' => (function () {
                $categories = Category::active()
                    ->get(['_id', 'name', 'slug'])
                    ->mapWithKeys(fn (Category $category) => [
                        (string) $category->_id => [
                            'name' => $category->name,
                            'slug' => $category->slug,
                        ],
                    ]);

                return Product::sortStorefrontByCategory(
                    Product::active()
                        ->orderBy('category_id')
                        ->get([
                            '_id',
                            'name',
                            'slug',
                            'primary_image',
                            'sell_price',
                            'mrp',
                            'discount_percentage',
                            'category_id',
                            'sort_order',
                            'created_at',
                            'updated_at',
                        ])
                )
                    ->map(fn (Product $product) => [
                        'id' => (string) $product->_id,
                        'productsName' => $product->name,
                        'seoUrl' => $product->slug,
                        'image1' => $product->primary_image,
                        'price' => $product->sell_price,
                        'mrp' => $product->mrp,
                        'discount' => $product->discount_percentage,
                        'categoryId' => $product->category_id
                            ? (string) $product->category_id
                            : null,
                        'categoryName' => $product->category_id
                            ? ($categories[(string) $product->category_id]['name'] ?? null)
                            : null,
                        'categorySlug' => $product->category_id
                            ? ($categories[(string) $product->category_id]['slug'] ?? null)
                            : null,
                    ])
                    ->values();
            })(),
            // Global statistics for admin sidebar badges
            'productCount' => Product::count(),
            'categoryCount' => Category::count(),
        ];
    }
}
