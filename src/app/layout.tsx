import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
<<<<<<< HEAD
import { Analytics } from "@vercel/analytics/next"
=======
>>>>>>> master

// Check these paths carefully:
import Navbar from "./components/Navbar"; // Relative path is safer here
import Footer from "./components/Footer"; // Relative path is safer here
import { Providers } from "./components/Providers"; // Update this too

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lamed English",
  description: "Unlock your English potential",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}