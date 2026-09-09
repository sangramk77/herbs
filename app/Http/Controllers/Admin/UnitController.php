<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UnitRequest;
use App\Models\Product;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

final class UnitController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Unit::query();

        if ($request->filled('search')) {
            $search = (string) $request->input('search');
            $query->where(fn ($unitQuery) => $unitQuery->where('name', 'like', "%{$search}%")->orWhere('symbol', 'like', "%{$search}%"));
        }

        return Inertia::render('admin/Units', [
            'units' => $query->orderBy('sort_order')->orderBy('name')->paginate(20)->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

    public function store(UnitRequest $request): RedirectResponse
    {
        Unit::create([...$request->validated(), 'created_by' => Auth::guard('admin')->id()]);

        return back()->with('success', 'Unit created successfully.');
    }

    public function update(UnitRequest $request, string $id): RedirectResponse
    {
        Unit::findOrFail($id)->update([...$request->validated(), 'updated_by' => Auth::guard('admin')->id()]);

        return back()->with('success', 'Unit updated successfully.');
    }

    public function destroy(string $id): RedirectResponse
    {
        $unit = Unit::findOrFail($id);
        $productCount = Product::where('measurement_unit_id', (string) $unit->getKey())->count();

        if ($productCount > 0) {
            return back()->withErrors(['unit' => "Cannot delete {$unit->name}; it is used by {$productCount} product(s)."]);
        }

        $unit->delete();

        return back()->with('success', 'Unit deleted successfully.');
    }
}
