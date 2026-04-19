import type { Metadata, Viewport } from "next";
import { Manrope, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { PwaRegister } from "@/components/PwaRegister";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "optional",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "optional",
});

export const metadata: Metadata = {
  title: "School Tasks",
  description: "Gestiona las tareas escolares fácilmente",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "School Tasks",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background">
        <Providers>{children}</Providers>
        <PwaRegister />
        <SpeedInsights />
      </body>
    </html>
  );
}
