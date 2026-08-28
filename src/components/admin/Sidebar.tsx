"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Scissors,
  Users,
  UserCheck,
  TrendingUp,
  ExternalLink,
  Sparkles,
  X,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Randevu Takvimi",
    href: "/takvim",
    icon: Calendar,
  },
  {
    name: "Randevular",
    href: "/randevular",
    icon: Clock,
  },
  {
    name: "Müşteriler",
    href: "/musteriler",
    icon: Users,
  },
  {
    name: "Hizmetler",
    href: "/hizmetler",
    icon: Scissors,
  },
  {
    name: "Personel",
    href: "/personel",
    icon: UserCheck,
  },
  {
    name: "Finans & Raporlar",
    href: "/finans",
    icon: TrendingUp,
  },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="w-72 sm:w-64 bg-[#0c0d14] text-slate-100 h-full flex flex-col border-r border-zinc-800/80">
      {/* Brand Header */}
      <div className="p-5 sm:p-6 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-md shadow-red-600/30">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5">
              Kuaför Ali Karayel <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            </h1>
            <p className="text-[10px] sm:text-xs text-red-400/90 font-semibold tracking-wider uppercase">Executive Lounge</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
          Yönetim Konsolu
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white font-bold shadow-lg shadow-red-600/25 scale-[1.02]"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              )}
            >
              <Icon className={cn("w-4.5 h-4.5", isActive ? "text-white" : "text-zinc-500")} />
              {item.name}
            </Link>
          );
        })}

        <div className="pt-5 px-3 pb-2 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
          Müşteri Rezervasyonu
        </div>

        <Link
          href="/randevu-al"
          target="_blank"
          onClick={onCloseMobile}
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-red-300 bg-red-950/30 border border-red-800/40 hover:bg-red-900/30 hover:border-red-600/50 transition-all"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-400" />
            Online Randevu Portalı
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-red-400" />
        </Link>
      </nav>

      {/* Salon Status Footer */}
      <div className="p-3.5 m-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-sm shadow-red-500"></span>
          <span className="font-bold text-zinc-200">Salon Hizmette</span>
        </div>
        <p className="text-zinc-400 text-[10px]">
          VIP ve Standart seanslar aktif kabul ediliyor.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:flex w-64 min-h-screen shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
