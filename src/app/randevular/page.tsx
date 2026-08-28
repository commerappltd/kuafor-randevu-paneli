"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Header from "@/components/admin/Header";
import AppointmentModal from "@/components/admin/AppointmentModal";
import WhatsAppModal from "@/components/admin/WhatsAppModal";
import { format } from "date-fns";
import { formatDateTR, formatPrice, APPOINTMENT_STATUS } from "@/lib/utils";
import { Appointment, Staff } from "@/types";
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Scissors,
  UserCheck,
  Phone,
  Trash2,
  Edit2,
  CheckCircle,
  Check,
  XCircle,
  MessageSquare,
} from "lucide-react";

export default function RandevularPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [staffFilter, setStaffFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [whatsAppAppointment, setWhatsAppAppointment] = useState<Appointment | null>(null);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      if (res.ok) setStaffList(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (staffFilter !== "ALL") params.append("staffId", staffFilter);
      if (dateFilter) params.append("date", dateFilter);

      const res = await fetch(`/api/appointments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, staffFilter, dateFilter]);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu randevuyu silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (res.ok) fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <Header
        title="Tüm Randevular"
        description="Filtreleme, arama ve toplu randevu yönetim tablosu"
        onNewAppointment={() => {
          setEditingAppointment(null);
          setIsModalOpen(true);
        }}
        onRefresh={fetchAppointments}
        isRefreshing={loading}
      />

      <main className="p-4 sm:p-8 space-y-4 sm:space-y-6 flex-1">
        {/* Filters Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Müşteri adı veya telefon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="ALL">Tüm Durumlar</option>
                <option value="PENDING">Beklemede (Onay Bekleyen)</option>
                <option value="CONFIRMED">Onaylandı</option>
                <option value="COMPLETED">Tamamlandı</option>
                <option value="CANCELLED">İptal Edildi</option>
              </select>
            </div>

            {/* Staff Filter */}
            <div>
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="ALL">Tüm Uzmanlar</option>
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  className="text-xs text-rose-600 hover:underline shrink-0"
                >
                  Temizle
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Tarih & Saat</th>
                  <th className="py-3.5 px-4">Müşteri</th>
                  <th className="py-3.5 px-4">Hizmet</th>
                  <th className="py-3.5 px-4">Uzman / Personel</th>
                  <th className="py-3.5 px-4">Ücret</th>
                  <th className="py-3.5 px-4">Durum</th>
                  <th className="py-3.5 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Filtrelere uygun randevu bulunamadı.
                    </td>
                  </tr>
                ) : (
                  appointments.map((app) => {
                    const statusConfig = APPOINTMENT_STATUS[app.status] || APPOINTMENT_STATUS.PENDING;

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Tarih & Saat */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{formatDateTR(app.dateStr, "d MMM yyyy")}</div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {app.startTime} - {app.endTime}
                          </div>
                        </td>

                        {/* Müşteri */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{app.customer.name}</div>
                          <a
                            href={`tel:${app.customer.phone}`}
                            className="text-slate-500 hover:text-amber-600 text-[11px] flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            {app.customer.phone}
                          </a>
                        </td>

                        {/* Hizmet */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <Scissors className="w-3.5 h-3.5 text-amber-600" />
                            {app.service.name}
                          </div>
                          <div className="text-[11px] text-slate-400">{app.service.durationMinutes} dakika</div>
                        </td>

                        {/* Personel */}
                        <td className="py-3.5 px-4">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-white font-semibold text-[11px]"
                            style={{ backgroundColor: app.staff.color || "#4f46e5" }}
                          >
                            <UserCheck className="w-3 h-3" />
                            {app.staff.name}
                          </span>
                        </td>

                        {/* Ücret */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {formatPrice(app.totalPrice)}
                        </td>

                        {/* Durum */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] border ${statusConfig.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                            {statusConfig.label}
                          </span>
                        </td>

                        {/* İşlemler */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* WhatsApp Bildirim Butonu */}
                            <button
                              onClick={() => setWhatsAppAppointment(app)}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                              title="WhatsApp ile Hatırlat"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>

                            {app.status === "PENDING" && (
                              <button
                                onClick={() => handleStatusChange(app.id, "CONFIRMED")}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Onayla"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            {app.status === "CONFIRMED" && (
                              <button
                                onClick={() => handleStatusChange(app.id, "COMPLETED")}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                title="Tamamlandı Yap"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setEditingAppointment(app);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="Düzenle"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(app.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAppointment(null);
        }}
        onSuccess={fetchAppointments}
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
