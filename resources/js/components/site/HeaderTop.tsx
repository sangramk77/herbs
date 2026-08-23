import { Mail, MapPin } from 'lucide-react';

import type { SocialLinks as SocialLinksType } from '@/types/site-types';

import { SocialLinks } from './SocialLinks';

interface HeaderTopProps {
    email: string;
    address: string;
    socialLinks: SocialLinksType;
}

export function HeaderTop({ email, address, socialLinks }: HeaderTopProps) {
    return (
        <div className="border-b bg-background">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-between gap-4 py-3 md:flex-row">
                    {/* Contact Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm md:gap-6">
                        <a
                            href={`mailto:${email}`}
                            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
                        >
                            <Mail className="h-4 w-4" />
                            <span>{email}</span>
                        </a>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span
                                className="line-clamp-1"
                                dangerouslySetInnerHTML={{ __html: address }}
                            />
                        </div>
                    </div>

                    {/* Social Links */}
                    <SocialLinks links={socialLinks} />
                </div>
            </div>
        </div>
    );
}
