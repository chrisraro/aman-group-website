import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { MainNav } from "@/components/main-nav"
import { Footer } from "@/components/footer"
import { AutoScrollTop } from "@/components/auto-scroll-top"
import { BackToTopButton } from "@/components/back-to-top-button"
import { NavigationProgress } from "@/components/navigation-progress"
import { SkipToContent } from "@/components/skip-to-content"
import { NetworkStatus } from "@/components/network-status"
import { PWARegister } from "@/components/pwa-register"
import { SplashScreen } from "@/components/splash-screen"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Aman Group - Real Estate Development",
  description: "Aman Group is a real estate development company in Naga City, Philippines.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <Providers>
          <SkipToContent />
          <SplashScreen />
          <NavigationProgress />
          <MainNav />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <BackToTopButton />
          <AutoScrollTop />
          <NetworkStatus />
          <PWARegister />
        </Providers>
      </body>
    </html>
  )
}
