<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SettingRequest;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

final class SettingController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index(): Response
    {
        $settings = Setting::getInstance();

        return Inertia::render('admin/system/Settings', [
            'settings' => $settings,
            'adsTxt' => File::exists(public_path('ads.txt'))
                ? File::get(public_path('ads.txt'))
                : '',
        ]);
    }

    /**
     * Update general settings.
     */
    public function updateGeneral(SettingRequest $request)
    {
        $settings = Setting::getInstance();

        $data = $request->only([
            'phone',
            'phone2',
            'email',
            'email2',
            'address',
            'cod_charge',
        ]);

        $data['updated_by'] = Auth::guard('admin')->id();

        $settings->update($data);

        return back()->with('success', 'General settings updated successfully.');
    }

    /**
     * Update counter settings.
     */
    public function updateCounter(SettingRequest $request)
    {
        $settings = Setting::getInstance();

        $data = $request->only([
            'active_clients',
            'varieties_of_rudraksha',
            'active_products',
            'country_cover',
        ]);

        $data['updated_by'] = Auth::guard('admin')->id();

        $settings->update($data);

        return back()->with('success', 'Counter settings updated successfully.');
    }

    /**
     * Update social media settings.
     */
    public function updateSocialMedia(SettingRequest $request)
    {
        $settings = Setting::getInstance();

        $data = $request->only([
            'facebook_link',
            'twitter_link',
            'instagram_link',
            'youtube_link',
        ]);

        $data['updated_by'] = Auth::guard('admin')->id();

        $settings->update($data);

        return back()->with('success', 'Social media settings updated successfully.');
    }

    /**
     * Update global SEO and social preview defaults.
     */
    public function updateSeo(SettingRequest $request)
    {
        $settings = Setting::getInstance();

        $data = $request->only([
            'global_meta_title',
            'global_meta_description',
            'global_meta_keywords',
            'global_og_title',
            'global_og_description',
            'global_og_image_url',
            'global_twitter_title',
            'global_twitter_description',
            'global_twitter_image_url',
        ]);

        $data['updated_by'] = Auth::guard('admin')->id();

        $settings->update($data);

        return back()->with('success', 'SEO defaults updated successfully.');
    }

    /**
     * Update header and footer scripts.
     */
    public function updateScripts(SettingRequest $request)
    {
        $settings = Setting::getInstance();

        $data = $request->only([
            'header_scripts',
            'footer_scripts',
        ]);

        $data['updated_by'] = Auth::guard('admin')->id();

        $settings->update($data);

        return back()->with('success', 'Scripts updated successfully.');
    }

    /**
     * Create or update the public ads.txt file.
     */
    public function updateAdsTxt(SettingRequest $request)
    {
        $path = public_path('ads.txt');
        $directory = dirname($path);

        if (! is_writable($directory)) {
            return back()->withErrors([
                'ads_txt' => 'The public directory is not writable. Please check file permissions.',
            ]);
        }

        if (File::exists($path) && ! is_writable($path)) {
            return back()->withErrors([
                'ads_txt' => 'ads.txt exists but is not writable. Please check file permissions.',
            ]);
        }

        try {
            File::put($path, (string) $request->input('ads_txt', ''), true);
            @chmod($path, 0644);
        } catch (Throwable) {
            return back()->withErrors([
                'ads_txt' => 'Unable to save ads.txt. Please check file permissions.',
            ]);
        }

        return back()->with('success', 'ads.txt updated successfully.');
    }

    /**
     * Update the storefront ticker.
     */
    public function updateTicker(SettingRequest $request)
    {
        $settings = Setting::getInstance();

        $settings->update([
            'ticker_text' => $request->input('ticker_text'),
            'ticker_enabled' => $request->boolean('ticker_enabled'),
            'updated_by' => Auth::guard('admin')->id(),
        ]);

        return back()->with('success', 'Ticker updated successfully.');
    }

    /**
     * Delete the storefront ticker.
     */
    public function deleteTicker()
    {
        $settings = Setting::getInstance();

        $settings->update([
            'ticker_text' => null,
            'ticker_enabled' => false,
            'updated_by' => Auth::guard('admin')->id(),
        ]);

        return back()->with('success', 'Ticker deleted successfully.');
    }

    /**
     * Upload public root verification files.
     */
    public function uploadVerificationFile(SettingRequest $request): JsonResponse
    {
        $uploadedFiles = $request->file('verification_files', []);

        if ($uploadedFiles instanceof UploadedFile) {
            $uploadedFiles = [$uploadedFiles];
        }

        $uploadedFiles = array_values(array_filter($uploadedFiles));

        if ($uploadedFiles === []) {
            return response()->json([
                'message' => 'Please choose at least one verification file.',
            ], 422);
        }

        $preparedFiles = [];

        foreach ($uploadedFiles as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $originalName = basename(str_replace('\\', '/', $file->getClientOriginalName()));
            $extension = Str::lower($file->getClientOriginalExtension());

            if (! in_array($extension, ['html', 'htm', 'txt', 'xml'], true)) {
                return response()->json([
                    'message' => $originalName.' must be HTML, TXT, or XML.',
                ], 422);
            }

            $filename = preg_replace('/[^A-Za-z0-9._-]/', '-', $originalName) ?: '';
            $filename = mb_substr($filename, 0, 180);

            if ($filename === '' || str_starts_with($filename, '.') || ! str_ends_with(Str::lower($filename), '.'.$extension)) {
                return response()->json([
                    'message' => $originalName.' has an invalid filename.',
                ], 422);
            }

            $path = public_path($filename);
            $directory = dirname($path);

            if (! is_writable($directory)) {
                return response()->json([
                    'message' => 'The public directory is not writable. Please check file permissions.',
                ], 422);
            }

            if (File::exists($path) && ! is_writable($path)) {
                return response()->json([
                    'message' => $filename.' exists but is not writable. Please check file permissions.',
                ], 422);
            }

            $preparedFiles[$filename] = [
                'file' => $file,
                'filename' => $filename,
                'path' => $path,
            ];
        }

        if ($preparedFiles === []) {
            return response()->json([
                'message' => 'Please choose at least one valid verification file.',
            ], 422);
        }

        foreach ($preparedFiles as $preparedFile) {
            try {
                File::put($preparedFile['path'], File::get($preparedFile['file']->getRealPath()));
                @chmod($preparedFile['path'], 0644);
            } catch (Throwable) {
                return response()->json([
                    'message' => 'Unable to save verification files. Please check file permissions.',
                ], 422);
            }
        }

        $settings = Setting::getInstance();
        $files = collect(is_array($settings->verification_files) ? $settings->verification_files : []);

        foreach ($preparedFiles as $preparedFile) {
            $files = $files
                ->reject(fn (array $item): bool => ($item['filename'] ?? '') === $preparedFile['filename'])
                ->values();

            $files->push([
                'filename' => $preparedFile['filename'],
                'url' => url('/'.$preparedFile['filename']),
                'size' => File::size($preparedFile['path']),
                'uploaded_at' => now()->toISOString(),
            ]);
        }

        $settings->verification_files = $files->values()->all();
        $settings->updated_by = Auth::guard('admin')->id();
        $settings->save();

        return response()->json([
            'success' => true,
            'files' => $settings->verification_files,
            'message' => count($preparedFiles) === 1
                ? 'Verification file uploaded successfully.'
                : 'Verification files uploaded successfully.',
        ]);
    }

    /**
     * Delete a public root verification file uploaded through settings.
     */
    public function deleteVerificationFile(SettingRequest $request): JsonResponse
    {
        $filename = (string) $request->input('filename', '');
        $safeFilename = basename(str_replace('\\', '/', $filename));
        $settings = Setting::getInstance();
        $files = collect(is_array($settings->verification_files) ? $settings->verification_files : []);
        $knownFile = $files->first(fn (array $item): bool => ($item['filename'] ?? '') === $safeFilename);

        if (! $knownFile) {
            return response()->json([
                'message' => 'Verification file was not found in settings.',
            ], 404);
        }

        $path = public_path($safeFilename);

        if (File::exists($path)) {
            if (! is_writable($path)) {
                return response()->json([
                    'message' => $safeFilename.' is not writable. Please check file permissions.',
                ], 422);
            }

            try {
                File::delete($path);
            } catch (Throwable) {
                return response()->json([
                    'message' => 'Unable to delete verification file. Please check file permissions.',
                ], 422);
            }
        }

        $settings->verification_files = $files
            ->reject(fn (array $item): bool => ($item['filename'] ?? '') === $safeFilename)
            ->values()
            ->all();
        $settings->updated_by = Auth::guard('admin')->id();
        $settings->save();

        return response()->json([
            'success' => true,
            'files' => $settings->verification_files,
            'message' => 'Verification file deleted successfully.',
        ]);
    }

    /**
     * Upload one storefront trust feature image, with a maximum of four.
     */
    public function uploadTrustFeature(SettingRequest $request): JsonResponse
    {
        $settings = Setting::getInstance();
        $features = collect(is_array($settings->trust_features) ? $settings->trust_features : [])
            ->filter(fn (array $feature): bool => isset($feature['id'], $feature['filename']))
            ->values();

        if ($features->count() >= 4) {
            return response()->json([
                'message' => 'Only four trust feature images are allowed.',
            ], 422);
        }

        $file = $request->file('trust_feature_image');

        if (! $file instanceof UploadedFile) {
            return response()->json([
                'message' => 'Please choose an image to upload.',
            ], 422);
        }

        $directory = public_path('uploads/settings/trust-features');

        if (! File::isDirectory($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        if (! is_writable($directory)) {
            return response()->json([
                'message' => 'The trust feature upload directory is not writable.',
            ], 422);
        }

        $id = (string) Str::uuid();
        $extension = Str::lower($file->getClientOriginalExtension());
        $filename = $id.'-'.time().'.'.$extension;

        try {
            $file->move($directory, $filename);
        } catch (Throwable) {
            return response()->json([
                'message' => 'Unable to save trust feature image.',
            ], 422);
        }

        $features->push([
            'id' => $id,
            'filename' => $filename,
            'url' => asset('uploads/settings/trust-features/'.$filename),
            'uploaded_at' => now()->toISOString(),
        ]);

        $settings->trust_features = $features->take(4)->values()->all();
        $settings->updated_by = Auth::guard('admin')->id();
        $settings->save();

        return response()->json([
            'success' => true,
            'features' => $settings->trust_features,
            'message' => 'Trust feature image uploaded successfully.',
        ]);
    }

    /**
     * Replace one storefront trust feature image.
     */
    public function updateTrustFeature(SettingRequest $request, string $id): JsonResponse
    {
        $settings = Setting::getInstance();
        $features = collect(is_array($settings->trust_features) ? $settings->trust_features : [])
            ->filter(fn (array $feature): bool => isset($feature['id'], $feature['filename']))
            ->values();
        $featureIndex = $features->search(fn (array $feature): bool => ($feature['id'] ?? '') === $id);

        if ($featureIndex === false) {
            return response()->json([
                'message' => 'Trust feature image was not found.',
            ], 404);
        }

        $file = $request->file('trust_feature_image');

        if (! $file instanceof UploadedFile) {
            return response()->json([
                'message' => 'Please choose an image to upload.',
            ], 422);
        }

        $directory = public_path('uploads/settings/trust-features');

        if (! File::isDirectory($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        if (! is_writable($directory)) {
            return response()->json([
                'message' => 'The trust feature upload directory is not writable.',
            ], 422);
        }

        $currentFeature = $features->get($featureIndex);
        $oldFilename = basename(str_replace('\\', '/', (string) ($currentFeature['filename'] ?? '')));
        $extension = Str::lower($file->getClientOriginalExtension());
        $filename = $id.'-'.time().'.'.$extension;

        try {
            $file->move($directory, $filename);
        } catch (Throwable) {
            return response()->json([
                'message' => 'Unable to save trust feature image.',
            ], 422);
        }

        if ($oldFilename !== '' && $oldFilename !== $filename) {
            $oldPath = $directory.'/'.$oldFilename;

            if (File::exists($oldPath) && is_writable($oldPath)) {
                File::delete($oldPath);
            }
        }

        $features->put($featureIndex, [
            'id' => $id,
            'filename' => $filename,
            'url' => asset('uploads/settings/trust-features/'.$filename),
            'uploaded_at' => $currentFeature['uploaded_at'] ?? now()->toISOString(),
            'updated_at' => now()->toISOString(),
        ]);

        $settings->trust_features = $features->take(4)->values()->all();
        $settings->updated_by = Auth::guard('admin')->id();
        $settings->save();

        return response()->json([
            'success' => true,
            'features' => $settings->trust_features,
            'message' => 'Trust feature image replaced successfully.',
        ]);
    }

    /**
     * Delete one storefront trust feature image.
     */
    public function deleteTrustFeature(SettingRequest $request): JsonResponse
    {
        $featureId = (string) $request->input('trust_feature_id', '');
        $settings = Setting::getInstance();
        $features = collect(is_array($settings->trust_features) ? $settings->trust_features : []);
        $feature = $features->first(fn (array $item): bool => ($item['id'] ?? '') === $featureId);

        if (! $feature) {
            return response()->json([
                'message' => 'Trust feature image was not found.',
            ], 404);
        }

        $filename = basename(str_replace('\\', '/', (string) ($feature['filename'] ?? '')));

        if ($filename !== '') {
            $path = public_path('uploads/settings/trust-features/'.$filename);

            if (File::exists($path)) {
                if (! is_writable($path)) {
                    return response()->json([
                        'message' => 'Trust feature image is not writable.',
                    ], 422);
                }

                try {
                    File::delete($path);
                } catch (Throwable) {
                    return response()->json([
                        'message' => 'Unable to delete trust feature image.',
                    ], 422);
                }
            }
        }

        $settings->trust_features = $features
            ->reject(fn (array $item): bool => ($item['id'] ?? '') === $featureId)
            ->values()
            ->all();
        $settings->updated_by = Auth::guard('admin')->id();
        $settings->save();

        return response()->json([
            'success' => true,
            'features' => $settings->trust_features,
            'message' => 'Trust feature image deleted successfully.',
        ]);
    }

    /**
     * Upload and store default product videos.
     */
    public function updateDefaultVideos(SettingRequest $request): JsonResponse
    {
        $settings = Setting::getInstance();
        $updated = [];
        $directory = public_path('uploads/settings/videos');

        File::ensureDirectoryExists($directory);

        foreach (['default_video_1', 'default_video_2', 'homepage_video', 'category_video'] as $field) {
            if ($request->hasFile($field)) {
                // Delete old file from disk
                if ($settings->$field) {
                    $oldPath = public_path('uploads/settings/videos/'.$settings->$field);
                    if (file_exists($oldPath)) {
                        @unlink($oldPath);
                    }
                }

                $file = $request->file($field);
                $filename = time().'_'.$field.'.'.$file->getClientOriginalExtension();
                $file->move($directory, $filename);
                $settings->$field = $filename;
                $updated[$field] = $filename;
            }
        }

        $settings->updated_by = Auth::guard('admin')->id();
        $settings->save();

        return response()->json([
            'success' => true,
            'default_video_1' => $settings->default_video_1,
            'default_video_2' => $settings->default_video_2,
            'homepage_video' => $settings->homepage_video,
            'category_video' => $settings->category_video,
        ]);
    }

    /**
     * Remove a specific default product video.
     */
    public function deleteDefaultVideo(Request $request): JsonResponse
    {
        $field = $request->input('field');

        if (! in_array($field, ['default_video_1', 'default_video_2', 'homepage_video', 'category_video'], true)) {
            return response()->json(['success' => false, 'message' => 'Invalid field.'], 422);
        }

        $settings = Setting::getInstance();

        if ($settings->$field) {
            $path = public_path('uploads/settings/videos/'.$settings->$field);
            if (file_exists($path)) {
                @unlink($path);
            }

            $settings->$field = null;
            $settings->updated_by = Auth::guard('admin')->id();
            $settings->save();
        }

        return response()->json(['success' => true]);
    }
}
