import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Github } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
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
  title: "This or That",
  description: "A fun This or That game — pick one, get another. Options powered by Gemini.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
              <Link href="/" className="text-sm font-semibold tracking-tight sm:text-base">
                This or That
              </Link>
              <ModeToggle />
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="flex flex-col items-center gap-2 px-4 py-4 text-center text-xs text-muted-foreground sm:py-6 sm:text-sm">
            <Link
              href="https://github.com/Blawness/this-or-that"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-wrap items-center justify-center gap-1.5 text-foreground/80 transition-colors hover:text-primary"
            >
              <Github className="size-4 shrink-0" aria-hidden />
              Contribute on GitHub
            </Link>
            <span>Made by Yudha with &lt;3</span>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
