import { type HTMLAttributes, useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

export default function InputError({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
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

    return (
        <p
            {...props}
            className={cn('text-sm text-red-600 dark:text-red-400', className)}
        >
            {message}
        </p>
    );
}
