<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\Category;
use App\Models\CmsPage;
use App\Models\Product;
use App\Services\SettingsService;
use Carbon\CarbonInterface;
use DateTimeInterface;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

final class SitemapController extends Controller
{
    private const CACHE_KEY = 'sitemap.xml.v1';

    private const CACHE_SECONDS = 3600;

    public function index(): Response
    {
        $xml = Cache::remember(self::CACHE_KEY, self::CACHE_SECONDS, fn (): string => $this->buildXml());

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    /** Human-readable sitemap directory. */
    public function show(): InertiaResponse
    {
        return Inertia::render('Sitemap', [
            'settings' => (object) SettingsService::getSettingsData(),
            'sitemapIndexUrl' => url('/sitemap.xml'),
        ]);
    }

    /** Current Herbs sitemap fits one XML document; reserve chunk URL parity. */
    public function chunk(int $page): Response
    {
        abort_unless($page === 1, 404);

        return $this->index();
    }

    private function buildXml(): string
    {
        $urls = [];

        // Core static pages
        $urls[] = $this->urlEntry(url('/'), null, 'daily', '1.0');
        $urls[] = $this->urlEntry(url('/product'), null, 'daily', '0.9');
        $urls[] = $this->urlEntry(url('/blog'), null, 'daily', '0.8');
        $urls[] = $this->urlEntry(url('/faq'), null, 'weekly', '0.5');
        $urls[] = $this->urlEntry(url('/contact'), null, 'weekly', '0.5');

        // Categories
        $categories = Category::active()
            ->get(['_id', 'slug', 'updated_at']);

        $categorySlugById = $categories
            ->filter(fn (Category $category): bool => is_string($category->slug) && $category->slug !== '')
            ->mapWithKeys(fn (Category $category): array => [
                (string) $category->_id => (string) $category->slug,
            ]);

        foreach ($categories as $category) {
            if (! is_string($category->slug) || $category->slug === '') {
                continue;
            }

            $urls[] = $this->urlEntry(
                url('/category/'.$category->slug),
                $category->updated_at,
                'weekly',
                '0.7'
            );
        }

        // Products (canonical category/product URL when category exists)
        $products = Product::active()
            ->get(['slug', 'category_id', 'updated_at']);

        foreach ($products as $product) {
            if (! is_string($product->slug) || $product->slug === '') {
                continue;
            }

            $categoryId = $product->category_id ? (string) $product->category_id : null;
            $categorySlug = $categoryId ? $categorySlugById->get($categoryId) : null;
            $path = $categorySlug
                ? '/category/'.$categorySlug.'/product/'.$product->slug
                : '/product/'.$product->slug;

            $urls[] = $this->urlEntry(
                url($path),
                $product->updated_at,
                'weekly',
                '0.8'
            );
        }

        // Blogs
        $blogs = Blog::published()
            ->get(['seo_url', 'updated_at', 'publish_date']);

        foreach ($blogs as $blog) {
            if (! is_string($blog->seo_url) || $blog->seo_url === '') {
                continue;
            }

            $lastModified = $blog->updated_at ?? $blog->publish_date;

            $urls[] = $this->urlEntry(
                url('/blog/'.$blog->seo_url),
                $lastModified,
                'weekly',
                '0.7'
            );
        }

        // Public CMS pages (exclude known static route slugs)
        $reservedSlugs = collect(['product', 'blog', 'faq', 'contact', 'checkout', 'cart', 'admin', 'login', 'register', 'dashboard', 'sitemap.xml']);
        $pages = CmsPage::active()
            ->get(['seo_url', 'updated_at']);

        foreach ($pages as $page) {
            if (! is_string($page->seo_url) || $page->seo_url === '') {
                continue;
            }

            if ($reservedSlugs->contains(mb_strtolower($page->seo_url))) {
                continue;
            }

            $urls[] = $this->urlEntry(
                url('/'.$page->seo_url),
                $page->updated_at,
                'monthly',
                '0.6'
            );
        }

        return $this->renderXml($urls);
    }

    /**
     * @param  array{loc: string, lastmod?: string, changefreq?: string, priority?: string}  $entry
     */
    private function renderUrlTag(array $entry): string
    {
        $loc = $this->xmlEscape($entry['loc']);
        $lastmod = $entry['lastmod'] ?? null;
        $changefreq = $entry['changefreq'] ?? null;
        $priority = $entry['priority'] ?? null;

        $parts = [
            '<url>',
            "<loc>{$loc}</loc>",
        ];

        if ($lastmod) {
            $parts[] = '<lastmod>'.$this->xmlEscape($lastmod).'</lastmod>';
        }

        if ($changefreq) {
            $parts[] = '<changefreq>'.$this->xmlEscape($changefreq).'</changefreq>';
        }

        if ($priority) {
            $parts[] = '<priority>'.$this->xmlEscape($priority).'</priority>';
        }

        $parts[] = '</url>';

        return implode('', $parts);
    }

    /**
     * @param  array<int, array{loc: string, lastmod?: string, changefreq?: string, priority?: string}>  $urls
     */
    private function renderXml(array $urls): string
    {
        $items = array_map($this->renderUrlTag(...), $urls);

        return '<?xml version="1.0" encoding="UTF-8"?>'
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
            .implode('', $items)
            .'</urlset>';
    }

    private function xmlEscape(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }

    /**
     * @return array{loc: string, lastmod?: string, changefreq?: string, priority?: string}
     */
    private function urlEntry(
        string $loc,
        mixed $lastModified,
        ?string $changefreq = null,
        ?string $priority = null,
    ): array {
        $entry = ['loc' => $loc];

        if ($lastModified instanceof CarbonInterface) {
            $entry['lastmod'] = $lastModified->toAtomString();
        } elseif ($lastModified instanceof DateTimeInterface) {
            $entry['lastmod'] = $lastModified->format(DATE_ATOM);
        }

        if ($changefreq) {
            $entry['changefreq'] = $changefreq;
        }

        if ($priority) {
            $entry['priority'] = $priority;
        }

        return $entry;
    }
}
