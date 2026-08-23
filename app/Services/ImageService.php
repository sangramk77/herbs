<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Intervention\Image\Laravel\Facades\Image;

final class ImageService
{
    /**
     * Upload and process product image.
     */
    public function uploadProductImage(UploadedFile $file, string $slug): string
    {
        // Generate unique filename
        $timestamp = time();
        $extension = $file->getClientOriginalExtension();
        $filename = $slug.'-'.$timestamp.'.'.$extension;

        // Create year/month directory structure
        $directory = date('Y').'/'.date('m');
        $fullPath = 'uploads/products/'.$directory;

        // Ensure directory exists
        if (! file_exists(public_path($fullPath))) {
            mkdir(public_path($fullPath), 0755, true);
        }

        // Resize and optimize image
        $image = Image::read($file);

        // Resize to max 800x800 while maintaining aspect ratio
        $image->scale(width: 800, height: 800);

        // Save optimized image
        $image->save(public_path($fullPath.'/'.$filename), quality: 85);

        // Generate thumbnail (150x150)
        $this->generateThumbnail($file, $fullPath, $slug, $timestamp, $extension);

        // Return relative path for database storage
        return $directory.'/'.$filename;
    }

    /**
     * Delete product image and its thumbnail.
     */
    public function deleteProductImage(string $filename): void
    {
        $fullPath = public_path('uploads/products/'.$filename);

        // Delete main image
        if (file_exists($fullPath)) {
            unlink($fullPath);
        }

        // Delete thumbnail
        $thumbnailPath = str_replace('.', '-thumb.', $fullPath);
        if (file_exists($thumbnailPath)) {
            unlink($thumbnailPath);
        }
    }

    /**
     * Get thumbnail URL for a product image.
     */
    public function getThumbnailUrl(string $filename): string
    {
        $thumbnailFilename = str_replace('.', '-thumb.', $filename);

        return asset('uploads/products/'.$thumbnailFilename);
    }

    /**
     * Upload and process banner image.
     */
    public function uploadBannerImage(UploadedFile $file, string $slug): string
    {
        // Generate unique filename
        $timestamp = time();
        $extension = $file->getClientOriginalExtension();
        $filename = $slug.'-'.$timestamp.'.'.$extension;

        // Create year/month directory structure
        $directory = date('Y').'/'.date('m');
        $fullPath = 'uploads/banners/'.$directory;

        // Ensure directory exists
        if (! file_exists(public_path($fullPath))) {
            mkdir(public_path($fullPath), 0755, true);
        }

        // Resize and optimize image for banner (1920x1080 max)
        $image = Image::read($file);

        // Resize to max 1920x1080 while maintaining aspect ratio
        $image->scale(width: 1920, height: 1080);

        // Save optimized image
        $image->save(public_path($fullPath.'/'.$filename), quality: 85);

        // Generate thumbnail (400x225) for admin preview
        $this->generateBannerThumbnail($file, $fullPath, $slug, $timestamp, $extension);

        // Return relative path for database storage
        return $directory.'/'.$filename;
    }

    /**
     * Upload and process mobile banner image.
     */
    public function uploadBannerMobileImage(UploadedFile $file, string $slug): string
    {
        $timestamp = time();
        $extension = $file->getClientOriginalExtension();
        $filename = $slug.'-'.$timestamp.'.'.$extension;

        $directory = date('Y').'/'.date('m');
        $fullPath = 'uploads/banners/'.$directory;

        if (! file_exists(public_path($fullPath))) {
            mkdir(public_path($fullPath), 0755, true);
        }

        $image = Image::read($file);
        $image->scale(width: 1200, height: 1600);
        $image->save(public_path($fullPath.'/'.$filename), quality: 85);

        return $directory.'/'.$filename;
    }

    /**
     * Upload and process CMS page image.
     */
    public function uploadCmsPageImage(UploadedFile $file, string $slug): string
    {
        $timestamp = time();
        $extension = $file->getClientOriginalExtension();
        $filename = $slug.'-'.$timestamp.'.'.$extension;

        $directory = date('Y').'/'.date('m');
        $fullPath = 'uploads/pages/'.$directory;

        if (! file_exists(public_path($fullPath))) {
            mkdir(public_path($fullPath), 0755, true);
        }

        $image = Image::read($file);
        $image->scale(width: 1200, height: 1200);
        $image->save(public_path($fullPath.'/'.$filename), quality: 85);

        return $directory.'/'.$filename;
    }

    /**
     * Delete banner image and its thumbnail.
     */
    public function deleteBannerImage(string $filename): void
    {
        $fullPath = public_path('uploads/banners/'.$filename);

        // Delete main image
        if (file_exists($fullPath)) {
            unlink($fullPath);
        }

        // Delete thumbnail
        $thumbnailPath = str_replace('.', '-thumb.', $fullPath);
        if (file_exists($thumbnailPath)) {
            unlink($thumbnailPath);
        }
    }

