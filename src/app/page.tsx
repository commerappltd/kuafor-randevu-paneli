"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Header from "@/components/admin/Header";
import StatsCards from "@/components/admin/StatsCards";
import RevenueChart from "@/components/admin/RevenueChart";
import TodayAppointmentsList from "@/components/admin/TodayAppointmentsList";
import AppointmentModal from "@/components/admin/AppointmentModal";
import { formatPrice } from "@/lib/utils";
import { Scissors, TrendingUp, Sparkles, Flame } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  todayAppointmentsCount: number;
  pendingApprovalsCount: number;
  todayRevenue: number;
  activeStaffCount: number;
  weeklyRevenueChart: {
    day: string;
    fullDate: string;
    revenue: number;
    appointments: number;
  }[];
  todayAppointments: any[];
  popularServices: {
    id: string;
    name: string;
    category: string;
    price: number;
    count: number;
  }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Stats yüklenemedi");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNew = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleSelectAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  return (
    <AdminLayout>
      <Header
        title="Genel Bakış & Kontrol Paneli"
        description="Salondaki anlık randevu akışı, finansal durum ve uzman performansları"
        onNewAppointment={handleCreateNew}
        onRefresh={fetchStats}
        isRefreshing={refreshing}
      />

      <main className="p-4 sm:p-8 space-y-6 sm:space-y-8 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
          </div>
        ) : stats ? (
          <>
            {/* Top KPI Cards */}
            <StatsCards
              todayCount={stats.todayAppointmentsCount}
              pendingCount={stats.pendingApprovalsCount}
              todayRevenue={stats.todayRevenue}
              activeStaffCount={stats.activeStaffCount}
            />

            {/* Middle Grid: Revenue Chart & Popular Services */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RevenueChart data={stats.weeklyRevenueChart} />
              </div>

              {/* Popular Services Card */}
              <div className="bg-[#12131a] rounded-2xl p-5 sm:p-6 border border-zinc-800/90 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-red-500 fill-red-500" /> Popüler Hizmetler
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">En çok tercih edilen işlemler</p>
                    </div>
                    <Link
                      href="/hizmetler"
                      className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                    >
                      Tümü
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {stats.popularServices.map((service, index) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#0c0d14] border border-zinc-800 hover:border-red-600/30 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-red-950/40 border border-red-800/40 flex items-center justify-center text-xs font-bold text-red-400">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{service.name}</p>
                            <p className="text-[10px] text-zinc-500">{service.category}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-extrabold text-red-400">
                            {formatPrice(service.price)}
                          </p>
                          <p className="text-[10px] text-zinc-400">{service.count} randevu</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <Link
                    href="/randevu-al"
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Online Rezervasyon Sayfasını Aç
                  </Link>
                </div>
              </div>
            </div>

            {/* Today Appointments Full List */}
            <TodayAppointmentsList
              appointments={stats.todayAppointments}
              onStatusChange={handleStatusChange}
              onSelectAppointment={handleSelectAppointment}
            />
          </>
        ) : null}
      </main>

      {/* Appointment Create / Edit Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        editAppointment={selectedAppointment}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchStats();
        }}
      />
    </AdminLayout>
  );
}
