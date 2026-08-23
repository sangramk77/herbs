import Autoplay from 'embla-carousel-autoplay';
import {
    type CSSProperties,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    type CarouselApi,
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import type { Banner } from '@/types/site-types';

interface HeroSliderProps {
    banners: Banner[];
}

export function HeroSlider({ banners }: HeroSliderProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [transitionKey, setTransitionKey] = useState(0);

    const bannerImages = useMemo(
        () => banners.map((banner) => `/uploads/banners/${banner.image1}`),
        [banners],
    );

    const onSelect = useCallback((emblaApi: CarouselApi) => {
        if (!emblaApi) {
            return;
        }

        setCurrentIndex(emblaApi.selectedScrollSnap());
        setTransitionKey((key) => key + 1);
    }, []);

    useEffect(() => {
        if (!api) {
            return;
        }

        onSelect(api);
        api.on('select', onSelect);
        api.on('reInit', onSelect);

        return () => {
            api.off('select', onSelect);
            api.off('reInit', onSelect);
        };
    }, [api, onSelect]);

    const currentImage = bannerImages[currentIndex];

    return (
        <section className="relative bg-muted">
            <style>{`
                @keyframes hero-slice-in {
                    from {
                        transform: translateY(var(--slice-offset));
                        opacity: 0.92;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
            <div className="mx-auto w-full max-w-[1400px] px-2 py-6 sm:px-4 lg:px-6">
                <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/35 shadow-[0_20px_60px_-30px_rgba(2,6,23,0.5),0_12px_35px_-20px_rgba(2,6,23,0.35)] backdrop-blur-2xl">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.65),rgba(255,255,255,0.15)_60%,rgba(255,255,255,0)_100%)]" />
                    <div className="pointer-events-none absolute inset-0 -translate-x-1/3 animate-[glass-sheen_8s_ease-in-out_infinite] bg-gradient-to-r from-white/70 via-white/20 to-transparent opacity-70 blur-2xl" />
                    <Carousel
                        opts={{
                            align: 'start',
                            loop: true,
                            watchDrag: true,
                        }}
                        setApi={setApi}
                        plugins={[
                            Autoplay({
                                delay: 5000,
                                stopOnMouseEnter: true,
                                stopOnInteraction: false,
                            }),
                        ]}
                        className="w-full"
                    >
                        <CarouselContent>
                            {banners.map((banner) => (
                                <CarouselItem key={banner.id}>
                                    <div
                                        className="relative h-[clamp(16rem,40vw,30rem)] w-full sm:h-[clamp(18rem,36vw,32rem)] lg:h-[clamp(20rem,34vw,34rem)]"
                                    >
                                        <picture className="absolute inset-0 block h-full w-full">
                                            {banner.mobileImage && (
                                                <source
                                                    media="(max-width: 767px)"
                                                    srcSet={`/uploads/banners/${banner.mobileImage}`}
                                                />
                                            )}
                                            <img
                                                src={`/uploads/banners/${banner.image1}`}
                                                alt={
                                                    banner.heading2 ||
                                                    banner.heading1 ||
                                                    'Banner'
                                                }
                                                className="h-full w-full object-cover"
                                                loading="eager"
                                            />
                                        </picture>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/[0.06] to-transparent" />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {banners.length > 1 && currentImage && (
                            <div
                                key={transitionKey}
                                className="pointer-events-none absolute inset-0 z-20"
                                aria-hidden="true"
                            >
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <span
                                        key={`${transitionKey}-${index}`}
                                        className="absolute top-0 h-full"
                                        style={
                                            {
                                                left: `${index * (100 / 6)}%`,
                                                width: `${100 / 6}%`,
                                                backgroundImage: `url(${currentImage})`,
                                                backgroundSize: '600% 100%',
                                                backgroundPosition: `${(index / 5) * 100}% 50%`,
                                                '--slice-offset':
                                                    index % 2 === 0 ? '-28px' : '28px',
                                                animation:
                                                    'hero-slice-in 240ms cubic-bezier(0.22, 1, 0.36, 1) both',
                                                animationDelay: `${index * 12}ms`,
                                            } as CSSProperties
                                        }
                                    />
                                ))}
                            </div>
                        )}
                        {banners.length > 1 && (
                            <>
                                <CarouselPrevious className="left-4" />
                                <CarouselNext className="right-4" />
                            </>
                        )}
                    </Carousel>
                    {banners.length > 1 && api && (
                        <div className="absolute right-0 bottom-4 left-0 z-30 flex items-center justify-center gap-2 px-4">
                            {api.scrollSnapList().map((_, index) => (
                                <button
                                    type="button"
                                    key={banners[index]?.id ?? `hero-bullet-${index}`}
                                    onClick={() => api.scrollTo(index)}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${
                                        currentIndex === index
                                            ? 'w-7 bg-white shadow-[0_0_18px_rgba(255,255,255,0.95)]'
                                            : 'w-2.5 bg-white/55 hover:bg-white/80'
                                    }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                    aria-current={currentIndex === index}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
