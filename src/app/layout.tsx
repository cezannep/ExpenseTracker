import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MobileContainer } from "@/components/common/MobileContainer";
import { BottomNav } from "@/components/common/BottomNav";
import { AddTransactionSheet } from "@/components/modals/AddTransactionSheet";
import { CalendarOverlay } from "@/components/modals/CalendarOverlay";
import { PWAInstallPrompt } from "@/components/common/PWAInstallPrompt";
import { ThemeInitializer } from "@/components/common/ThemeInitializer";
import { AuthGuard } from "@/components/auth/AuthGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Personal Expense Tracker PWA",
  description: "Mobile-first PWA personal expense tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Expense Tracker",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased selection:bg-blue-500 selection:text-white`}>
        <ThemeInitializer>
          <AuthGuard>
            <MobileContainer>
              {children}
              <AddTransactionSheet />
              <CalendarOverlay />
              <PWAInstallPrompt />
              <BottomNav />
            </MobileContainer>
          </AuthGuard>
        </ThemeInitializer>
      </body>
    </html>
  );
}

