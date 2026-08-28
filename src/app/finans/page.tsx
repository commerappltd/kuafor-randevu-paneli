"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Header from "@/components/admin/Header";
import { formatPrice, formatDateTR } from "@/lib/utils";
import { Appointment, Staff, Service } from "@/types";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  PieChart as PieChartIcon,
  UserCheck,
  Scissors,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PIE_COLORS = ["#4f46e5", "#db2777", "#059669", "#d97706", "#7c3aed", "#0284c7"];

export default function FinansPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, staffRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/staff"),
      ]);

      if (appRes.ok && staffRes.ok) {
        setAppointments(await appRes.json());
        setStaffList(await staffRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hesaplamalar
  const completedAppointments = appointments.filter((a) => a.status === "COMPLETED");
  const confirmedAppointments = appointments.filter((a) => a.status === "CONFIRMED");
  const pendingAppointments = appointments.filter((a) => a.status === "PENDING");
  const cancelledAppointments = appointments.filter((a) => a.status === "CANCELLED");

  const totalRealizedRevenue = completedAppointments.reduce((sum, a) => sum + a.totalPrice, 0);
  const totalProjectedRevenue = confirmedAppointments.reduce((sum, a) => sum + a.totalPrice, 0);
  const totalCombinedRevenue = totalRealizedRevenue + totalProjectedRevenue;

  const averageTicket =
    completedAppointments.length > 0
      ? totalRealizedRevenue / completedAppointments.length
      : 0;

  // Personel Bazlı Ciro
  const staffPerformance = staffList.map((staff) => {
    const staffApps = appointments.filter(
      (a) => a.staffId === staff.id && (a.status === "COMPLETED" || a.status === "CONFIRMED")
    );
    const revenue = staffApps.reduce((sum, a) => sum + a.totalPrice, 0);
    return {
      name: staff.name,
      appointments: staffApps.length,
      revenue,
      color: staff.color || "#4f46e5",
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Kategori Bazlı Gelir Dağılımı
  const categoryMap: { [key: string]: number } = {};
  for (const a of appointments) {
    if (a.status === "COMPLETED" || a.status === "CONFIRMED") {
      const cat = a.service?.category || "Diğer";
      categoryMap[cat] = (categoryMap[cat] || 0) + a.totalPrice;
    }
  }

  const categoryPieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <AdminLayout>
      <Header
        title="Finans & Gelir Analizi"
        description="Salon cirosu, personel satış performansları ve hizmet gelir kırılımları"
        onRefresh={fetchData}
        isRefreshing={loading}
      />

      <main className="p-8 space-y-8 flex-1">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tahsil Edilen Ciro
            </span>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1.5">
              {formatPrice(totalRealizedRevenue)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {completedAppointments.length} tamamlanan işlem
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Beklenen Ciro (Onaylı)
            </span>
            <h3 className="text-2xl font-bold text-blue-600 mt-1.5">
              {formatPrice(totalProjectedRevenue)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {confirmedAppointments.length} onaylanmış randevu
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ortalama Seans Tutarı
            </span>
            <h3 className="text-2xl font-bold text-amber-600 mt-1.5">
              {formatPrice(averageTicket)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">İşlem başına düşen ortalama harcama</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Randevu Başarı Oranı
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-1.5">
              {appointments.length > 0
                ? `%${Math.round(
                    ((completedAppointments.length + confirmedAppointments.length) /
                      appointments.length) *
                      100
                  )}`
                : "%0"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {cancelledAppointments.length} iptal edilen randevu
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personel Bazında Ciro Grafiği */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="mb-6">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-600" />
                Personel Kazanç & Performans Dağılımı
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Uzman kuaförlerin salona kazandırdığı ciro</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffPerformance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `₺${v}`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatPrice(Number(val)), "Ciro"]}
                  />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Kategori Bazında Gelir Dağılımı */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-amber-600" />
                  Kategori Bazında Ciro Kırılımı
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Hangi hizmet türünden ne kadar gelir sağlandı?</p>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => [formatPrice(Number(val)), "Ciro"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-100 text-xs">
              {categoryPieData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  ></span>
                  <span className="text-slate-600 font-medium">{item.name}:</span>
                  <span className="font-bold text-slate-900">{formatPrice(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staff Table Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900">Personel Ciro & Hakediş Özeti</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Uzman / Kuaför</th>
                  <th className="py-3 px-4">Tamamlanan / Onaylı Randevu</th>
                  <th className="py-3 px-4">Toplam Ciro</th>
                  <th className="py-3 px-4">Salon Ciro Payı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {staffPerformance.map((st) => {
                  const share =
                    totalCombinedRevenue > 0
                      ? Math.round((st.revenue / totalCombinedRevenue) * 100)
                      : 0;

                  return (
                    <tr key={st.name} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: st.color }}
                        ></span>
                        {st.name}
                      </td>
                      <td className="py-3.5 px-4">{st.appointments} seans</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        {formatPrice(st.revenue)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full"
                              style={{ width: `${share}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-slate-700 text-[11px]">%{share}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
