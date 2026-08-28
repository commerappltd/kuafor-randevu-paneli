import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kuaför Ali Karayel | Özel Tasarım & Randevu Yönetim Paneli",
  description: "Kuaför Ali Karayel kurumsal randevu, müşteri ve salon yönetim sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full bg-[#090a0f] text-slate-100 antialiased">
      <body className="min-h-full flex flex-col bg-[#090a0f] text-slate-100">{children}</body>
    </html>
  );
}
