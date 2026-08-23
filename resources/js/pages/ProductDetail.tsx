import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Check,
    Heart,
    Home,
    Minus,
    Plus,
    ShieldCheck,
    ShoppingCart,
} from 'lucide-react';
import { useState } from 'react';
import { FaLinkedin } from 'react-icons/fa6';
import { SiFacebook, SiInstagram, SiX } from 'react-icons/si';
import { toast } from 'sonner';
import Lightbox from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';

import { RelatedProducts } from '@/components/product/RelatedProducts';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type {
    CartItem,
    NavCategory,
    Product,
    ProductDetail as ProductDetailType,
    Settings,
} from '@/types/site-types';
import '@/styles/product-lightbox.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/styles.css';

interface ProductDetailProps {
    settings: Settings;
    cart_count: number;
    cart_price: number;
    cart_items: CartItem[];
    wishlist_count: number;
    wishlist_items: any[];
    wishlist_ids: string[];
    product_details: ProductDetailType;
    related_product: Product[];
    popular_product: Product[];
    featured_product: Product[];
    all_product: Product[];
    auth: {
        user?: {
            name: string;
            email: string;
        };
    };
}

export default function ProductDetail({
    settings,
    cart_count,
    cart_price,
    cart_items,
    wishlist_count,
    wishlist_items,
    wishlist_ids,
    product_details,
    popular_product,
    featured_product,
    all_product,
    auth,
}: ProductDetailProps) {
    const page = usePage<{
        navCategories?: NavCategory[];
        cmsPages?: { pageName: string; seoUrl: string }[];
    }>();
    const headerCategories = page.props.navCategories ?? [];
    const headerPages = page.props.cmsPages ?? [];

    const [mainImage, setMainImage] = useState(product_details.image1);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [isUpdating, setIsUpdating] = useState(false);

    const { processing } = useForm({});

    // Detect if this product is already in cart
    const cartItem = cart_items.find(
        (item) => item.id === String(product_details.id),
    );
    const cartQty = cartItem?.quantity ?? 0;
    const isInCart = cartQty > 0;

    const handleCartUpdate = (action: 'increase' | 'decrease') => {
        setIsUpdating(true);
        router.post(
            '/cart/update',
            { productId: String(product_details.id), action },
            {
                preserveScroll: true,
                onFinish: () => setIsUpdating(false),
            },
        );
    };

    const handleRemoveFromCart = () => {
        setIsUpdating(true);
        router.post(
            '/cart/remove',
            { productId: String(product_details.id) },
            {
                preserveScroll: true,
                onFinish: () => setIsUpdating(false),
            },
        );
    };
    const maxOrderableQuantity =
        product_details.stock <= 0
            ? 0
            : product_details.stock === 1
              ? 99
              : product_details.stock;

    const productPath = product_details.categorySlug
        ? `/category/${product_details.categorySlug}/product/${product_details.seoUrl}`
        : `/product/${product_details.seoUrl}`;
    const breadcrumbCategoryName = product_details.categoryName?.trim();
    const breadcrumbCategoryHref = product_details.categorySlug
        ? `/category/${product_details.categorySlug}`
        : null;
    const appUrl = (
        import.meta.env.VITE_APP_URL as string | undefined
    )?.replace(/\/$/, '');
    const canonicalUrl = appUrl ? `${appUrl}${productPath}` : productPath;
    const shareUrl =
        typeof window !== 'undefined' ? window.location.href : canonicalUrl;
    const metaTitle = product_details.metaTitle || product_details.productsName;
    const metaDescription =
        product_details.metaDescription || product_details.short_description;
    const productImageUrl = product_details.image1Url
        ? product_details.image1Url
        : appUrl
          ? `${appUrl}/uploads/products/${product_details.image1}`
          : `/uploads/products/${product_details.image1}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied');
        } catch {
            toast.error('Unable to copy link');
        }
    };

    const facebookShareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl,
    )}`;
    const twitterShareHref = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl,
    )}&text=${encodeURIComponent(metaTitle)}`;
    const linkedinShareHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl,
    )}`;

    // Images array for gallery (including primary)
    // Ensure duplicates are removed if primary_image is also in images array
    // Wait, the controller handles uniqueness.
    const galleryImages =
        product_details.images.length > 0
            ? [product_details.image1, ...product_details.images]
            : [product_details.image1];

    // De-duplicate just in case
    const uniqueGalleryImages = Array.from(new Set(galleryImages));

    const handleAddToCart = () => {
        // Ensure we're using the current state value
        const currentQuantity = selectedQuantity;

        if (currentQuantity < 1) {
            toast.error('Please select a valid quantity');
            return;
        }

        if (currentQuantity > maxOrderableQuantity) {
            toast.error('Selected quantity exceeds available stock');
            return;
        }

        router.post(
            '/add-to-cart',
            {
                productId: product_details.id,
                quantity: currentQuantity,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`${currentQuantity} item(s) added to cart`);
                    // Reset quantity to 1 after successful add
                    setSelectedQuantity(1);
                },
                onError: (errors) => {
                    console.error('Add to cart error:', errors);
                    toast.error('Failed to add product to cart');
                },
            },
        );
    };

    const addToWishlist = () => {
        const wasInWishlist = product_details.is_in_wishlist;
        router.post(
            '/wishlist',
            {
                productId: product_details.id,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (wasInWishlist) {
                        toast.error('Removed from wishlist');
                        return;
                    }

                    toast.success('Product added to wishlist');
                },
            },
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title={metaTitle}>
                <meta name="description" content={metaDescription} />
                <meta
                    name="keywords"
                    content={product_details.metaKeyword?.join(', ')}
                />
                <meta property="og:type" content="product" />
                <meta property="og:title" content={metaTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={productImageUrl} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={metaTitle} />
                <meta name="twitter:description" content={metaDescription} />
                <meta name="twitter:image" content={productImageUrl} />
                <link rel="canonical" href={canonicalUrl} />
            </Head>

            <SiteHeader
                settings={settings}
                cart={{
                    count: cart_count,
                    price: cart_price,
                    items: cart_items,
                }}
                wishlist={{
                    count: wishlist_count,
                    items: wishlist_items,
                }}
                products={all_product}
                categories={headerCategories}
                user={auth?.user}
                pages={headerPages}
            />

            {/* Breadcrumb */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-500/20 via-amber-500/15 to-orange-600/20 py-5 backdrop-blur-sm md:py-7">
                {/* Background layer for frosted effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-100/40 via-amber-50/30 to-orange-100/40" />

                {/* Decorative glass elements */}
                <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-orange-400/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-2xl" />

                <div className="relative z-10 container mx-auto px-4">
                    <h1 className="mb-1 text-lg font-bold text-gray-800 md:text-xl">
                        Product Details
                    </h1>
                    <nav
                        aria-label="breadcrumb"
                        className="flex items-center gap-1 text-[11px] font-medium text-gray-700 md:text-xs"
                    >
                        <Link
                            href="/"
                            className="flex items-center gap-1 hover:text-orange-600"
                        >
                            <Home className="h-3 w-3" /> Home
                        </Link>
                        {breadcrumbCategoryName ? (
                            <>
                                <span>/</span>
                                {breadcrumbCategoryHref ? (
                                    <Link
                                        href={breadcrumbCategoryHref}
                                        className="hover:text-orange-600"
                                    >
                                        {breadcrumbCategoryName}
                                    </Link>
                                ) : (
                                    <span className="text-gray-600">
                                        {breadcrumbCategoryName}
                                    </span>
                                )}
                            </>
                        ) : null}
                        <span>/</span>
                        <span className="text-gray-600">
                            {product_details.productsName}
                        </span>
                    </nav>
                </div>
            </div>

            <main className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
                            {/* Image Gallery */}
                            <div className="flex flex-col items-center space-y-4">
                                <div
                                    className="relative w-full cursor-zoom-in overflow-hidden rounded-xl border bg-white shadow-sm"
                                    onClick={() => {
                                        const index =
                                            uniqueGalleryImages.indexOf(
                                                mainImage,
                                            );
                                        setLightboxIndex(
                                            index >= 0 ? index : 0,
                                        );
                                        setLightboxOpen(true);
                                    }}
                                >
                                    <img
                                        src={`/uploads/products/${mainImage}`}
                                        alt={product_details.productsName}
                                        className="aspect-square w-full object-contain p-4 transition-transform hover:scale-105"
                                    />
                                </div>

                                {uniqueGalleryImages.length > 1 && (
                                    <div className="flex w-full justify-center gap-2 overflow-x-auto pb-2">
                                        {uniqueGalleryImages.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() =>
                                                    setMainImage(img)
                                                }
                                                className={cn(
                                                    'relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:ring-2 hover:ring-primary',
                                                    mainImage === img
                                                        ? 'ring-2 ring-primary'
                                                        : 'opacity-70 hover:opacity-100',
                                                )}
                                            >
                                                <img
                                                    src={`/uploads/products/${img}`}
                                                    alt={`Thumbnail ${idx}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <Lightbox
                                    className="product-lightbox"
                                    open={lightboxOpen}
                                    close={() => setLightboxOpen(false)}
                                    index={lightboxIndex}
                                    on={{ view: ({ index }) => setLightboxIndex(index) }}
                                    plugins={[Thumbnails]}
                                    animation={{
                                        fade: 260,
                                        swipe: 340,
                                        easing: {
                                            fade: 'cubic-bezier(0.22, 1, 0.36, 1)',
                                            swipe: 'cubic-bezier(0.22, 1, 0.36, 1)',
                                            navigation:
                                                'cubic-bezier(0.22, 1, 0.36, 1)',
                                        },
                                    }}
                                    carousel={{
                                        imageFit: 'contain',
                                        padding: '48px',
                                    }}
                                    thumbnails={{
                                        position: 'bottom',
                                        width: 96,
                                        height: 72,
                                        gap: 10,
                                        border: 0,
                                        borderRadius: 14,
                                        padding: 0,
                                        vignette: false,
                                    }}
                                    render={{
                                        controls: () => (
                                            <div className="product-lightbox__counter">
                                                {lightboxIndex + 1} /{' '}
                                                {uniqueGalleryImages.length}
                                            </div>
                                        ),
                                    }}
                                    slides={uniqueGalleryImages.map((src) => ({
                                        src: `/uploads/products/${src}`,
                                    }))}
                                />
                            </div>

                            {/* Product Info */}
                            <div className="space-y-6">
                                <div>
                                    <h2 className="mb-2 text-3xl font-bold text-gray-900">
                                        {product_details.productsName}
                                    </h2>
                                    {product_details.stock > 0 ? (
                                        <Badge
                                            variant="outline"
                                            className="border-green-500 bg-green-50 text-green-600"
                                        >
                                            In Stock
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive">
                                            Out of Stock
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-end gap-3">
                                    <span className="text-3xl font-bold text-primary">
                                        ₹
                                        {product_details.price.toLocaleString(
                                            'en-IN',
                                        )}
                                    </span>
                                    {product_details.mrp >
                                        product_details.price && (
                                        <div className="flex flex-col text-sm text-muted-foreground">
                                            <span className="line-through">
                                                ₹
                                                {product_details.mrp.toLocaleString(
                                                    'en-IN',
                                                )}
                                            </span>
                                            {product_details.discount && (
                                                <span className="font-medium text-green-600">
                                                    {product_details.discount}%
                                                    OFF
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 pt-4">
                                    {isInCart ? (
                                        /* ── IN-CART STATE ── */
                                        <div className="space-y-3">
                                            {/* Confirmation pill */}
                                            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                                                <Check className="h-4 w-4" />
                                                Added to cart
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {/* Live cart qty stepper */}
                                                <div className="flex items-center overflow-hidden rounded-lg border border-primary/30 bg-primary/5">
                                                    <button
                                                        type="button"
                                                        className="px-3 py-2.5 text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
                                                        onClick={() => {
                                                            if (cartQty <= 1) {
                                                                handleRemoveFromCart();
                                                            } else {
                                                                handleCartUpdate(
                                                                    'decrease',
                                                                );
                                                            }
                                                        }}
                                                        disabled={isUpdating}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="min-w-10 px-1 text-center text-base font-bold text-primary">
                                                        {cartQty
                                                            .toString()
                                                            .padStart(2, '0')}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="px-3 py-2.5 text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
                                                        onClick={() =>
                                                            handleCartUpdate(
                                                                'increase',
                                                            )
                                                        }
                                                        disabled={
                                                            isUpdating ||
                                                            cartQty >=
                                                                maxOrderableQuantity
                                                        }
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                {/* Go to Cart CTA */}
                                                <Button
                                                    size="lg"
                                                    className="flex-1 gap-2 bg-green-600 text-base font-semibold hover:bg-green-700"
                                                    asChild
                                                >
                                                    <Link href="/cart">
                                                        <ShoppingCart className="h-5 w-5" />
                                                        GO TO CART
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* ── NOT-IN-CART STATE ── */
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center rounded-md border">
                                                <button
                                                    type="button"
                                                    className="p-3 hover:bg-accent disabled:opacity-50"
                                                    onClick={() =>
                                                        setSelectedQuantity(
                                                            (prev) =>
                                                                Math.max(
                                                                    1,
                                                                    prev - 1,
                                                                ),
                                                        )
                                                    }
                                                    disabled={
                                                        selectedQuantity <= 1
                                                    }
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-12 text-center font-semibold">
                                                    {selectedQuantity
                                                        .toString()
                                                        .padStart(2, '0')}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="p-3 hover:bg-accent disabled:opacity-50"
                                                    onClick={() =>
                                                        setSelectedQuantity(
                                                            (prev) =>
                                                                Math.min(
                                                                    maxOrderableQuantity,
                                                                    prev + 1,
                                                                ),
                                                        )
                                                    }
                                                    disabled={
                                                        selectedQuantity >=
                                                        maxOrderableQuantity
                                                    }
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <Button
                                                size="lg"
                                                className="flex-1 gap-2 text-base font-semibold"
                                                onClick={handleAddToCart}
                                                disabled={
                                                    processing ||
                                                    product_details.stock <= 0
                                                }
                                            >
                                                <ShoppingCart className="h-5 w-5" />
                                                {product_details.stock > 0
                                                    ? 'ADD TO CART'
                                                    : 'OUT OF STOCK'}
                                            </Button>
                                        </div>
                                    )}

                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            'gap-2 hover:text-destructive',
                                            product_details.is_in_wishlist
                                                ? 'text-destructive'
                                                : 'text-muted-foreground',
                                        )}
                                        onClick={addToWishlist}
                                    >
                                        <Heart
                                            className="h-5 w-5"
                                            fill={
                                                product_details.is_in_wishlist
                                                    ? 'currentColor'
                                                    : 'none'
                                            }
                                        />
                                        {product_details.is_in_wishlist
                                            ? 'In Wishlist'
                                            : 'Add to Wishlist'}
                                    </Button>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="font-semibold text-foreground">
                                            Share:
                                        </span>
                                        <div className="flex gap-2">
                                            <a
                                                href={facebookShareHref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-blue-100 hover:text-blue-600"
                                            >
                                                <SiFacebook className="h-4 w-4" />
                                            </a>
                                            <a
                                                href={twitterShareHref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-sky-100 hover:text-sky-500"
                                            >
                                                <SiX className="h-4 w-4" />
                                            </a>
                                            <a
                                                href={linkedinShareHref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
                                            >
                                                <FaLinkedin className="h-4 w-4" />
                                            </a>
                                            <a
                                                href="https://www.instagram.com/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() => {
                                                    void handleCopyLink();
                                                }}
                                                className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-pink-100 hover:text-pink-600"
                                            >
                                                <SiInstagram className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                                        <ShieldCheck className="h-5 w-5 shrink-0" />
                                        <span>Guaranteed Safe Checkout</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue="description" className="mb-12">
                            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                                <TabsTrigger
                                    value="description"
                                    className="relative rounded-none border-b-2 border-transparent px-4 py-3 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                                >
                                    Description
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="description" className="mt-6">
                                <div
                                    className="prose dark:prose-invert max-w-none [&_p:empty]:min-h-[1.4em] [&_p:has(>br:only-child)]:min-h-[1.4em]"
                                    dangerouslySetInnerHTML={{
                                        __html: product_details.description,
                                    }}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="space-y-8">
                            {/* Featured Products Widget */}
                            <div className="rounded-xl border bg-card p-6 shadow-sm">
                                <h3 className="mb-6 border-b pb-2 text-lg font-bold">
                                    Featured Products
                                </h3>
                                <div className="space-y-6">
                                    {featured_product.map((product) => (
                                        <div
                                            key={product.id}
                                            className="group flex gap-4"
                                        >
                                            <Link
                                                href={
                                                    product.categorySlug
                                                        ? `/category/${product.categorySlug}/product/${product.seoUrl}`
                                                        : `/product/${product.seoUrl}`
                                                }
                                                className="h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted"
                                            >
                                                <img
                                                    src={`/uploads/products/${product.image1}`}
                                                    alt={product.productsName}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            </Link>
                                            <div className="flex-1">
                                                <Link
                                                    href={
                                                        product.categorySlug
                                                            ? `/category/${product.categorySlug}/product/${product.seoUrl}`
                                                            : `/product/${product.seoUrl}`
                                                    }
                                                >
                                                    <h4 className="mb-1 line-clamp-2 text-sm font-semibold transition-colors group-hover:text-primary">
                                                        {product.productsName}
                                                    </h4>
                                                </Link>
                                                <div className="flex flex-wrap items-baseline gap-2">
                                                    <span className="font-bold text-primary">
                                                        ₹
                                                        {product.price.toLocaleString(
                                                            'en-IN',
                                                        )}
                                                    </span>
                                                    {product.mrp >
                                                        product.price && (
                                                        <span className="text-xs text-muted-foreground line-through">
                                                            ₹
                                                            {product.mrp.toLocaleString(
                                                                'en-IN',
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Banner Widget */}
                            <div className="overflow-hidden rounded-xl border bg-muted shadow-sm">
                                <img
                                    src="/assets/img/banner/2.jpg"
                                    alt="Sidebar Banner"
                                    className="w-full object-cover transition-transform hover:scale-105"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <RelatedProducts
                    products={popular_product}
                    wishlistIds={wishlist_ids}
                    heading="Popular Products"
                    subheading="Most Loved Picks"
                    description="Top-picked Rudraksha products trusted by customers for daily spiritual practice and gifting."
                    className="mt-12 border-t pt-12"
                />
            </main>

            <SiteFooter settings={settings} />
        </div>
    );
}
