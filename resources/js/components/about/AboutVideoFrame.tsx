import { Play } from 'lucide-react';
import { useState } from 'react';

export interface AboutVideoItem {
    title: string;
    url: string;
    type?: 'external' | 'local';
}

function getYoutubeId(url: string): string | null {
    const match =
        url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        ) || url.match(/youtube\.com\/shorts\/([^&\n?#]+)/);

    return match?.[1] ?? null;
}

function getEmbedUrl(url: string): string | null {
    try {
        const youtubeId = getYoutubeId(url);

        if (youtubeId) {
            return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&autoplay=1`;
        }

        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);

        if (vimeoMatch?.[1]) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1&autoplay=1`;
        }

        return null;
    } catch {
        return null;
    }
}

export function AboutVideoFrame({ video }: { video: AboutVideoItem }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const embedUrl = getEmbedUrl(video.url);
    const youtubeId = getYoutubeId(video.url);
    const isLocalVideo =
        video.type === 'local' || video.url.includes('/uploads/');

    if (youtubeId && !isPlaying) {
        return (
            <button
                type="button"
                className="group relative aspect-video w-full overflow-hidden bg-stone-950 text-left"
                onClick={() => setIsPlaying(true)}
                aria-label={`Play ${video.title || 'video'}`}
            >
                <img
                    src={`https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`}
                    alt={video.title || 'Video thumbnail'}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(event) => {
                        event.currentTarget.src = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/35 via-stone-950/5 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 shadow-2xl ring-1 shadow-stone-950/25 ring-white/45 backdrop-blur-md transition duration-300 group-hover:scale-105 group-hover:bg-white/28">
                        <span className="flex h-13 w-13 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-950/30 transition duration-300 group-hover:bg-red-500">
                            <Play className="ml-0.5 h-6 w-6 fill-current" />
                        </span>
                    </span>
                </div>
            </button>
        );
    }

    if (embedUrl) {
        return (
            <div className="aspect-video overflow-hidden bg-stone-100">
                <iframe
                    src={embedUrl}
                    title={video.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                />
            </div>
        );
    }

    if (isLocalVideo) {
        return (
            <div className="aspect-video overflow-hidden bg-stone-100">
                <video
                    src={video.url}
                    title={video.title}
                    className="h-full w-full object-cover"
                    controls
                    preload="metadata"
                />
            </div>
        );
    }

    return (
        <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 text-sm text-stone-500">
            Video unavailable
        </div>
    );
}
