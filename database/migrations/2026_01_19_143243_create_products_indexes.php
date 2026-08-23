<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get MongoDB connection
        $collection = DB::connection('mongodb')
            ->getCollection('products');

        // Create unique index on slug
        $collection->createIndex(
            ['slug' => 1],
            ['unique' => true, 'name' => 'slug_unique']
        );

        // Create index on status for filtering
        $collection->createIndex(
            ['status' => 1],
            ['name' => 'status_index']
        );

        // Create index on created_at for sorting
        $collection->createIndex(
            ['created_at' => -1],
            ['name' => 'created_at_desc']
        );

        // Create text index for search on name and description
        $collection->createIndex(
            ['name' => 'text', 'description' => 'text'],
            ['name' => 'search_text']
        );

        // Create index on stock for inventory queries
        $collection->createIndex(
            ['stock' => 1],
            ['name' => 'stock_index']
        );

        // Create index on is_featured for featured products
        $collection->createIndex(
            ['is_featured' => 1],
            ['name' => 'featured_index']
        );

        // Create compound index for active + in-stock products
        $collection->createIndex(
            ['status' => 1, 'stock' => 1],
            ['name' => 'active_stock_compound']
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $collection = DB::connection('mongodb')
            ->getCollection('products');

        // Drop all indexes except _id
        $collection->dropIndex('slug_unique');
        $collection->dropIndex('status_index');
        $collection->dropIndex('created_at_desc');
        $collection->dropIndex('search_text');
        $collection->dropIndex('stock_index');
        $collection->dropIndex('featured_index');
        $collection->dropIndex('active_stock_compound');
    }
};
