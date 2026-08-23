<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminManagementController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\BlogAiController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CmsPageController as AdminCmsPageController;
use App\Http\Controllers\Admin\ContactSubmissionController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Admin\NewsletterSubscriberController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\CmsPageController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\WishlistController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Custom Password Reset Link Route (overrides Fortify default for better UX)
Route::post('/forgot-password', [App\Http\Controllers\Auth\PasswordResetLinkController::class, 'store'])
    ->middleware('guest')
    ->name('password.email');

// Token Expired Route (for invalid/used password reset links)
Route::get('/password/token-expired', fn () => Inertia::render('auth/token-expired'))
    ->middleware('guest')
    ->name('password.token-expired');

// Home page route
Route::get('/', [App\Http\Controllers\HomeController::class, 'index'])->name('home');

// Product Detail Route
Route::get('/product', [App\Http\Controllers\ProductController::class, 'index'])->name('product.index');
Route::get('/popular-products', [App\Http\Controllers\ProductController::class, 'popular'])->name('popular-products');
Route::get('/category/{categorySlug}', [App\Http\Controllers\ProductController::class, 'category'])->name('category.show');
Route::get('/category/{categorySlug}/product/{slug}', [App\Http\Controllers\ProductController::class, 'showByCategory'])->name('product.show.category');
Route::get('/product/{slug}', [App\Http\Controllers\ProductController::class, 'show'])->name('product.show');
Route::post('/add-to-cart', [App\Http\Controllers\CartController::class, 'store'])->name('addtocart');
Route::post('/cart/update', [App\Http\Controllers\CartController::class, 'update'])->name('cart.update');
Route::post('/cart/remove', [App\Http\Controllers\CartController::class, 'destroy'])->name('cart.remove');
Route::post('/wishlist', [WishlistController::class, 'store'])->name('wishlist.add');

// Checkout pages (guest allowed)
Route::get('/cart', [App\Http\Controllers\CheckoutController::class, 'index'])->name('cart');
Route::get('/checkout', [App\Http\Controllers\CheckoutController::class, 'index'])->name('checkout');
Route::post('/payment/webhook', [App\Http\Controllers\PaymentController::class, 'handleWebhook'])
    ->name('payment.webhook');

// Checkout actions (requires authentication)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/checkout/coupon/apply', [CouponController::class, 'apply'])->name('checkout.coupon.apply');
    Route::post('/checkout/coupon/remove', [CouponController::class, 'remove'])->name('checkout.coupon.remove');

    Route::post('/checkout', [App\Http\Controllers\CheckoutController::class, 'process'])->name('checkout.process');

    // Payment Routes
    Route::post('/payment/create-order', [App\Http\Controllers\PaymentController::class, 'createOrder'])->name('payment.create-order');
    Route::post('/payment/verify', [App\Http\Controllers\PaymentController::class, 'verifyPayment'])->name('payment.verify');
    Route::post('/payment/failure', [App\Http\Controllers\PaymentController::class, 'handleFailure'])->name('payment.failure');
});

// Blog Routes
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{seoUrl}', [BlogController::class, 'show'])->name('blog.show');
Route::post('/blog/{seoUrl}/reaction', [BlogController::class, 'react'])->name('blog.react');
Route::get('/faq', [FaqController::class, 'index'])->name('faq.index');
Route::get('/contact', [ContactController::class, 'index'])->name('contact.index');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
Route::post('/newsletter/subscribe', [NewsletterController::class, 'store'])
    ->name('newsletter.subscribe');
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap.xml');

// User Routes (with redirect if admin)
Route::middleware(['auth', 'verified', 'redirect.if.admin'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/success/{orderId}', [OrderController::class, 'success'])
        ->name('orders.success');
    Route::redirect('/profile', '/settings/profile')->name('profile.redirect');
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
});

// Admin Authentication Routes (guest only)
Route::prefix('admin')->middleware('guest:admin')->group(function () {
    Route::get('/login', [AdminAuthController::class, 'showLoginForm'])
        ->name('admin.login');
    Route::post('/login', [AdminAuthController::class, 'login']);
});

