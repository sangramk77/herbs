<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\BlogRequest;
use App\Models\Blog;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

final class BlogController extends Controller
{
    public function __construct(
        protected ImageService $imageService
    ) {}

    /**
     * Display a listing of blogs.
     */
    public function index(Request $request): Response
    {
        $query = Blog::query();

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('blog_title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('post_by', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'publish_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $blogs = $query->get();

        return Inertia::render('admin/cms/Blog', [
            'blogs' => $blogs,
            'filters' => $request->only(['search', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Show the form for creating a new blog.
     */
    public function create(): Response
    {
        return Inertia::render('admin/cms/AddBlog');
    }

    /**
     * Store a newly created blog.
     */
    public function store(BlogRequest $request)
    {
        $data = $request->validated();

        // Generate SEO URL from title if not provided
        if (empty($data['seo_url'])) {
            $data['seo_url'] = Str::slug($data['blog_title']);
        }

        // Upload thumbnail image
        if ($request->hasFile('thumbnail')) {
            $slug = Str::slug($data['blog_title']);
            $data['thumbnail'] = $this->imageService->uploadBlogThumbnail(
                $request->file('thumbnail'),
                $slug
            );
        }

        // Upload banner image
        if ($request->hasFile('banner')) {
            $slug = Str::slug($data['blog_title']);
            $data['banner'] = $this->imageService->uploadBlogBanner(
                $request->file('banner'),
                $slug
            );
        }

        // Set created_by
        $data['created_by'] = Auth::guard('admin')->id();

        // Set default status if not provided
        if (! isset($data['status'])) {
            $data['status'] = true;
        }

        // Publish immediately when no explicit publish date is provided.
        if (empty($data['publish_date'])) {
            $data['publish_date'] = now()->toDateString();
        }

        Blog::create($data);

        return redirect()
            ->route('admin.cms.blog')
            ->with('success', 'Blog created successfully.');
    }

    /**
     * Show the form for editing a blog.
     */
    public function edit(string $id): Response
    {
        $blog = Blog::findOrFail($id);

        return Inertia::render('admin/cms/EditBlog', [
            'blog' => $blog,
        ]);
    }

    /**
     * Update the specified blog.
     */
    public function update(BlogRequest $request, string $id)
    {
        $blog = Blog::findOrFail($id);
        $data = $request->validated();

        // Generate SEO URL from title if not provided
        if (empty($data['seo_url'])) {
            $data['seo_url'] = Str::slug($data['blog_title']);
        }

        // Upload new thumbnail if provided
        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail if exists
            if ($blog->thumbnail) {
                $this->imageService->deleteBlogThumbnail($blog->thumbnail);
            }

            $slug = Str::slug($data['blog_title']);
            $data['thumbnail'] = $this->imageService->uploadBlogThumbnail(
                $request->file('thumbnail'),
                $slug
            );
        } else {
            // If thumbnail field is not sent, keep the existing value
            unset($data['thumbnail']);
        }

        // Upload new banner if provided
        if ($request->hasFile('banner')) {
            // Delete old banner if exists
            if ($blog->banner) {
                $this->imageService->deleteBlogBanner($blog->banner);
            }

            $slug = Str::slug($data['blog_title']);
            $data['banner'] = $this->imageService->uploadBlogBanner(
                $request->file('banner'),
                $slug
            );
        } else {
            // If banner field is not sent, keep the existing value
            unset($data['banner']);
        }

        // Set updated_by
        $data['updated_by'] = Auth::guard('admin')->id();

        $blog->update($data);

        return redirect()
            ->route('admin.cms.blog')
            ->with('success', 'Blog updated successfully.');
    }

    /**
     * Remove the specified blog from storage.
     */
    public function destroy(string $id)
    {
        $blog = Blog::findOrFail($id);

        // Delete thumbnail image
        if ($blog->thumbnail) {
            $this->imageService->deleteBlogThumbnail($blog->thumbnail);
        }

        // Delete banner image
        if ($blog->banner) {
            $this->imageService->deleteBlogBanner($blog->banner);
        }

        // Soft delete the blog
        $blog->delete();

        return redirect()
            ->route('admin.cms.blog')
            ->with('success', 'Blog deleted successfully.');
    }

    /**
     * Toggle blog status.
     */
    public function toggleStatus(string $id)
    {
        $blog = Blog::findOrFail($id);

        $blog->status = ! $blog->status;
        $blog->updated_by = Auth::guard('admin')->id();
        $blog->save();

        return back()->with('success', 'Blog status updated successfully.');
    }
}
