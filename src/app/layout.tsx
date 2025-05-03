import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import AppSidebar from '@/components/AppSidebar';
import { AppDataProvider } from '@/context/AppDataContext'; // Import the provider

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'InviteAI VBDA',
  description: 'AI-Powered Invitation Management for VBDA 2025',
  // Note: Favicon generation is not supported. Add favicon link here manually if needed.
  icons: {
     icon: '/logo.svg', // Use SVG logo as favicon
     apple: '/logo.svg', // Use SVG logo for Apple touch icon
   },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning // Add suppressHydrationWarning here
        className={cn(
          'min-h-screen bg-secondary font-sans antialiased',
          inter.variable
        )}
      >
        <AppDataProvider> {/* Wrap with AppDataProvider */}
          <SidebarProvider defaultOpen>
              <Sidebar collapsible="icon" side="left" variant="sidebar">
                <AppSidebar />
              </Sidebar>
              <SidebarInset>
                  {children}
              </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </AppDataProvider> {/* Close AppDataProvider */}
      </body>
    </html>
  );
}
