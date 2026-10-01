import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Material Readiness",
  description: "Pre-site material readiness for passive fire team leaders.",
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