    /**
     * Upload and process blog thumbnail image.
     */
    public function uploadBlogThumbnail(UploadedFile $file, string $slug): string
    {
        // Generate unique filename
        $timestamp = time();
        $extension = $file->getClientOriginalExtension();
        $filename = $slug.'-'.$timestamp.'.'.$extension;

        // Create year/month directory structure
        $directory = date('Y').'/'.date('m');
        $fullPath = 'uploads/blogs/thumbnails/'.$directory;

        // Ensure directory exists
        if (! file_exists(public_path($fullPath))) {
            mkdir(public_path($fullPath), 0755, true);
        }

        // Resize and optimize thumbnail (600x400)
        $image = Image::read($file);
        $image->cover(600, 400);
        $image->save(public_path($fullPath.'/'.$filename), quality: 85);

        // Return relative path for database storage
        return $directory.'/'.$filename;
    }

    /**
     * Upload and process blog banner image.
     */
    public function uploadBlogBanner(UploadedFile $file, string $slug): string
    {
        // Generate unique filename
        $timestamp = time();
        $extension = $file->getClientOriginalExtension();
        $filename = $slug.'-'.$timestamp.'.'.$extension;

        // Create year/month directory structure
        $directory = date('Y').'/'.date('m');
        $fullPath = 'uploads/blogs/banners/'.$directory;

        // Ensure directory exists
        if (! file_exists(public_path($fullPath))) {
            mkdir(public_path($fullPath), 0755, true);
        }

        // Resize and optimize banner (1920x600)
        $image = Image::read($file);
        $image->cover(1920, 600);
        $image->save(public_path($fullPath.'/'.$filename), quality: 85);

        // Return relative path for database storage
        return $directory.'/'.$filename;
    }

    /**
     * Delete blog thumbnail image.
     */
    public function deleteBlogThumbnail(string $filename): void
    {
        $fullPath = public_path('uploads/blogs/thumbnails/'.$filename);

        if (file_exists($fullPath)) {
            unlink($fullPath);
        }
    }

    /**
     * Delete blog banner image.
     */
    public function deleteBlogBanner(string $filename): void
    {
        $fullPath = public_path('uploads/blogs/banners/'.$filename);

        if (file_exists($fullPath)) {
            unlink($fullPath);
        }
    }

    /**
     * Upload and process testimonial image.
     */
    public function uploadTestimonialImage(UploadedFile $file, string $slug): string
    {
        // Generate unique filename
        $timestamp = time();
        $extension = $file->getClientOriginalExtension();
        $filename = $slug.'-'.$timestamp.'.'.$extension;

        // Create year/month directory structure
        $directory = date('Y').'/'.date('m');
        $fullPath = 'uploads/testimonials/'.$directory;

        // Ensure directory exists
        if (! file_exists(public_path($fullPath))) {
            mkdir(public_path($fullPath), 0755, true);
        }

        // Resize and optimize image (300x300 square)
        $image = Image::read($file);
        $image->cover(300, 300);
        $image->save(public_path($fullPath.'/'.$filename), quality: 85);

        // Return relative path for database storage
        return $directory.'/'.$filename;
    }

    /**
     * Delete testimonial image.
     */
    public function deleteTestimonialImage(string $filename): void
    {
        $fullPath = public_path('uploads/testimonials/'.$filename);

        if (file_exists($fullPath)) {
            unlink($fullPath);
        }
    }

    /**
     * Upload and process avatar image.
     */
    public function uploadAvatar(UploadedFile $file, string $userId): string
    {
        // Generate unique filename
        $timestamp = time();
        $extension = $file->getClientOriginalExtension();
        $filename = 'user-'.$userId.'-'.$timestamp.'.'.$extension;

        // Create year/month directory structure
        $directory = date('Y').'/'.date('m');
        $fullPath = 'uploads/avatars/'.$directory;

        // Ensure directory exists
        if (! file_exists(public_path($fullPath))) {
            mkdir(public_path($fullPath), 0755, true);
        }

        // Resize and optimize image (200x200 square)
        $image = Image::read($file);
        $image->cover(200, 200);
        $image->save(public_path($fullPath.'/'.$filename), quality: 90);

        // Return relative path for database storage
        return $directory.'/'.$filename;
    }

    /**
     * Delete avatar image.
     */
    public function deleteAvatar(string $filename): void
    {
        $fullPath = public_path('uploads/avatars/'.$filename);

        if (file_exists($fullPath)) {
            unlink($fullPath);
        }
    }

    /**
     * Generate thumbnail for product image.
     */
    private function generateThumbnail(UploadedFile $file, string $path, string $slug, int $timestamp, string $extension): void
    {
        $thumbnailFilename = $slug.'-'.$timestamp.'-thumb.'.$extension;

        $thumbnail = Image::read($file);
        $thumbnail->cover(150, 150);
        $thumbnail->save(public_path($path.'/'.$thumbnailFilename), quality: 85);
    }

    /**
     * Generate thumbnail for banner image.
     */
    private function generateBannerThumbnail(UploadedFile $file, string $path, string $slug, int $timestamp, string $extension): void
    {
        $thumbnailFilename = $slug.'-'.$timestamp.'-thumb.'.$extension;

        $thumbnail = Image::read($file);
        $thumbnail->cover(400, 225);
        $thumbnail->save(public_path($path.'/'.$thumbnailFilename), quality: 85);
    }
}
