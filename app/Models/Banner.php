<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use MongoDB\Laravel\Eloquent\Model;

/**
 * @property string $_id
 * @property string|null $heading1
 * @property string|null $main_heading
 * @property string|null $image
 * @property string|null $mobile_image
 * @property string|null $description
 * @property bool $status
 * @property int $sort_order
 * @property string|null $created_by
 * @property string|null $updated_by
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 * @property-read string|null $image_url
 * @property-read User|null $creator
 * @property-read User|null $updater
 */
final class Banner extends Model
{
    use SoftDeletes;

    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'mongodb';

    /**
     * The collection associated with the model.
     *
     * @var string
     */
    protected $collection = 'banners';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'heading1',
        'main_heading',
        'image',
        'mobile_image',
        'description',
        'status',
        'sort_order',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should have default values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => true,
        'sort_order' => 0,
    ];

    /**
     * Get the full URL for the banner image.
     */
    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image) {
            return null;
        }

        return asset('uploads/banners/'.$this->image);
    }

    /**
     * Get the full URL for the mobile banner image.
     */
    public function getMobileImageUrlAttribute(): ?string
    {
        if (! $this->mobile_image) {
            return null;
        }

        return asset('uploads/banners/'.$this->mobile_image);
    }

    /**
     * Scope a query to only include active banners.
     */
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    /**
     * Scope a query to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc')->orderBy('created_at', 'desc');
    }

    /**
     * Get the admin who created this banner.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the admin who last updated this banner.
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Check if banner is active.
     */
    public function isActive(): bool
    {
        return $this->status === true;
    }

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'sort_order' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }
}
