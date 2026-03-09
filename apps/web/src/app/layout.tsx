import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";

import { Navbar } from "@/components/Navbar";

import "@/styles/globals.css";

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700", "800"],
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CraftBridge",
  description: "Digital marketplace for artisan products and reels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body className="font-[var(--font-body)] text-ink antialiased">
        <Navbar />
        <main className="mx-auto min-h-[calc(100vh-73px)] w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}

