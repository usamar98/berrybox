import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/shared/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://berrybox.local"),
  title: {
    default: "BerryBox - Static AI Game Maker SaaS",
    template: "%s | BerryBox",
  },
  description:
    "A polished static MVP for an AI game maker SaaS with templates, mock editor, gallery, pricing, and roadmap pages.",
  keywords: [
    "AI game maker",
    "game templates",
    "mock game editor",
    "static SaaS frontend",
    "BerryBox",
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/berrybox.png",
  },
  openGraph: {
    title: "BerryBox",
    description:
      "Describe a game idea, explore templates, preview generated games, and open a mock AI editor.",
    type: "website",
    images: ["/berrybox.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
