import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/shared/toast";
import "./globals.css";
import "./studio.css";
import "./berrybox.css";
import "./scene-generator.css";

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
    default: "BerryBox - AI 3D Creation Tools",
    template: "%s | BerryBox",
  },
  description:
    "Create textured 3D scenes and original characters from prompts, explore them interactively, and download private GLB results.",
  keywords: [
    "AI 3D generator",
    "3D scene generator",
    "3D character generator",
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
      "Generate textured 3D scenes and original characters, then inspect and download private GLB assets.",
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
