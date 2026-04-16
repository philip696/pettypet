import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PettyPet MVP - Pet Care Management",
  description: "Track and manage your pet's care tasks and health records",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
