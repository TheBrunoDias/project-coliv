import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthListener } from "@/components/auth/AuthListener";
import { LocaleSync } from "@/components/i18n/LocaleSync";
import { DEFAULT_LOCALE } from "@/i18n/config";
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
  title: {
    default: "Coliv",
    template: "%s · Coliv",
  },
  description: "Chores, shared purchases and notices for shared homes. / Tarefas, compras e avisos da casa compartilhada.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      // Updated on the client by LocaleSync
      lang={DEFAULT_LOCALE}
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <AuthListener />
        <LocaleSync />
        {children}
      </body>
    </html>
  );
}
