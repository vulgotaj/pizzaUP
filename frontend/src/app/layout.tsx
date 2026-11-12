import type { Metadata } from "next";
import { DM_Sans, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const bodyFont = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const headingFont = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const numberFont = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: "500",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "pizzaUP",
  description: "Pedidos e cardápio da sua pizzaria.",
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${bodyFont.variable} ${headingFont.variable} ${numberFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
