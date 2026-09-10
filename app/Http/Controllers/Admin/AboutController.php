<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AboutSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

final class AboutController extends Controller
{
    private const ABOUT_IMAGE_MAX_KB = 10240;

    private const GALLERY_IMAGE_MAX_KB = 10240;

    private const SUPPORTED_IMAGE_TYPES = 'jpg,jpeg,png,gif,webp';

    /**
     * Display the admin about settings page.
     */
    public function index(): Response
    {
        $about = AboutSetting::getInstance();

        return Inertia::render('admin/cms/About', [
            'about' => [
                'about_heading' => $about->about_heading,
                'about_description' => $about->about_description,
                'about_image' => $about->about_image,
                'about_image_url' => $about->about_image
                    ? asset('uploads/about/'.$about->about_image)
                    : null,
                'mission_text' => $about->mission_text,
                'vision_text' => $about->vision_text,
                'credentials_text' => $about->credentials_text,
                'gallery' => collect($about->gallery ?? [])->map(fn ($item) => [
                    'image' => $item['image'] ?? '',
                    'description' => $item['description'] ?? '',
                    'image_url' => isset($item['image'])
                        ? asset('uploads/about/gallery/'.$item['image'])
                        : null,
                ])->values()->all(),
                'videos' => $this->videosPayload($about->videos ?? []),
                'experience_items' => $about->experience_items ?? [],
            ],
        ]);
    }

