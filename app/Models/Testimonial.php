<?php

declare(strict_types=1);

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Eloquent\SoftDeletes as MongoSoftDeletes;

/**
 * @property string $_id
 * @property string $name
 * @property string|null $designation
 * @property string $description
 * @property string|null $image
 * @property bool $status
 * @property string|null $seo_url
 * @property string|null $meta_title
 * @property string|null $meta_keyword
 * @property string|null $meta_description
 * @property string|null $created_by
 * @property string|null $updated_by
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 * @property-read string|null $image_url
 * @property-read User|null $creator
 * @property-read User|null $updater
 */
final class Testimonial extends Model
{
    use MongoSoftDeletes;

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
    protected $collection = 'testimonials';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'designation',
        'description',
        'image',
        'status',
        'seo_url',
        'meta_title',
        'meta_keyword',
        'meta_description',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = ['image_url'];

    /**
     * Get the image URL accessor.
     */
    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image) {
            return null;
        }

        return asset('uploads/testimonials/'.$this->image);
    }

    /**
     * Scope a query to only include active testimonials.
     */
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    /**
     * Scope a query to order testimonials.
     */
    public function scopeOrdered($query, string $column = 'created_at', string $direction = 'desc')
    {
        return $query->orderBy($column, $direction);
    }

    /**
     * Get the user who created this testimonial.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this testimonial.
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
