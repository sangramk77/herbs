import { router, usePage } from '@inertiajs/react';
import { Clock, LogOut, Menu, Moon, Shield, Sun, User } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminTopBarProps {
    userName?: string;
    userAvatar?: string;
    onToggleSidebar?: () => void;
}

export function AdminTopBar({
    userName = 'Admin User',
    userAvatar,
    onToggleSidebar,
}: AdminTopBarProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { auth } = usePage().props as any;
    const user = auth?.user;

    useEffect(() => {
        // Check if dark mode is enabled on mount
        const darkMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(darkMode);
        if (darkMode) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);

        if (newDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    };

    const handleLogout = () => {
        router.post('/admin/logout');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleBadge = (role: string) => {
        if (role === 'super_admin') {
            return (
                <Badge className="bg-purple-500 text-white hover:bg-purple-600">
                    <Shield className="mr-1 h-3 w-3" />
                    Super Admin
                </Badge>
            );
        }
        if (role === 'admin') {
            return (
                <Badge className="bg-orange-500 text-white hover:bg-orange-600">
                    <Shield className="mr-1 h-3 w-3" />
                    Admin
                </Badge>
            );
        }
        return null;
    };

    const formatLastLogin = (lastLogin: string | null) => {
        if (!lastLogin) return 'Never';
        const date = new Date(lastLogin);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60)
            return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24)
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7)
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    const displayName = user?.name || userName;
    const displayRole = user?.role || 'admin';
    const lastLogin = user?.last_login_at;

    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-zinc-800 dark:bg-black">
            {/* Left Section - Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
                {onToggleSidebar && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleSidebar}
                        className="md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                )}
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Dashboard
                </h1>
            </div>

            {/* Right Section - Dark Mode Toggle & User Menu */}
            <div className="flex items-center gap-2">
                {/* Dark Mode Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleDarkMode}
                    className="relative h-9 w-9"
                    aria-label="Toggle dark mode"
                >
                    {isDarkMode ? (
                        <Sun className="h-5 w-5 text-zinc-300" />
                    ) : (
                        <Moon className="h-5 w-5 text-gray-600" />
                    )}
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative flex items-center gap-2 rounded-full"
                        >
                            <Avatar className="h-9 w-9">
                                <AvatarImage
                                    src={userAvatar}
                                    alt={displayName}
                                />
                                <AvatarFallback className="bg-orange-500 text-white">
                                    {getInitials(displayName)}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm leading-none font-medium">
                                        {displayName}
                                    </p>
                                    {getRoleBadge(displayRole)}
                                </div>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email || 'admin@example.com'}
                                </p>
                                {lastLogin && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                            Last login:{' '}
                                            {formatLastLogin(lastLogin)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => router.visit('/admin/profile')}
                            className="cursor-pointer"
                        >
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
