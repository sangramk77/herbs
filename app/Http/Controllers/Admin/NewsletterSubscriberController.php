<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class NewsletterSubscriberController extends Controller
{
    public function index(Request $request): Response
    {
        $query = NewsletterSubscriber::query();

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where('email', 'like', '%'.$search.'%');
        }

        $subscribers = $query
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        $subscribers->setCollection(
            $subscribers->getCollection()->map(
                fn (NewsletterSubscriber $subscriber) => [
                    'id' => (string) $subscriber->_id,
                    'email' => $subscriber->email,
                    'createdAt' => $subscriber->created_at?->toISOString(),
                ],
            ),
        );

        return Inertia::render('admin/NewsletterSubscribers', [
            'subscribers' => $subscribers,
            'filters' => $request->only(['search']),
        ]);
    }

    public function destroy(string $id): \Illuminate\Http\RedirectResponse
    {
        $subscriber = NewsletterSubscriber::findOrFail($id);
        $subscriber->delete();

        return back()->with('success', 'Subscriber deleted successfully.');
    }
}
