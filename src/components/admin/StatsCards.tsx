"use client";

import { Calendar, Clock, DollarSign, UserCheck, TrendingUp, AlertCircle } from "lucide-react";
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
      subtitle: "Günün toplam rezervasyonu",
      icon: Calendar,
      color: "from-blue-600 to-indigo-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Bekleyen Onaylar",
      value: `${pendingCount} Talep`,
      subtitle: pendingCount > 0 ? "Onay bekleyen randevular var" : "Tüm talepler yanıtlandı",
      icon: AlertCircle,
      color: "from-amber-500 to-orange-500",
      textColor: "text-amber-600",
      bgColor: "bg-amber-500/10",
      badge: pendingCount > 0 ? "İncele" : null,
    },
    {
      title: "Bugünkü Ciro",
      value: formatPrice(todayRevenue),
      subtitle: "Onaylanan ve tamamlanan",
      icon: DollarSign,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Aktif Uzmanlar",
      value: `${activeStaffCount} Personel`,
      subtitle: "Salonda görevde",
      icon: UserCheck,
      color: "from-purple-500 to-violet-600",
      textColor: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1.5">{card.value}</h3>
                <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
              </div>

              <div className={`w-11 h-11 rounded-xl ${card.bgColor} ${card.textColor} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {card.badge && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-medium">
                <span>İşlem gerekiyor</span>
                <span className="bg-amber-100 px-2 py-0.5 rounded-full font-bold">!</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
