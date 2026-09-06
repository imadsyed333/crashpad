import { AppShell } from "@/components/AppShell";
import type { Metadata, Viewport } from "next";
import { SerwistProvider } from "@serwist/next/react";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "CrashPad",
  title: {
    default: "CrashPad",
    template: "%s · CrashPad",
  },
  description: "Document a collision on this device. No account. No server.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CrashPad",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#196ec8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <SerwistProvider swUrl="/sw.js" cacheOnNavigation>
          <AppShell>{children}</AppShell>
        </SerwistProvider>
      </body>
    </html>
  );
}
