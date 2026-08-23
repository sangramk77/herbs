import { router } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';

interface WishlistButtonProps {
    productId: string;
    isInWishlist: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function WishlistButton({
    productId,
    isInWishlist,
    className,
    size = 'md',
}: WishlistButtonProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isProcessing) return;

        setIsProcessing(true);
        const wasInWishlist = isInWishlist;
        router.post(
            '/wishlist',
            { productId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    if (wasInWishlist) {
                        toast.error('Removed from wishlist');
                    }
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            },
        );
    };

    const sizeClasses = {
        sm: 'h-7 w-7',
        md: 'h-9 w-9',
        lg: 'h-10 w-10',
    };

    const iconSizes = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn(
                sizeClasses[size],
                'rounded-full bg-white/90 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white',
                isProcessing && 'cursor-not-allowed opacity-50',
                className,
            )}
            onClick={toggleWishlist}
            disabled={isProcessing}
            aria-label={
                isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'
            }
        >
            <Heart
                className={cn(
                    iconSizes[size],
                    'transition-all',
                    isInWishlist
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-600 hover:text-red-500',
                )}
            />
        </Button>
    );
}
