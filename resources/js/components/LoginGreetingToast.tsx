import { Moon, Sun, Sunset } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

type LoginGreetingToastProps = {
    name?: string;
    show: boolean;
};

const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return {
            icon: Sun,
            title: 'Good Morning',
            tone: 'border-amber-200/70 bg-linear-to-br from-amber-50/95 via-orange-50/85 to-sky-50/90 dark:border-amber-400/20 dark:from-amber-950/45 dark:via-orange-950/30 dark:to-sky-950/35',
        };
    }

    if (hour >= 12 && hour < 21) {
        return {
            icon: Sunset,
            title: 'Good Evening',
            tone: 'border-rose-200/70 bg-linear-to-br from-rose-50/95 via-violet-50/85 to-amber-50/90 dark:border-rose-400/20 dark:from-rose-950/40 dark:via-violet-950/35 dark:to-amber-950/30',
        };
    }

    return {
        icon: Moon,
        title: 'Good Night',
        tone: 'border-indigo-200/70 bg-linear-to-br from-indigo-50/95 via-sky-50/85 to-violet-50/90 dark:border-indigo-400/20 dark:from-indigo-950/45 dark:via-sky-950/30 dark:to-violet-950/40',
    };
};

export default function LoginGreetingToast({
    name,
    show,
}: LoginGreetingToastProps) {
    const hasShown = useRef(false);

    useEffect(() => {
        if (!show || hasShown.current) {
            return;
        }

        hasShown.current = true;
        const greeting = getGreeting();
        const Icon = greeting.icon;

        toast.custom(
            () => (
                <div
                    className={`flex w-[min(22rem,calc(100vw-2rem))] items-center gap-3 rounded-2xl border p-3 text-foreground shadow-xl backdrop-blur-xl ${greeting.tone}`}
                >
                    <div className="rounded-xl bg-background/60 p-3 text-primary">
                        <Icon aria-hidden="true" />
                    </div>
                    <div>
                        <p className="font-semibold">{greeting.title}</p>
                        <p className="text-sm text-muted-foreground">
                            {name ? `Welcome back, ${name}!` : 'Welcome back!'}
                        </p>
                    </div>
                </div>
            ),
            { duration: 5000 },
        );
    }, [name, show]);

    return null;
}
