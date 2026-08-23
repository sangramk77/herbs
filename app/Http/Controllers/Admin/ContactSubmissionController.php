<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use Inertia\Inertia;
use Inertia\Response;

final class ContactSubmissionController extends Controller
{
    public function index(): Response
    {
        $submissions = ContactSubmission::orderBy('created_at', 'desc')
            ->get()
            ->map(fn (ContactSubmission $submission) => [
                'id' => (string) $submission->getKey(),
                'firstName' => $submission->first_name,
                'lastName' => $submission->last_name,
                'email' => $submission->email,
                'phone' => $submission->phone,
                'message' => $submission->message,
                'createdAt' => optional($submission->created_at)->toISOString(),
            ])
            ->values();

        return Inertia::render('admin/ContactSubmissions', [
            'submissions' => $submissions,
        ]);
    }
}
