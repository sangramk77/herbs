import 'yet-another-react-lightbox/styles.css';

import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';

interface GalleryItem {
    image: string;
    description: string;
    image_url: string | null;
}

interface GallerySectionProps {
    gallery: GalleryItem[];
}

export function GallerySection({ gallery }: GallerySectionProps) {
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);

    const slides = gallery.map((item) => ({
        src: item.image_url ?? '',
    }));

    return (
        <section className="bg-transparent py-16 md:py-20">
            <div className="container mx-auto px-4">
                <div className="rounded-[2rem] border border-amber-100/80 bg-gradient-to-br from-amber-50/80 via-white/62 to-orange-50/70 p-6 shadow-2xl shadow-amber-950/10 backdrop-blur-xl sm:p-8 md:p-10">
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/75 px-4 py-1.5 text-sm font-medium text-amber-700 shadow-sm">
                            Our Moments
                        </div>
                        <h2 className="text-3xl font-bold text-stone-800 sm:text-4xl">
                            Photo Gallery
                        </h2>
                        <p className="mt-3 text-lg font-medium text-amber-800/80">
                            Glimpses of our journey, events, and milestones
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
                        {gallery.map((item, i) => (
                            <button
                                key={item.image}
                                id={`gallery-item-${i}`}
                                className="group overflow-hidden rounded-2xl border border-white/80 bg-white/90 text-left shadow-md transition-shadow hover:shadow-xl focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:outline-none"
                                onClick={() => {
                                    setIndex(i);
                                    setOpen(true);
                                }}
                                aria-label={`View gallery image ${i + 1}${item.description ? ': ' + item.description : ''}`}
                            >
                                <div className="aspect-square overflow-hidden">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            alt={
                                                item.description ||
                                                `Gallery image ${i + 1}`
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-amber-50 text-3xl">
                                            🖼️
                                        </div>
                                    )}
                                </div>

                                {item.description && (
                                    <div className="min-h-14 px-3 py-2">
                                        <p className="line-clamp-2 text-sm leading-5 font-medium text-stone-700">
                                            {item.description}
                                        </p>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lightbox */}
                <Lightbox
                    open={open}
                    close={() => setOpen(false)}
                    slides={slides}
                    index={index}
                    styles={{
                        container: { backgroundColor: 'rgba(0,0,0,0.92)' },
                    }}
                />
            </div>
        </section>
    );
}
