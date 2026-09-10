import { AboutVideoFrame } from '@/components/about/AboutVideoFrame';

interface CredentialsSectionProps {
    text: string;
    videos?: VideoItem[];
}

interface VideoItem {
    id: string;
    title: string;
    url: string;
    type?: 'external' | 'local';
}

function splitCredentialsText(text: string): [string, string] {
    const paragraphs = text.match(/<p[\s\S]*?<\/p>/gi);

    if (!paragraphs || paragraphs.length < 2) {
        return [text, ''];
    }

    const splitAt = Math.ceil(paragraphs.length / 2);

    return [
        paragraphs.slice(0, splitAt).join(''),
        paragraphs.slice(splitAt).join(''),
    ];
}

export function CredentialsSection({
    text,
    videos = [],
}: CredentialsSectionProps) {
    const credentialVideos = videos.slice(0, 2);
    const [firstText, secondText] = splitCredentialsText(text);

    return (
        <section className="bg-transparent py-16 md:py-20">
            <div className="container mx-auto px-4">
                <div className="rounded-[2rem] border border-emerald-100/80 bg-gradient-to-br from-emerald-50/75 via-white/68 to-teal-50/70 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl sm:p-8 md:p-10">
                    <h2 className="mb-10 text-center text-3xl font-bold text-stone-900 sm:text-4xl">
                        Our Credentials
                    </h2>

                    {credentialVideos.length > 0 ? (
                        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                            <div
                                className="prose prose-stone max-w-none rounded-2xl border border-emerald-100/90 bg-gradient-to-br from-white/82 via-emerald-50/74 to-teal-50/66 p-5 text-lg leading-9 text-emerald-950/80 shadow-lg shadow-emerald-950/5 backdrop-blur-md [&_p]:mb-4"
                                dangerouslySetInnerHTML={{ __html: firstText }}
                            />

                            <div className="overflow-hidden rounded-2xl border border-white/80 shadow-lg shadow-emerald-950/10">
                                <AboutVideoFrame video={credentialVideos[0]} />
                            </div>

                            {credentialVideos[1] && (
                                <div className="overflow-hidden rounded-2xl border border-white/80 shadow-lg shadow-emerald-950/10">
                                    <AboutVideoFrame
                                        video={credentialVideos[1]}
                                    />
                                </div>
                            )}

                            <div
                                className="prose prose-stone max-w-none rounded-2xl border border-cyan-100/90 bg-gradient-to-br from-white/82 via-cyan-50/74 to-sky-50/66 p-5 text-lg leading-9 text-cyan-950/80 shadow-lg shadow-cyan-950/5 backdrop-blur-md [&_p]:mb-4"
                                dangerouslySetInnerHTML={{
                                    __html: secondText || firstText,
                                }}
                            />
                        </div>
                    ) : (
                        <div className="mx-auto max-w-4xl rounded-2xl border border-emerald-100/90 bg-gradient-to-br from-white/82 via-emerald-50/74 to-teal-50/66 p-5 shadow-lg shadow-emerald-950/5 backdrop-blur-md">
                            <div
                                className="prose prose-stone prose-lg max-w-none text-stone-700 [&_p]:mb-4 [&_p]:leading-9"
                                dangerouslySetInnerHTML={{ __html: text }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
