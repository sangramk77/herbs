import { Link } from '@inertiajs/react';
import { Calendar, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Blog } from '@/types/site-types';

interface BlogSectionProps {
    blogs: Blog[];
}

export function BlogSection({ blogs }: BlogSectionProps) {
    const visibleBlogs = blogs.slice(0, 3);
    const hasMore = blogs.length > 3;

    return (
        <section className="newsprint-bg overflow-hidden py-12 md:py-16">
            <div className="relative container mx-auto px-4">
                <div className="pointer-events-none absolute -top-16 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
                <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute top-10 right-6 h-24 w-24 text-primary/50"
                    viewBox="0 0 120 120"
                    fill="none"
                >
                    <path
                        d="M10 60c20-20 40-20 60 0s40 20 40 20"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <path
                        d="M20 80c16-14 32-14 48 0s32 14 32 14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
                {/* Section Header */}
                <div className="mb-10 text-center md:mb-12">
                    <div className="relative mx-auto inline-flex flex-col items-center">
                        <div className="absolute -top-7 h-[4.5rem] w-48 rounded-full bg-cyan-400/30 blur-3xl dark:bg-cyan-500/20" />
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-900/85 bg-slate-900 px-4 py-1.5 text-[10px] font-bold tracking-[0.3em] text-cyan-200 uppercase shadow-[0_8px_24px_rgba(15,23,42,0.35)] dark:border-cyan-300/40 dark:bg-slate-950 dark:text-cyan-100">
                            Insights
                        </div>
                        <h2 className="relative bg-gradient-to-r from-slate-900 via-cyan-700 to-teal-600 bg-clip-text font-display text-3xl font-semibold tracking-tight text-transparent drop-shadow-[0_8px_20px_rgba(8,145,178,0.25)] dark:from-cyan-100 dark:via-cyan-200 dark:to-emerald-200 md:text-4xl lg:text-5xl">
                            Latest News & Blogs
                        </h2>
                        <div className="mt-4 flex items-center gap-3">
                            <span className="h-px w-10 bg-slate-400/70 dark:bg-cyan-100/40" />
                            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 dark:bg-cyan-300" />
                            <span className="h-1 w-[4.5rem] rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />
                            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 dark:bg-cyan-300" />
                            <span className="h-px w-10 bg-slate-400/70 dark:bg-cyan-100/40" />
                        </div>
                    </div>
                    <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
                        Fresh articles, rituals, and gemstone wisdom — curated
                        to guide your journey with clarity, care, and tradition.
                    </p>
                </div>

                {/* Blog Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {visibleBlogs.map((blog) => (
                        <div
                            key={blog.id}
                            className="group overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
                        >
                            {/* Blog Image */}
                            <Link
                                href={`/blog/${blog.seoUrl}`}
                                className="relative block overflow-hidden"
                            >
                                <img
                                    src={
                                        blog.thumbnail_url ||
                                        `/upload/${blog.thumbnail}`
                                    }
                                    alt={blog.blogTitle}
                                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            </Link>

                            {/* Blog Content */}
                            <div className="p-4">
                                {/* Meta */}
                                <div className="mb-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        <span>{blog.post_by}</span>
                                    </div>
                                    <span className="text-muted-foreground/40">
                                        •
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            {new Date(
                                                blog.publishDate,
                                            ).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {/* Title */}
                                <Link href={`/blog/${blog.seoUrl}`}>
                                    <h3 className="mb-2 line-clamp-2 text-base leading-snug font-semibold transition-colors group-hover:text-primary">
                                        {blog.blogTitle}
                                    </h3>
                                </Link>

                                {/* Read More Link */}
                                <Link
                                    href={`/blog/${blog.seoUrl}`}
                                    className="inline-flex items-center text-xs font-medium text-primary hover:underline"
                                >
                                    Read article
                                    <svg
                                        className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {hasMore && (
                    <div className="mt-8 flex justify-center">
                        <Button asChild size="lg" variant="outline">
                            <Link href="/blog">View More</Link>
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
