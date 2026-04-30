import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Akash AI Job Board",
  description: "Personal AI-powered job board for growth, product, and performance marketing roles."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
