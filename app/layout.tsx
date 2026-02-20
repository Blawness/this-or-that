import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Github } from "lucide-react";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <main className="flex-1">{children}</main>
        <footer className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
          <Link
            href="https://github.com/Yudha/this-or-that"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-foreground/80 transition-colors hover:text-primary"
          >
            <Github className="size-4" aria-hidden />
            Contribute on GitHub
          </Link>
          <span>Made by Yudha with &lt;3</span>
        </footer>
      </body>
    </html>
  );
}
