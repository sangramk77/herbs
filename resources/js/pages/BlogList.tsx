import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';

import { BlogCard } from '@/components/site/BlogCard';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import SiteLayout from '@/layouts/SiteLayout';
import type { CartItem, Product, Settings } from '@/types/site-types';

interface Blog {
    id: string;
    blog_title: string;
    description: string;
    post_by: string;
    thumbnail_url: string | null;
    publish_date: string;
    seo_url: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface BlogListProps {
    blogs: {
        data: Blog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: PaginationLink[];
    };
    settings: Settings;
    cart_count: number;
    cart_price: number;
    cart_items: CartItem[];
    all_product: Product[];
}

export default function BlogList({
    blogs,
    settings,
    cart_count,
    cart_price,
    cart_items,
    all_product,
}: BlogListProps) {
    return (
        <SiteLayout
            title="Blog - Natural Rudraksh"
            settings={settings}
            metaDescription="Read our latest articles about Rudraksha, spiritual guidance, and wellness."
            cart={{ count: cart_count, price: cart_price, items: cart_items }}
            products={all_product}
        >
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
                        <span className="font-medium text-gray-900">Blog</span>
                    </nav>
                </div>
            </div>

            {/* Page Header */}
            <div className="border-b bg-gradient-to-r from-orange-50 to-orange-100">
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
                        Our Blog
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-gray-600">
                        Discover insights about Rudraksha, spiritual practices,
                        and holistic wellness
                    </p>
                </div>
            </div>

            {/* Blog Grid */}
            <div className="container mx-auto px-4 py-12">
                {blogs.data.length > 0 ? (
                    <>
                        {/* Grid: 1 col mobile, 2 tablet, 4 desktop */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {blogs.data.map((blog) => (
                                <BlogCard key={blog.id} blog={blog} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {blogs.last_page > 1 && (
                            <div className="mt-12">
                                <Pagination>
                                    <PaginationContent>
                                        {/* Previous Button */}
                                        {blogs.links[0]?.url && (
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href={blogs.links[0].url}
                                                />
                                            </PaginationItem>
                                        )}

                                        {/* Page Numbers */}
                                        {blogs.links
                                            .slice(1, -1)
                                            .map((link, index) => (
                                                <PaginationItem
                                                    key={`page-${link.url || index}-${link.label}`}
                                                >
                                                    {link.label === '...' ? (
                                                        <PaginationEllipsis />
                                                    ) : (
                                                        <PaginationLink
                                                            href={
                                                                link.url || '#'
                                                            }
                                                            isActive={
                                                                link.active
                                                            }
                                                        >
                                                            {link.label}
                                                        </PaginationLink>
                                                    )}
                                                </PaginationItem>
                                            ))}

                                        {/* Next Button */}
                                        {blogs.links[blogs.links.length - 1]
                                            ?.url && (
                                            <PaginationItem>
                                                <PaginationNext
                                                    href={
                                                        blogs.links[
                                                            blogs.links.length -
                                                                1
                                                        ].url || '#'
                                                    }
                                                />
                                            </PaginationItem>
                                        )}
                                    </PaginationContent>
                                </Pagination>

                                {/* Results Info */}
                                <p className="mt-4 text-center text-sm text-muted-foreground">
                                    Showing {blogs.data.length} of {blogs.total}{' '}
                                    blogs
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    /* Empty State */
                    <div className="py-20 text-center">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                            <span className="text-5xl">📝</span>
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">
                            No Blogs Yet
                        </h2>
                        <p className="text-gray-600">
                            Check back soon for new articles and insights!
                        </p>
                    </div>
                )}
            </div>
        </SiteLayout>
    );
}
