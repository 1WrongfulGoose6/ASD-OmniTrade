import React from "react";
import PropTypes from "prop-types";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { getCurrentUser } from "@/lib/server/currentUser";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "OmniTrade - Secure Crypto Trading Platform",
  description: "Professional cryptocurrency trading platform with real-time market data, portfolio management, and advanced security features.",
  keywords: "cryptocurrency, trading, bitcoin, ethereum, portfolio, secure, finance",
  authors: [{ name: "OmniTrade Team" }],
  creator: "OmniTrade",
  publisher: "OmniTrade",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification tokens here when available
    // google: "your-google-verification-token",
    // yandex: "your-yandex-verification-token",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "OmniTrade - Secure Crypto Trading Platform",
    description: "Professional cryptocurrency trading platform with real-time market data and portfolio management.",
    siteName: "OmniTrade",
  },
  twitter: {
    card: "summary_large_image",
    title: "OmniTrade - Secure Crypto Trading Platform",
    description: "Professional cryptocurrency trading platform with real-time market data and portfolio management.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default async function RootLayout({ children }) {
  const currentUser = await getCurrentUser().catch(() => null);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <AuthProvider initialUser={currentUser}>
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
