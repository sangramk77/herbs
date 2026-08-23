import { Link } from '@inertiajs/react';
import { ChevronDown, Heart, Menu, ShoppingCart, User } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import type {
    MegaMenuItem,
    SiteNavItem,
    SocialLinks as SocialLinksType,
} from '@/types/site-types';

import { SearchBar } from './SearchBar';
import { SocialLinks } from './SocialLinks';

interface MobileMenuProps {
    navItems: SiteNavItem[];
    products: MegaMenuItem[];
    cartCount: number;
    isAuthenticated: boolean;
    socialLinks: SocialLinksType;
    logoUrl: string;
}

export function MobileMenu({
    navItems,
    products,
    cartCount,
    isAuthenticated,
    socialLinks,
    logoUrl,
    isHomePage = false,
}: MobileMenuProps & { isHomePage?: boolean }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b bg-background py-3 lg:hidden">
            <div className="container mx-auto px-4">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <Menu className="mr-2 h-5 w-5" />
                            MENU
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="left"
                        className="w-75 overflow-y-auto p-0"
                        onOpenAutoFocus={(event) => event.preventDefault()}
                    >
                        <SheetHeader className="border-b p-4">
                            <SheetTitle className="text-left">
                                <Link
                                    href="/"
                                    onClick={() => setOpen(false)}
                                    className="block"
                                >
                                    <img
                                        src={logoUrl}
                                        alt="Herbs"
                                        className={`w-auto ${isHomePage ? 'h-12' : 'h-9'}`}
                                    />
                                </Link>
                            </SheetTitle>
                        </SheetHeader>

                        {/* Mobile Search */}
                        <div className="border-b p-4">
                            <SearchBar
                                className="w-full"
                                placeholder="Search products..."
                                onSelect={() => setOpen(false)}
                            />
                        </div>

                        {/* Mobile Navigation */}
                        <nav className="border-b p-4">
                            <ul className="space-y-2">
                                {navItems.map((item) => {
                                    if (item.megaMenu && products.length > 0) {
                                        return (
                                            <li key={item.label}>
                                                <Collapsible>
                                                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                                                        {item.label}
                                                        <ChevronDown className="h-4 w-4" />
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent className="mt-1 space-y-1 pl-3">
                                                        {products.map(
                                                            (product) => (
                                                                <Link
                                                                    key={
                                                                        product.id
                                                                    }
                                                                    href={
                                                                        product.categorySlug
                                                                            ? `/category/${product.categorySlug}/product/${product.url}`
                                                                            : `/product/${product.url}`
                                                                    }
                                                                    onClick={() =>
                                                                        setOpen(
                                                                            false,
                                                                        )
                                                                    }
                                                                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                                                                >
                                                                    <img
                                                                        src={
                                                                            product.image
                                                                        }
                                                                        alt={
                                                                            product.name
                                                                        }
                                                                        className="h-8 w-8 rounded object-cover"
                                                                    />
                                                                    <span className="line-clamp-2 text-xs">
                                                                        {
                                                                            product.name
                                                                        }
                                                                    </span>
                                                                </Link>
                                                            ),
                                                        )}
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            </li>
                                        );
                                    }

                                    return (
                                        <li key={item.label}>
                                            <Link
                                                href={item.url}
                                                onClick={() => setOpen(false)}
                                                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>

                        {/* Mobile Actions */}
                        <div className="border-b p-4">
                            <div className="space-y-2">
                                <Link
                                    href={
                                        isAuthenticated ? '/account' : '/login'
                                    }
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
                                >
                                    <User className="h-5 w-5" />
                                    My Account
                                </Link>
                                <Link
                                    href="/wishlist"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
                                >
                                    <Heart className="h-5 w-5" />
                                    Wishlist
                                </Link>
                                <Link
                                    href="/cart"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    <span className="flex-1">Your Cart</span>
                                    {cartCount > 0 && (
                                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="p-4">
                            <SocialLinks
                                links={socialLinks}
                                className="justify-center"
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
