import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SME Connect — CRM & Marketing Platform",
  description: "The AI-native CRM built for South African SMEs",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
