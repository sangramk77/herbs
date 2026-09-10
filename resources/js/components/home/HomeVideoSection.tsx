interface HomeVideoSectionProps {
    videoPath?: string | null;
}

export function HomeVideoSection({ videoPath }: HomeVideoSectionProps) {
    if (!videoPath) {
        return null;
    }

    return (
        <section className="bg-muted/40 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-black shadow-lg">
                <video
                    className="aspect-video w-full object-cover"
                    src={`/uploads/settings/videos/${videoPath}`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    preload="metadata"
                />
            </div>
        </section>
    );
}
