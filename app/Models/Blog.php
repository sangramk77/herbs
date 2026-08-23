<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use MongoDB\Laravel\Eloquent\Model;

/**
 * @property string $_id
 * @property string $blog_title
 * @property string|null $blog_category_id
 * @property string|null $description
 * @property array|null $description_json
 * @property string|null $post_by
 * @property string|null $meta_title
 * @property string|null $meta_keyword
 * @property string|null $meta_description
 * @property string|null $thumbnail
 * @property string|null $banner
 * @property \Carbon\Carbon|null $publish_date
 * @property bool $status
 * @property string|null $seo_url
 * @property string|null $created_by
 * @property string|null $updated_by
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 * @property-read string|null $thumbnail_url
 * @property-read string|null $banner_url
 * @property-read User|null $creator
 * @property-read User|null $updater
 */
final class Blog extends Model
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
    protected $collection = 'blogs';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'blog_title',
        'blog_category_id',
        'description',
        'description_json',
        'post_by',
        'meta_title',
        'meta_keyword',
        'meta_description',
        'thumbnail',
        'banner',
        'publish_date',
        'status',
        'seo_url',
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
    ];

    /**
     * Get the full URL for the thumbnail image.
     */
    public function getThumbnailUrlAttribute(): ?string
    {
        if (! $this->thumbnail) {
            return null;
        }

        return asset('uploads/blogs/thumbnails/'.$this->thumbnail);
    }

    /**
     * Get the full URL for the banner image.
     */
    public function getBannerUrlAttribute(): ?string
    {
        if (! $this->banner) {
            return null;
        }

        return asset('uploads/blogs/banners/'.$this->banner);
    }

    /**
     * Scope a query to only include active blogs.
     */
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    /**
     * Scope a query to only include published blogs.
     */
    public function scopePublished($query)
    {
        return $query->where('status', true)
            ->where(function ($query) {
                $query->whereNull('publish_date')
                    ->orWhere('publish_date', '<=', now());
            });
    }

    /**
     * Scope a query to order by publish date.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('publish_date', 'desc')->orderBy('created_at', 'desc');
    }

    /**
     * Get the admin who created this blog.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the admin who last updated this blog.
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Check if blog is active.
     */
    public function isActive(): bool
    {
        return $this->status === true;
    }

    /**
     * Check if blog is published.
     */
    public function isPublished(): bool
    {
        return $this->status === true && $this->publish_date && $this->publish_date <= now();
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
            'publish_date' => 'date',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }
}
