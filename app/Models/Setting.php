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
            ]);
        }

        if ($settings->cod_charge === null) {
            $settings->cod_charge = 50;
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
