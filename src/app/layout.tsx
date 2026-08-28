import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Makas & Stil | Kuaför & Salon Yönetim Paneli",
  description: "Modern kuaför randevu, müşteri ve salon yönetim sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full bg-slate-50 text-slate-900 antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
