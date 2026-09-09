<?php

declare(strict_types=1);

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

final class Unit extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'units';

    protected $fillable = ['name', 'symbol', 'status', 'sort_order', 'created_by', 'updated_by'];

    protected $attributes = ['status' => 'active', 'sort_order' => 0];

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    protected function casts(): array
    {
        return ['sort_order' => 'integer'];
    }
}
