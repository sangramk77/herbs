<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Jobs\ConvertProductVideoJob;
use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use App\Services\ImageService;
use App\Services\ProductVideoService;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

final class ProductController extends Controller
{
    public function __construct(
        protected ImageService $imageService,
        protected ProductVideoService $videoService
    ) {}

    /**
     * Display a listing of products.
     */
    public function index(Request $request): Response
    {
        $query = Product::query()->with('category');

        $categories = $this->getCategoryOptions();

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');

        $allowedSortBy = ['sort_order', 'created_at', 'name', 'sell_price', 'stock'];
        $sortBy = in_array($sortBy, $allowedSortBy, true) ? $sortBy : 'name';
        $sortOrder = in_array($sortOrder, ['asc', 'desc'], true) ? $sortOrder : 'asc';

        $perPage = 20;

        if ($sortBy === 'name') {
            // Natural sorting keeps numeric prefixes human-friendly: 1, 2, 3 ... 10
            $productsCollection = $query->get();
            $sortedProducts = $productsCollection
                ->sort(fn (Product $a, Product $b) => strnatcasecmp($a->name ?? '', $b->name ?? ''));

            if ($sortOrder === 'desc') {
                $sortedProducts = $sortedProducts->reverse();
            }

            $sortedProducts = $sortedProducts->values();
            $currentPage = max(1, (int) $request->integer('page', 1));
            $total = $sortedProducts->count();
            $items = $sortedProducts
                ->slice(($currentPage - 1) * $perPage, $perPage)
                ->values();

            $products = new LengthAwarePaginator(
                $items,
                $total,
                $perPage,
                $currentPage,
                [
                    'path' => $request->url(),
                    'query' => $request->query(),
                ]
            );
        } else {
            $query->orderBy($sortBy, $sortOrder);

            // Keep ordering stable even when multiple products have the same sort order.
            if ($sortBy === 'sort_order') {
                $query->orderBy('updated_at', 'desc')->orderBy('_id', 'desc');
            }

            $products = $query->paginate($perPage)->withQueryString();
        }

        return Inertia::render('admin/Products', [
            'products' => $products,
            'filters' => $request->only(['search', 'status', 'sort_by', 'sort_order', 'category_id']),
            'categories' => $categories,
        ]);
    }

    /**
     * Display a listing of best seller products.
     */
    public function bestSellers(Request $request): Response
    {
        $query = Product::query()
            ->with('category')
            ->featured();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $products = $query
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/BestSeller', [
            'products' => $products,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Update best seller sort order for a featured product.
     */
    public function updateBestSellerSortOrder(Request $request, string $id)
    {
        $data = $request->validate([
            'featured_sort_order' => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::findOrFail($id);

        if (! $product->is_featured) {
            return back()->with('error', 'Only featured products can be sorted as best sellers.');
        }

        $product->featured_sort_order = (int) $data['featured_sort_order'];
        $product->updated_by = Auth::guard('admin')->id();
        $product->save();

        return back()->with('success', 'Best seller sorting order updated successfully.');
    }

    /**
     * Bulk update best seller sort orders.
     */
    public function updateBestSellerSortOrders(Request $request)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'string'],
            'items.*.featured_sort_order' => ['required', 'integer', 'min:1'],
        ]);

        foreach ($data['items'] as $item) {
            $product = Product::find($item['id']);

            if (! $product || ! $product->is_featured) {
                continue;
            }

            $product->featured_sort_order = (int) $item['featured_sort_order'];
            $product->updated_by = Auth::guard('admin')->id();
            $product->save();
        }

