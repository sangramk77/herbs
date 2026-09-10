<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

final class PincodeController extends Controller
{
    public function show(Request $request, string $pincode): JsonResponse
    {
        if (! preg_match('/^\d{6}$/', $pincode)) {
            return response()->json(['success' => false, 'message' => 'Please enter a valid 6-digit PIN code.'], 422);
        }

        try {
            $response = Http::timeout(5)->acceptJson()->get("https://api.postalpincode.in/pincode/{$pincode}");
            $record = $response->successful() ? ($response->json()[0] ?? null) : null;
            $office = is_array($record) ? ($record['PostOffice'][0] ?? null) : null;
            if (! is_array($office) || ($record['Status'] ?? null) !== 'Success') {
                return response()->json(['success' => false, 'message' => 'No city found for this PIN code.'], 404);
            }

            $city = Str::title(Str::lower(mb_trim((string) ($office['District'] ?? ''))));
            $state = $this->normaliseState((string) ($office['State'] ?? ''));
            if ($city === '' || $state === '') {
                return response()->json(['success' => false, 'message' => 'No city found for this PIN code.'], 404);
            }

            return response()->json(['success' => true, 'city' => $city, 'state' => $state]);
        } catch (Throwable) {
            return response()->json(['success' => false, 'message' => 'Unable to verify PIN code right now.'], 503);
        }
    }

    private function normaliseState(string $state): string
    {
        $state = Str::title(Str::lower(mb_trim($state)));

        return ['Orissa' => 'Odisha', 'Chattisgarh' => 'Chhattisgarh', 'Uttarkhand' => 'Uttarakhand', 'Nct Of Delhi' => 'Delhi', 'Jammu & Kashmir' => 'Jammu and Kashmir'][$state] ?? $state;
    }
}
