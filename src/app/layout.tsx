import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YYJ Allergen-Aware Eats | Victoria BC Restaurant Allergen Guide",
  description:
    "Find allergy-safe dining in Victoria BC and the Capital Regional District. Browse restaurant menus with EU 14 allergen flags for every dish.",
  keywords: [
    "Victoria BC restaurants",
    "food allergies",
    "allergen menu",
    "gluten free Victoria",
    "Capital Regional District dining",
    "EU 14 allergens",
  ],
  openGraph: {
    title: "YYJ Allergen-Aware Eats",
    description:
      "Restaurant allergen directory for Victoria BC. Menu-item-level allergen information for safe dining.",
    type: "website",
    locale: "en_CA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
