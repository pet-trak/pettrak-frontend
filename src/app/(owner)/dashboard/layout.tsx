'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/sidebar';
import { SidebarProvider } from '@/context/sidebar-context';
import { Toaster } from 'sonner';

interface LayoutProps {
    children: ReactNode;
}

function InnerLayout({ children }: Readonly<LayoutProps>) {
    return (
        /*
         * flex-row: sidebar + main sit side-by-side on desktop.
         * The sidebar is sticky/in-flow so it naturally claims its width —
         * no padding-left or margin offsets needed on <main>.
         *
         * On mobile the sidebar renders nothing (hidden md:flex),
         * so the fixed top bar (h-14) and bottom nav (h-16) are the only
         * chrome — handled by pt-14 pb-16 on <main>.
         */
        <div className="flex flex-row min-h-screen bg-gray-100">
            <Sidebar />

            <main className="flex-1 min-w-0 overflow-auto pt-14 pb-16 md:pt-0 md:pb-0">
                {children}
                <Toaster position="top-right" richColors closeButton />
            </main>
        </div>
    );
}

export default function Layout({ children }: Readonly<LayoutProps>) {
    return (
        <SidebarProvider>
            <InnerLayout>{children}</InnerLayout>
        </SidebarProvider>
    );
}