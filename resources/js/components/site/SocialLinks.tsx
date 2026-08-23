import { SiFacebook, SiInstagram, SiX, SiYoutube } from 'react-icons/si';

import type { SocialLinks as SocialLinksType } from '@/types/site-types';

interface SocialLinksProps {
    links: SocialLinksType;
    className?: string;
}

export function SocialLinks({ links, className = '' }: SocialLinksProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {links.facebook && (
                <a
                    href={links.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-primary"
                    title="Facebook"
                >
                    <SiFacebook className="h-4 w-4" />
                </a>
            )}
            {links.twitter && (
                <a
                    href={links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-primary"
                    title="X"
                >
                    <SiX className="h-4 w-4" />
                </a>
            )}
            {links.instagram && (
                <a
                    href={links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-primary"
                    title="Instagram"
                >
                    <SiInstagram className="h-4 w-4" />
                </a>
            )}
            {links.youtube && (
                <a
                    href={links.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-primary"
                    title="Youtube"
                >
                    <SiYoutube className="h-4 w-4" />
                </a>
            )}
        </div>
    );
}
