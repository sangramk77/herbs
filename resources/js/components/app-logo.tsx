import { cn } from '@/lib/utils';

import AppLogoIcon from './app-logo-icon';

interface AppLogoProps {
    className?: string;
}

export default function AppLogo({ className }: AppLogoProps) {
    return (
        <>
            <AppLogoIcon
                className={cn('h-12 w-12 md:h-14 md:w-14', className)}
            />
        </>
    );
}
