"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Header from "@/components/admin/Header";
import StatsCards from "@/components/admin/StatsCards";
import RevenueChart from "@/components/admin/RevenueChart";
import TodayAppointmentsList from "@/components/admin/TodayAppointmentsList";
import AppointmentModal from "@/components/admin/AppointmentModal";
import WhatsAppModal from "@/components/admin/WhatsAppModal";
import { formatPrice } from "@/lib/utils";
import { DashboardStats, Appointment } from "@/types";
import { Scissors, TrendingUp, Sparkles, UserPlus, Calendar } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [whatsAppAppointment, setWhatsAppAppointment] = useState<Appointment | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("İstatistikler alınamadı");
      const data: DashboardStats = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchStats();
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingAppointment(null);
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

      <main className="p-8 space-y-8 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
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
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-amber-600" />
                        Popüler Hizmetler
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">En çok tercih edilen işlemler</p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {stats.popularServices.map((service, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-700 font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="font-semibold text-slate-900 text-xs">{service.name}</h4>
                            <p className="text-[11px] text-slate-500">{service.count} kez uygulandı</p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-800 text-xs">
                          {formatPrice(service.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Tüm hizmetleri görüntüle</span>
                  <Link
                    href="/hizmetler"
                    className="font-semibold text-amber-600 hover:text-amber-700"
                  >
                    Hizmet Kataloğu →
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom: Today's Appointments List */}
            <TodayAppointmentsList
              appointments={stats.todayAppointments}
              onStatusChange={handleStatusChange}
              onEdit={handleEditAppointment}
              onWhatsApp={(app) => setWhatsAppAppointment(app)}
            />
          </>
        ) : null}
      </main>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAppointment(null);
        }}
        onSuccess={fetchStats}
        editAppointment={editingAppointment}
      />

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={Boolean(whatsAppAppointment)}
        onClose={() => setWhatsAppAppointment(null)}
        appointment={whatsAppAppointment}
      />
    </AdminLayout>
  );
}
