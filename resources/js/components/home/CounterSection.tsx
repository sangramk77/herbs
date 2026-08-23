import { Box, LoaderCircle, Smile, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CounterStats {
    counter_1: number;
    counter_2: number;
    counter_3: number;
    counter_4: number;
}

interface CounterSectionProps {
    stats?: CounterStats;
}

const defaultStats: CounterStats = {
    counter_1: 733,
    counter_2: 25,
    counter_3: 50,
    counter_4: 10,
};

export function CounterSection({ stats = defaultStats }: CounterSectionProps) {
    const [hasAnimated, setHasAnimated] = useState(false);
    const [counts, setCounts] = useState({
        counter_1: 0,
        counter_2: 0,
        counter_3: 0,
        counter_4: 0,
    });
    const sectionRef = useRef<HTMLElement>(null);

    const counters = [
        {
            icon: Users,
            count: stats.counter_1,
            currentCount: counts.counter_1,
            suffix: '+',
            label: 'Active Clients',
        },
        {
            icon: LoaderCircle,
            count: stats.counter_2,
            currentCount: counts.counter_2,
            suffix: '+',
            label: 'Varieties Of Rudraksha',
        },
        {
            icon: Box,
            count: stats.counter_3,
            currentCount: counts.counter_3,
            suffix: '+',
            label: 'Active Products',
        },
        {
            icon: Smile,
            count: stats.counter_4,
            currentCount: counts.counter_4,
            suffix: 'K+',
            label: 'Satisfied Client',
        },
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        setHasAnimated(true);
                        animateCounters();
                    }
                });
            },
            { threshold: 0.3 },
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, [hasAnimated]);

    const animateCounters = () => {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const stepDuration = duration / steps;

        let currentStep = 0;

        const interval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            setCounts({
                counter_1: Math.floor(stats.counter_1 * progress),
                counter_2: Math.floor(stats.counter_2 * progress),
                counter_3: Math.floor(stats.counter_3 * progress),
                counter_4: Math.floor(stats.counter_4 * progress),
            });

            if (currentStep >= steps) {
                clearInterval(interval);
                setCounts({
                    counter_1: stats.counter_1,
                    counter_2: stats.counter_2,
                    counter_3: stats.counter_3,
                    counter_4: stats.counter_4,
                });
            }
        }, stepDuration);
    };

    return (
        <section
            ref={sectionRef}
            className="border-y bg-background py-12 md:py-16"
        >
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
                    {counters.map((counter, index) => {
                        const Icon = counter.icon;
                        return (
                            <div
                                key={index}
                                className="flex flex-col items-center text-center"
                            >
                                {/* Icon */}
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform hover:scale-110">
                                    <Icon className="h-8 w-8" />
                                </div>

                                {/* Count */}
                                <h5 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
                                    {counter.currentCount}
                                    <span className="text-primary">
                                        {counter.suffix}
                                    </span>
                                </h5>

                                {/* Label */}
                                <h6 className="text-sm font-medium text-muted-foreground md:text-base">
                                    {counter.label}
                                </h6>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
