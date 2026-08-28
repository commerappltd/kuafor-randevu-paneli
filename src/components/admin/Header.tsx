"use client";

import { Plus, Bell, RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import { formatDateTR } from "@/lib/utils";

interface HeaderProps {
  title: string;
  description?: string;
  onNewAppointment?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function Header({
  title,
  description,
  onNewAppointment,
  onRefresh,
  isRefreshing = false,
}: HeaderProps) {
  const todayStr = formatDateTR(new Date());

  return (
    <header className="bg-white border-b border-slate-200/80 px-8 py-5 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm bg-white/90">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <span>{todayStr}</span>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        )}

        {/* New Appointment Button */}
        {onNewAppointment && (
          <button
            onClick={onNewAppointment}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Yeni Randevu Oluştur
          </button>
        )}
      </div>
    </header>
  );
}