// Admin Routes (authenticated admin only)
Route::prefix('admin')->middleware(['auth:admin', 'admin'])->group(function () {
    // Logout
    Route::post('/logout', [AdminAuthController::class, 'logout'])
        ->name('admin.logout');

    // Dashboard
    Route::get('/', [App\Http\Controllers\Admin\DashboardController::class, 'index'])
        ->name('admin.dashboard');

    // Profile Routes
    Route::get('/profile', [ProfileController::class, 'show'])
        ->name('admin.profile');
    Route::post('/profile', [ProfileController::class, 'update'])
        ->name('admin.profile.update');
    Route::post('/profile/password', [ProfileController::class, 'changePassword'])
        ->name('admin.profile.password');

    // Product Routes
    Route::get('/products', [ProductController::class, 'index'])
        ->name('admin.products.index');
    Route::get('/products/create', [ProductController::class, 'create'])
        ->name('admin.products.create');
    Route::post('/products', [ProductController::class, 'store'])
        ->name('admin.products.store');
    Route::get('/products/{id}/edit', [ProductController::class, 'edit'])
        ->name('admin.products.edit');
    Route::put('/products/{id}', [ProductController::class, 'update'])
        ->name('admin.products.update');
    Route::delete('/products/{id}', [ProductController::class, 'destroy'])
        ->name('admin.products.destroy');
    Route::post('/products/{id}/toggle-status', [ProductController::class, 'toggleStatus'])
        ->name('admin.products.toggle-status');
    Route::post('/products/{id}/toggle-featured', [ProductController::class, 'toggleFeatured'])
        ->name('admin.products.toggle-featured');
    Route::post('/products/{id}/toggle-stock', [ProductController::class, 'toggleStock'])
        ->name('admin.products.toggle-stock');
    Route::get('/best-sellers', [ProductController::class, 'bestSellers'])
        ->name('admin.best-sellers.index');
    Route::put('/best-sellers/{id}/sort-order', [ProductController::class, 'updateBestSellerSortOrder'])
        ->name('admin.best-sellers.sort-order');
    Route::put('/best-sellers/sort-orders', [ProductController::class, 'updateBestSellerSortOrders'])
        ->name('admin.best-sellers.sort-orders');

    // Category Routes
    Route::prefix('categories')->name('admin.categories.')->group(function () {
        Route::get('/', [CategoryController::class, 'index'])
            ->name('index');
        Route::get('/create', [CategoryController::class, 'create'])
            ->name('create');
        Route::post('/', [CategoryController::class, 'store'])
            ->name('store');
        Route::get('/{id}/edit', [CategoryController::class, 'edit'])
            ->name('edit');
        Route::put('/{id}', [CategoryController::class, 'update'])
            ->name('update');
        Route::delete('/{id}', [CategoryController::class, 'destroy'])
            ->name('destroy');
        Route::post('/{id}/toggle-status', [CategoryController::class, 'toggleStatus'])
            ->name('toggle-status');
        Route::post('/{id}/reassign-and-delete', [CategoryController::class, 'reassignAndDelete'])
            ->name('reassign-and-delete');
    });

    // Coupon Routes
    Route::prefix('coupons')->name('admin.coupons.')->group(function () {
        Route::get('/', [AdminCouponController::class, 'index'])->name('index');
        Route::get('/create', [AdminCouponController::class, 'create'])->name('create');
        Route::post('/', [AdminCouponController::class, 'store'])->name('store');
        Route::get('/{id}/edit', [AdminCouponController::class, 'edit'])->name('edit');
        Route::put('/{id}', [AdminCouponController::class, 'update'])->name('update');
        Route::delete('/{id}', [AdminCouponController::class, 'destroy'])->name('destroy');
        Route::post('/{id}/toggle-status', [AdminCouponController::class, 'toggleStatus'])->name('toggle-status');
    });

    // API endpoint for active categories (for product form dropdown)
    Route::get('/api/categories/active', [CategoryController::class, 'getActiveCategories'])
        ->name('api.categories.active');

    // Customer Routes
    Route::get('/customers', [AdminCustomerController::class, 'index'])->name('admin.customers');

    // Order Routes
    Route::get('/orders', [AdminOrderController::class, 'index'])->name('admin.orders');
    Route::post('/orders/{orderId}/status', [AdminOrderController::class, 'updateStatus'])
        ->name('admin.orders.status');
    Route::post('/orders/{orderId}/bill', [AdminOrderController::class, 'uploadBill'])
        ->name('admin.orders.bill');
    Route::delete('/orders/{orderId}/bill', [AdminOrderController::class, 'deleteBill'])
        ->name('admin.orders.bill.delete');

    // System Routes
    Route::prefix('system')->group(function () {
        Route::get('/settings', [App\Http\Controllers\Admin\SettingController::class, 'index'])->name('admin.system.settings');
        Route::post('/settings/general', [App\Http\Controllers\Admin\SettingController::class, 'updateGeneral'])->name('admin.system.settings.general');
        Route::post('/settings/counter', [App\Http\Controllers\Admin\SettingController::class, 'updateCounter'])->name('admin.system.settings.counter');
        Route::post('/settings/social-media', [App\Http\Controllers\Admin\SettingController::class, 'updateSocialMedia'])->name('admin.system.settings.social-media');
        Route::post('/settings/scripts', [App\Http\Controllers\Admin\SettingController::class, 'updateScripts'])->name('admin.system.settings.scripts');
    });

    // CMS Routes
    Route::prefix('cms')->group(function () {
        Route::get('/pages', [AdminCmsPageController::class, 'index'])->name('admin.cms.pages');
        Route::get('/pages/add', fn () => Inertia::render('admin/cms/AddPage'))->name('admin.cms.pages.add');
        Route::post('/pages', [AdminCmsPageController::class, 'store'])->name('admin.cms.pages.store');
        Route::get('/pages/{id}/edit', [AdminCmsPageController::class, 'edit'])->name('admin.cms.pages.edit');
        Route::post('/pages/{id}', [AdminCmsPageController::class, 'update'])->name('admin.cms.pages.update');
        Route::post('/pages/{id}/toggle', [AdminCmsPageController::class, 'toggle'])->name('admin.cms.pages.toggle');

        Route::get('/banner', [BannerController::class, 'index'])->name('admin.cms.banner');
        Route::get('/banner/create', [BannerController::class, 'create'])->name('admin.cms.banner.create');
        Route::post('/banner', [BannerController::class, 'store'])->name('admin.cms.banner.store');
        Route::get('/banner/{id}/edit', [BannerController::class, 'edit'])->name('admin.cms.banner.edit');
        Route::put('/banner/{id}', [BannerController::class, 'update'])->name('admin.cms.banner.update');
        Route::delete('/banner/{id}', [BannerController::class, 'destroy'])->name('admin.cms.banner.destroy');
        Route::post('/banner/{id}/toggle-status', [BannerController::class, 'toggleStatus'])->name('admin.cms.banner.toggle-status');

        Route::get('/sections', fn () => Inertia::render('admin/cms/Sections'))->name('admin.cms.sections');

        Route::get('/faq', [App\Http\Controllers\Admin\FaqController::class, 'index'])->name('admin.cms.faq');
        Route::get('/faq/create', [App\Http\Controllers\Admin\FaqController::class, 'create'])->name('admin.cms.faq.create');
        Route::post('/faq', [App\Http\Controllers\Admin\FaqController::class, 'store'])->name('admin.cms.faq.store');
        Route::get('/faq/{id}/edit', [App\Http\Controllers\Admin\FaqController::class, 'edit'])->name('admin.cms.faq.edit');
        Route::put('/faq/{id}', [App\Http\Controllers\Admin\FaqController::class, 'update'])->name('admin.cms.faq.update');
        Route::delete('/faq/{id}', [App\Http\Controllers\Admin\FaqController::class, 'destroy'])->name('admin.cms.faq.destroy');
        Route::post('/faq/{id}/toggle-visibility', [App\Http\Controllers\Admin\FaqController::class, 'toggleVisibility'])->name('admin.cms.faq.toggle-visibility');

        Route::get('/blog', [App\Http\Controllers\Admin\BlogController::class, 'index'])->name('admin.cms.blog');
        Route::get('/blog/create', [App\Http\Controllers\Admin\BlogController::class, 'create'])->name('admin.cms.blog.create');
        Route::post('/blog', [App\Http\Controllers\Admin\BlogController::class, 'store'])->name('admin.cms.blog.store');
        Route::get('/blog/{id}/edit', [App\Http\Controllers\Admin\BlogController::class, 'edit'])->name('admin.cms.blog.edit');
        Route::put('/blog/{id}', [App\Http\Controllers\Admin\BlogController::class, 'update'])->name('admin.cms.blog.update');
        Route::delete('/blog/{id}', [App\Http\Controllers\Admin\BlogController::class, 'destroy'])->name('admin.cms.blog.destroy');
        Route::post('/blog/{id}/toggle-status', [App\Http\Controllers\Admin\BlogController::class, 'toggleStatus'])->name('admin.cms.blog.toggle-status');

        // AI Blog Generation Route
        Route::post('/blog/ai-generate', [BlogAiController::class, 'generate'])->name('admin.cms.blog.ai-generate');

        Route::get('/testimonial', [App\Http\Controllers\Admin\TestimonialController::class, 'index'])->name('admin.cms.testimonial');
        Route::get('/testimonial/create', [App\Http\Controllers\Admin\TestimonialController::class, 'create'])->name('admin.cms.testimonial.create');
        Route::post('/testimonial', [App\Http\Controllers\Admin\TestimonialController::class, 'store'])->name('admin.cms.testimonial.store');
        Route::get('/testimonial/{id}/edit', [App\Http\Controllers\Admin\TestimonialController::class, 'edit'])->name('admin.cms.testimonial.edit');
        Route::put('/testimonial/{id}', [App\Http\Controllers\Admin\TestimonialController::class, 'update'])->name('admin.cms.testimonial.update');
        Route::delete('/testimonial/{id}', [App\Http\Controllers\Admin\TestimonialController::class, 'destroy'])->name('admin.cms.testimonial.destroy');
        Route::post('/testimonial/{id}/toggle-status', [App\Http\Controllers\Admin\TestimonialController::class, 'toggleStatus'])->name('admin.cms.testimonial.toggle-status');
    });

    // Contact Submissions
    Route::get('/contact-submissions', [ContactSubmissionController::class, 'index'])
        ->name('admin.contact-submissions');

    // Newsletter Subscribers
    Route::get('/newsletter-subscribers', [NewsletterSubscriberController::class, 'index'])
        ->name('admin.newsletter-subscribers');
    Route::delete('/newsletter-subscribers/{id}', [NewsletterSubscriberController::class, 'destroy'])
        ->name('admin.newsletter-subscribers.destroy');

    // Admin Management Routes (Super Admin Only)
    Route::middleware(['role:'.App\Models\User::ROLE_SUPER_ADMIN])->group(function () {
        Route::get('/admins', [AdminManagementController::class, 'index'])
            ->name('admin.admins.index');
        Route::get('/admins/create', [AdminManagementController::class, 'create'])
            ->name('admin.admins.create');
        Route::post('/admins', [AdminManagementController::class, 'store'])
            ->name('admin.admins.store');
        Route::get('/admins/{id}/edit', [AdminManagementController::class, 'edit'])
            ->name('admin.admins.edit');
        Route::put('/admins/{id}', [AdminManagementController::class, 'update'])
            ->name('admin.admins.update');
        Route::delete('/admins/{id}', [AdminManagementController::class, 'destroy'])
            ->name('admin.admins.destroy');
        Route::post('/admins/{id}/toggle-status', [AdminManagementController::class, 'toggleStatus'])
            ->name('admin.admins.toggle-status');
    });
});

require __DIR__.'/settings.php';

// CMS Pages (public)
Route::get('/{seoUrl}', [CmsPageController::class, 'show'])->name('cms.page.show');
