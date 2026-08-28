"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
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
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
          <p className="font-bold text-amber-400">{payload[0]?.payload?.fullDate || label}</p>
          <p className="text-slate-300">
            Ciro: <span className="font-semibold text-white">{formatPrice(payload[0]?.value || 0)}</span>
          </p>
          <p className="text-slate-400">
            Randevu Sayısı: <span className="font-semibold text-white">{payload[0]?.payload?.appointments || 0} adet</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Haftalık Gelir & Randevu Grafiği</h3>
          <p className="text-xs text-slate-500 mt-0.5">Son 7 günün toplam ciro ve randevu performansı</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
            <span>Günlük Ciro (₺)</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tickFormatter={(val) => `₺${val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="revenue"
              fill="#f59e0b"
              radius={[6, 6, 0, 0]}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
