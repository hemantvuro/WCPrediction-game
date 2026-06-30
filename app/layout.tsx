import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FIFA 2026 World Cup Prediction Game",
  description: "Predict match outcomes and compete with friends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
