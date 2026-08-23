<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\Category;
use App\Models\Product;
use App\Models\Testimonial;
use App\Services\SettingsService;
use Inertia\Inertia;
use Inertia\Response;

final class HomeController extends Controller
{
    /**
     * Display the home page.
     */
    public function index(): Response
    {
        // Get all active products for navbar and product section
        $products = Product::sortStorefrontByCategory(
            Product::active()
                ->orderBy('category_id')
                ->get(['_id', 'name', 'slug', 'primary_image', 'sell_price', 'mrp', 'discount_percentage', 'category_id', 'sort_order', 'created_at', 'updated_at'])
        )
            ->map(fn ($product) => [
                'id' => $product->_id,
                'productsName' => $product->name,
                'seoUrl' => $product->slug,
                'image1' => $product->primary_image,
                'price' => $product->sell_price,
                'mrp' => $product->mrp,
                'discount' => $product->discount_percentage,
            ]);

        // Featured products (Best Seller)
        $featuredProducts = Product::active()
            ->featured()
            ->orderBy('featured_sort_order')
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get(['_id', 'name', 'slug', 'primary_image', 'sell_price', 'mrp', 'discount_percentage', 'featured_sort_order'])
            ->map(fn ($product) => [
                'id' => $product->_id,
                'productsName' => $product->name,
                'seoUrl' => $product->slug,
                'image1' => $product->primary_image,
                'price' => $product->sell_price,
                'mrp' => $product->mrp,
                'discount' => $product->discount_percentage,
            ])
            ->values();

        // Get latest products grouped by category (show 8 per category on home)
        $latestProducts = Product::sortStorefrontByCategory(
            Product::active()
                ->orderBy('category_id')
                ->get(['_id', 'name', 'slug', 'primary_image', 'sell_price', 'mrp', 'discount_percentage', 'category_id', 'sort_order', 'created_at', 'updated_at'])
        );

        $productsByCategory = $latestProducts->groupBy(fn ($product) => (string) $product->category_id);

        $latestProductsByCategory = Category::active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['_id', 'name', 'slug'])
            ->map(function ($category) use ($productsByCategory) {
                $categoryId = (string) $category->_id;
                $categoryProducts = $productsByCategory->get($categoryId, collect());
                $total = $categoryProducts->count();

                if ($total === 0) {
                    return null;
                }

                $products = $categoryProducts
                    ->map(fn ($product) => [
                        'id' => $product->_id,
                        'productsName' => $product->name,
                        'seoUrl' => $product->slug,
                        'image1' => $product->primary_image,
                        'price' => $product->sell_price,
                        'mrp' => $product->mrp,
                        'discount' => $product->discount_percentage,
                    ])
                    ->values();

                return [
                    'id' => $category->_id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'total' => $total,
                    'has_more' => $total > 8,
                    'products' => $products,
                ];
            })
            ->filter()
            ->values();

        // Fetch banners from database
        $bannerModels = \App\Models\Banner::active()
            ->ordered()
            ->get();

        $banners = $bannerModels
            ->map(fn ($banner) => [
                'id' => $banner->_id,
                'image1' => $banner->image,
                'mobileImage' => $banner->mobile_image ?: $banner->image,
                'heading1' => $banner->heading1,
                'heading2' => $banner->main_heading,
                'description' => $banner->description,
            ]);

        $homeMetaImage = $bannerModels->first()?->image_url;

        // Latest blogs for home page
        $blog = Blog::published()
            ->ordered()
            ->limit(4)
            ->get()
            ->map(fn ($blog) => [
                'id' => $blog->id,
                'blogTitle' => $blog->blog_title,
                'seoUrl' => $blog->seo_url,
                'thumbnail' => $blog->thumbnail,
                'thumbnail_url' => $blog->thumbnail_url,
                'post_by' => $blog->post_by,
                'publishDate' => $blog->publish_date?->format('Y-m-d'),
            ]);

        $testimonials = Testimonial::active()
            ->ordered()
            ->get()
            ->map(fn ($testimonial) => [
                'id' => (string) $testimonial->_id,
                'name' => $testimonial->name,
                'designation' => $testimonial->designation,
                'description' => $testimonial->description,
                'image_url' => $testimonial->image_url,
            ]);

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
                ->get(['_id', 'name', 'slug', 'primary_image', 'sell_price', 'mrp']);

            $wishlistItems = $wishlistProducts->map(fn ($product) => [
                'id' => $product->_id,
                'productsName' => $product->name,
                'seoUrl' => $product->slug,
                'image1' => $product->primary_image,
                'price' => $product->sell_price,
                'mrp' => $product->mrp,
            ])->toArray();
        }

        return Inertia::render('Home', [
            'settings' => (object) SettingsService::getSettingsData(),
            'cart_count' => $cartCount,
            'cart_price' => $cartPrice,
            'cart_items' => array_values($cart),
            'wishlist_count' => $wishlistCount,
            'wishlist_items' => array_values($wishlistItems),
            'wishlist_ids' => $wishlist,
            'all_product' => $products,
            'product' => $featuredProducts,
            'latest_products_by_category' => $latestProductsByCategory,
            'banner' => $banners,
            'metaImage' => $homeMetaImage,
            'blog' => $blog,
            'testimonials' => $testimonials,
        ]);
    }
}
