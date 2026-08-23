<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\BlogReaction;
use App\Models\Product;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class BlogController extends Controller
{
    /**
     * Display a listing of published blogs.
     */
    public function index(): Response
    {
        $blogs = Blog::published()
            ->ordered()
            ->paginate(12)
            ->through(fn ($blog) => [
                'id' => $blog->id,
                'blog_title' => $blog->blog_title,
                'description' => $blog->description,
                'post_by' => $blog->post_by,
                'thumbnail' => $blog->thumbnail,
                'thumbnail_url' => $blog->thumbnail_url,
                'publish_date' => $blog->publish_date?->format('M d, Y'),
                'seo_url' => $blog->seo_url,
            ]);

        // Get all active products for navbar
        $products = Product::active()
            ->orderBy('name')
            ->get(['_id', 'name', 'slug', 'primary_image'])
            ->map(fn ($product) => [
                'id' => $product->_id,
                'productsName' => $product->name,
                'seoUrl' => $product->slug,
                'image1' => $product->primary_image,
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

        return Inertia::render('BlogList', [
            'blogs' => $blogs,
            'settings' => (object) SettingsService::getSettingsData(),
            'cart_count' => $cartCount,
            'cart_price' => $cartPrice,
            'cart_items' => array_values($cart),
            'all_product' => $products,
        ]);
    }

    /**
     * Display the specified blog.
     */
    public function show(Request $request, string $seoUrl): Response
    {
        $blog = Blog::published()
            ->where('seo_url', $seoUrl)
            ->firstOrFail();

        // Get related blogs (same category or recent)
        $relatedBlogs = Blog::published()
            ->where('id', '!=', $blog->id)
            ->ordered()
            ->limit(4)
            ->get()
            ->map(fn ($relatedBlog) => [
                'id' => $relatedBlog->id,
                'blog_title' => $relatedBlog->blog_title,
                'thumbnail' => $relatedBlog->thumbnail,
                'thumbnail_url' => $relatedBlog->thumbnail_url,
                'publish_date' => $relatedBlog->publish_date?->format('M d, Y'),
                'seo_url' => $relatedBlog->seo_url,
            ]);

        // Get all active products for navbar
        $products = Product::active()
            ->orderBy('name')
            ->get(['_id', 'name', 'slug', 'primary_image'])
            ->map(fn ($product) => [
                'id' => $product->_id,
                'productsName' => $product->name,
                'seoUrl' => $product->slug,
                'image1' => $product->primary_image,
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

        $ipHash = $this->hashIp($request->ip());
        $userReaction = BlogReaction::query()
            ->where('blog_id', $blog->id)
            ->where('ip_hash', $ipHash)
            ->first();

        $reactionCounts = [
            'heart' => BlogReaction::query()
                ->where('blog_id', $blog->id)
                ->where('reaction', 'heart')
                ->count(),
            'smile' => BlogReaction::query()
                ->where('blog_id', $blog->id)
                ->where('reaction', 'smile')
                ->count(),
        ];

        return Inertia::render('BlogDetail', [
            'blog' => [
                'id' => $blog->id,
                'blog_title' => $blog->blog_title,
                'description' => $blog->description,
                'post_by' => $blog->post_by,
                'thumbnail' => $blog->thumbnail,
                'thumbnail_url' => $blog->thumbnail_url,
                'banner' => $blog->banner,
                'banner_url' => $blog->banner_url,
                'publish_date' => $blog->publish_date?->format('M d, Y'),
                'meta_title' => $blog->meta_title,
                'meta_keyword' => $blog->meta_keyword,
                'meta_description' => $blog->meta_description,
                'seo_url' => $blog->seo_url,
            ],
            'reactions' => [
                'counts' => $reactionCounts,
                'userReaction' => $userReaction?->reaction,
            ],
            'relatedBlogs' => $relatedBlogs,
            'settings' => (object) SettingsService::getSettingsData(),
            'cart_count' => $cartCount,
            'cart_price' => $cartPrice,
            'cart_items' => array_values($cart),
            'all_product' => $products,
        ]);
    }

    /**
     * Store or update a blog reaction (one per IP).
     */
    public function react(Request $request, string $seoUrl): JsonResponse
    {
        $validated = $request->validate([
            'reaction' => ['required', 'string', 'in:heart,smile'],
        ]);

        $blog = Blog::published()
            ->where('seo_url', $seoUrl)
            ->firstOrFail();

        $ipHash = $this->hashIp($request->ip());

        BlogReaction::query()->updateOrCreate(
            [
                'blog_id' => $blog->id,
                'ip_hash' => $ipHash,
            ],
            [
                'reaction' => $validated['reaction'],
            ],
        );

        return response()->json([
            'counts' => [
                'heart' => BlogReaction::query()
                    ->where('blog_id', $blog->id)
                    ->where('reaction', 'heart')
                    ->count(),
                'smile' => BlogReaction::query()
                    ->where('blog_id', $blog->id)
                    ->where('reaction', 'smile')
                    ->count(),
            ],
            'userReaction' => $validated['reaction'],
        ]);
    }

    private function hashIp(?string $ip): string
    {
        return hash('sha256', ($ip ?? 'unknown').config('app.key'));
    }
}
