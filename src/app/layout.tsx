import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ABeeZee, Inter, Mulish } from "next/font/google";
import Navbar from "@/components/navigation/nav-bar";
import { NavigationProvider } from "@/context/navigation-context";
import "./globals.css";
import Footer from "@/components/sections/footer";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const abeeZee = ABeeZee({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-abeezee",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-mulish",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ozbo1973.com"),
  title: {
    default: "OzBo1973 || Portfolio",
    template: "%s | OzBo1973",
  },
  description:
    "Portfolio of Brady Bovero for freelance web development, specializing in React, Next.js, and AI-powered solutions.",
  keywords: [
    "Brady Bovero",
    "OzBo1973",
    "Portfolio",
    "Web Developer",
    "Freelance",
    "React",
    "Next.js",
    "AI",
    "Frontend",
    "Fullstack",
    "JavaScript",
    "TypeScript",
    "Projects",
    "Contact",
    "Skills",
  ],
  authors: [{ name: "Brady Bovero", url: "https://ozbo1973.com" }],
  creator: "Brady Bovero",
  publisher: "Brady Bovero",
  openGraph: {
    title: "OzBo1973 || Portfolio",
    description:
      "Portfolio of Brady Bovero for freelance web development, specializing in React, Next.js, and AI-powered solutions.",
    url: "https://ozbo1973.com",
    siteName: "OzBo1973 Portfolio",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "OzBo1973 Portfolio OG Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${abeeZee.variable} ${inter.variable} ${mulish.variable} min-h-screen antialiased font-serif`}
      >
        <NavigationProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster position="top-center" />
          <Footer />
        </NavigationProvider>
      </body>
    </html>
  );
}
