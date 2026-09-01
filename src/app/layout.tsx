import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/shared/toast";
import "./globals.css";
import "./studio.css";
import "./berrybox.css";

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
    default: "BerryBox - AI 3D Template Generator",
    template: "%s | BerryBox",
  },
  description:
    "Create game-ready 3D template assets from prompts and inspect GLB results in an interactive Three.js viewer.",
  keywords: [
    "AI 3D generator",
    "3D game templates",
    "text to 3D",
    "GLB viewer",
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
      "Describe a 3D template, generate a GLB asset, and inspect it in an interactive web viewer.",
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
