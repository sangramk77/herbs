import { useEffect, useState } from 'react';

interface FormErrorProps {
    message?: string;
    tone?: 'light' | 'dark';
}

export function FormError({ message, tone = 'light' }: FormErrorProps) {
    const [isVisible, setIsVisible] = useState(Boolean(message));

    useEffect(() => {
        if (!message) {
            setIsVisible(false);
            return;
        }

        setIsVisible(true);
        const timeoutId = window.setTimeout(() => {
            setIsVisible(false);
        }, 5000);

        return () => window.clearTimeout(timeoutId);
    }, [message]);

    if (!message || !isVisible) {
        return null;
    }

    const toneClasses =
        tone === 'dark'
            ? 'border-red-500/40 bg-red-500/10 text-red-200'
            : 'border-red-200 bg-red-50 text-red-700';

    return (
        <p
            className={`rounded-md border px-3 py-2 text-xs font-medium ${toneClasses}`}
        >
            {message}
        </p>
    );
}
