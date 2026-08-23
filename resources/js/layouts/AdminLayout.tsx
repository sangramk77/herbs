import { usePage } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';

import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';

interface AdminLayoutProps {
    userName?: string;
    userAvatar?: string;
}

export default function AdminLayout({
    userName = 'Admin User',
    userAvatar,
    children,
}: PropsWithChildren<AdminLayoutProps>) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { productCount = 0, categoryCount = 0 } = usePage().props as any;

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-zinc-950">
            {/* Sidebar */}
            <AdminSidebar
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                productCount={productCount}
                categoryCount={categoryCount}
            />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Bar */}
                <AdminTopBar
                    userName={userName}
                    userAvatar={userAvatar}
                    onToggleSidebar={() =>
                        setSidebarCollapsed(!sidebarCollapsed)
                    }
                />

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 dark:bg-zinc-950">
                    {children}
                </main>
            </div>
        </div>
    );
}
