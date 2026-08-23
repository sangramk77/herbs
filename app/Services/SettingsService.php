<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Setting;

final class SettingsService
{
    /**
     * Get settings data for frontend consumption.
     *
     * @return array<string, mixed>
     */
    public static function getSettingsData(): array
    {
        $settings = Setting::getInstance();

        return [
            'email1' => $settings->email ?? '',
            'address' => $settings->address ?? '',
            'phone1' => $settings->phone ?? '',
            'fbLink' => $settings->facebook_link ?? '',
            'twitterLink' => $settings->twitter_link ?? '',
            'instaLink' => $settings->instagram_link ?? '',
            'youtubeLink' => $settings->youtube_link ?? '',
            'cod_charge' => $settings->cod_charge ?? 50,
            'headerScripts' => $settings->header_scripts ?? '',
            'footerScripts' => $settings->footer_scripts ?? '',
        ];
    }
}
