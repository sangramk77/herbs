import { Link } from '@inertiajs/react';

import { cn } from '@/lib/utils';
import type { CartItem } from '@/types/site-types';

import { CartIcon } from './CartIcon';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';
import { WishlistIcon } from './WishlistIcon';

interface WishlistItem {
    id: string;
    productsName: string;
    seoUrl: string;
    image1: string;
    price: number;
    mrp: number;
}

interface HeaderMiddleProps {
    logoUrl: string;
    cartCount: number;
    cartPrice: number;
    cartItems: CartItem[];
    wishlistCount: number;
    wishlistItems: WishlistItem[];
    isAuthenticated: boolean;
    userName?: string;
    userAvatar?: string;
}

export function HeaderMiddle({
    logoUrl,
    cartCount,
    cartPrice,
    cartItems,
    wishlistCount,
    wishlistItems,
    isAuthenticated,
    userName,
    userAvatar,
    isHomePage = false,
}: HeaderMiddleProps & { isHomePage?: boolean }) {
    return (
        <div className="border-b bg-background">
            <div className="container mx-auto px-4">
                <div
                    className={cn(
                        'grid grid-cols-[auto_1fr_auto] items-center gap-4 py-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-8 lg:py-4',
                        isHomePage && 'lg:items-end lg:py-0',
                    )}
                >
                    {/* Logo */}
                    <div className="shrink-0 justify-self-start">
                        <Link href="/" className="block">
                            <img
                                src={logoUrl}
                                alt="Natural Rudraksh"
                                className="h-9 w-auto md:h-14 lg:h-24"
                            />
                        </Link>
                    </div>

                    {/* Search Bar - Hidden on mobile */}
                    <div
                        className={cn(
                            'hidden w-full justify-self-center lg:block',
                            isHomePage && 'lg:pb-3',
                        )}
                    >
                        <SearchBar className="w-full" />
                    </div>

                    {/* User Actions */}
                    <div className="flex w-full items-center justify-end gap-1 justify-self-end">
                        <UserMenu
                            isAuthenticated={isAuthenticated}
                            userName={userName}
                            userAvatar={userAvatar}
                        />
                        <WishlistIcon
                            count={wishlistCount}
                            items={wishlistItems}
                        />
                        <CartIcon
                            count={cartCount}
                            price={cartPrice}
                            items={cartItems}
                        />
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="mx-auto w-full max-w-md pb-3 lg:hidden">
                    <SearchBar className="mx-auto w-full" />
                </div>
            </div>
        </div>
    );
}
