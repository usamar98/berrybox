import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/shared/toast";
import "./globals.css";
import "./studio.css";

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
    default: "BerryBox - AI Game Maker",
    template: "%s | BerryBox",
  },
  description:
    "Create playable 3D games with templates and an AI-assisted builder. Your next game starts at BerryBox.",
  keywords: [
    "AI game maker",
    "game templates",
    "AI game editor",
    "playable game generator",
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
      "Describe a game idea, generate a playable configuration, and tune it with the AI editor.",
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
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
