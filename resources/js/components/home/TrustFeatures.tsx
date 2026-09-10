interface Feature {
    id: string;
    image_url: string;
}

interface TrustFeaturesProps {
    features?: Feature[];
}

interface FeatureStyle {
    tint: string;
    glow: string;
}

const featureStyles: FeatureStyle[] = [
    {
        tint: 'from-emerald-100/80 via-white/70 to-cyan-100/70',
        glow: 'bg-emerald-300/30',
    },
    {
        tint: 'from-amber-100/85 via-white/70 to-orange-100/70',
        glow: 'bg-amber-300/35',
    },
    {
        tint: 'from-rose-100/75 via-white/70 to-violet-100/70',
        glow: 'bg-rose-300/30',
    },
    {
        tint: 'from-sky-100/80 via-white/70 to-indigo-100/70',
        glow: 'bg-sky-300/30',
    },
];

export function TrustFeatures({ features = [] }: TrustFeaturesProps) {
    const visibleFeatures = features
        .filter((feature) => feature.image_url)
        .slice(0, 4);

    if (visibleFeatures.length === 0) {
        return null;
    }

    return (
        <section className="relative overflow-hidden border-y border-cyan-100/70 bg-[radial-gradient(circle_at_15%_20%,rgba(186,230,253,0.46),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(221,214,254,0.34),transparent_26%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(224,242,254,0.42)_48%,rgba(248,250,252,0.98))] py-8 md:py-10">
            <style>
                {`
                    @keyframes trust-feature-badge-flip {
                        0% {
                            transform: rotate(0deg);
                        }
                        45% {
                            transform: rotate(180deg);
                        }
                        100% {
                            transform: rotate(360deg);
                        }
                    }
                `}
            </style>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
            <div className="absolute inset-x-8 top-1/2 h-32 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-200/35 via-white/45 to-indigo-200/30 blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/75 to-transparent" />
            <div className="relative container mx-auto px-4">
                <div className="mx-auto grid max-w-5xl grid-cols-2 items-stretch gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
                    {visibleFeatures.map((feature, index) => {
                        const style = featureStyles[index] ?? featureStyles[0];

                        return (
                            <div
                                key={feature.id}
                                className={`group relative flex min-h-36 items-center justify-center overflow-hidden rounded-[1.35rem] border border-white/70 bg-gradient-to-br ${style.tint} p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-[transform,border-color,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:border-white hover:shadow-[0_22px_60px_rgba(15,23,42,0.14)] sm:min-h-40`}
                            >
                                <div
                                    className={`absolute -top-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full ${style.glow} blur-2xl transition-transform duration-500 ease-out group-hover:translate-x-4 group-hover:-translate-y-1`}
                                />
                                <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
                                <div className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/55 to-transparent opacity-0 blur-sm transition-all duration-700 ease-out group-hover:left-full group-hover:opacity-100" />
                                <div className="absolute inset-x-4 top-3 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
                                <div className="relative flex h-28 w-28 items-center justify-center transition-[filter] duration-500 ease-out sm:h-32 sm:w-32">
                                    <img
                                        src={feature.image_url}
                                        alt={`Trust feature ${index + 1}`}
                                        className="h-auto w-24 object-contain mix-blend-multiply contrast-125 drop-shadow-[0_12px_22px_rgba(15,23,42,0.12)] transition-[filter,opacity] duration-500 ease-out group-hover:animate-[trust-feature-badge-flip_1.35s_ease-in-out] group-hover:opacity-90 group-hover:saturate-150 sm:w-28"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
