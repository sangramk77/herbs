<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class NewsletterController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:120'],
        ]);

        $email = mb_strtolower((string) $validated['email']);

        if (NewsletterSubscriber::where('email', $email)->exists()) {
            return back()
                ->withErrors(['email' => 'This email is already subscribed.'])
                ->withInput();
        }

        NewsletterSubscriber::create(['email' => $email]);

        return back()->with('success', 'Thanks for subscribing!');
    }
}
