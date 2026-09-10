import { BadgeCheck, Gem, ShieldCheck, Sparkles } from 'lucide-react';

interface AboutHeroProps {
    heading: string | null;
    description: string | null;
    imageUrl: string | null;
}

const trustMarkers = [
    {
        label: 'Quality herbs',
        icon: Gem,
    },
    {
        label: 'Thoughtful sourcing',
        icon: ShieldCheck,
    },
    {
        label: 'Dependable delivery',
        icon: Sparkles,
    },
];

export function AboutHero({ heading, description, imageUrl }: AboutHeroProps) {
    return (
        <section className="relative isolate overflow-hidden bg-transparent py-14 md:py-20">
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(120,53,15,0.07)_1px,transparent_1px),linear-gradient(180deg,rgba(120,53,15,0.05)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" />
            <div className="absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-white/80 to-transparent" />

            <div className="container mx-auto px-4">
                <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
                    <div>
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-white/70 px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm backdrop-blur">
                            <span className="h-2 w-2 rounded-full bg-emerald-600" />
                            Who We Are
                        </div>

                        {heading && (
                            <h2 className="max-w-3xl text-4xl leading-[1.08] font-extrabold tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
                                {heading}
                            </h2>
                        )}

                        {description && (
                            <div
                                className="prose prose-stone mt-7 max-w-2xl text-lg leading-8 text-stone-700 [&_li]:relative [&_li]:pl-5 [&_li]:text-stone-700 [&_li]:before:absolute [&_li]:before:top-3 [&_li]:before:left-0 [&_li]:before:h-1.5 [&_li]:before:w-1.5 [&_li]:before:rounded-full [&_li]:before:bg-emerald-700 [&_li]:before:content-[''] [&_p]:mb-4 [&_strong]:font-bold [&_strong]:text-stone-950 [&_ul]:list-none [&_ul]:pl-0"
                                dangerouslySetInnerHTML={{
                                    __html: description,
                                }}
                            />
                        )}

                        <div className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-3">
                            {trustMarkers.map(({ label, icon: Icon }) => (
                                <div
                                    key={label}
                                    className="flex min-h-16 items-center gap-3 border-l-2 border-amber-500 bg-white/55 px-4 py-3 shadow-sm"
                                >
                                    <Icon className="h-5 w-5 shrink-0 text-emerald-700" />
                                    <span className="text-sm leading-snug font-bold text-stone-900">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-center lg:justify-end">
                        <div className="relative w-full max-w-xl">
                            <div className="absolute -top-5 -left-5 h-full w-full rotate-[-3deg] rounded-[1.75rem] border border-amber-300/70 bg-[#f5dfaa]" />
                            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-2xl shadow-amber-950/15">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt="About us"
                                        className="aspect-[5/4] w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex aspect-[5/4] w-full flex-col items-center justify-center bg-[#f3e5bf] p-8 text-center">
                                        <Gem className="mb-4 h-14 w-14 text-emerald-800" />
                                        <p className="text-sm font-bold text-amber-950">
                                            Herbs
                                        </p>
                                        <p className="mt-1 text-xs text-stone-700">
                                            Authentic Spiritual Products
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="absolute right-4 bottom-4 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-xl border border-amber-200 bg-white/95 px-4 py-3 shadow-xl shadow-stone-950/15 backdrop-blur sm:right-6 sm:bottom-6">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white">
                                    <BadgeCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold tracking-wide text-amber-800 uppercase">
                                        Authenticity Checked
                                    </p>
                                    <p className="text-xl leading-tight font-extrabold text-stone-950">
                                        Certified
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
