<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendOrderAcceptedEmail;
use App\Jobs\SendOrderDeliveredEmail;
use App\Jobs\SendOrderRejectedEmail;
use App\Jobs\SendOrderShippedEmail;
use App\Models\Order;
use App\Models\Product;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

final class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $paymentFilter = mb_strtolower((string) $request->query('payment', ''));

        $ordersQuery = Order::query();

        if ($paymentFilter === 'cod') {
            $ordersQuery->whereIn('payment_method', ['cod', 'COD']);
        }

        $orders = $ordersQuery->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Order $order) {
                $status = $order->status ?? 'Order Placed';
                if (in_array($status, ['Processing', 'Pending'], true)) {
                    $status = 'Order Placed';
                }
                $items = collect($order->items ?? []);
                $productIds = $items
                    ->map(fn (array $item) => $item['id'] ?? $item['product_id'] ?? $item['productId'] ?? null)
                    ->filter()
                    ->unique()
                    ->values();

                $productsById = $productIds->isNotEmpty()
                    ? Product::whereIn('_id', $productIds)
                        ->get(['_id', 'name'])
                        ->keyBy('_id')
                    : collect();

                $mappedItems = $items->map(function (array $item) use ($productsById) {
                    $productId = $item['id'] ?? $item['product_id'] ?? $item['productId'] ?? null;
                    $product = $productId ? $productsById->get($productId) : null;

                    return [
                        'name' => $product?->name ?? ($item['name'] ?? 'N/A'),
                        'quantity' => (int) ($item['quantity'] ?? 1),
                        'price' => (float) ($item['price'] ?? 0),
                    ];
                });

                $shipping = $order->shipping_address;
                $formattedAddress = is_array($shipping)
                    ? array_filter([
                        $shipping['line1'] ?? null,
                        $shipping['line2'] ?? null,
                        mb_trim(implode(' ', array_filter([
                            $shipping['city'] ?? null,
                            $shipping['state'] ?? null,
                            $shipping['postal_code'] ?? $shipping['zip'] ?? null,
                        ]))),
                        $shipping['country'] ?? null,
                    ])
                    : $shipping;

                return [
                    'id' => (string) $order->getKey(),
                    'orderId' => $order->order_id,
                    'date' => optional($order->created_at)->toISOString(),
                    'price' => (float) $order->total_price,
                    'customerName' => $order->customer_name,
                    'customerPhone' => $order->customer_phone,
                    'customerEmail' => $order->customer_email,
                    'status' => $status,
                    'paymentMethod' => $order->payment_method,
                    'paymentStatus' => $order->payment_status ?? 'pending',
                    'shippingAddress' => $formattedAddress,
                    'shippingAddressFields' => is_array($shipping) ? $shipping : null,
                    'products' => $mappedItems->values(),
                    'courierName' => $order->courier_name,
                    'trackingId' => $order->tracking_id,
                    'receivedBy' => $order->received_by,
                    'comment' => $order->notes ?? '',
                    'billUrl' => $order->bill_pdf_path ? asset($order->bill_pdf_path) : null,
                ];
            })
            ->values();

        return Inertia::render('admin/Orders', [
            'orders' => $orders,
        ]);
    }

    public function updateStatus(Request $request, string $orderId): RedirectResponse
    {
        $order = Order::where('order_id', $orderId)->firstOrFail();

        $currentStatus = $order->status ?? 'Order Placed';
        if (in_array($currentStatus, ['Processing', 'Pending'], true)) {
            $currentStatus = 'Order Placed';
        }

        if ($currentStatus === 'Delivered') {
            return back()->with('error', 'Delivered orders cannot be updated.');
        }

        $validated = $request->validate([
            'status' => ['required', 'string'],
            'courier_name' => ['nullable', 'string', 'max:120'],
            'tracking_id' => ['nullable', 'string', 'max:120'],
            'received_by' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $status = $validated['status'];
        $now = now();
        $previousStatus = $currentStatus;

        $allowedTransitions = [
            'Order Placed' => ['Order Accepted', 'Order Rejected'],
            'Order Accepted' => ['Shipped', 'Out for Delivery', 'Delivered'],
            'Shipped' => ['Out for Delivery', 'Delivered'],
            'Out for Delivery' => ['Delivered'],
            'Order Rejected' => [],
        ];

        if ($status !== $currentStatus) {
            $allowedNext = $allowedTransitions[$currentStatus] ?? [];
            if (! in_array($status, $allowedNext, true)) {
                return back()->with('error', 'Invalid status transition.');
            }
        }

        if ($status === 'Shipped') {
            if (empty($validated['courier_name']) || empty($validated['tracking_id'])) {
                return back()->with('error', 'Courier name and tracking ID are required for shipped orders.');
            }
            $order->courier_name = $validated['courier_name'];
            $order->tracking_id = $validated['tracking_id'];
            $order->shipped_at = $now;
        }

        if ($status === 'Order Accepted') {
            $order->accepted_at = $now;
        }

        if ($status === 'Order Rejected') {
            $order->rejected_at = $now;
        }

        if ($status === 'Out for Delivery') {
            $order->out_for_delivery_at = $now;
        }

        if ($status === 'Delivered') {
            if (empty($validated['received_by'])) {
                return back()->with('error', 'Received by is required for delivered orders.');
            }
            $order->received_by = $validated['received_by'];
            $order->delivered_at = $now;

            // Update payment status to Paid for COD orders
            if (mb_strtoupper((string) $order->payment_method) === 'COD'
                && mb_strtolower((string) $order->payment_status) === 'pending') {
                $order->payment_status = 'completed';
            }
        }

        $order->status = $status;
        $order->notes = $validated['notes'] ?? $order->notes;
        $order->save();

        // Notify customer immediately when admin accepts/rejects the order.
        if ($status !== $previousStatus) {
            if ($status === 'Order Accepted') {
                try {
                    SendOrderAcceptedEmail::dispatch($order);
                } catch (Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to dispatch order accepted email job', [
                        'order_id' => $order->order_id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            if ($status === 'Order Rejected') {
                $reason = $validated['notes'] ?? null;
                if (! is_string($reason) || mb_trim($reason) === '') {
                    $reason = 'Rejected due to internal policy.';
                }

                try {
                    SendOrderRejectedEmail::dispatch($order, $reason);
                } catch (Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to dispatch order rejected email job', [
                        'order_id' => $order->order_id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            if ($status === 'Shipped') {
                try {
                    SendOrderShippedEmail::dispatch($order);
                } catch (Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to dispatch order shipped email job', [
                        'order_id' => $order->order_id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            if ($status === 'Delivered') {
                try {
                    SendOrderDeliveredEmail::dispatch($order);
                } catch (Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to dispatch order delivered email job', [
                        'order_id' => $order->order_id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        return back()->with('success', 'Order status updated.');
    }

    public function uploadBill(Request $request, string $orderId): RedirectResponse
    {
        $order = Order::where('order_id', $orderId)->firstOrFail();

        $validated = $request->validate([
            'bill' => ['required', 'file', 'mimes:pdf', 'max:2048'], // 2MB
        ]);

        /** @var UploadedFile $file */
        $file = $validated['bill'];

        $directory = public_path('uploads/bills');
        if (! File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        // If replacing an existing bill, delete the old file to avoid orphaned PDFs.
        if (! empty($order->bill_pdf_path)) {
            $existingPath = public_path((string) $order->bill_pdf_path);
            if (File::exists($existingPath)) {
                File::delete($existingPath);
            }
        }

        $filename = 'bill-'.$orderId.'-'.time().'.pdf';
        $file->move($directory, $filename);

        // Store a public path (relative to /public) so it can be served directly.
        $order->bill_pdf_path = 'uploads/bills/'.$filename;
        $order->bill_uploaded_at = now();
        $order->save();

        return back()->with('success', 'Bill uploaded.');
    }

    public function deleteBill(string $orderId): RedirectResponse
    {
        $order = Order::where('order_id', $orderId)->firstOrFail();

        if (! empty($order->bill_pdf_path)) {
            $existingPath = public_path((string) $order->bill_pdf_path);
            if (File::exists($existingPath)) {
                File::delete($existingPath);
            }
        }

        $order->bill_pdf_path = null;
        $order->bill_uploaded_at = null;
        $order->save();

        return back()->with('success', 'Bill removed.');
    }
}
