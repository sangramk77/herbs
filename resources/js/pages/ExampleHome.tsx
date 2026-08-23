import { SiteHeader } from '@/components/site/SiteHeader';
import type { Product, Settings } from '@/types/site-types';

interface HomePageProps {
    settings: Settings;
    cart_count: number;
    cart_price: number;
    all_product: Product[];
    auth?: {
        user?: {
            name: string;
        };
    };
}

export default function HomePage({
    settings,
    cart_count,
    cart_price,
    all_product,
    auth,
}: HomePageProps) {
    return (
        <div className="min-h-screen bg-background">
            <SiteHeader
                settings={settings}
                cart={{
                    count: cart_count,
                    price: cart_price,
                    items: [],
                }}
                wishlist={{ count: 0, items: [] }}
                products={all_product}
                user={auth?.user}
            />

            <main className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold">
                    Welcome to Natural Rudraksh
                </h1>
                <p className="mt-4 text-muted-foreground">
                    Your content goes here...
                </p>
            </main>
        </div>
    );
}
