<?php

declare(strict_types=1);

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * @property string $_id
 * @property string|null $about_heading
 * @property string|null $about_description
 * @property string|null $about_image
 * @property string|null $mission_text
 * @property string|null $vision_text
 * @property string|null $credentials_text
 * @property array|null $gallery
 * @property array|null $videos
 * @property array|null $experience_items
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
final class AboutSetting extends Model
{
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
    protected $collection = 'about_settings';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'about_heading',
        'about_description',
        'about_image',
        'mission_text',
        'vision_text',
        'credentials_text',
        'gallery',
        'videos',
        'experience_items',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'gallery' => 'array',
        'videos' => 'array',
        'experience_items' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the singleton about settings instance.
     */
    public static function getInstance(): self
    {
        $about = self::first();

        if (! $about) {
            $about = self::create([
                'about_heading' => 'Rooted in Nature, Made for Everyday Wellbeing',
                'about_description' => '<p>We carefully source quality herbs and natural essentials to support your everyday wellbeing.</p>',
                'about_image' => null,
                'mission_text' => '<ul><li>Make trusted natural products accessible for everyday routines.</li><li>Share clear product information so customers can choose with confidence.</li></ul>',
                'vision_text' => '<ul><li>Build a trusted home for thoughtfully sourced herbal essentials.</li><li>Help more people bring natural wellbeing into daily life.</li></ul>',
                'credentials_text' => '<p>We focus on carefully selected products, clear information, and dependable customer support.</p>',
                'gallery' => [],
                'videos' => [],
                'experience_items' => [
                    ['icon' => 'BookOpen', 'title' => 'Clear Guidance', 'description' => 'Helpful information for choosing products with confidence'],
                    ['icon' => 'FlaskConical', 'title' => 'Thoughtful Selection', 'description' => 'A considered range of natural essentials'],
                    ['icon' => 'Network', 'title' => 'Reliable Sourcing', 'description' => 'Trusted partners and dependable fulfilment'],
                    ['icon' => 'HeartHandshake', 'title' => 'Customer Care', 'description' => 'Friendly support before and after your order'],
                    ['icon' => 'ShieldCheck', 'title' => 'Quality Focus', 'description' => 'Care at every step from selection to delivery'],
                    ['icon' => 'Layers', 'title' => 'Everyday Essentials', 'description' => 'Products chosen to fit naturally into daily routines'],
                ],
            ]);
        }

        return $about;
    }
}
