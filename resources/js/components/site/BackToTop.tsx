import { ArrowUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const targetProgressRef = useRef(0);
    const animatedProgressRef = useRef(0);
    const animationFrameRef = useRef<number | null>(null);

    const size = 40;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference * (1 - scrollProgress);

    useEffect(() => {
        const animateProgress = () => {
            const target = targetProgressRef.current;
            const current = animatedProgressRef.current;
            const next = current + (target - current) * 0.14;

            animatedProgressRef.current =
                Math.abs(target - next) < 0.001 ? target : next;
            setScrollProgress(animatedProgressRef.current);

            if (Math.abs(target - animatedProgressRef.current) < 0.001) {
                animationFrameRef.current = null;
                return;
            }

            animationFrameRef.current =
                window.requestAnimationFrame(animateProgress);
        };

        const toggleVisibility = () => {
            const currentScroll = window.scrollY;
            const maxScroll =
                document.documentElement.scrollHeight - window.innerHeight;
            const progress =
                maxScroll > 0
                    ? Math.min(Math.max(currentScroll / maxScroll, 0), 1)
                    : 0;

            setIsVisible(currentScroll > 300);
            targetProgressRef.current = progress;

            if (animationFrameRef.current === null) {
                animationFrameRef.current =
                    window.requestAnimationFrame(animateProgress);
            }
        };

        toggleVisibility();
        window.addEventListener('scroll', toggleVisibility, { passive: true });

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
            if (animationFrameRef.current !== null) {
                window.cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="fixed right-8 bottom-8 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:scale-110 hover:bg-primary/90"
                    aria-label="Back to top"
                >
                    <svg
                        className="pointer-events-none absolute inset-0 -rotate-90"
                        width={size}
                        height={size}
                        viewBox={`0 0 ${size} ${size}`}
                        aria-hidden="true"
                    >
                        <defs>
                            <linearGradient
                                id="back-to-top-progress"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                            >
                                <stop offset="0%" stopColor="#0284c7" />
                                <stop offset="55%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#34d399" />
                            </linearGradient>
                        </defs>
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="rgba(2, 132, 199, 0.28)"
                            strokeWidth={strokeWidth}
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="url(#back-to-top-progress)"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={progressOffset}
                            style={{
                                filter:
                                    'drop-shadow(0 0 2px rgba(99,102,241,0.45))',
                            }}
                        />
                    </svg>
                    <ArrowUp className="h-4 w-4" />
                </button>
            )}
        </>
    );
}
