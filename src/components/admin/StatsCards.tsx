"use client";

import { Calendar, Clock, DollarSign, UserCheck, TrendingUp, AlertCircle, Flame } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface StatsCardsProps {
  todayCount: number;
  pendingCount: number;
  todayRevenue: number;
  activeStaffCount: number;
}

export default function StatsCards({
  todayCount,
  pendingCount,
  todayRevenue,
  activeStaffCount,
}: StatsCardsProps) {
  const cards = [
    {
      title: "Bugünkü Randevular",
      value: `${todayCount} Randevu`,
      subtitle: "Günün toplam seansı",
      icon: Calendar,
      textColor: "text-red-400",
      iconBg: "bg-red-500/10 text-red-500 border border-red-500/20",
    },
    {
      title: "Bekleyen Onaylar",
      value: `${pendingCount} Talep`,
      subtitle: pendingCount > 0 ? "İşlem bekleyen rezervasyon" : "Tüm talepler yanıtlandı",
      icon: AlertCircle,
      textColor: pendingCount > 0 ? "text-amber-400" : "text-zinc-300",
      iconBg: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      badge: pendingCount > 0 ? "İncele" : null,
    },
    {
      title: "Bugünkü Ciro",
      value: formatPrice(todayRevenue),
      subtitle: "Onaylanan ve tamamlanan",
      icon: DollarSign,
      textColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    },
    {
      title: "Uzman Kadro",
      value: `${activeStaffCount} Stilist`,
      subtitle: "Salonda aktif görevde",
      icon: UserCheck,
      textColor: "text-red-300",
      iconBg: "bg-red-500/10 text-red-400 border border-red-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-[#12131a] rounded-2xl p-5 border border-zinc-800/90 shadow-lg hover:border-red-600/40 transition-all duration-200 relative overflow-hidden group"
          >
            {/* Top red subtle line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {card.title}
                </span>
                <h3 className="text-2xl font-black text-white mt-1.5">{card.value}</h3>
                <p className="text-xs text-zinc-400 mt-1">{card.subtitle}</p>
              </div>

              <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {card.badge && (
              <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-amber-400 font-semibold">
                <span>Bekleyen onay var</span>
                <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-500/30">
                  Aksiyon Gerekiyor
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
