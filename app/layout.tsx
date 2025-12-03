import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iPod Classic",
  description: "A fully functional iPod Classic simulator built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
