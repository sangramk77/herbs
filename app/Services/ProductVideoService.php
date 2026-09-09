<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

final class ProductVideoService
{
    public function storeTemporary(UploadedFile $file, string $slug, int $slot): string
    {
        $directory = date('Y').'/'.date('m');
        $filename = Str::slug($slug).'-'.($slot + 1).'-'.Str::uuid().'.'.($file->getClientOriginalExtension() ?: 'mp4');
        $path = public_path('uploads/products/videos/temp/'.$directory);
        if (! is_dir($path)) {
            mkdir($path, 0755, true);
        }
        $file->move($path, $filename);

        return $directory.'/'.$filename;
    }

    public function outputPath(string $slug, int $slot): string
    {
        $directory = date('Y').'/'.date('m');
        $path = public_path('uploads/products/videos/'.$directory);
        if (! is_dir($path)) {
            mkdir($path, 0755, true);
        }

        return $directory.'/'.Str::slug($slug).'-'.($slot + 1).'-'.Str::uuid().'.mp4';
    }
}
