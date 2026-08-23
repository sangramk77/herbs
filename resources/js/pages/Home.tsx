import type { ComponentProps } from 'react';

import { AboutSection } from '@/components/home/AboutSection';
import { BlogSection } from '@/components/home/BlogSection';
import { CounterSection } from '@/components/home/CounterSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { GemsPromo } from '@/components/home/GemsPromo';
import { HeroSlider } from '@/components/home/HeroSlider';
import { LatestProducts } from '@/components/home/LatestProducts';
import { TestimonialSection } from '@/components/home/TestimonialSection';
import { TrustFeatures } from '@/components/home/TrustFeatures';
import { BackToTop } from '@/components/site/BackToTop';
import SiteLayout from '@/layouts/SiteLayout';
import type {
    Banner,
    Blog,
    CartItem,
    Product,
    Settings,
} from '@/types/site-types';

interface HomePageProps {
    settings: Settings;
    cart_count: number;
    cart_price: number;
    cart_items: CartItem[];
    wishlist_count: number;
    wishlist_items: any[];
    wishlist_ids: string[];
    all_product: Product[];
    banner: Banner[];
    product: Product[];
    latest_products_by_category: {
        id: string;
        name: string;
        slug: string;
        total: number;
        has_more: boolean;
        products: Product[];
    }[];
    blog: Blog[];
    testimonials?: ComponentProps<typeof TestimonialSection>['testimonials'];
    auth?: {
        user?: {
            name: string;
        };
    };
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: string;
}

export default function HomePage({
    settings,
    cart_count,
    cart_price,
    cart_items,
    wishlist_count,
    wishlist_items,
    wishlist_ids,
    all_product,
    banner,
    product,
    latest_products_by_category,
    blog,
    testimonials = [],
    auth,
    metaTitle = 'Natural Rudraksh - Home',
    metaDescription = 'Discover authentic Rudraksha beads and spiritual products',
    metaImage,
}: HomePageProps) {
    return (
        <SiteLayout
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
            user={auth?.user}
            title={metaTitle}
            metaDescription={metaDescription}
            ogImage={metaImage}
        >
            <div className="min-h-screen bg-background">
                {/* Hero Slider */}
                <HeroSlider banners={banner} />

                {/* Category Carousel */}
                {/* <CategoryCarousel products={product} /> */}

                {/* Featured Products */}
                <FeaturedProducts
                    products={product}
                    wishlistIds={wishlist_ids}
                />

                {/* Gems Promo */}
                <GemsPromo />

                {/* Latest Products */}
                <LatestProducts
                    categories={latest_products_by_category}
                    wishlistIds={wishlist_ids}
                />

                {/* About Section */}
                <AboutSection />

                {/* Testimonial Section */}
                <TestimonialSection testimonials={testimonials} />

                {/* Counter Section */}
                <CounterSection />

                {/* Blog Section */}
                <BlogSection blogs={blog} />

                {/* Trust Features */}
                <TrustFeatures />
            </div>

            {/* Back to Top Button */}
            <BackToTop />
        </SiteLayout>
    );
}
