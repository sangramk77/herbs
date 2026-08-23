import { ExternalLink } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export function GemsPromo() {
    const typingText = useMemo(
        () =>
            "Explore the world's most exquisite gemstones at our premium sister store. Discover certified treasures, astrological collections, and rare, handpicked pieces trusted by discerning collectors.",
        [],
    );
    const [typedText, setTypedText] = useState('');
    const typingRef = useRef<HTMLDivElement | null>(null);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (!typingRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHasStarted(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.35 },
        );

        observer.observe(typingRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!hasStarted) return;
        let index = 0;
        setTypedText('');

        const intervalId = window.setInterval(() => {
            index += 1;
            setTypedText(typingText.slice(0, index));
            if (index >= typingText.length) {
                window.clearInterval(intervalId);
            }
        }, 22);

        return () => window.clearInterval(intervalId);
    }, [hasStarted, typingText]);

    return (
        <section className="relative overflow-hidden pt-6 pb-10 md:pt-8 md:pb-16">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 -z-10 h-full w-full bg-gradient-to-br from-[#C5D7FD]/40 via-[#E8F0FE]/30 to-[#C5D7FD]/40" />
            <div className="absolute top-1/2 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300/30 blur-3xl" />
            <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-indigo-300/20 blur-2xl" />
            <div className="absolute bottom-0 left-0 -z-10 h-64 w-64 rounded-full bg-blue-200/20 blur-2xl" />

            <div className="container mx-auto px-4">
                <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-[#C5D7FD]/60 p-8 shadow-2xl backdrop-blur-2xl before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-white/40 before:via-transparent before:to-white/20 md:p-12 lg:p-16">
                    {/* Inner Decorative Shapes */}
                    <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-400/15 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-400/15 blur-3xl" />

                    {/* Glass reflection effect */}
                    <div className="absolute top-0 left-0 h-full w-full rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-50" />

                    <div className="relative z-10 flex flex-col items-center justify-between gap-10 md:flex-row">
                        {/* Logo & Text */}
                        <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
                            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white p-4 shadow-lg">
                                <img
                                    src="/assets/img/logo708a.png"
                                    alt="Effective Gems Logo"
                                    className="h-full w-full object-contain"
                                />
                            </div>
                            <div>
                                <h2 className="mb-3 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-5xl">
                                    Interested in Gems?
                                </h2>
                                <p
                                    ref={typingRef}
                                    className="relative max-w-xl font-display text-base leading-snug md:text-lg"
                                >
                                    <span className="opacity-0 select-none">
                                        {typingText}
                                    </span>
                                    <span className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-500 to-sky-300 bg-clip-text text-transparent">
                                        {typedText}
                                        <span className="ml-1 inline-block h-5 w-0.5 animate-pulse rounded-full bg-indigo-500/80 align-[-2px]" />
                                    </span>
                                </p>
                                <p className="mt-3 max-w-xl text-sm text-gray-600 md:text-base">
                                    Shop sapphires, rubies, emeralds, and more
                                    with transparent pricing, expert guidance,
                                    and lifelong confidence in authenticity.
                                </p>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="flex shrink-0">
                            <a
                                href="https://effectivegems.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95"
                            >
                                Visit our store
                                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
