<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\BannerRequest;
use App\Models\Banner;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

final class BannerController extends Controller
{
    public function __construct(
        protected ImageService $imageService
    ) {}

    /**
     * Display a listing of banners.
     */
    public function index(Request $request): Response
    {
        $query = Banner::query();

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('heading1', 'like', "%{$search}%")
                    ->orWhere('main_heading', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $banners = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/cms/Banner', [
            'banners' => $banners,
            'filters' => $request->only(['search', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Show the form for creating a new banner.
     */
    public function create(): Response
    {
        return Inertia::render('admin/cms/AddBanner');
    }

    /**
     * Store a newly created banner.
     */
    public function store(BannerRequest $request)
    {
        $data = $request->validated();

        // Upload banner image
        if ($request->hasFile('image')) {
            // Generate slug from heading for image naming (fallback to random if empty)
            $slug = empty($data['heading1']) ? 'banner-'.Str::random(5) : Str::slug($data['heading1']);
            $data['image'] = $this->imageService->uploadBannerImage(
                $request->file('image'),
                $slug
            );
        }

        if ($request->hasFile('mobile_image')) {
            $slug = empty($data['heading1']) ? 'banner-mobile-'.Str::random(5) : Str::slug($data['heading1']).'-mobile';
            $data['mobile_image'] = $this->imageService->uploadBannerMobileImage(
                $request->file('mobile_image'),
                $slug
            );
        }

        // Set created_by
        $data['created_by'] = Auth::guard('admin')->id();

        Banner::create($data);

        return redirect()
            ->route('admin.cms.banner')
            ->with('success', 'Banner created successfully.');
    }

    /**
     * Show the form for editing a banner.
     */
    public function edit(string $id): Response
    {
        $banner = Banner::findOrFail($id);

        return Inertia::render('admin/cms/EditBanner', [
            'banner' => $banner,
        ]);
    }

    /**
     * Update the specified banner.
     */
    public function update(BannerRequest $request, string $id)
    {
        $banner = Banner::findOrFail($id);
        $data = $request->validated();

        // Upload new banner image if provided
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($banner->image) {
                $this->imageService->deleteBannerImage($banner->image);
            }

            // Generate slug from heading (fallback to random if empty)
            $slug = empty($data['heading1']) ? 'banner-'.Str::random(5) : Str::slug($data['heading1']);
            $data['image'] = $this->imageService->uploadBannerImage(
                $request->file('image'),
                $slug
            );
        } elseif ($request->filled('image')) {
            // Existing image string provided - unset to preserve current DB value
            unset($data['image']);
        } else {
            // Empty value provided - user wants to remove the image
            $data['image'] = null;

            // Delete old image file if exists
            if ($banner->image) {
                $this->imageService->deleteBannerImage($banner->image);
            }
        }

        if ($request->hasFile('mobile_image')) {
            if ($banner->mobile_image) {
                $this->imageService->deleteBannerImage($banner->mobile_image);
            }

            $slug = empty($data['heading1']) ? 'banner-mobile-'.Str::random(5) : Str::slug($data['heading1']).'-mobile';
            $data['mobile_image'] = $this->imageService->uploadBannerMobileImage(
                $request->file('mobile_image'),
                $slug
            );
        } elseif ($request->filled('mobile_image')) {
            unset($data['mobile_image']);
        } else {
            $data['mobile_image'] = null;

            if ($banner->mobile_image) {
                $this->imageService->deleteBannerImage($banner->mobile_image);
            }
        }

        // Set updated_by
        $data['updated_by'] = Auth::guard('admin')->id();

        $banner->update($data);

        return redirect()
            ->route('admin.cms.banner')
            ->with('success', 'Banner updated successfully.');
    }

    /**
     * Remove the specified banner from storage.
     */
    public function destroy(string $id)
    {
        $banner = Banner::findOrFail($id);

        // Delete banner image
        if ($banner->image) {
            $this->imageService->deleteBannerImage($banner->image);
        }
        if ($banner->mobile_image) {
            $this->imageService->deleteBannerImage($banner->mobile_image);
        }

        // Soft delete the banner
        $banner->delete();

        return redirect()
            ->route('admin.cms.banner')
            ->with('success', 'Banner deleted successfully.');
    }

    /**
     * Toggle banner status.
     */
    public function toggleStatus(string $id)
    {
        $banner = Banner::findOrFail($id);

        $banner->status = ! $banner->status;
        $banner->updated_by = Auth::guard('admin')->id();
        $banner->save();

        return back()->with('success', 'Banner status updated successfully.');
    }
}
