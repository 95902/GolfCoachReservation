import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://golfindoor.fr'),
  title: "Golf Indoor TrackMan 4 - Cours de Golf à Paris",
  description: "Réservez vos cours de golf indoor avec TrackMan 4 à Paris. Entraînement professionnel, analyse de swing et coaching personnalisé pour tous les niveaux.",
  keywords: [
    "golf indoor", 
    "TrackMan 4", 
    "cours de golf Paris", 
    "golf simulator", 
    "coach golf Paris", 
    "leçon golf", 
    "analyse swing", 
    "golf accompagné",
    "parcours golf Paris",
    "entraînement golf",
    "golf pour débutants",
    "golf pour confirmés"
  ],
  authors: [{ name: "Golf Indoor TrackMan 4" }],
  creator: "Golf Indoor TrackMan 4",
  publisher: "Golf Indoor TrackMan 4",
  robots: "index, follow",
  openGraph: {
    title: "Golf Indoor TrackMan 4 - Cours de Golf à Paris",
    description: "Réservez vos cours de golf indoor avec TrackMan 4 à Paris. Entraînement professionnel et coaching personnalisé.",
    url: "https://golfindoor.fr",
    siteName: "Golf Indoor TrackMan 4",
    type: "website",
    locale: "fr_FR",
    images: [
      {
        url: "/golf-indoor-banner.jpg",
        width: 1440,
        height: 720,
        alt: "Golf Indoor TrackMan 4 - Installation professionnelle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Golf Indoor TrackMan 4 - Cours de Golf à Paris",
    description: "Réservez vos cours de golf indoor avec TrackMan 4 à Paris",
    images: ["/golf-indoor-banner.jpg"],
  },
  alternates: {
    canonical: "https://golfindoor.fr",
  },
  other: {
    "geo.region": "FR-IDF",
    "geo.placename": "Paris",
    "geo.position": "48.8566;2.3522",
    "ICBM": "48.8566, 2.3522",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning={true}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
