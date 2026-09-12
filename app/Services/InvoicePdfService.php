<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\File;
use Spatie\Browsershot\Browsershot;
use Spatie\LaravelPdf\Facades\Pdf;

/** Generates and persists the single customer invoice for an order. */
final class InvoicePdfService
{
    public function generateForOrder(Order $order): string
    {
        if (is_string($order->bill_pdf_path) && $order->bill_pdf_path !== '') {
            $existingPath = public_path($order->bill_pdf_path);

            if (File::exists($existingPath)) {
                return $order->bill_pdf_path;
            }
        }

        $directory = public_path('uploads/bills');
        File::ensureDirectoryExists($directory);

        $relativePath = 'uploads/bills/invoice-'.$order->order_id.'.pdf';
        $nodeModulesPath = base_path('node_modules');
        $localChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

        Pdf::view('invoices.order', ['order' => $order])
            ->driver('browsershot')
            ->withBrowsershot(static function (Browsershot $browsershot) use ($nodeModulesPath, $localChromePath): void {
                if (is_dir($nodeModulesPath)) {
                    $browsershot->setNodeModulePath($nodeModulesPath);
                }

                // Production uses LARAVEL_PDF_CHROME_PATH; this is the local
                // Herd fallback used for development and PDF verification.
                if (is_file($localChromePath) && ! config('laravel-pdf.browsershot.chrome_path')) {
                    $browsershot->setChromePath($localChromePath);
                }
            })
            ->format('a4')
            ->margins(10, 10, 10, 10)
            ->save(public_path($relativePath));

        $order->bill_pdf_path = $relativePath;
        $order->bill_uploaded_at = now();
        $order->save();

        return $relativePath;
    }
}
