<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Support\Str;
use MongoDB\Laravel\Eloquent\Model;

final class CmsPage extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'cms_pages';

    protected $fillable = [
        'page_name',
        'heading',
        'description',
        'description_json',
        'image',
        'is_active',
        'show_in_footer',
        'show_in_navbar',
        'seo_url',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];

    protected $attributes = [
        'is_active' => true,
        'show_in_footer' => true,
        'show_in_navbar' => false,
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'show_in_footer' => 'boolean',
        'show_in_navbar' => 'boolean',
    ];

    public static function generateSeoUrl(string $pageName): string
    {
        $slug = Str::slug($pageName);
        $original = $slug;
        $count = 1;

        while (self::where('seo_url', $slug)->exists()) {
            $slug = $original.'-'.$count;
            $count++;
        }

        return $slug;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
