import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "KickAt",
  description: "KickAt Ecommerce Platform",
  icons: {
    icon: "/logo.png",
  },
};

import { Navbar } from "@/components/common/Navbar";
import { SmoothScrollProvider } from "@/components/common/SmoothScrollProvider";
import { SplashScreen } from "@/components/common/SplashScreen";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} ${fraunces.variable} ${ibmPlexMono.variable} antialiased`}
    >
      <body className="flex flex-col min-h-screen">
        <SplashScreen />
        <SmoothScrollProvider>
          <Navbar />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
