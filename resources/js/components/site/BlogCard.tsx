import { Link } from '@inertiajs/react';
import { Calendar, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface BlogCardProps {
    blog: {
        id: string;
        blog_title: string;
        description: string;
        post_by: string;
        thumbnail_url: string | null;
        publish_date: string;
        seo_url: string;
    };
}

export function BlogCard({ blog }: BlogCardProps) {
    // Extract plain text from HTML description and truncate
    const getExcerpt = (html: string, maxLength: number = 150) => {
        const text = html.replace(/<[^>]*>/g, '');
        return text.length > maxLength
            ? text.substring(0, maxLength) + '...'
            : text;
    };

    return (
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl">
            <Link href={`/blog/${blog.seo_url}`}>
                {/* Thumbnail Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    {blog.thumbnail_url ? (
                        <img
                            src={blog.thumbnail_url}
                            alt={blog.blog_title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                            <span className="text-4xl text-orange-400">📝</span>
                        </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                </div>

                <CardContent className="p-6">
                    {/* Meta Info */}
                    <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{blog.publish_date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{blog.post_by}</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-primary">
                        {blog.blog_title}
                    </h3>

                    {/* Excerpt */}
                    <p className="line-clamp-3 text-sm text-gray-600">
                        {getExcerpt(blog.description)}
                    </p>
                </CardContent>

                <CardFooter className="px-6 pb-6">
                    <Button
                        variant="outline"
                        className="group-hover:bg-primary group-hover:text-white"
                    >
                        Read More →
                    </Button>
                </CardFooter>
            </Link>
        </Card>
    );
}
