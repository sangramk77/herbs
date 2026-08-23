import { Link } from '@inertiajs/react';
import { Heart, LayoutGrid, Settings, ShoppingBag } from 'lucide-react';

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'My Orders',
        href: '/orders',
        icon: ShoppingBag,
    },
    {
        title: 'My Wishlist',
        href: '/wishlist',
        icon: Heart,
    },
    {
        title: 'Settings',
        href: '/settings/profile',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="bg-[radial-gradient(ellipse_80%_60%_at_10%_10%,rgba(99,102,241,0.25)_0%,transparent_55%),radial-gradient(ellipse_70%_60%_at_90%_90%,rgba(139,92,246,0.20)_0%,transparent_55%),radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(20,184,166,0.12)_0%,transparent_60%)]"
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-auto p-3 group-data-[state=collapsed]:p-2"
                        >
                            <Link href={dashboard()} prefetch>
                                <span className="flex items-center justify-center">
                                    <span className="flex items-center justify-center group-data-[state=collapsed]:hidden">
                                        <img
                                            src="/assets/brand/herbs-mark.svg"
                                            alt="Herbs"
                                            className="h-[49px] w-auto object-contain md:h-[49px]"
                                        />
                                    </span>
                                    <span className="hidden items-center justify-center group-data-[state=collapsed]:flex">
                                        <img
                                            src="/assets/brand/herbs-mark.svg"
                                            alt="Herbs"
                                            className="h-10 w-10 object-contain"
                                        />
                                    </span>
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
