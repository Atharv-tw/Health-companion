import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Health Companion | Your Bio-Digital Oracle",
  description: "Next-gen personal health tracking and AI guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${inter.variable} font-sans antialiased bg-background text-foreground transition-colors duration-500`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}