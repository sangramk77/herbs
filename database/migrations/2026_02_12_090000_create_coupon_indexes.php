<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $couponCollection = DB::connection('mongodb')->getCollection('coupons');
        $usageCollection = DB::connection('mongodb')->getCollection('coupon_usages');

        $couponCollection->createIndex(
            ['code' => 1],
            ['unique' => true, 'name' => 'code_unique']
        );

        $couponCollection->createIndex(
            ['is_active' => 1],
            ['name' => 'is_active_index']
        );

        $couponCollection->createIndex(
            ['expires_at' => 1],
            ['name' => 'expires_at_index']
        );

        $usageCollection->createIndex(
            ['coupon_id' => 1],
            ['name' => 'coupon_id_index']
        );

        $usageCollection->createIndex(
            ['coupon_id' => 1, 'user_id' => 1],
            ['name' => 'coupon_user_compound']
        );

        $usageCollection->createIndex(
            ['order_id' => 1],
            ['name' => 'order_id_index']
        );
    }

    public function down(): void
    {
        $couponCollection = DB::connection('mongodb')->getCollection('coupons');
        $usageCollection = DB::connection('mongodb')->getCollection('coupon_usages');

        $couponCollection->dropIndex('code_unique');
        $couponCollection->dropIndex('is_active_index');
        $couponCollection->dropIndex('expires_at_index');

        $usageCollection->dropIndex('coupon_id_index');
        $usageCollection->dropIndex('coupon_user_compound');
        $usageCollection->dropIndex('order_id_index');
    }
};
