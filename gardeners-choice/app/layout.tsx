import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Gardener's Choice — find local food banks and free harvest sites",
  description:
    "A community map of food banks, pantries, and free harvesting sites. Built so neighbors can find help, share resources, and stay fed.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="root-layout">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
