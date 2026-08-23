<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CouponRequest;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

final class CouponController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Coupon::query();

        if ($request->filled('search')) {
            $search = (string) $request->input('search');

            $query->where(function ($q) use ($search): void {
                $q->where('code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $isActive = $request->input('status') === 'active';
            $query->where('is_active', $isActive);
        }

        $coupons = $query
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString()
            ->through(function (Coupon $coupon): array {
                return [
                    'id' => (string) $coupon->getKey(),
                    'code' => $coupon->code,
                    'discount_type' => $coupon->discount_type,
                    'discount_value' => (float) $coupon->discount_value,
                    'applies_to' => $coupon->applies_to,
                    'category_id' => $coupon->category_id,
                    'product_id' => $coupon->product_id,
                    'is_active' => (bool) $coupon->is_active,
                    'usage_limit' => $coupon->usage_limit,
                    'usage_per_user' => $coupon->usage_per_user,
                    'used_count' => (int) $coupon->used_count,
                    'expires_at' => $coupon->expires_at?->toISOString(),
                    'is_expired' => $coupon->expires_at?->isPast() ?? false,
                    'created_at' => $coupon->created_at?->toISOString(),
                ];
            });

        return Inertia::render('admin/Coupons', [
            'coupons' => $coupons,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/AddCoupon', [
            'categories' => $this->categoryOptions(),
            'products' => $this->productOptions(),
        ]);
    }

    public function store(CouponRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $data['created_by'] = Auth::guard('admin')->id();
        $data['updated_by'] = Auth::guard('admin')->id();
        $data['used_count'] = 0;

        $this->normalizeScopeTargets($data);

        Coupon::create($data);

        return redirect()
            ->route('admin.coupons.index')
            ->with('success', 'Coupon created successfully.');
    }

    public function edit(string $id): Response
    {
        $coupon = Coupon::findOrFail($id);

        return Inertia::render('admin/EditCoupon', [
            'coupon' => [
                'id' => (string) $coupon->getKey(),
                'code' => $coupon->code,
                'discount_type' => $coupon->discount_type,
                'discount_value' => (float) $coupon->discount_value,
                'applies_to' => $coupon->applies_to,
                'category_id' => $coupon->category_id,
                'product_id' => $coupon->product_id,
                'is_active' => (bool) $coupon->is_active,
                'usage_limit' => $coupon->usage_limit,
                'usage_per_user' => $coupon->usage_per_user,
                'expires_at' => $coupon->expires_at?->format('Y-m-d'),
            ],
            'categories' => $this->categoryOptions(),
            'products' => $this->productOptions(),
        ]);
    }

    public function update(CouponRequest $request, string $id): RedirectResponse
    {
        $coupon = Coupon::findOrFail($id);
        $data = $request->validated();

        $data['updated_by'] = Auth::guard('admin')->id();

        $this->normalizeScopeTargets($data);

        $coupon->update($data);

        return redirect()
            ->route('admin.coupons.index')
            ->with('success', 'Coupon updated successfully.');
    }

    public function toggleStatus(string $id): RedirectResponse
    {
        $coupon = Coupon::findOrFail($id);

        $coupon->is_active = ! (bool) $coupon->is_active;
        $coupon->updated_by = Auth::guard('admin')->id();
        $coupon->save();

        return back()->with('success', 'Coupon status updated successfully.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return back()->with('success', 'Coupon deleted successfully.');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function normalizeScopeTargets(array &$data): void
    {
        if (($data['applies_to'] ?? null) === Coupon::APPLIES_TO_ENTIRE_STORE) {
            $data['category_id'] = null;
            $data['product_id'] = null;

            return;
        }

        if (($data['applies_to'] ?? null) === Coupon::APPLIES_TO_CATEGORY) {
            $data['product_id'] = null;

            return;
        }

        if (($data['applies_to'] ?? null) === Coupon::APPLIES_TO_PRODUCT) {
            $data['category_id'] = null;
        }
    }

    /**
     * @return array<int, array{id: string, name: string}>
     */
    private function categoryOptions(): array
    {
        return Category::query()
            ->orderBy('name')
            ->get(['name'])
            ->map(fn (Category $category): array => [
                'id' => (string) $category->getKey(),
                'name' => $category->name,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{id: string, name: string}>
     */
    private function productOptions(): array
    {
        return Product::query()
            ->orderBy('name')
            ->get(['name'])
            ->map(fn (Product $product): array => [
                'id' => (string) $product->getKey(),
                'name' => $product->name,
            ])
            ->values()
            ->all();
    }
}
