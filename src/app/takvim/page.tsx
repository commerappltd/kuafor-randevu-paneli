"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Header from "@/components/admin/Header";
import AppointmentModal from "@/components/admin/AppointmentModal";
import { formatPrice, formatDateTR } from "@/lib/utils";
import { Appointment, Staff } from "@/types";
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { tr } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  UserCheck,
  Scissors,
  Plus,
  Filter,
} from "lucide-react";

const HOURS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00",
];

const APPOINTMENT_STATUS: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: "Bekliyor", bg: "bg-amber-500/15 border-amber-500/30 text-amber-400", text: "text-amber-400" },
  CONFIRMED: { label: "Onaylandı", bg: "bg-blue-500/15 border-blue-500/30 text-blue-400", text: "text-blue-400" },
  COMPLETED: { label: "Tamamlandı", bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400", text: "text-emerald-400" },
  CANCELLED: { label: "İptal", bg: "bg-red-500/15 border-red-500/30 text-red-400", text: "text-red-400" },
};

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export default function TakvimPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"staff_day" | "weekly">("staff_day");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("ALL");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>();
  const [modalInitialStaffId, setModalInitialStaffId] = useState<string | undefined>();
  const [modalInitialTime, setModalInitialTime] = useState<string | undefined>();
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff?activeOnly=true");
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let url = "/api/appointments?";
      if (viewMode === "staff_day") {
        url += `date=${format(selectedDate, "yyyy-MM-dd")}`;
      } else {
        const start = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
        const end = format(endOfWeek(selectedDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
        url += `startDate=${start}&endDate=${end}`;
      }

      if (selectedStaffId !== "ALL") {
        url += `&staffId=${selectedStaffId}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
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
  }, [selectedDate, viewMode, selectedStaffId]);

  const handlePrev = () => {
    setSelectedDate((prev) => (viewMode === "staff_day" ? subDays(prev, 1) : subDays(prev, 7)));
  };

  const handleNext = () => {
    setSelectedDate((prev) => (viewMode === "staff_day" ? addDays(prev, 1) : addDays(prev, 7)));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleCellClick = (dateStr: string, staffId: string, time: string) => {
    setEditingAppointment(null);
    setModalInitialDate(dateStr);
    setModalInitialStaffId(staffId);
    setModalInitialTime(time);
    setIsModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, app: Appointment) => {
    e.stopPropagation();
    setEditingAppointment(app);
    setIsModalOpen(true);
  };

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const activeStaffToDisplay = selectedStaffId === "ALL" 
    ? staffList 
    : staffList.filter((s) => s.id === selectedStaffId);

  return (
    <AdminLayout>
      <Header
        title="İnteraktif Randevu Takvimi"
        description="Personel bazlı saatlik timeline ve haftalık salon doluluk planı"
        onNewAppointment={() => {
          setEditingAppointment(null);
          setModalInitialDate(format(selectedDate, "yyyy-MM-dd"));
          setIsModalOpen(true);
        }}
        onRefresh={fetchAppointments}
        isRefreshing={loading}
      />

      <main className="p-4 sm:p-8 space-y-4 sm:space-y-6 flex-1 flex flex-col">
        {/* Calendar Controls Top Bar */}
        <div className="bg-[#12131a] p-4 rounded-2xl border border-zinc-800/90 shadow-lg flex flex-wrap items-center justify-between gap-4">
          {/* Sol: Tarih Navigasyonu */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#0c0d14] p-1 rounded-xl border border-zinc-800">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                title="Önceki"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
              >
                Bugün
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                title="Sonraki"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-white">
              <CalendarIcon className="w-4.5 h-4.5 text-red-500" />
              <span>
                {viewMode === "staff_day"
                  ? formatDateTR(selectedDate)
                  : `${format(weekStart, "d MMM", { locale: tr })} - ${format(weekEnd, "d MMM yyyy", { locale: tr })}`}
              </span>
            </div>
          </div>

          {/* Sağ: Görünüm & Personel Filtreleri */}
          <div className="flex items-center gap-3">
            {/* Personel Seçimi */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400 hidden sm:inline">Uzman:</span>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-xs font-medium text-white focus:outline-none focus:border-red-600"
              >
                <option value="ALL">Tüm Uzmanlar</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Görünüm Modu */}
            <div className="flex items-center bg-[#0c0d14] p-1 rounded-xl border border-zinc-800 text-xs font-medium">
              <button
                onClick={() => setViewMode("staff_day")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "staff_day"
                    ? "bg-red-600 text-white font-bold shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Günlük / Personel
              </button>
              <button
                onClick={() => setViewMode("weekly")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "weekly"
                    ? "bg-red-600 text-white font-bold shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Haftalık Görünüm
              </button>
            </div>
          </div>
        </div>

        {/* 1. GÖRÜNÜM: Günlük Personel Bazlı Timeline */}
        {viewMode === "staff_day" && (
          <div className="bg-[#12131a] rounded-2xl border border-zinc-800/90 shadow-lg overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Personel Başlıkları */}
                <div className="grid grid-cols-[80px_repeat(auto-fit,minmax(200px,1fr))] border-b border-zinc-800 bg-[#0c0d14]">
                  <div className="p-3.5 text-center text-xs font-bold text-zinc-400 border-r border-zinc-800 flex items-center justify-center">
                    Saat
                  </div>
                  {activeStaffToDisplay.map((staff) => (
                    <div
                      key={staff.id}
                      className="p-3.5 border-r border-zinc-800 last:border-r-0 flex items-center gap-2.5"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: staff.color }}
                      ></span>
                      <div>
                        <h4 className="font-bold text-xs text-white">{staff.name}</h4>
                        <p className="text-[10px] text-zinc-400">{staff.title}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Saat Satırları */}
                <div className="divide-y divide-zinc-800/80">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="grid grid-cols-[80px_repeat(auto-fit,minmax(200px,1fr))] min-h-[64px]"
                    >
                      {/* Saat Etiketi */}
                      <div className="p-2 text-center text-xs font-semibold text-zinc-400 border-r border-zinc-800 bg-[#0c0d14]/60 flex items-center justify-center">
                        {hour}
                      </div>

                      {/* Her Personel İçin Hücre */}
                      {activeStaffToDisplay.map((staff) => {
                        const matchingApp = appointments.find(
                          (a) =>
                            a.staffId === staff.id &&
                            timeToMinutes(hour) >= timeToMinutes(a.startTime) &&
                            timeToMinutes(hour) < timeToMinutes(a.endTime)
                        );

                        const isStartHour = matchingApp && matchingApp.startTime === hour;

                        return (
                          <div
                            key={staff.id}
                            onClick={() =>
                              !matchingApp &&
                              handleCellClick(
                                format(selectedDate, "yyyy-MM-dd"),
                                staff.id,
                                hour
                              )
                            }
                            className={`p-1.5 border-r border-zinc-800/60 last:border-r-0 relative group transition-colors ${
                              matchingApp
                                ? "bg-zinc-900/30"
                                : "hover:bg-red-950/20 cursor-pointer"
                            }`}
                          >
                            {!matchingApp && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center text-red-400 text-xs font-bold gap-1">
                                <Plus className="w-3.5 h-3.5" />
                                <span>Randevu Ekle</span>
                              </div>
                            )}

                            {matchingApp && isStartHour && (
                              <div
                                onClick={(e) => handleEditClick(e, matchingApp)}
                                className="h-full w-full rounded-xl p-2.5 shadow-md border border-zinc-700/80 text-xs cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between bg-[#0c0d14]"
                                style={{
                                  borderLeftColor: staff.color || "#dc2626",
                                  borderLeftWidth: "4px",
                                }}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-white truncate">
                                      {matchingApp.customer.name}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                        APPOINTMENT_STATUS[matchingApp.status]?.bg || "bg-zinc-800 text-zinc-300"
                                      }`}
                                    >
                                      {APPOINTMENT_STATUS[matchingApp.status]?.label || matchingApp.status}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-1 truncate">
                                    <Scissors className="w-3 h-3 text-red-500 shrink-0" />
                                    <span>{matchingApp.service.name}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2 pt-1.5 border-t border-zinc-800">
                                  <span className="font-semibold text-zinc-300">
                                    {matchingApp.startTime} - {matchingApp.endTime}
                                  </span>
                                  <span className="font-bold text-red-400">
                                    {formatPrice(matchingApp.totalPrice)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. GÖRÜNÜM: Haftalık Takvim */}
        {viewMode === "weekly" && (
          <div className="bg-[#12131a] rounded-2xl border border-zinc-800/90 shadow-lg overflow-hidden flex-1">
            <div className="grid grid-cols-7 border-b border-zinc-800 bg-[#0c0d14] text-center">
              {weekDays.map((day) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={day.toString()}
                    className={`p-3 border-r border-zinc-800 last:border-r-0 ${
                      isToday ? "bg-red-950/30" : ""
                    }`}
                  >
                    <span className="block text-[11px] font-bold text-zinc-400 uppercase">
                      {format(day, "EEEE", { locale: tr })}
                    </span>
                    <span
                      className={`inline-block mt-0.5 text-sm font-black w-7 h-7 leading-7 rounded-full ${
                        isToday ? "bg-red-600 text-white shadow-md shadow-red-600/30" : "text-white"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-7 divide-x divide-zinc-800/80 min-h-[500px]">
              {weekDays.map((day) => {
                const dayStr = format(day, "yyyy-MM-dd");
                const dayApps = appointments.filter((a) => a.dateStr === dayStr);

                return (
                  <div
                    key={dayStr}
                    className="p-2 space-y-2 bg-[#12131a] hover:bg-zinc-900/40 transition-colors"
                  >
                    {dayApps.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-3">
                        <button
                          onClick={() => handleCellClick(dayStr, staffList[0]?.id || "", "10:00")}
                          className="text-[11px] font-medium text-zinc-500 hover:text-red-400 p-2 rounded-lg border border-dashed border-zinc-800 hover:border-red-600/50 transition-all w-full"
                        >
                          + Randevu Ekle
                        </button>
                      </div>
                    ) : (
                      dayApps.map((app) => (
                        <div
                          key={app.id}
                          onClick={(e) => handleEditClick(e, app)}
                          className="bg-[#0c0d14] p-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 shadow-sm transition-all cursor-pointer text-xs"
                          style={{
                            borderLeftColor: app.staff.color || "#dc2626",
                            borderLeftWidth: "4px",
                          }}
                        >
                          <div className="flex items-center justify-between font-bold text-white">
                            <span className="truncate">{app.customer.name}</span>
                            <span className="text-[10px] text-zinc-400 font-medium">
                              {app.startTime}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 mt-1 truncate">
                            {app.service.name}
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-800 text-[10px]">
                            <span className="text-zinc-500">{app.staff.name.split(" ")[0]}</span>
                            <span className="font-bold text-red-400">
                              {formatPrice(app.totalPrice)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAppointment(null);
        }}
        onSuccess={fetchAppointments}
        initialDate={modalInitialDate}
        initialStaffId={modalInitialStaffId}
        initialTime={modalInitialTime}
        editAppointment={editingAppointment}
      />
    </AdminLayout>
  );
}
