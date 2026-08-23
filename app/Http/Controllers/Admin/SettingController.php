<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SettingRequest;
use App\Models\Setting;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

final class SettingController extends Controller
{
    /**
     * Display the settings page.
     */
    public function index(): Response
    {
        $settings = Setting::getInstance();

        return Inertia::render('admin/system/Settings', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update general settings.
     */
    public function updateGeneral(SettingRequest $request)
    {
        $settings = Setting::getInstance();

        $data = $request->only([
            'phone',
            'phone2',
            'email',
            'email2',
            'address',
            'cod_charge',
        ]);

        $data['updated_by'] = Auth::guard('admin')->id();

        $settings->update($data);

        return back()->with('success', 'General settings updated successfully.');
    }

    /**
     * Update counter settings.
     */
    public function updateCounter(SettingRequest $request)
    {
        $settings = Setting::getInstance();

        $data = $request->only([
            'active_clients',
            'varieties_of_rudraksha',
            'active_products',
            'country_cover',
        ]);

        $data['updated_by'] = Auth::guard('admin')->id();

        $settings->update($data);

        return back()->with('success', 'Counter settings updated successfully.');
    }

    /**
     * Update social media settings.
     */
    public function updateSocialMedia(SettingRequest $request)
    {
        $settings = Setting::getInstance();

        $data = $request->only([
            'facebook_link',
            'twitter_link',
            'instagram_link',
            'youtube_link',
        ]);

        $data['updated_by'] = Auth::guard('admin')->id();

        $settings->update($data);

        return back()->with('success', 'Social media settings updated successfully.');
    }

    /**
     * Update header and footer scripts.
     */
    public function updateScripts(SettingRequest $request)
    {
        $settings = Setting::getInstance();

        $data = $request->only([
            'header_scripts',
            'footer_scripts',
        ]);

        $data['updated_by'] = Auth::guard('admin')->id();

        $settings->update($data);

        return back()->with('success', 'Scripts updated successfully.');
    }
}
