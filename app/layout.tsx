import type React from "react"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { FocusTrap } from "@/components/focus-trap"
import { SkipToContent } from "@/components/skip-to-content"
import type { Metadata } from "next"
import { PWARegister } from "@/components/pwa-register"
import { InstallPrompt } from "@/components/install-prompt"
import { SplashScreen } from "@/components/splash-screen"
import { NetworkStatus } from "@/components/network-status"
import { AutoScrollTop } from "@/components/auto-scroll-top"
import { NavigationProgress } from "@/components/navigation-progress"
import { BackToTopButton } from "@/components/back-to-top-button"
import { PageTransition } from "@/components/page-transition"

export const metadata: Metadata = {
  title: "Aman Group of Companies",
  description: "Premium real estate developments by Aman Group of Companies",
  themeColor: "#65932D",
  manifest: "/manifest.json",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aman Group",
  },
  formatDetection: {
    telephone: true,
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Aman Group" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#65932D" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Aman Group" />
        <meta name="msapplication-TileColor" content="#65932D" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="format-detection" content="telephone=no" />
        {/* Add proper content type for service worker */}
        <link rel="serviceworker" href="/sw.js" type="application/javascript" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <NavigationProgress />
          <BackToTopButton />
          <AutoScrollTop />
          <FocusTrap />
          <PWARegister />
          <SplashScreen />
          <div className="relative flex min-h-screen flex-col">
            <SkipToContent />
            <MainNav />
            <main id="main-content" className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <NetworkStatus />
            <InstallPrompt />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
