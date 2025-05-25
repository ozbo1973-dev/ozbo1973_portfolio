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
  title: "OzBo1973 || Portfolio",
  description: "Protfoilio of Brady Bovero for frelance web development",
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
