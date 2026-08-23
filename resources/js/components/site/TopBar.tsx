import { Link } from '@inertiajs/react';

interface TopBarProps {
    message: string;
    linkText: string;
    linkUrl: string;
}

export function TopBar({ message, linkText, linkUrl }: TopBarProps) {
    return (
        <div className="border-b border-[#3e8e4f]/15 bg-[#173c28] py-2 text-center text-[11px] tracking-[0.08em] text-[#dcefd1] uppercase">
            <div className="container mx-auto px-4">
                {message}{' '}
                <Link
                    href={linkUrl}
                    className="font-semibold text-[#9ad454] underline underline-offset-2 transition-colors hover:text-white"
                >
                    {linkText}
                </Link>
            </div>
        </div>
    );
}
