"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const mobileNavTabs = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Takvim", href: "/takvim", icon: Calendar },
    { name: "Randevular", href: "/randevular", icon: Clock },
    { name: "Müşteriler", href: "/musteriler", icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-[#090a0f] text-slate-100 relative">
      {/* Sidebar with Desktop fixed & Mobile Drawer */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0 overflow-x-hidden bg-[#090a0f]">
        {children}
      </div>

      {/* Bottom Mobile Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0d14]/95 backdrop-blur-md border-t border-zinc-800/80 px-3 py-2 flex items-center justify-around">
        {mobileNavTabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all",
                isActive
                  ? "text-red-500 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Icon className="w-4.5 h-4.5" />
              <span className="text-[10px]">{tab.name}</span>
            </Link>
          );
        })}

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={cn(
            "flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all text-zinc-400 hover:text-zinc-200"
          )}
        >
          <Menu className="w-4.5 h-4.5" />
          <span className="text-[10px]">Tüm Menü</span>
        </button>
      </div>
    </div>
  );
}