    /**
     * Update the main about content (heading, description, image).
     */
    public function updateAbout(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'about_heading' => ['nullable', 'string', 'max:500'],
            'about_description' => ['nullable', 'string'],
            'about_image' => ['nullable', 'image', 'mimes:'.self::SUPPORTED_IMAGE_TYPES, 'max:'.self::ABOUT_IMAGE_MAX_KB],
        ]);

        $about = AboutSetting::getInstance();
        $data = $request->only(['about_heading', 'about_description']);

        if ($request->hasFile('about_image')) {
            // Delete old image
            if ($about->about_image) {
                $oldPath = public_path('uploads/about/'.$about->about_image);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            $file = $request->file('about_image');
            $filename = time().'_about.'.$file->getClientOriginalExtension();
            $file->move(public_path('uploads/about'), $filename);
            $data['about_image'] = $filename;
        }

        $about->update($data);

        return back()->with('success', 'About content updated successfully.');
    }

    /**
     * Update mission and vision text.
     */
    public function updateMissionVision(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'mission_text' => ['nullable', 'string'],
            'vision_text' => ['nullable', 'string'],
        ]);

        $about = AboutSetting::getInstance();
        $about->update($request->only(['mission_text', 'vision_text']));

        return back()->with('success', 'Mission & Vision updated successfully.');
    }

    /**
     * Update credentials text.
     */
    public function updateCredentials(Request $request): \Illuminate\Http\RedirectResponse
    {
        $request->validate([
            'credentials_text' => ['nullable', 'string'],
        ]);

        $about = AboutSetting::getInstance();
        $about->update($request->only(['credentials_text']));

        return back()->with('success', 'Credentials updated successfully.');
    }

    /**
     * Upload a gallery image with an optional description.
     */
    public function addGalleryImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:'.self::SUPPORTED_IMAGE_TYPES, 'max:'.self::GALLERY_IMAGE_MAX_KB],
            'description' => ['nullable', 'string', 'max:500'],
        ], [
            'image.image' => 'Please upload a valid image file.',
            'image.mimes' => 'Please upload a JPG, PNG, GIF, or WebP image.',
            'image.max' => 'Please upload an image smaller than 10 MB.',
        ]);

        $about = AboutSetting::getInstance();
        $gallery = collect($about->gallery ?? []);

        File::ensureDirectoryExists(public_path('uploads/about/gallery'));

        $file = $request->file('image');
        $filename = time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
        $file->move(public_path('uploads/about/gallery'), $filename);

        $gallery->push([
            'image' => $filename,
            'description' => $request->input('description', ''),
        ]);

        $about->gallery = $gallery->values()->all();
        $about->save();

        return response()->json([
            'success' => true,
            'gallery' => collect($about->gallery)->map(fn ($item) => [
                'image' => $item['image'] ?? '',
                'description' => $item['description'] ?? '',
                'image_url' => asset('uploads/about/gallery/'.($item['image'] ?? '')),
            ])->values()->all(),
            'message' => 'Image added to gallery.',
        ]);
    }

    /**
     * Update a gallery image description.
     */
    public function updateGalleryImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'string'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);

        $about = AboutSetting::getInstance();
        $gallery = collect($about->gallery ?? [])->map(function ($item) use ($request) {
            if (($item['image'] ?? '') === $request->input('image')) {
                $item['description'] = $request->input('description', '');
            }

            return $item;
        })->values()->all();

        $about->gallery = $gallery;
        $about->save();

        return response()->json(['success' => true, 'message' => 'Gallery item updated.']);
    }

    /**
     * Delete a gallery image.
     */
    public function deleteGalleryImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'string'],
        ]);

        $imageName = basename($request->input('image'));
        $about = AboutSetting::getInstance();

        $path = public_path('uploads/about/gallery/'.$imageName);
        if (file_exists($path)) {
            try {
                File::delete($path);
            } catch (Throwable) {
                // Continue even if file delete fails
            }
        }

        $about->gallery = collect($about->gallery ?? [])
            ->reject(fn ($item) => ($item['image'] ?? '') === $imageName)
            ->values()
            ->all();
        $about->save();

        return response()->json([
            'success' => true,
            'gallery' => collect($about->gallery)->map(fn ($item) => [
                'image' => $item['image'] ?? '',
                'description' => $item['description'] ?? '',
                'image_url' => asset('uploads/about/gallery/'.($item['image'] ?? '')),
            ])->values()->all(),
            'message' => 'Image removed from gallery.',
        ]);
    }

    /**
     * Add a video to the about videos list.
     */
    public function addVideo(Request $request): JsonResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'required_without:video', 'string', 'max:1000'],
            'video' => ['nullable', 'required_without:url', 'file', 'mimes:mp4,mov,avi,mkv,webm', 'max:102400'],
        ]);

        $about = AboutSetting::getInstance();
        $videos = collect($about->videos ?? []);
        $video = [
            'id' => Str::uuid()->toString(),
            'title' => $request->input('title'),
            'type' => 'external',
            'url' => $request->input('url'),
        ];

        if ($request->hasFile('video')) {
            $video['type'] = 'local';
            $video['path'] = $this->uploadAboutVideo(
                $request->file('video'),
                $request->input('title')
            );
            $video['url'] = null;
        }

        $videos->push($video);

        $about->videos = $videos->values()->all();
        $about->save();

        return response()->json([
            'success' => true,
            'videos' => $this->videosPayload($about->videos ?? []),
            'message' => 'Video added successfully.',
        ]);
    }

    /**
     * Delete a video from the about videos list.
     */
    public function deleteVideo(Request $request): JsonResponse
    {
        $request->validate([
            'id' => ['required', 'string'],
        ]);

        $about = AboutSetting::getInstance();
        $video = collect($about->videos ?? [])->first(
            fn ($item) => ($item['id'] ?? '') === $request->input('id')
        );

        if (($video['type'] ?? null) === 'local' && ! empty($video['path'])) {
            $this->deleteAboutVideo((string) $video['path']);
        }

        $about->videos = collect($about->videos ?? [])
            ->reject(fn ($item) => ($item['id'] ?? '') === $request->input('id'))
            ->values()
            ->all();
        $about->save();

        return response()->json([
            'success' => true,
            'videos' => $this->videosPayload($about->videos ?? []),
            'message' => 'Video removed successfully.',
        ]);
    }

    /**
     * Update experience items.
     */
    public function updateExperience(Request $request): JsonResponse
    {
        $request->validate([
            'experience_items' => ['required', 'array'],
            'experience_items.*.icon' => ['required', 'string'],
            'experience_items.*.title' => ['required', 'string', 'max:255'],
            'experience_items.*.description' => ['required', 'string', 'max:500'],
        ]);

        $about = AboutSetting::getInstance();
        $about->experience_items = $request->input('experience_items');
        $about->save();

        return response()->json([
            'success' => true,
            'experience_items' => $about->experience_items,
            'message' => 'Experience items updated.',
        ]);
    }

    /**
     * Delete the about image.
     */
    public function deleteAboutImage(): JsonResponse
    {
        $about = AboutSetting::getInstance();

        if ($about->about_image) {
            $path = public_path('uploads/about/'.$about->about_image);
            if (file_exists($path)) {
                @unlink($path);
            }

            $about->about_image = null;
            $about->save();
        }

        return response()->json(['success' => true, 'message' => 'Image deleted.']);
    }

    private function uploadAboutVideo(\Illuminate\Http\UploadedFile $file, string $title): string
    {
        $directory = public_path('uploads/about/videos');
        File::ensureDirectoryExists($directory);

        $filename = sprintf(
            '%s-%d-%s.%s',
            Str::slug($title) ?: 'about-video',
            time(),
            Str::random(8),
            $file->getClientOriginalExtension()
        );

        $file->move($directory, $filename);

        return $filename;
    }

    private function deleteAboutVideo(string $filename): void
    {
        $path = public_path('uploads/about/videos/'.basename($filename));

        if (File::exists($path)) {
            File::delete($path);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $videos
     * @return array<int, array<string, mixed>>
     */
    private function videosPayload(array $videos): array
    {
        return collect($videos)
            ->map(fn ($item) => [
                'id' => $item['id'] ?? '',
                'title' => $item['title'] ?? '',
                'type' => $item['type'] ?? 'external',
                'path' => $item['path'] ?? null,
                'url' => ($item['type'] ?? null) === 'local' && ! empty($item['path'])
                    ? asset('uploads/about/videos/'.$item['path'])
                    : ($item['url'] ?? ''),
            ])
            ->values()
            ->all();
    }
}
