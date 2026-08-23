<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\TestimonialRequest;
use App\Models\Testimonial;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

final class TestimonialController extends Controller
{
    public function __construct(
        protected ImageService $imageService
    ) {}

    /**
     * Display a listing of testimonials.
     */
    public function index(Request $request): Response
    {
        $query = Testimonial::query();

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('designation', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $testimonials = $query->get();

        return Inertia::render('admin/cms/Testimonial', [
            'testimonials' => $testimonials,
            'filters' => $request->only(['search', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Show the form for creating a new testimonial.
     */
    public function create(): Response
    {
        return Inertia::render('admin/cms/AddTestimonial');
    }

    /**
     * Store a newly created testimonial.
     */
    public function store(TestimonialRequest $request)
    {
        $data = $request->validated();

        // Generate SEO URL from name if not provided
        if (empty($data['seo_url'])) {
            $data['seo_url'] = Str::slug($data['name']);
        }

        // Upload image
        if ($request->hasFile('image')) {
            $slug = Str::slug($data['name']);
            $data['image'] = $this->imageService->uploadTestimonialImage(
                $request->file('image'),
                $slug
            );
        }

        // Set created_by
        $data['created_by'] = Auth::guard('admin')->id();

        // Set default status if not provided
        if (! isset($data['status'])) {
            $data['status'] = true;
        }

        Testimonial::create($data);

        return redirect()
            ->route('admin.cms.testimonial')
            ->with('success', 'Testimonial created successfully.');
    }

    /**
     * Show the form for editing a testimonial.
     */
    public function edit(string $id): Response
    {
        $testimonial = Testimonial::findOrFail($id);

        return Inertia::render('admin/cms/EditTestimonial', [
            'testimonial' => $testimonial,
        ]);
    }

    /**
     * Update the specified testimonial.
     */
    public function update(TestimonialRequest $request, string $id)
    {
        $testimonial = Testimonial::findOrFail($id);
        $data = $request->validated();

        // Generate SEO URL from name if not provided
        if (empty($data['seo_url'])) {
            $data['seo_url'] = Str::slug($data['name']);
        }

        // Upload new image if provided
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($testimonial->image) {
                $this->imageService->deleteTestimonialImage($testimonial->image);
            }

            $slug = Str::slug($data['name']);
            $data['image'] = $this->imageService->uploadTestimonialImage(
                $request->file('image'),
                $slug
            );
        } else {
            // If image field is not sent, keep the existing value
            unset($data['image']);
        }

        // Set updated_by
        $data['updated_by'] = Auth::guard('admin')->id();

        $testimonial->update($data);

        return redirect()
            ->route('admin.cms.testimonial')
            ->with('success', 'Testimonial updated successfully.');
    }

    /**
     * Remove the specified testimonial from storage.
     */
    public function destroy(string $id)
    {
        $testimonial = Testimonial::findOrFail($id);

        // Delete image
        if ($testimonial->image) {
            $this->imageService->deleteTestimonialImage($testimonial->image);
        }

        // Soft delete the testimonial
        $testimonial->delete();

        return redirect()
            ->route('admin.cms.testimonial')
            ->with('success', 'Testimonial deleted successfully.');
    }

    /**
     * Toggle testimonial status.
     */
    public function toggleStatus(string $id)
    {
        $testimonial = Testimonial::findOrFail($id);

        $testimonial->status = ! $testimonial->status;
        $testimonial->updated_by = Auth::guard('admin')->id();
        $testimonial->save();

        return back()->with('success', 'Testimonial status updated successfully.');
    }
}
