<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Product;
use App\Services\ProductVideoService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\Process\Process;

final class ConvertProductVideoJob implements ShouldQueue
{
    use Queueable;

    public int $timeout = 1200;

    public function __construct(public string $productId, public string $statusId) {}

    public function handle(ProductVideoService $service): void
    {
        $lock = Cache::lock("product-video:{$this->productId}:{$this->statusId}", 1500);
        if (! $lock->get()) {
            return;
        }
        try {
            $product = Product::find($this->productId);
            $statuses = is_array($product?->video_conversion_status) ? $product->video_conversion_status : [];
            foreach ($statuses as $index => $status) {
                if (($status['id'] ?? null) === $this->statusId) {
                    if (($status['status'] ?? null) === 'completed') {
                        return;
                    }
                    $statuses[$index]['status'] = 'processing';
                    $statuses[$index]['progress'] = 1;
                    $product->video_conversion_status = $statuses;
                    $product->save();
                    $source = public_path('uploads/products/videos/temp/'.$status['source']);
                    $output = $service->outputPath($product->slug, (int) $status['slot']);
                    $process = new Process(['/opt/homebrew/bin/ffmpeg', '-y', '-i', $source, '-c:v', 'libx264', '-c:a', 'aac', '-movflags', '+faststart', public_path('uploads/products/videos/'.$output)]);
                    $process->setTimeout(0);
                    $process->run();
                    $product->refresh();
                    $statuses = $product->video_conversion_status;
                    $statuses[$index] = [...$statuses[$index], 'status' => $process->isSuccessful() ? 'completed' : 'failed', 'progress' => $process->isSuccessful() ? 100 : 0, 'output' => $process->isSuccessful() ? $output : null];
                    $product->video_conversion_status = $statuses;
                    if ($process->isSuccessful()) {
                        $product->videos = array_values(array_unique([...(is_array($product->videos) ? $product->videos : []), $output]));
                    } $product->save();
                    if (is_file($source)) {
                        unlink($source);
                    }

return;
                }
            }
        } finally {
            $lock->release();
        }
    }
}
