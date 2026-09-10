<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use App\Models\Product;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

final class CategoryController extends Controller
{
    public function __construct(
        protected ImageService $imageService
    ) {}

    /**
     * Display a listing of categories.
     */
    public function index(Request $request): Response
    {
        $query = Category::query();

        // Search
        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'sort_order');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Get categories
        $categories = $query->paginate(20)->withQueryString();

        $categories->getCollection()->transform(
            fn (Category $category): array => $this->categoryPayload(
                $category,
                $this->productCount($category),
            )
        );

        return Inertia::render('admin/Categories', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create(): Response
    {
        return Inertia::render('admin/CreateCategory');
    }

    /**
     * Store a newly created category.
     */
    public function store(CategoryRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = Auth::guard('admin')->id();
        unset($data['image'], $data['remove_image'], $data['video'], $data['remove_video'], $data['banner'], $data['remove_banner']);

        if ($request->hasFile('image') || $request->hasFile('video') || $request->hasFile('banner')) {
            $data['slug'] = Category::generateUniqueSlug($data['name']);
        }

        if ($request->hasFile('image')) {
            $data['image'] = $this->imageService->uploadProductImage(
                $request->file('image'),
                'category-'.$data['slug']
            );
        }
        if ($request->hasFile('video')) {
            $data['video'] = $this->uploadCategoryVideo($request->file('video'), $data['slug']);
        }
        if ($request->hasFile('banner')) {
            $data['banner'] = $this->uploadCategoryBanner($request->file('banner'), $data['slug']);
        }

        Category::create($data);

        return redirect()
            ->route('admin.categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Show the form for editing a category.
     */
    public function edit(string $id): Response
    {
        $category = Category::findOrFail($id);

        return Inertia::render('admin/EditCategory', [
            'category' => $this->categoryPayload($category, $this->productCount($category)),
        ]);
    }

    /**
     * Update the specified category.
     */
    public function update(CategoryRequest $request, string $id)
    {
        $category = Category::findOrFail($id);
        $data = $request->validated();
        $data['updated_by'] = Auth::guard('admin')->id();
        unset($data['image'], $data['remove_image'], $data['video'], $data['remove_video'], $data['banner'], $data['remove_banner']);

        // Check if name changed - regenerate slug if needed
        if ($data['name'] !== $category->name) {
            $data['slug'] = Category::generateUniqueSlug($data['name']);
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($category->image) {
                $this->imageService->deleteProductImage($category->image);
            }

            // Upload new image with updated slug
            $slug = $data['slug'] ?? $category->slug;
            $data['image'] = $this->imageService->uploadProductImage(
                $request->file('image'),
                'category-'.$slug
            );
        }
        if ($request->boolean('remove_image') && ! $request->hasFile('image') && $category->image) {
            $this->imageService->deleteProductImage($category->image);
            $data['image'] = null;
        }
        if ($request->boolean('remove_video') && $category->video) {
            $this->deleteCategoryVideo($category->video);
            $data['video'] = null;
        }
        if ($request->hasFile('video')) {
            if ($category->video) {
                $this->deleteCategoryVideo($category->video);
            }
            $data['video'] = $this->uploadCategoryVideo($request->file('video'), $data['slug'] ?? $category->slug);
        }
        if ($request->boolean('remove_banner') && ! $request->hasFile('banner') && $category->banner) {
            $this->deleteCategoryBanner($category->banner);
            $data['banner'] = null;
        }
        if ($request->hasFile('banner')) {
            if ($category->banner) {
                $this->deleteCategoryBanner($category->banner);
            }
            $data['banner'] = $this->uploadCategoryBanner($request->file('banner'), $data['slug'] ?? $category->slug);
        }

        $category->update($data);

        return redirect()
            ->route('admin.categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified category.
     */
    public function destroy(string $id)
    {
        $category = Category::findOrFail($id);

        // Manually check product count (MongoDB compatible)
        $productsCount = $this->productCount($category);

        // CRITICAL: Prevent deletion if products exist
        if ($productsCount > 0) {
            return back()->withErrors([
                'category' => "Cannot delete category '{$category->name}'. It has {$productsCount} product(s) attached. Please reassign or delete the products first.",
            ]);
        }

        // Delete image if exists
        if ($category->image) {
            $this->imageService->deleteProductImage($category->image);
        }
        if ($category->video) {
            $this->deleteCategoryVideo($category->video);
        }
        if ($category->banner) {
            $this->deleteCategoryBanner($category->banner);
        }

        $category->delete();

        return redirect()
            ->route('admin.categories.index')
            ->with('success', 'Category deleted successfully.');
    }

    /**
     * Reassign products and delete category.
     */
    public function reassignAndDelete(Request $request, string $id)
    {
        $request->validate([
            'new_category_id' => ['required', 'exists:categories,_id'],
        ]);

        $category = Category::findOrFail($id);

        // Manually get product count (MongoDB compatible)
        $productsCount = $this->productCount($category);

        $newCategoryId = $request->input('new_category_id');

        // Prevent reassigning to the same category
        if ($category->_id === $newCategoryId) {
            return back()->withErrors([
                'new_category_id' => 'Please select a different category.',
            ]);
        }

        // Reassign all products to the new category
        Product::where('category_id', $category->_id)
            ->update(['category_id' => $newCategoryId]);

        // Delete image if exists
        if ($category->image) {
            $this->imageService->deleteProductImage($category->image);
        }
        if ($category->video) {
            $this->deleteCategoryVideo($category->video);
        }
        if ($category->banner) {
            $this->deleteCategoryBanner($category->banner);
        }

        // Now safe to delete
        $category->delete();

        return redirect()
            ->route('admin.categories.index')
            ->with('success', "Category deleted successfully. {$productsCount} product(s) reassigned.");
    }

    /**
     * Toggle category status.
     */
    public function toggleStatus(string $id)
    {
        $category = Category::findOrFail($id);
        $category->status = $category->status === 'active' ? 'inactive' : 'active';
        $category->updated_by = Auth::guard('admin')->id();
        $category->save();

        return back()->with('success', 'Category status updated successfully.');
    }

    /**
     * Get active categories for dropdown (API endpoint).
     */
    public function getActiveCategories()
    {
        $categories = Category::active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['name', 'slug'])
            ->map(fn (Category $category) => [
                'id' => (string) $category->getKey(),
                'name' => $category->name,
                'slug' => $category->slug,
            ])
            ->values()
            ->all();

        return response()->json($categories);
    }

    private function uploadCategoryVideo(UploadedFile $file, string $slug): string
    {
        $directory = public_path('uploads/categories/videos');
        if (! is_dir($directory)) {
            File::makeDirectory($directory, 0775, true);
        }

        $filename = sprintf('%s-%d-%s.%s', Str::slug($slug) ?: 'category', time(), Str::random(8), $file->getClientOriginalExtension());
        $file->move($directory, $filename);

        return $filename;
    }

    private function deleteCategoryVideo(string $filename): void
    {
        $path = public_path('uploads/categories/videos/'.basename($filename));
        if (File::exists($path)) {
            File::delete($path);
        }
    }

    private function uploadCategoryBanner(UploadedFile $file, string $slug): string
    {
        $directory = public_path('uploads/categories/banners');
        if (! is_dir($directory)) {
            File::makeDirectory($directory, 0775, true);
        }

        $filename = sprintf('%s-banner-%d-%s.%s', Str::slug($slug) ?: 'category', time(), Str::random(8), $file->getClientOriginalExtension());
        $file->move($directory, $filename);

        return $filename;
    }

    private function deleteCategoryBanner(string $filename): void
    {
        $path = public_path('uploads/categories/banners/'.basename($filename));
        if (File::exists($path)) {
            File::delete($path);
        }
    }

    /** @return array<string, mixed> */
    private function categoryPayload(Category $category, int $productsCount): array
    {
        $image = is_string($category->image) && $category->image !== '' ? $category->image : null;
        $video = is_string($category->video) && $category->video !== '' ? $category->video : null;
        $banner = is_string($category->banner) && $category->banner !== '' ? $category->banner : null;

        return [
            'id' => (string) $category->getKey(),
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'image' => $image,
            'image_url' => $image ? asset('uploads/products/'.$image) : null,
            'video' => $video,
            'video_url' => $video ? asset('uploads/categories/videos/'.$video) : null,
            'banner' => $banner,
            'banner_url' => $banner ? asset('uploads/categories/banners/'.$banner) : null,
            'show_video' => $category->show_video === true,
            'show_banner' => $category->show_banner !== false,
            'status' => $category->status,
            'sort_order' => $category->sort_order,
            'products_count' => $productsCount,
            'created_at' => $category->created_at,
            'updated_at' => $category->updated_at,
        ];
    }

    private function productCount(Category $category): int
    {
        return Product::where('category_id', '=', $category->_id, 'and')->count('*');
    }
}
