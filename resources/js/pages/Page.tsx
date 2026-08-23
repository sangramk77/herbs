import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import SiteLayout from '@/layouts/SiteLayout';
import type { Product, Settings } from '@/types/site-types';

interface CMSPageProps {
    page: {
        pageName: string;
        heading?: string | null;
        description?: string | null;
        image?: string | null;
        metaTitle?: string | null;
        metaDescription?: string | null;
        metaKeyword?: string | null;
        seoUrl?: string | null;
    };
    settings: Settings;
    products?: Product[];
    wishlist?: {
        count: number;
        items: any[];
    };
    cart?: {
        count: number;
        price: number;
        items: any[];
    };
    user?: {
        name: string;
    };
}

export default function Page({
    page,
    settings,
    products = [],
    wishlist = { count: 0, items: [] },
    cart = { count: 0, price: 0, items: [] },
    user,
}: CMSPageProps) {
    const content = page.description ?? '';
    const isHtmlContent = /<\/?[a-z][\s\S]*>/i.test(content);

    return (
        <SiteLayout
            settings={settings}
            products={products}
            wishlist={wishlist}
            cart={cart}
            user={user}
            title={page.metaTitle || page.pageName}
            metaDescription={page.metaDescription || undefined}
            metaKeywords={page.metaKeyword || undefined}
        >
            <Head title={page.pageName} />
            {/* Breadcrumb */}
            <div className="border-b bg-gray-50">
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link
                            href="/"
                            className="flex items-center text-muted-foreground transition-colors hover:text-primary"
                        >
                            <Home className="h-4 w-4" />
                        </Link>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-gray-900">
                            {page.pageName}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Page Header */}
            <div className="border-b bg-gradient-to-r from-orange-50 to-orange-100">
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="mb-2 text-4xl font-bold text-gray-900 md:text-5xl">
                        {page.heading || page.pageName}
                    </h1>
                    {page.heading && (
                        <p className="mx-auto max-w-2xl text-lg text-gray-600">
                            {page.pageName}
                        </p>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-10">
                <div className="mx-auto max-w-4xl space-y-6">
                    {page.image && (
                        <div className="overflow-hidden rounded-xl border">
                            <img
                                src={page.image}
                                alt={page.pageName}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    )}

                    {content ? (
                        <div className="prose prose-lg prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary prose-strong:text-gray-900 prose-img:rounded-lg prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-gray-600 prose-ul:pl-6 prose-ol:pl-6 max-w-none [&_div[data-type='horizontalRule']]:my-6 [&_li]:my-1 [&_li]:list-item [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p:empty]:min-h-[1.5em] [&_p:has(br:only-child)]:min-h-[1.5em] [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6">
                            {isHtmlContent ? (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: content,
                                    }}
                                />
                            ) : (
                                <ReactMarkdown>{content}</ReactMarkdown>
                            )}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">
                            No description available.
                        </p>
                    )}
                </div>
            </div>
        </SiteLayout>
    );
}
