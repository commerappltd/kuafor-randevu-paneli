"use client";

import { Plus, RefreshCw, Calendar as CalendarIcon, Menu, Flame } from "lucide-react";
import { formatDateTR } from "@/lib/utils";

interface HeaderProps {
  title: string;
  description?: string;
  onNewAppointment?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onOpenMobileMenu?: () => void;
}

export default function Header({
  title,
  description,
  onNewAppointment,
  onRefresh,
  isRefreshing = false,
  onOpenMobileMenu,
}: HeaderProps) {
  const todayStr = formatDateTR(new Date(), "d MMMM, EEEE");

  return (
    <header className="bg-[#0c0d14]/90 border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 sm:py-5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800 transition-colors shrink-0"
            title="Menüyü Aç"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight truncate flex items-center gap-2">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-zinc-400 mt-0.5 truncate hidden sm:block">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Date Display (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-zinc-300">
          <CalendarIcon className="w-4 h-4 text-red-500" />
          <span>{todayStr}</span>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 sm:p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-red-500" : ""}`} />
          </button>
        )}

        {/* New Appointment Button */}
        {onNewAppointment && (
          <button
            onClick={onNewAppointment}
            className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Yeni Randevu</span>
            <span className="sm:hidden">Randevu</span>
          </button>
        )}
      </div>
    </header>
  );
}
