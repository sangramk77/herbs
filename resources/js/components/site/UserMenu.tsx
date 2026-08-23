import { Link, router } from '@inertiajs/react';
import { Heart, LogOut, User, UserCircle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserMenuProps {
    isAuthenticated: boolean;
    userName?: string;
    userAvatar?: string;
}

export function UserMenu({
    isAuthenticated,
    userName,
    userAvatar,
}: UserMenuProps) {
    const handleLogout = () => {
        router.post('/logout');
    };

    const initial = userName?.trim()?.charAt(0)?.toUpperCase() ?? 'U';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10"
                >
                    {isAuthenticated ? (
                        <Avatar className="h-7 w-7 border border-border/70">
                            <AvatarImage src={userAvatar} alt={userName} />
                            <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary-foreground">
                                {initial}
                            </AvatarFallback>
                        </Avatar>
                    ) : (
                        <User className="h-6 w-6" />
                    )}
                    <span className="sr-only">User menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {isAuthenticated ? (
                    <>
                        <div className="px-2 py-1.5 text-sm font-medium">
                            {userName}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                href="/dashboard"
                                className="flex w-full cursor-pointer items-center"
                            >
                                <UserCircle className="mr-2 h-4 w-4" />
                                My Account
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                href="/wishlist"
                                className="flex w-full cursor-pointer items-center"
                            >
                                <Heart className="mr-2 h-4 w-4" />
                                Wishlist
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="cursor-pointer"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <DropdownMenuItem asChild>
                            <Link
                                href="/login"
                                className="flex w-full cursor-pointer items-center"
                            >
                                Sign in
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                href="/register"
                                className="flex w-full cursor-pointer items-center"
                            >
                                Register
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                href="/login"
                                className="flex w-full cursor-pointer items-center"
                            >
                                <Heart className="mr-2 h-4 w-4" />
                                Wishlist
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
