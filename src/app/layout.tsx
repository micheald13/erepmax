import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { UnitProvider } from "@/context/UnitContext";
import Navbar from "@/components/layout/Navbar";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "erepmax",
  description: "Track your estimated 1 rep max over time",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-950 text-gray-100 flex flex-col">
        <UnitProvider>
          <Navbar />
          <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
            {children}
          </main>
        </UnitProvider>
      </body>
    </html>
  );
}
