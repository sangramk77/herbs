import { Link, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    FileText,
    Image,
    Layers,
    LayoutDashboard,
    Mail,
    MessageSquare,
    Package,
    Quote,
    Rss,
    Section,
    Settings,
    ShieldCheck,
    ShoppingCart,
    Star,
    Users,
} from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
    collapsed: boolean;
    onToggleCollapse: () => void;
    productCount?: number;
    categoryCount?: number;
}

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    href?: string;
    children?: {
        label: string;
        icon: React.ReactNode;
        href: string;
        count?: number;
    }[];
    requireSuperAdmin?: boolean;
}

export function AdminSidebar({
    collapsed,
    onToggleCollapse,
    productCount = 0,
    categoryCount = 0,
}: AdminSidebarProps) {
    const [openMenus, setOpenMenus] = useState<string[]>([]);
    const { auth } = usePage().props as any;
    const user = auth?.user;

    const toggleMenu = (label: string) => {
        setOpenMenus((prev) =>
            prev.includes(label)
                ? prev.filter((item) => item !== label)
                : [...prev, label],
        );
    };

    const renderIcon = (icon: React.ReactNode) => {
        if (!icon || !React.isValidElement<{ className?: string }>(icon))
            return icon;
        return React.cloneElement(icon, {
            className: cn(
                icon.props?.className,
                'transition-colors group-hover:text-primary',
            ),
        });
    };

    const menuItems: MenuItem[] = [
        {
            label: 'Dashboard',
            icon: <LayoutDashboard className="h-5 w-5" />,
            href: '/admin',
        },
        {
            label: 'Products',
            icon: <Package className="h-5 w-5" />,
            children: [
                {
                    label: 'Product',
                    icon: <Package className="h-4 w-4" />,
                    href: '/admin/products',
                    count: productCount,
                },
                {
                    label: 'Categories',
                    icon: <Layers className="h-4 w-4" />,
                    href: '/admin/categories',
                    count: categoryCount,
                },
                {
                    label: 'Coupons',
                    icon: <Section className="h-4 w-4" />,
                    href: '/admin/coupons',
                },
                {
                    label: 'Units',
                    icon: <Section className="h-4 w-4" />,
                    href: '/admin/units',
                },
            ],
        },
        {
            label: 'Orders',
            icon: <ShoppingCart className="h-5 w-5" />,
            children: [
                {
                    label: 'All Orders',
                    icon: <ShoppingCart className="h-4 w-4" />,
                    href: '/admin/orders',
                },
                {
                    label: 'COD Orders',
                    icon: <ShoppingCart className="h-4 w-4" />,
                    href: '/admin/orders?payment=cod',
                },
            ],
        },
        {
            label: 'Best Seller',
            icon: <Star className="h-5 w-5" />,
            href: '/admin/best-sellers',
        },
        {
            label: 'CMS',
            icon: <FileText className="h-5 w-5" />,
            children: [
                {
                    label: 'Pages',
                    icon: <FileText className="h-4 w-4" />,
                    href: '/admin/cms/pages',
                },
                {
                    label: 'Banner',
                    icon: <Image className="h-4 w-4" />,
                    href: '/admin/cms/banner',
                },
                {
                    label: 'CMS Section',
                    icon: <Section className="h-4 w-4" />,
                    href: '/admin/cms/sections',
                },
                {
                    label: 'FAQ',
                    icon: <MessageSquare className="h-4 w-4" />,
                    href: '/admin/cms/faq',
                },

                {
                    label: 'Testimonial',
                    icon: <Quote className="h-4 w-4" />,
                    href: '/admin/cms/testimonial',
                },
            ],
        },
        {
            label: 'Blog',
            icon: <Rss className="h-5 w-5" />,
            href: '/admin/cms/blog',
        },
        {
            label: 'Contact Us',
            icon: <MessageSquare className="h-5 w-5" />,
            href: '/admin/contact-submissions',
        },
        {
            label: 'Newsletter',
            icon: <Mail className="h-5 w-5" />,
            href: '/admin/newsletter-subscribers',
        },
        {
            label: 'System',
            icon: <Settings className="h-5 w-5" />,
            children: [
                {
                    label: 'Settings',
                    icon: <Settings className="h-4 w-4" />,
                    href: '/admin/system/settings',
                },
            ],
        },
        {
            label: 'Customer',
            icon: <Users className="h-5 w-5" />,
            href: '/admin/customers',
        },
        // Admin Management - Only for Super Admin
        {
            label: 'Admin Management',
            icon: <ShieldCheck className="h-5 w-5" />,
            href: '/admin/admins',
            requireSuperAdmin: true,
        },
    ];

    // Filter menu items based on user role
    const filteredMenuItems = menuItems.filter((item) => {
        if (item.requireSuperAdmin) {
            return user?.role === 'super_admin';
        }
        return true;
    });

    return (
        <aside
            className={cn(
                'relative flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-black',
                collapsed ? 'w-20' : 'w-64',
            )}
        >
            {/* Logo Section */}
            <div
                className={cn(
                    'flex items-center border-b border-gray-200 dark:border-zinc-800',
                    collapsed
                        ? 'h-auto flex-col gap-4 px-0 py-4'
                        : 'h-16 justify-between px-4',
                )}
            >
                <Link href="/admin" className="flex items-center">
                    {collapsed ? (
                        // Show compact logo/icon when collapsed
                        <img
                            src="/assets/brand/herbs-mark.svg"
                            alt="Herbs"
                            className="h-20 w-20 object-contain"
                        />
                    ) : (
                        // Show full logo when expanded
                        <>
                            <img
                                src="/assets/brand/herbs-logo.svg"
                                alt="Herbs"
                                className="h-12 w-auto max-w-52 object-contain"
                            />
                        </>
                    )}
                </Link>
                <button
                    onClick={onToggleCollapse}
                    className={cn(
                        'rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white',
                        collapsed && 'mx-auto',
                    )}
                    aria-label="Toggle sidebar"
                >
                    {collapsed ? (
                        <ChevronRight className="h-5 w-5" />
                    ) : (
                        <ChevronLeft className="h-5 w-5" />
                    )}
                </button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                    {filteredMenuItems.map((item) => (
                        <li key={item.label}>
                            {item.children ? (
                                <Collapsible
                                    open={
                                        !collapsed &&
                                        openMenus.includes(item.label)
                                    }
                                    onOpenChange={() => toggleMenu(item.label)}
                                >
                                    <CollapsibleTrigger
                                        className={cn(
                                            'group flex w-full items-center justify-between rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-white/60 hover:bg-white/70 hover:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.18)] hover:ring-1 hover:ring-white/50 hover:backdrop-blur-md dark:text-zinc-300 dark:hover:border-white/10 dark:hover:bg-zinc-900/50 dark:hover:ring-white/10',
                                            collapsed && 'justify-center',
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {renderIcon(item.icon)}
                                            {!collapsed && (
                                                <span>{item.label}</span>
                                            )}
                                        </div>
                                        {!collapsed && (
                                            <ChevronDown
                                                className={cn(
                                                    'h-4 w-4 transition-transform',
                                                    openMenus.includes(
                                                        item.label,
                                                    ) && 'rotate-180',
                                                )}
                                            />
                                        )}
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-1 overflow-hidden transition-all duration-300 ease-in-out data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                        <ul className="space-y-1 pl-4">
                                            {item.children.map((child) => (
                                                <li key={child.label}>
                                                    <Link
                                                        href={child.href}
                                                        className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm text-gray-600 transition-all hover:border-white/60 hover:bg-white/70 hover:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.16)] hover:ring-1 hover:ring-white/50 hover:backdrop-blur-md dark:text-zinc-400 dark:hover:border-white/10 dark:hover:bg-zinc-900/50 dark:hover:ring-white/10"
                                                    >
                                                        {renderIcon(child.icon)}
                                                        <span>
                                                            {child.label}
                                                        </span>
                                                        {child.count !==
                                                            undefined && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="ml-auto bg-orange-500/10 text-orange-600 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-orange-500/20 dark:text-orange-400"
                                                            >
                                                                {child.count}
                                                            </Badge>
                                                        )}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </CollapsibleContent>
                                </Collapsible>
                            ) : (
                                <Link
                                    href={item.href!}
                                    className={cn(
                                        'group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-white/60 hover:bg-white/70 hover:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.18)] hover:ring-1 hover:ring-white/50 hover:backdrop-blur-md dark:text-zinc-300 dark:hover:border-white/10 dark:hover:bg-zinc-900/50 dark:hover:ring-white/10',
                                        collapsed && 'justify-center',
                                    )}
                                >
                                    {renderIcon(item.icon)}
                                    {!collapsed && <span>{item.label}</span>}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}
