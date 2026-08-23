<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Ai\Agents\BlogWriter;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;

final class BlogAiController extends Controller
{
    /**
     * Generate blog content using AI.
     */
    public function generate(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'prompt' => 'required|string|min:3|max:500',
            ]);

            $prompt = $request->input('prompt');
            $provider = (string) config('blog_ai.provider', 'openai');
            $model = (string) config('blog_ai.model', '');
            $timeout = max((int) config('blog_ai.timeout', 60), 10);

            $promptOptions = [
                'prompt' => "Write a comprehensive blog post about: {$prompt}",
                'provider' => $provider,
                'timeout' => $timeout,
            ];

            if ($model !== '') {
                $promptOptions['model'] = $model;
            }

            // Create and prompt the BlogWriter agent
            $response = BlogWriter::make()->prompt(...$promptOptions);

            // Extract structured data
            $blogData = [
                'title' => $response['title'] ?? '',
                'content' => $response['content'] ?? '',
                'meta_description' => $response['meta_description'] ?? '',
                'keywords' => $response['keywords'] ?? [],
            ];

            return response()->json([
                'success' => true,
                'data' => $blogData,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid input',
                'errors' => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            Log::error('Blog AI generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate blog content. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