        return back()->with('success', 'Best seller sorting orders updated successfully.');
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(): Response
    {
        $categories = $this->getCategoryOptions(true);

        return Inertia::render('admin/AddProduct', [
            'categories' => $categories,
            'units' => $this->getUnitOptions(),
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(ProductRequest $request)
    {
        $data = $request->validated();
        unset($data['videos']);

        // Upload primary image
        if ($request->hasFile('primary_image')) {
            // Generate slug first for image naming
            $slug = Product::generateUniqueSlug($data['name']);
            $data['primary_image'] = $this->imageService->uploadProductImage(
                $request->file('primary_image'),
                $slug
            );
            $data['slug'] = $slug;
        }

        // Upload gallery images
        if ($request->hasFile('images')) {
            $galleryImages = [];
            foreach ($request->file('images') as $image) {
                $galleryImages[] = $this->imageService->uploadProductImage(
                    $image,
                    $data['slug']
                );
            }
            $data['images'] = $galleryImages;
        }

        // Upload legacy images (image2, image3, image4)
        foreach (['image2', 'image3', 'image4'] as $imgField) {
            if ($request->hasFile($imgField)) {
                $data[$imgField] = $this->imageService->uploadProductImage(
                    $request->file($imgField),
                    $data['slug']
                );
            }
        }

        // Set created_by
        $this->syncMeasurementUnit($data);
        $data['created_by'] = Auth::guard('admin')->id();

        $product = Product::create($data);

        if ($request->hasFile('videos')) {
            $statuses = [];
            foreach ($request->file('videos') as $slot => $video) {
                $statusId = (string) Str::uuid();
                $statuses[] = ['id' => $statusId, 'slot' => $slot, 'source' => $this->videoService->storeTemporary($video, $product->slug, $slot), 'status' => 'queued', 'progress' => 0, 'output' => null];
            }
            $product->video_conversion_status = $statuses;
            $product->save();
            foreach ($statuses as $status) {
                ConvertProductVideoJob::dispatch((string) $product->getKey(), $status['id']);
            }
        }

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product created successfully.');
    }

    /**
     * Show the form for editing a product.
     */
    public function edit(string $id): Response
    {
        $product = Product::findOrFail($id);

        // Convert arrays back to comma-separated strings for form
        $product->meta_keywords_string = is_array($product->meta_keywords)
            ? implode(', ', $product->meta_keywords)
            : '';

        $product->tags_string = is_array($product->tags)
            ? implode(', ', $product->tags)
            : '';

        // Get all active categories for dropdown
        $categories = $this->getCategoryOptions(true);

        return Inertia::render('admin/EditProduct', [
            'product' => $product,
            'categories' => $categories,
            'units' => $this->getUnitOptions(),
        ]);
    }

    /**
     * Update the specified product.
     */
    public function update(ProductRequest $request, string $id)
    {
        $product = Product::findOrFail($id);
        $data = $request->validated();

        // Check if name changed - regenerate slug if needed
        if ($data['name'] !== $product->name) {
            $data['slug'] = Product::generateUniqueSlug($data['name']);
        }

        // Upload new primary image if provided
        if ($request->hasFile('primary_image')) {
            // Delete old image
            if ($product->primary_image) {
                $this->imageService->deleteProductImage($product->primary_image);
            }

            // Use new slug if it was regenerated, otherwise use existing
            $slug = $data['slug'] ?? $product->slug;
            $data['primary_image'] = $this->imageService->uploadProductImage(
                $request->file('primary_image'),
                $slug
            );
        }

        // Upload new gallery images if provided
        if ($request->hasFile('images')) {
            $galleryImages = $product->images ?? [];
            $slug = $data['slug'] ?? $product->slug;
            foreach ($request->file('images') as $image) {
                $galleryImages[] = $this->imageService->uploadProductImage(
                    $image,
                    $slug
                );
            }
            $data['images'] = $galleryImages;
        }

        // Upload legacy images (image2, image3, image4)
        $slug = $data['slug'] ?? $product->slug;
        foreach (['image2', 'image3', 'image4'] as $imgField) {
            if ($request->hasFile($imgField)) {
                // Delete old image if exists
                if ($product->$imgField) {
                    $this->imageService->deleteProductImage($product->$imgField);
                }

                $data[$imgField] = $this->imageService->uploadProductImage(
                    $request->file($imgField),
                    $slug
                );
            }
        }

        // Set updated_by
        $this->syncMeasurementUnit($data);
        $data['updated_by'] = Auth::guard('admin')->id();

        $product->update($data);

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(string $id)
    {
        $product = Product::findOrFail($id);

        // Check if product has been ordered (you'll need to implement this based on your Order model)
        // For now, we'll use soft delete to preserve product data for order history

        // Delete product images
        if ($product->primary_image) {
            $this->imageService->deleteProductImage($product->primary_image);
        }

        if ($product->images && is_array($product->images)) {
            foreach ($product->images as $image) {
                $this->imageService->deleteProductImage($image);
            }
        }

        // Soft delete the product (preserves data for order history)
        $product->delete();

        return redirect()
            ->route('admin.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    /**
     * Toggle product status.
     */
    public function toggleStatus(string $id)
    {
        $product = Product::findOrFail($id);

        $product->status = $product->status === 'active' ? 'inactive' : 'active';
        $product->updated_by = Auth::guard('admin')->id();
        $product->save();

        return back();
    }

    /**
     * Toggle product featured/best seller status.
     */
    public function toggleFeatured(string $id)
    {
        $product = Product::findOrFail($id);

        $product->is_featured = ! $product->is_featured;
        if ($product->is_featured) {
            if (! $product->featured_sort_order || $product->featured_sort_order < 1) {
                $product->featured_sort_order = 1;
            }
        } else {
            $product->featured_sort_order = null;
        }
        $product->updated_by = Auth::guard('admin')->id();
        $product->save();

        return back();
    }

    /**
     * Toggle product stock availability.
     */
    public function toggleStock(string $id)
    {
        $product = Product::findOrFail($id);

        // Toggle between 0 (out of stock) and 10 (in stock)
        $product->stock = $product->stock > 0 ? 0 : 10;
        $product->updated_by = Auth::guard('admin')->id();
        $product->save();

        return back();
    }

    /**
     * Get category options for select inputs.
     *
     * @return array<int, array{id: string, name: string, slug: string}>
     */
    private function getCategoryOptions(bool $onlyActive = false): array
    {
        $query = Category::query();

        if ($onlyActive) {
            $query->where('status', 'active');
        }

        return $query->orderBy('sort_order')
            ->orderBy('name')
            ->get(['name', 'slug'])
            ->map(fn (Category $category) => [
                'id' => (string) $category->getKey(),
                'name' => $category->name,
                'slug' => $category->slug,
            ])
            ->values()
            ->all();
    }

    /** @return array<int, array{id: string, name: string, symbol: string}> */
    private function getUnitOptions(): array
    {
        return Unit::active()->orderBy('sort_order')->orderBy('name')
            ->get(['name', 'symbol'])
            ->map(fn (Unit $unit) => ['id' => (string) $unit->getKey(), 'name' => $unit->name, 'symbol' => $unit->symbol])
            ->values()->all();
    }

    /** @param array<string, mixed> $data */
    private function syncMeasurementUnit(array &$data): void
    {
        if (empty($data['measurement_unit_id'])) {
            $data['measurement_unit_id'] = null;
            $data['measurement_unit_name'] = null;
            $data['measurement_unit_symbol'] = null;
            $data['measurement_minimum'] = null;
            $data['measurement_maximum'] = null;
            $data['measurement_increment'] = null;

            return;
        }

        $unit = Unit::findOrFail($data['measurement_unit_id']);
        $data['measurement_unit_name'] = $unit->name;
        $data['measurement_unit_symbol'] = $unit->symbol;
    }
}
