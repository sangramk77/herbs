import {
    CreditCard,
    Gift,
    RotateCcw,
    Truck,
    type LucideIcon,
} from 'lucide-react';

interface Feature {
    icon: LucideIcon;
    iconClassName: string;
    title: string;
    description: string;
}

const features: Feature[] = [
    {
        icon: Truck,
        iconClassName:
            'animate-[bounce_2.6s_ease-in-out_infinite] group-hover:scale-110',
        title: 'Free shipping',
        description: 'On all orders over ₹999.00',
    },
    {
        icon: RotateCcw,
        iconClassName:
            'animate-[spin_7s_linear_infinite] group-hover:scale-110',
        title: '15 days returns',
        description: 'Moneyback guarantee',
    },
    {
        icon: CreditCard,
        iconClassName:
            'animate-[pulse_2.4s_ease-in-out_infinite] group-hover:scale-110',
        title: 'Secure checkout',
        description: 'Protected by Razorpay',
    },
    {
        icon: Gift,
        iconClassName:
            'animate-[bounce_3s_ease-in-out_infinite] group-hover:scale-110',
        title: 'Offer & gift here',
        description: 'On all orders over',
    },
];

export function TrustFeatures() {
    return (
        <section className="bg-muted/50 py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group flex flex-col items-center text-center"
                        >
                            <div className="mb-3 text-primary">
                                <feature.icon
                                    className={`h-8 w-8 transition-transform duration-300 ${feature.iconClassName}`}
                                />
                            </div>
                            <h3 className="mb-1 text-base font-semibold md:text-lg">
                                {feature.title}
                            </h3>
                            <p className="text-xs text-muted-foreground md:text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
