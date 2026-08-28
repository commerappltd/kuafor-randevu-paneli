"use client";

import { Plus, RefreshCw, Calendar as CalendarIcon, Menu } from "lucide-react";
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
    <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5 sm:py-5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md bg-white/90">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
            title="Menüyü Aç"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5 truncate hidden sm:block">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Date Display (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <span>{todayStr}</span>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 sm:p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        )}

        {/* New Appointment Button */}
        {onNewAppointment && (
          <button
            onClick={onNewAppointment}
            className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all active:scale-[0.98]"
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
