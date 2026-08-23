import { Link } from '@inertiajs/react';
import JSConfetti from 'js-confetti';
import { Calendar, ChevronRight, Home, Share2, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { BlogCard } from '@/components/site/BlogCard';
import { Button } from '@/components/ui/button';
import SiteLayout from '@/layouts/SiteLayout';
import type { Settings } from '@/types/site-types';

interface Blog {
    id: string;
    blog_title: string;
    description: string;
    post_by: string;
    thumbnail_url: string | null;
    banner_url: string | null;
    publish_date: string;
    meta_title?: string;
    meta_keyword?: string;
    meta_description?: string;
    seo_url: string;
}

interface RelatedBlog {
    id: string;
    blog_title: string;
    thumbnail_url: string | null;
    publish_date: string;
    seo_url: string;
}

interface BlogDetailProps {
    blog: Blog;
    relatedBlogs: RelatedBlog[];
    settings: Settings;
    reactions: {
        counts: {
            heart: number;
            smile: number;
        };
        userReaction?: 'heart' | 'smile' | null;
    };
}

export default function BlogDetail({
    blog,
    relatedBlogs,
    settings,
    reactions,
}: BlogDetailProps) {
    const [reactionCounts, setReactionCounts] = useState(reactions.counts);
    const [userReaction, setUserReaction] = useState<'heart' | 'smile' | null>(
        reactions.userReaction ?? null,
    );
    const confettiRef = useRef<JSConfetti | null>(null);

    useEffect(() => {
        confettiRef.current = new JSConfetti();
    }, []);

    const handleReaction = async (reaction: 'heart' | 'smile') => {
        if (userReaction === reaction) {
            toast.message('You already reacted with this emoji.');
            return;
        }

        const response = await fetch(`/blog/${blog.seo_url}/reaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') ?? '',
            },
            body: JSON.stringify({ reaction }),
        });

        if (!response.ok) {
            toast.error('Unable to save reaction. Please try again.');
            return;
        }

        const data: {
            counts: { heart: number; smile: number };
            userReaction: 'heart' | 'smile';
        } = await response.json();

        setReactionCounts(data.counts);
        setUserReaction(data.userReaction);

        confettiRef.current?.addConfetti({
            emojis:
                reaction === 'heart'
                    ? ['❤️', '💖', '💗', '💘']
                    : ['😊', '😁', '🙂', '✨'],
            confettiNumber: 30,
            emojiSize: 26,
        });
    };
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: blog.blog_title,
                text: blog.meta_description || blog.blog_title,
                url: window.location.href,
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <SiteLayout
            title={blog.meta_title || blog.blog_title}
            settings={settings}
            metaDescription={blog.meta_description}
            metaKeywords={blog.meta_keyword}
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
                        <Link
                            href="/blog"
                            className="text-muted-foreground transition-colors hover:text-primary"
                        >
                            Blog
                        </Link>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="line-clamp-1 font-medium text-gray-900">
                            {blog.blog_title}
                        </span>
                    </nav>
                </div>
            </div>

            {/* Blog Content */}
            <article className="container mx-auto px-4 py-12">
                <div className="mx-auto max-w-4xl">
                    {/* Title */}
                    <h1 className="mb-4 bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-500 bg-clip-text font-display text-2xl font-semibold text-transparent md:text-3xl">
                        {blog.blog_title}
                    </h1>

                    {/* Meta Info */}
                    <div className="mb-8 flex flex-wrap items-center gap-6 border-b pb-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-5 w-5" />
                            <span className="font-medium">{blog.post_by}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-5 w-5" />
                            <span>{blog.publish_date}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShare}
                            className="ml-auto"
                        >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share
                        </Button>
                    </div>

                    {/* Featured Image */}
                    {blog.banner_url && (
                        <div className="mb-8 flex justify-center">
                            <div className="relative aspect-[4/3] w-full max-w-xl overflow-hidden rounded-lg bg-gray-100 shadow-md">
                                <img
                                    src={blog.banner_url}
                                    alt={blog.blog_title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* Blog Content */}
                    <div
                        className="prose prose-lg prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary prose-strong:text-gray-900 prose-img:rounded-lg prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-gray-600 prose-ul:pl-6 prose-ol:pl-6 max-w-none [&_li]:my-1 [&_li]:list-item [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p:empty]:min-h-[1.5em] [&_p:has(br:only-child)]:min-h-[1.5em] [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
                        dangerouslySetInnerHTML={{ __html: blog.description }}
                    />

                    {/* Reactions */}
                    <div className="mt-6 flex max-w-sm flex-wrap items-center gap-2 rounded-xl border bg-white/70 px-3 py-2 shadow-sm">
                        <span className="text-sm font-medium text-gray-700">
                            React to this article
                        </span>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => handleReaction('heart')}
                                className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-sm transition ${
                                    userReaction === 'heart'
                                        ? 'border-rose-300 bg-rose-50 text-rose-700'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-rose-200 hover:bg-rose-50'
                                }`}
                            >
                                <span aria-hidden="true">❤️</span>
                                <span className="font-semibold">
                                    {reactionCounts.heart}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleReaction('smile')}
                                className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-sm transition ${
                                    userReaction === 'smile'
                                        ? 'border-amber-300 bg-amber-50 text-amber-700'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-amber-200 hover:bg-amber-50'
                                }`}
                            >
                                <span aria-hidden="true">😊</span>
                                <span className="font-semibold">
                                    {reactionCounts.smile}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Back to Blog Button */}
                    <div className="mt-12 border-t pt-8">
                        <Link href="/blog">
                            <Button variant="outline">
                                ← Back to All Blogs
                            </Button>
                        </Link>
                    </div>
                </div>
            </article>

            {/* Related Blogs */}
            {relatedBlogs.length > 0 && (
                <section className="border-t bg-gray-50 py-12">
                    <div className="container mx-auto px-4">
                        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
                            Related Articles
                        </h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {relatedBlogs.map((relatedBlog) => (
                                <BlogCard
                                    key={relatedBlog.id}
                                    blog={{
                                        ...relatedBlog,
                                        description: '',
                                        post_by: '',
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </SiteLayout>
    );
}
