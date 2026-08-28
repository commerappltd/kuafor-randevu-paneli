"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Header from "@/components/admin/Header";
import AppointmentModal from "@/components/admin/AppointmentModal";
import WhatsAppModal from "@/components/admin/WhatsAppModal";
import { formatPrice, formatDateTR } from "@/lib/utils";
import { Appointment, Staff } from "@/types";
import {
  Search,
  Filter,
  Scissors,
  UserCheck,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Phone,
} from "lucide-react";

const APPOINTMENT_STATUS: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  PENDING: {
    label: "Onay Bekliyor",
    bg: "bg-amber-500/15 border-amber-500/30 text-amber-400",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  CONFIRMED: {
    label: "Onaylandı",
    bg: "bg-blue-500/15 border-blue-500/30 text-blue-400",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  COMPLETED: {
    label: "Tamamlandı",
    bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  CANCELLED: {
    label: "İptal Edildi",
    bg: "bg-red-500/15 border-red-500/30 text-red-400",
    text: "text-red-400",
    dot: "bg-red-400",
  },
};

export default function RandevularPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [staffFilter, setStaffFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  // Modals
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

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let url = "/api/appointments?";
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter !== "ALL") url += `status=${statusFilter}&`;
      if (staffFilter !== "ALL") url += `staffId=${staffFilter}&`;
      if (dateFilter) url += `date=${dateFilter}&`;

      const res = await fetch(url);
      if (res.ok) {
        setAppointments(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [search, statusFilter, staffFilter, dateFilter]);

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
        <div className="bg-[#12131a] p-4 sm:p-5 rounded-2xl border border-zinc-800/90 shadow-lg space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Müşteri adı veya telefon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-xs font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-xs font-medium text-white focus:outline-none focus:border-red-600"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-xs font-medium text-white focus:outline-none focus:border-red-600"
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
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#0c0d14] text-xs font-medium text-white focus:outline-none focus:border-red-600"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  className="text-xs text-red-400 hover:underline shrink-0"
                >
                  Temizle
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-[#12131a] rounded-2xl border border-zinc-800/90 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#0c0d14] text-zinc-400 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Tarih & Saat</th>
                  <th className="py-3.5 px-4">Müşteri</th>
                  <th className="py-3.5 px-4">Hizmet</th>
                  <th className="py-3.5 px-4">Uzman / Personel</th>
                  <th className="py-3.5 px-4">Ücret</th>
                  <th className="py-3.5 px-4">Durum</th>
                  <th className="py-3.5 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 font-medium text-zinc-300">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      Filtrelere uygun randevu bulunamadı.
                    </td>
                  </tr>
                ) : (
                  appointments.map((app) => {
                    const statusConfig = APPOINTMENT_STATUS[app.status] || APPOINTMENT_STATUS.PENDING;

                    return (
                      <tr key={app.id} className="hover:bg-zinc-800/30 transition-colors">
                        {/* Tarih & Saat */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-white">{formatDateTR(app.dateStr, "d MMM yyyy")}</div>
                          <div className="text-zinc-400 text-[11px] flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-red-500" />
                            {app.startTime} - {app.endTime}
                          </div>
                        </td>

                        {/* Müşteri */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{app.customer?.name}</div>
                          <a
                            href={`tel:${app.customer?.phone}`}
                            className="text-zinc-400 hover:text-red-400 text-[11px] flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            {app.customer?.phone}
                          </a>
                        </td>

                        {/* Hizmet */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <Scissors className="w-3.5 h-3.5 text-red-500" />
                            {app.service?.name}
                          </div>
                          <div className="text-[11px] text-zinc-500">{app.service?.durationMinutes} dakika</div>
                        </td>

                        {/* Personel */}
                        <td className="py-3.5 px-4">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-white font-semibold text-[11px]"
                            style={{ backgroundColor: app.staff?.color || "#dc2626" }}
                          >
                            <UserCheck className="w-3 h-3" />
                            {app.staff?.name}
                          </span>
                        </td>

                        {/* Ücret */}
                        <td className="py-3.5 px-4 font-black text-red-400 whitespace-nowrap">
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
                              className="p-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 transition-colors border border-emerald-800/40"
                              title="WhatsApp ile Hatırlat"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>

                            {app.status === "PENDING" && (
                              <button
                                onClick={() => handleStatusChange(app.id, "CONFIRMED")}
                                className="p-1.5 rounded-lg bg-blue-950/40 text-blue-400 hover:bg-blue-900/50 transition-colors border border-blue-800/40"
                                title="Onayla"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            {app.status === "CONFIRMED" && (
                              <button
                                onClick={() => handleStatusChange(app.id, "COMPLETED")}
                                className="p-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 transition-colors border border-emerald-800/40"
                                title="Tamamlandı Olarak İşaretle"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            {app.status !== "CANCELLED" && app.status !== "COMPLETED" && (
                              <button
                                onClick={() => handleStatusChange(app.id, "CANCELLED")}
                                className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/50 transition-colors border border-red-800/40"
                                title="İptal Et"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}

                            {/* Düzenle */}
                            <button
                              onClick={() => {
                                setEditingAppointment(app);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                              title="Düzenle"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Sil */}
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
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

      {/* Appointment Create/Edit Modal */}
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
        appointment={whatsAppAppointment}
        onClose={() => setWhatsAppAppointment(null)}
      />
    </AdminLayout>
  );
}
