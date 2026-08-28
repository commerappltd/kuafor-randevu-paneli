"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatPrice } from "@/lib/utils";

interface RevenueChartProps {
  data: {
    day: string;
    fullDate: string;
    revenue: number;
    appointments: number;
  }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0c0d14] text-white p-3.5 rounded-xl shadow-2xl border border-red-500/30 text-xs space-y-1">
          <p className="font-bold text-red-400">{payload[0]?.payload?.fullDate || label}</p>
          <p className="text-zinc-300">
            Ciro: <span className="font-bold text-white">{formatPrice(payload[0]?.value || 0)}</span>
          </p>
          <p className="text-zinc-400">
            Randevu Sayısı: <span className="font-semibold text-white">{payload[0]?.payload?.appointments || 0} seans</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#12131a] rounded-2xl p-5 sm:p-6 border border-zinc-800/90 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-white text-base">Haftalık Gelir & Performans</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Son 7 günün toplam ciro ve randevu dökümü</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="w-3 h-3 rounded-sm bg-red-600"></span>
            <span>Günlük Ciro (₺)</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#3f3f46" }}
            />
            <YAxis
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#3f3f46" }}
              tickFormatter={(val) => `₺${val}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(220, 38, 38, 0.08)" }} />
            <Bar
              dataKey="revenue"
              fill="#dc2626"
              radius={[6, 6, 0, 0]}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
