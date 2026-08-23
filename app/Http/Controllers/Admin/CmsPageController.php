<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use App\Services\ImageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CmsPageController extends Controller
{
    public function __construct(private readonly ImageService $imageService) {}

    public function index(): Response
    {
        $pages = CmsPage::orderBy('created_at', 'desc')
            ->get()
            ->map(fn (CmsPage $page) => [
                'id' => (string) $page->getKey(),
                'page' => $page->page_name,
                'image' => $page->image ? asset('uploads/pages/'.$page->image) : null,
                'isActive' => (bool) $page->is_active,
                'seoUrl' => $page->seo_url,
                'showInFooter' => (bool) $page->show_in_footer,
            ])
            ->values();

        return Inertia::render('admin/cms/Pages', [
            'pages' => $pages,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pageName' => ['required', 'string', 'max:150'],
            'heading' => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'onFooter' => ['nullable', 'in:yes,no'],
            'onTopNav' => ['nullable', 'in:yes,no'],
            'metaTitle' => ['nullable', 'string', 'max:255'],
            'metaDescription' => ['nullable', 'string', 'max:255'],
            'metaKeyword' => ['nullable', 'string', 'max:255'],
            'seoUrl' => ['nullable', 'string', 'max:200', 'unique:cms_pages,seo_url'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $seoUrl = $validated['seoUrl'] ?? CmsPage::generateSeoUrl($validated['pageName']);
        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $this->imageService->uploadCmsPageImage(
                $request->file('image'),
                $seoUrl,
            );
        }

        CmsPage::create([
            'page_name' => $validated['pageName'],
            'heading' => $validated['heading'] ?? null,
            'description' => $validated['description'] ?? null,
            'image' => $imagePath,
            'is_active' => true,
            'show_in_footer' => ($validated['onFooter'] ?? 'yes') === 'yes',
            'show_in_navbar' => ($validated['onTopNav'] ?? 'no') === 'yes',
            'seo_url' => $seoUrl,
            'meta_title' => $validated['metaTitle'] ?? null,
            'meta_description' => $validated['metaDescription'] ?? null,
            'meta_keywords' => $validated['metaKeyword'] ?? null,
        ]);

        return redirect()
            ->route('admin.cms.pages')
            ->with('success', 'Page created successfully.');
    }

    public function edit(string $id): Response
    {
        $page = CmsPage::findOrFail($id);

        return Inertia::render('admin/cms/EditPage', [
            'page' => [
                'id' => (string) $page->getKey(),
                'pageName' => $page->page_name,
                'heading' => $page->heading,
                'description' => $page->description,
                'image' => $page->image ? asset('uploads/pages/'.$page->image) : null,
                'onFooter' => $page->show_in_footer ? 'yes' : 'no',
                'onTopNav' => $page->show_in_navbar ? 'yes' : 'no',
                'metaTitle' => $page->meta_title,
                'metaDescription' => $page->meta_description,
                'metaKeyword' => $page->meta_keywords,
                'seoUrl' => $page->seo_url,
                'isActive' => (bool) $page->is_active,
            ],
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $page = CmsPage::findOrFail($id);

        $validated = $request->validate([
            'pageName' => ['required', 'string', 'max:150'],
            'heading' => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'onFooter' => ['nullable', 'in:yes,no'],
            'onTopNav' => ['nullable', 'in:yes,no'],
            'metaTitle' => ['nullable', 'string', 'max:255'],
            'metaDescription' => ['nullable', 'string', 'max:255'],
            'metaKeyword' => ['nullable', 'string', 'max:255'],
            'seoUrl' => ['nullable', 'string', 'max:200', 'unique:cms_pages,seo_url,'.$page->getKey().',_id'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $seoUrl = $validated['seoUrl'] ?? $page->seo_url ?? CmsPage::generateSeoUrl($validated['pageName']);

        if ($request->hasFile('image')) {
            $page->image = $this->imageService->uploadCmsPageImage(
                $request->file('image'),
                $seoUrl,
            );
        }

        $page->page_name = $validated['pageName'];
        $page->heading = $validated['heading'] ?? null;
        $page->description = $validated['description'] ?? null;
        $page->show_in_footer = ($validated['onFooter'] ?? 'yes') === 'yes';
        $page->show_in_navbar = ($validated['onTopNav'] ?? 'no') === 'yes';
        $page->seo_url = $seoUrl;
        $page->meta_title = $validated['metaTitle'] ?? null;
        $page->meta_description = $validated['metaDescription'] ?? null;
        $page->meta_keywords = $validated['metaKeyword'] ?? null;
        $page->save();

        return redirect()
            ->route('admin.cms.pages')
            ->with('success', 'Page updated successfully.');
    }

    public function toggle(string $id): RedirectResponse
    {
        $page = CmsPage::findOrFail($id);
        $page->is_active = ! $page->is_active;
        $page->save();

        return back()->with('success', 'Page status updated.');
    }
}
