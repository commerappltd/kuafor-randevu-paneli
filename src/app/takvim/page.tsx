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
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
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
  Sparkles,
  Phone,
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
  const [viewMode, setViewMode] = useState<"staff_day" | "weekly" | "monthly">("staff_day");
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
      } else if (viewMode === "weekly") {
        const start = format(startOfWeek(selectedDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
        const end = format(endOfWeek(selectedDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
        url += `startDate=${start}&endDate=${end}`;
      } else {
        const monthStart = startOfWeek(startOfMonth(selectedDate), { weekStartsOn: 1 });
        const monthEnd = endOfWeek(endOfMonth(selectedDate), { weekStartsOn: 1 });
        url += `startDate=${format(monthStart, "yyyy-MM-dd")}&endDate=${format(monthEnd, "yyyy-MM-dd")}`;
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
    if (viewMode === "staff_day") {
      setSelectedDate((prev) => subDays(prev, 1));
    } else if (viewMode === "weekly") {
      setSelectedDate((prev) => subDays(prev, 7));
    } else {
      setSelectedDate((prev) => subMonths(prev, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "staff_day") {
      setSelectedDate((prev) => addDays(prev, 1));
    } else if (viewMode === "weekly") {
      setSelectedDate((prev) => addDays(prev, 7));
    } else {
      setSelectedDate((prev) => addMonths(prev, 1));
    }
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

  // Monthly Days Interval
  const monthStart = startOfWeek(startOfMonth(selectedDate), { weekStartsOn: 1 });
  const monthEnd = endOfWeek(endOfMonth(selectedDate), { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const activeStaffToDisplay = selectedStaffId === "ALL" 
    ? staffList 
    : staffList.filter((s) => s.id === selectedStaffId);

  return (
    <AdminLayout>
      <Header
        title="İnteraktif Randevu Takvimi"
        description="Personel bazlı saatlik timeline, haftalık plan ve aylık salon doluluk çizelgesi"
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
                  : viewMode === "weekly"
                  ? `${format(weekStart, "d MMM", { locale: tr })} - ${format(weekEnd, "d MMM yyyy", { locale: tr })}`
                  : format(selectedDate, "MMMM yyyy", { locale: tr }).toUpperCase()}
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

            {/* Görünüm Modu 3'lü Buton */}
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
              <button
                onClick={() => setViewMode("monthly")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "monthly"
                    ? "bg-red-600 text-white font-bold shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Aylık Görünüm
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
                            className={`p-1.5 border-r border-zinc-800 last:border-r-0 relative transition-colors ${
                              !matchingApp ? "hover:bg-zinc-800/40 cursor-pointer" : ""
                            }`}
                          >
                            {matchingApp && isStartHour && (
                              <div
                                onClick={(e) => handleEditClick(e, matchingApp)}
                                className={`absolute inset-x-1 top-1 z-10 p-2.5 rounded-xl border transition-all cursor-pointer shadow-md hover:scale-[1.02] ${
                                  APPOINTMENT_STATUS[matchingApp.status]?.bg ||
                                  "bg-zinc-800 border-zinc-700 text-white"
                                }`}
                                style={{
                                  height: `calc(${
                                    ((timeToMinutes(matchingApp.endTime) -
                                      timeToMinutes(matchingApp.startTime)) /
                                      30) *
                                    64
                                  }px - 8px)`,
                                }}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-extrabold text-xs truncate text-white">
                                    {matchingApp.customer.name}
                                  </span>
                                  <span className="text-[10px] font-bold text-zinc-300">
                                    {matchingApp.startTime} - {matchingApp.endTime}
                                  </span>
                                </div>
                                <div className="text-[11px] font-medium text-zinc-300 truncate mt-0.5">
                                  {matchingApp.service.name}
                                </div>
                                <div className="text-[10px] font-bold text-emerald-400 mt-1">
                                  {formatPrice(matchingApp.totalPrice)}
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

        {/* 2. GÖRÜNÜM: Haftalık Görünüm */}
        {viewMode === "weekly" && (
          <div className="bg-[#12131a] rounded-2xl border border-zinc-800/90 shadow-lg overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Gün Başlıkları */}
                <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-zinc-800 bg-[#0c0d14]">
                  <div className="p-3.5 text-center text-xs font-bold text-zinc-400 border-r border-zinc-800 flex items-center justify-center">
                    Saat
                  </div>
                  {weekDays.map((day) => {
                    const isToday = isSameDay(day, new Date());
                    return (
                      <div
                        key={day.toISOString()}
                        className={`p-3 text-center border-r border-zinc-800 last:border-r-0 ${
                          isToday ? "bg-red-950/20" : ""
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase text-zinc-400 block">
                          {format(day, "EEEE", { locale: tr })}
                        </span>
                        <span
                          className={`text-sm font-extrabold block mt-0.5 ${
                            isToday ? "text-red-500" : "text-white"
                          }`}
                        >
                          {format(day, "d MMMM", { locale: tr })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Saat Satırları */}
                <div className="divide-y divide-zinc-800/80">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="grid grid-cols-[80px_repeat(7,1fr)] min-h-[56px]"
                    >
                      <div className="p-2 text-center text-xs font-semibold text-zinc-400 border-r border-zinc-800 bg-[#0c0d14]/60 flex items-center justify-center">
                        {hour}
                      </div>

                      {weekDays.map((day) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const matchingApps = appointments.filter(
                          (a) => a.dateStr === dateStr && a.startTime === hour
                        );

                        return (
                          <div
                            key={day.toISOString()}
                            onClick={() =>
                              matchingApps.length === 0 &&
                              handleCellClick(
                                dateStr,
                                staffList[0]?.id || "",
                                hour
                              )
                            }
                            className={`p-1 border-r border-zinc-800 last:border-r-0 relative transition-colors ${
                              matchingApps.length === 0
                                ? "hover:bg-zinc-800/30 cursor-pointer"
                                : ""
                            }`}
                          >
                            {matchingApps.map((app) => (
                              <div
                                key={app.id}
                                onClick={(e) => handleEditClick(e, app)}
                                className={`p-1.5 rounded-lg border text-[10px] font-semibold mb-1 cursor-pointer transition-all hover:scale-105 ${
                                  APPOINTMENT_STATUS[app.status]?.bg ||
                                  "bg-zinc-800 border-zinc-700 text-white"
                                }`}
                              >
                                <div className="font-bold text-white truncate">
                                  {app.customer.name}
                                </div>
                                <div className="text-zinc-300 truncate text-[9px]">
                                  {app.service.name}
                                </div>
                              </div>
                            ))}
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

        {/* 3. GÖRÜNÜM: AYLIK GÖRÜNÜM (YENİ EKLENDİ) */}
        {viewMode === "monthly" && (
          <div className="bg-[#12131a] rounded-2xl border border-zinc-800/90 shadow-lg overflow-hidden flex-1 flex flex-col p-4 sm:p-6">
            {/* Haftanın Günleri Başlıkları */}
            <div className="grid grid-cols-7 border-b border-zinc-800 pb-3 mb-2 text-center text-xs font-black uppercase tracking-wider text-zinc-400">
              <span>Pazartesi</span>
              <span>Salı</span>
              <span>Çarşamba</span>
              <span>Perşembe</span>
              <span>Cuma</span>
              <span className="text-red-400">Cumartesi</span>
              <span className="text-red-400">Pazar</span>
            </div>

            {/* Aylık Gün Kutuları Grid */}
            <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
              {monthDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const isCurrentMonth = isSameMonth(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const dayApps = appointments.filter((a) => a.dateStr === dateStr);
                const dayRevenue = dayApps
                  .filter((a) => a.status === "COMPLETED" || a.status === "CONFIRMED")
                  .reduce((sum, a) => sum + a.totalPrice, 0);

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => {
                      setSelectedDate(day);
                      setViewMode("staff_day");
                    }}
                    className={`min-h-[105px] sm:min-h-[125px] p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isToday
                        ? "bg-red-950/20 border-red-600/80 shadow-md shadow-red-950/40"
                        : isCurrentMonth
                        ? "bg-[#0c0d14] border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-900/60"
                        : "bg-zinc-950/40 border-zinc-900/60 opacity-30"
                    }`}
                  >
                    {/* Üst Satır: Gün Numarası & Randevu Sayısı */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? "bg-red-600 text-white shadow-sm"
                            : isCurrentMonth
                            ? "text-white"
                            : "text-zinc-500"
                        }`}
                      >
                        {format(day, "d")}
                      </span>

                      {dayApps.length > 0 && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-red-600/20 text-red-400 border border-red-600/30">
                          {dayApps.length} Randevu
                        </span>
                      )}
                    </div>

                    {/* Randevu Hapları (Max 2 tane gösterir, fazlaysa +N der) */}
                    <div className="space-y-1 my-1 overflow-hidden">
                      {dayApps.slice(0, 2).map((app) => (
                        <div
                          key={app.id}
                          onClick={(e) => handleEditClick(e, app)}
                          className="px-1.5 py-0.5 rounded bg-zinc-900/90 border border-zinc-800 text-[9px] font-semibold text-zinc-300 truncate flex items-center gap-1 hover:border-red-500"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: app.staff.color || "#dc2626" }}
                          />
                          <span className="font-bold text-white">{app.startTime}</span>
                          <span className="truncate">{app.customer.name}</span>
                        </div>
                      ))}

                      {dayApps.length > 2 && (
                        <div className="text-[9px] font-bold text-zinc-500 pl-1">
                          +{dayApps.length - 2} randevu daha
                        </div>
                      )}
                    </div>

                    {/* Alt Satır: Ciro */}
                    <div className="text-[10px] font-bold text-emerald-400/90 text-right">
                      {dayRevenue > 0 ? `${formatPrice(dayRevenue)}` : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Appointment Create/Edit Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchAppointments}
        initialDate={modalInitialDate}
        initialStaffId={modalInitialStaffId}
        initialTime={modalInitialTime}
        editAppointment={editingAppointment}
      />
    </AdminLayout>
  );
}
