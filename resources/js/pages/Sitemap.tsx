import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';

import SiteLayout from '@/layouts/SiteLayout';
import type { Settings } from '@/types/site-types';

export default function Sitemap({
    settings,
    sitemapIndexUrl,
}: {
    settings: Settings;
    sitemapIndexUrl: string;
}) {
    return (
        <SiteLayout
            settings={settings}
            title="Sitemap"
            metaDescription="Browse Herbs public URLs and search-engine sitemap."
        >
            <Head title="Sitemap" />
            <section className="container mx-auto px-4 py-14">
                <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 text-center shadow-sm">
                    <FileText className="mx-auto h-10 w-10 text-primary" />
                    <h1 className="mt-4 text-3xl font-bold">Sitemap</h1>
                    <p className="mt-3 text-muted-foreground">
                        Our XML sitemap contains all public products,
                        categories, articles, and pages available to search
                        engines.
                    </p>
                    <a
                        className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
                        href={sitemapIndexUrl}
                    >
                        Open XML sitemap
                    </a>
                </div>
            </section>
        </SiteLayout>
    );
}
