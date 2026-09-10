import {
    BadgeCheck,
    BookOpen,
    FlaskConical,
    Gem,
    HeartHandshake,
    Layers,
    Network,
    ShieldCheck,
} from 'lucide-react';

interface ExperienceItem {
    icon: string;
    title: string;
    description: string;
}

interface ExperienceSectionProps {
    items: ExperienceItem[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    BookOpen,
    FlaskConical,
    Network,
    Gem,
    HeartHandshake,
    ShieldCheck,
    BadgeCheck,
    Layers,
};

function ExperienceCard({ item }: { item: ExperienceItem }) {
    const Icon = ICON_MAP[item.icon] ?? ShieldCheck;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-stone-100 bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl">
            <div className="absolute top-0 right-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-amber-100/60 blur-xl transition-all group-hover:bg-amber-200/60" />
            <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-200 transition-transform group-hover:scale-110">
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 font-bold text-stone-800">{item.title}</h3>
                <p className="text-sm leading-relaxed text-stone-500">
                    {item.description}
                </p>
            </div>
        </div>
    );
}

export function ExperienceSection({ items }: ExperienceSectionProps) {
    if (items.length === 0) return null;

    return (
        <section className="bg-transparent py-16 md:py-20">
            <div className="container mx-auto px-4">
                <div className="rounded-[2rem] border border-violet-100/80 bg-gradient-to-br from-violet-50/74 via-white/66 to-fuchsia-50/70 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur-xl sm:p-8 md:p-10">
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/75 px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm">
                            Why Trust Us
                        </div>
                        <h2 className="text-3xl font-bold text-stone-800 sm:text-4xl">
                            Our Experience
                        </h2>
                        <p className="mt-3 text-lg font-medium text-violet-800/80">
                            Years of dedication, research, and customer service
                            set us apart
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {items.map((item, i) => (
                            <ExperienceCard key={i} item={item} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
