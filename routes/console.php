<?php

declare(strict_types=1);

use App\Models\Product;
use Illuminate\Support\Facades\Artisan;

Artisan::command('c', function () {
    $this->info('Reindexing products in Algolia...');
    Product::query()->with('category')->searchable();
    $this->info('Products reindexed successfully.');
})->purpose('Reindex products for Algolia search');
