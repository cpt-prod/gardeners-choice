import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Harvest Connect — find local food banks and free harvest sites",
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
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
