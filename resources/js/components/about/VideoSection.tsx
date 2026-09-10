import { AboutVideoFrame } from '@/components/about/AboutVideoFrame';

interface VideoItem {
    id: string;
    title: string;
    url: string;
    type?: 'external' | 'local';
}

interface VideoSectionProps {
    videos: VideoItem[];
}

function VideoCard({ video }: { video: VideoItem }) {
    return (
        <div className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
            <AboutVideoFrame video={video} />
            {video.title && (
                <div className="border-t border-stone-100 px-4 py-3">
                    <p className="line-clamp-2 text-sm font-medium text-stone-700">
                        {video.title}
                    </p>
                </div>
            )}
        </div>
    );
}

export function VideoSection({ videos }: VideoSectionProps) {
    if (videos.length === 0) return null;

    return (
        <section className="bg-transparent py-16 md:py-20">
            <div className="container mx-auto px-4">
                <div className="rounded-[2rem] border border-sky-100/80 bg-gradient-to-br from-sky-50/76 via-white/66 to-indigo-50/70 p-6 shadow-2xl shadow-sky-950/10 backdrop-blur-xl sm:p-8 md:p-10">
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/75 px-4 py-1.5 text-sm font-medium text-sky-700 shadow-sm">
                            Watch & Learn
                        </div>
                        <h2 className="text-3xl font-bold text-stone-800 sm:text-4xl">
                            Our Videos
                        </h2>
                        <p className="mt-3 text-lg font-medium text-sky-800/80">
                            Explore our collection of informative videos about
                            herbs and everyday wellbeing
                        </p>
                    </div>

                    <div
                        className={`mx-auto grid gap-6 ${
                            videos.length === 1
                                ? 'max-w-2xl grid-cols-1'
                                : videos.length === 2
                                  ? 'max-w-4xl grid-cols-1 md:grid-cols-2'
                                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                        }`}
                    >
                        {videos.map((video) => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
