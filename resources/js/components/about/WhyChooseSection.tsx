import {
    BadgeCheck,
    Blocks,
    Globe2,
    MessageSquareText,
    ShieldCheck,
    Sparkles,
    Truck,
} from 'lucide-react';

const reasons = [
    {
        label: 'Quality-focused selection',
        icon: ShieldCheck,
    },
    {
        label: 'Carefully sourced products',
        icon: Globe2,
    },
    {
        label: 'Dependable delivery',
        icon: Truck,
    },
    {
        label: 'Natural essentials',
        icon: Blocks,
    },
    {
        label: 'Helpful guidance',
        icon: Sparkles,
    },
    {
        label: 'Customer-first support',
        icon: MessageSquareText,
    },
];

export function WhyChooseSection() {
    return (
        <section className="border-b border-fuchsia-100 bg-transparent py-14 md:py-18">
            <div className="container mx-auto px-4">
                <div className="relative isolate overflow-hidden rounded-[2rem] border border-fuchsia-100 bg-white/85 shadow-2xl shadow-fuchsia-950/10 backdrop-blur-sm">
                    <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.2),transparent_45%)]" />
                    <div className="absolute inset-0 z-[1] bg-gradient-to-r from-white/92 via-white/76 to-white/50" />

                    <div className="relative z-10 grid gap-10 p-7 sm:p-9 md:p-12 lg:grid-cols-[0.95fr_1.55fr] lg:items-center lg:p-14">
                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-white/80 px-4 py-2 text-sm font-bold text-fuchsia-800 shadow-sm">
                                <span className="h-2 w-2 rounded-full bg-fuchsia-500" />
                                Trusted Excellence
                            </div>

                            <h2 className="max-w-xl text-4xl leading-tight font-extrabold tracking-tight text-stone-950 md:text-5xl">
                                Why Choose Us?
                            </h2>
                            <p className="mt-7 max-w-2xl text-xl leading-relaxed text-stone-700 md:text-2xl">
                                Thoughtfully selected herbs and natural
                                essentials for everyday wellbeing.
                                <span className="mt-4 block">
                                    Clear information, quality products, and
                                    support you can rely on.
                                </span>
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {reasons.map(({ label, icon: Icon }) => (
                                <div
                                    key={label}
                                    className="group flex min-h-28 items-center gap-4 rounded-2xl border border-fuchsia-100 bg-white/85 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-fuchsia-200 hover:shadow-lg hover:shadow-fuchsia-950/10 sm:p-5"
                                >
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-100 text-fuchsia-600 transition duration-200 group-hover:bg-fuchsia-600 group-hover:text-white">
                                        {label ===
                                        'Quality-focused selection' ? (
                                            <BadgeCheck className="h-7 w-7" />
                                        ) : (
                                            <Icon className="h-7 w-7" />
                                        )}
                                    </div>
                                    <p className="text-lg leading-snug font-extrabold text-stone-950 md:text-xl">
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
