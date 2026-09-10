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
            'default_video_1' => $settings->default_video_1 ?? null,
            'default_video_2' => $settings->default_video_2 ?? null,
            'homepageVideo' => $settings->homepage_video ?? null,
            'categoryVideo' => $settings->category_video ?? null,
            'trustFeatures' => collect(is_array($settings->trust_features) ? $settings->trust_features : [])
                ->take(4)
                ->map(fn (array $feature, int $index): array => [
                    'id' => (string) ($feature['id'] ?? $index + 1),
                    'image_url' => (string) ($feature['url'] ?? ''),
                ])
                ->filter(fn (array $feature): bool => $feature['image_url'] !== '')
                ->values()
                ->all(),
            'tickerText' => $settings->ticker_text ?? null,
            'tickerEnabled' => (bool) ($settings->ticker_enabled ?? false),
            'globalMetaTitle' => $settings->global_meta_title ?? null,
            'globalMetaDescription' => $settings->global_meta_description ?? null,
            'globalMetaKeywords' => $settings->global_meta_keywords ?? null,
            'globalOgTitle' => $settings->global_og_title ?? null,
            'globalOgDescription' => $settings->global_og_description ?? null,
            'globalOgImageUrl' => $settings->global_og_image_url ?: null,
            'globalTwitterTitle' => $settings->global_twitter_title ?? null,
            'globalTwitterDescription' => $settings->global_twitter_description ?? null,
            'globalTwitterImageUrl' => $settings->global_twitter_image_url ?: null,
            'globalOgImageWidth' => 1200,
            'globalOgImageHeight' => 630,
        ];
    }
}
