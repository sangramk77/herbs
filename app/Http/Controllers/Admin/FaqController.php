<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\FaqRequest;
use App\Models\Faq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

final class FaqController extends Controller
{
    /**
     * Display a listing of FAQs.
     */
    public function index(Request $request): Response
    {
        $query = Faq::query();

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                    ->orWhere('answer', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $faqs = $query->get();

        return Inertia::render('admin/cms/Faq', [
            'faqs' => $faqs,
            'filters' => $request->only(['search', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Show the form for creating a new FAQ.
     */
    public function create(): Response
    {
        return Inertia::render('admin/cms/AddFaq');
    }

    /**
     * Store a newly created FAQ.
     */
    public function store(FaqRequest $request)
    {
        $data = $request->validated();

        // Set created_by
        $data['created_by'] = Auth::guard('admin')->id();

        // Set default visibility if not provided
        if (! isset($data['is_visible'])) {
            $data['is_visible'] = true;
        }

        Faq::create($data);

        return redirect()
            ->route('admin.cms.faq')
            ->with('success', 'FAQ created successfully.');
    }

    /**
     * Show the form for editing a FAQ.
     */
    public function edit(string $id): Response
    {
        $faq = Faq::findOrFail($id);

        return Inertia::render('admin/cms/EditFaq', [
            'faq' => $faq,
        ]);
    }

    /**
     * Update the specified FAQ.
     */
    public function update(FaqRequest $request, string $id)
    {
        $faq = Faq::findOrFail($id);
        $data = $request->validated();

        // Set updated_by
        $data['updated_by'] = Auth::guard('admin')->id();

        $faq->update($data);

        return redirect()
            ->route('admin.cms.faq')
            ->with('success', 'FAQ updated successfully.');
    }

    /**
     * Remove the specified FAQ from storage.
     */
    public function destroy(string $id)
    {
        $faq = Faq::findOrFail($id);

        // Soft delete the FAQ
        $faq->delete();

        return redirect()
            ->route('admin.cms.faq')
            ->with('success', 'FAQ deleted successfully.');
    }

    /**
     * Toggle FAQ visibility.
     */
    public function toggleVisibility(string $id)
    {
        $faq = Faq::findOrFail($id);

        $faq->is_visible = ! $faq->is_visible;
        $faq->updated_by = Auth::guard('admin')->id();
        $faq->save();

        return back()->with('success', 'FAQ visibility updated successfully.');
    }
}
