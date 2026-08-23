<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use App\Models\Product;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        // Manually add product counts (MongoDB compatible)
        foreach ($categories as $category) {
            $category->products_count = Product::where('category_id', $category->_id)->count();
        }

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

        // Handle image upload if provided
        if ($request->hasFile('image')) {
            $slug = Category::generateUniqueSlug($data['name']);
            $data['image'] = $this->imageService->uploadProductImage(
                $request->file('image'),
                'category-'.$slug
            );
            $data['slug'] = $slug;
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

        // Manually add product count (MongoDB compatible)
        $category->products_count = Product::where('category_id', $category->_id)->count();

        return Inertia::render('admin/EditCategory', [
            'category' => $category,
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
        $productsCount = Product::where('category_id', $category->_id)->count();

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
        $productsCount = Product::where('category_id', $category->_id)->count();

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
}
