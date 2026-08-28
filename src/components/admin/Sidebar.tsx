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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
              Makas & Stil <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h1>
            <p className="text-xs text-slate-400 font-medium">Kuaför Yönetim Paneli</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Ana Menü
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150",
                isActive
                  ? "bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/70"
              )}
            >
              <Icon className={cn("w-4.5 h-4.5", isActive ? "text-slate-950" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Müşteri Erişimi
        </div>

        <Link
          href="/randevu-al"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-amber-300 bg-amber-950/40 border border-amber-600/30 hover:bg-amber-900/40 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Online Randevu Portalı
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
        </Link>
      </nav>

      {/* Salon Status Footer */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/70 border border-slate-700/60 text-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-200">Salon Açık</span>
        </div>
        <p className="text-slate-400 text-[11px]">
          Bugün 4 uzman kuaför aktif hizmet vermektedir.
        </p>
      </div>
    </aside>
  );
}
