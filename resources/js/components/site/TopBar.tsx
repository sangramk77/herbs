import { Link } from '@inertiajs/react';

interface TopBarProps {
    message: string;
    linkText: string;
    linkUrl: string;
}

export function TopBar({ message, linkText, linkUrl }: TopBarProps) {
    return (
        <div className="bg-gray-900 py-1.5 text-center text-xs text-gray-300">
            <div className="container mx-auto px-4">
                {message}{' '}
                <Link
                    href={linkUrl}
                    className="font-semibold text-amber-400 underline underline-offset-2 transition-colors hover:text-amber-300"
                >
                    {linkText}
                </Link>
            </div>
        </div>
    );
}
