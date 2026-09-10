<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\AboutSetting;
use App\Models\Category;
use App\Services\SettingsService;
use Inertia\Inertia;
use Inertia\Response;

final class AboutController extends Controller
{
    /**
     * Display the about page.
     */
    public function index(): Response
    {
        $about = AboutSetting::getInstance();

        $categories = Category::active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['_id', 'name', 'slug', 'image'])
            ->map(fn ($category) => [
                'id' => (string) $category->_id,
                'name' => $category->name,
                'slug' => $category->slug,
                'image' => $category->image,
                'image_url' => $category->image
                    ? asset('uploads/products/'.$category->image)
                    : null,
            ]);

        return Inertia::render('About', [
            'settings' => (object) SettingsService::getSettingsData(),
            'about' => [
                'about_heading' => $about->about_heading,
                'about_description' => $about->about_description,
                'about_image' => $about->about_image,
                'about_image_url' => $about->about_image
                    ? asset('uploads/about/'.$about->about_image)
                    : null,
                'mission_text' => $about->mission_text,
                'vision_text' => $about->vision_text,
                'credentials_text' => $about->credentials_text,
                'gallery' => collect($about->gallery ?? [])->map(fn ($item) => [
                    'image' => $item['image'] ?? '',
                    'description' => $item['description'] ?? '',
                    'image_url' => isset($item['image'])
                        ? asset('uploads/about/gallery/'.$item['image'])
                        : null,
                ])->values()->all(),
                'videos' => collect($about->videos ?? [])->map(fn ($item) => [
                    'id' => $item['id'] ?? '',
                    'title' => $item['title'] ?? '',
                    'type' => $item['type'] ?? 'external',
                    'path' => $item['path'] ?? null,
                    'url' => ($item['type'] ?? null) === 'local' && ! empty($item['path'])
                        ? asset('uploads/about/videos/'.$item['path'])
                        : ($item['url'] ?? ''),
                ])->values()->all(),
                'experience_items' => $about->experience_items ?? [],
            ],
            'categories' => $categories,
        ]);
    }
}
