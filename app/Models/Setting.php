<?php

declare(strict_types=1);

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * @property string $_id
 * @property string|null $phone
 * @property string|null $phone2
 * @property string|null $email
 * @property string|null $email2
 * @property string|null $address
 * @property int $cod_charge
 * @property string|null $facebook_link
 * @property string|null $twitter_link
 * @property string|null $instagram_link
 * @property string|null $youtube_link
 * @property int $active_clients
 * @property int $varieties_of_rudraksha
 * @property int $active_products
 * @property int $country_cover
 * @property string|null $header_scripts
 * @property string|null $footer_scripts
 * @property string|null $default_video_1
 * @property string|null $default_video_2
 * @property string|null $homepage_video
 * @property string|null $category_video
 * @property array|null $verification_files
 * @property array|null $trust_features
 * @property string|null $ticker_text
 * @property bool $ticker_enabled
 * @property string|null $global_meta_title
 * @property string|null $global_meta_description
 * @property string|null $global_meta_keywords
 * @property string|null $global_og_title
 * @property string|null $global_og_description
 * @property string|null $global_og_image_url
 * @property string|null $global_twitter_title
 * @property string|null $global_twitter_description
 * @property string|null $global_twitter_image_url
 * @property string|null $updated_by
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property-read User|null $updater
 */
final class Setting extends Model
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
    protected $collection = 'settings';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        // General Settings
        'phone',
        'phone2',
        'email',
        'email2',
        'address',
        'cod_charge',

        // Social Media Links
        'facebook_link',
        'twitter_link',
        'instagram_link',
        'youtube_link',

        // Counter Settings
        'active_clients',
        'varieties_of_rudraksha',
        'active_products',
        'country_cover',
        'header_scripts',
        'footer_scripts',

        // Default product videos
        'default_video_1',
        'default_video_2',
        'homepage_video',
        'category_video',
        'verification_files',
        'trust_features',
        'ticker_text',
        'ticker_enabled',

        // Global SEO defaults
        'global_meta_title',
        'global_meta_description',
        'global_meta_keywords',
        'global_og_title',
        'global_og_description',
        'global_og_image_url',
        'global_twitter_title',
        'global_twitter_description',
        'global_twitter_image_url',

        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'active_clients' => 'integer',
        'varieties_of_rudraksha' => 'integer',
        'active_products' => 'integer',
        'country_cover' => 'integer',
        'cod_charge' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'verification_files' => 'array',
        'trust_features' => 'array',
        'ticker_enabled' => 'boolean',
    ];

    /**
     * Get the singleton settings instance.
     */
    public static function getInstance(): self
    {
        $settings = self::first();

        if (! $settings) {
            $settings = self::create([
                'phone' => '',
                'phone2' => null,
                'email' => null,
                'email2' => null,
                'address' => null,
                'facebook_link' => null,
                'twitter_link' => null,
                'instagram_link' => null,
                'youtube_link' => null,
                'active_clients' => 0,
                'varieties_of_rudraksha' => 0,
                'active_products' => 0,
                'country_cover' => 0,
                'cod_charge' => 50,
                'header_scripts' => null,
                'footer_scripts' => null,
                'homepage_video' => null,
                'category_video' => null,
                'verification_files' => [],
                'trust_features' => [],
                'ticker_text' => 'For Bulk Order (B2B Business) Contact Us Directly Via(Call/Whatsapp)',
                'ticker_enabled' => true,
                'global_meta_title' => null,
                'global_meta_description' => null,
                'global_meta_keywords' => null,
                'global_og_title' => null,
                'global_og_description' => null,
                'global_og_image_url' => null,
                'global_twitter_title' => null,
                'global_twitter_description' => null,
                'global_twitter_image_url' => null,
            ]);
        }

        if ($settings->cod_charge === null) {
            $settings->cod_charge = 50;
            $settings->save();
        }

        $attributes = $settings->getAttributes();
        if (! array_key_exists('ticker_text', $attributes)) {
            $settings->ticker_text = 'For Bulk Order (B2B Business) Contact Us Directly Via(Call/Whatsapp)';
        }

        if (! array_key_exists('ticker_enabled', $attributes)) {
            $settings->ticker_enabled = true;
        }

        if (! array_key_exists('ticker_text', $attributes) || ! array_key_exists('ticker_enabled', $attributes)) {
            $settings->save();
        }

        return $settings;
    }

    /**
     * Get the user who last updated settings.
     */
    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
