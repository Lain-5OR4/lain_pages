import type { Metadata } from "next";
import localFont from "next/font/local";
import { Kaisei_Decol, Reggae_One } from "next/font/google";
import "./globals.css";
import { ConditionalBackground } from "@/components/background/ConditionalBackground";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const loveLetter = localFont({
  src: "./fonts/LoveLetter.woff",
  variable: "--font-love-letter",
  weight: "400",
  display: "swap",
});

const kaiseiDecol = Kaisei_Decol({
  subsets: ["latin", "latin-ext"],
  variable: "--font-kaisei-decol",
  weight: ["400", "500", "700"],
  display: "swap",
});

const reggaeOne = Reggae_One({
  subsets: ["latin", "latin-ext"],
  variable: "--font-reggae-one",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Locus Solus in Wired",
  description: "portfolios of the future",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${loveLetter.variable} ${geistMono.variable} ${geistSans.variable} ${kaiseiDecol.variable} ${reggaeOne.variable} antialiased`}
      >
        <ConditionalBackground />
        {children}
      </body>
    </html>
  );
}
