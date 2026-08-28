"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Header from "@/components/admin/Header";
import AppointmentModal from "@/components/admin/AppointmentModal";
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { formatDateTR, formatPrice, APPOINTMENT_STATUS, timeToMinutes } from "@/lib/utils";
import { Appointment, Staff } from "@/types";
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
  "18:00", "18:30", "19:00", "19:30"
];

export default function TakvimPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"staff_day" | "weekly">("staff_day");
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("ALL");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<string>("");
  const [modalInitialStaffId, setModalInitialStaffId] = useState<string>("");
  const [modalInitialTime, setModalInitialTime] = useState<string>("");
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

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      let url = "";
      if (viewMode === "staff_day") {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        url = `/api/appointments?date=${dateStr}&staffId=${selectedStaffId}`;
      } else {
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        const startStr = format(weekStart, "yyyy-MM-dd");
        const endStr = format(weekEnd, "yyyy-MM-dd");
        url = `/api/appointments?startDate=${startStr}&endDate=${endStr}&staffId=${selectedStaffId}`;
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
  }, [selectedDate, viewMode, selectedStaffId]);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handlePrev = () => {
    if (viewMode === "staff_day") {
      setSelectedDate((prev) => subDays(prev, 1));
    } else {
      setSelectedDate((prev) => subDays(prev, 7));
    }
  };

  const handleNext = () => {
    if (viewMode === "staff_day") {
      setSelectedDate((prev) => addDays(prev, 1));
    } else {
      setSelectedDate((prev) => addDays(prev, 7));
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

  // Hafta günleri
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

      <main className="p-8 space-y-6 flex-1 flex flex-col">
        {/* Calendar Controls Top Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Sol: Tarih Navigasyonu */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                title="Önceki"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Bugün
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                title="Sonraki"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 font-bold text-base text-slate-900">
              <CalendarIcon className="w-5 h-5 text-amber-600" />
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
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Uzman:</span>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setViewMode("staff_day")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "staff_day"
                    ? "bg-white text-slate-900 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Günlük / Personel
              </button>
              <button
                onClick={() => setViewMode("weekly")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  viewMode === "weekly"
                    ? "bg-white text-slate-900 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Haftalık Görünüm
              </button>
            </div>
          </div>
        </div>

        {/* 1. GÖRÜNÜM: Günlük Personel Bazlı Timeline */}
        {viewMode === "staff_day" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Personel Başlıkları */}
                <div className="grid grid-cols-[80px_repeat(auto-fit,minmax(200px,1fr))] border-b border-slate-200 bg-slate-50">
                  <div className="p-3.5 text-center text-xs font-bold text-slate-500 border-r border-slate-200 flex items-center justify-center">
                    Saat
                  </div>
                  {activeStaffToDisplay.map((staff) => (
                    <div
                      key={staff.id}
                      className="p-3.5 border-r border-slate-200 last:border-r-0 flex items-center gap-2.5"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: staff.color }}
                      ></span>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{staff.name}</h4>
                        <p className="text-[10px] text-slate-500">{staff.title}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Saat Satırları */}
                <div className="divide-y divide-slate-100">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="grid grid-cols-[80px_repeat(auto-fit,minmax(200px,1fr))] min-h-[64px]"
                    >
                      {/* Saat Etiketi */}
                      <div className="p-2 text-center text-xs font-semibold text-slate-400 border-r border-slate-100 bg-slate-50/50 flex items-center justify-center">
                        {hour}
                      </div>

                      {/* Her Personel İçin Hücre */}
                      {activeStaffToDisplay.map((staff) => {
                        // Bu saat diliminde başlayan veya süren randevuyu bul
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
                            className={`p-1.5 border-r border-slate-100 last:border-r-0 relative group transition-colors ${
                              matchingApp
                                ? "bg-slate-50/40"
                                : "hover:bg-amber-50/40 cursor-pointer"
                            }`}
                          >
                            {/* Boş hücrede hover olunca "+" butonu */}
                            {!matchingApp && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center text-amber-600 text-xs font-semibold gap-1">
                                <Plus className="w-3.5 h-3.5" />
                                <span>Randevu Ekle</span>
                              </div>
                            )}

                            {/* Randevu Kartı (Sadece başlangıç saatinde render et) */}
                            {matchingApp && isStartHour && (
                              <div
                                onClick={(e) => handleEditClick(e, matchingApp)}
                                className="h-full w-full rounded-xl p-2.5 shadow-xs border text-xs cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md flex flex-col justify-between bg-white"
                                style={{
                                  borderLeftColor: staff.color || "#4f46e5",
                                  borderLeftWidth: "4px",
                                }}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-slate-900 truncate">
                                      {matchingApp.customer.name}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                        APPOINTMENT_STATUS[matchingApp.status]?.bg
                                      }`}
                                    >
                                      {APPOINTMENT_STATUS[matchingApp.status]?.label}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-1 truncate">
                                    <Scissors className="w-3 h-3 text-amber-600 shrink-0" />
                                    <span>{matchingApp.service.name}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-slate-100">
                                  <span className="font-semibold text-slate-700">
                                    {matchingApp.startTime} - {matchingApp.endTime}
                                  </span>
                                  <span className="font-bold text-slate-900">
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
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex-1">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center">
              {weekDays.map((day) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={day.toString()}
                    className={`p-3 border-r border-slate-200 last:border-r-0 ${
                      isToday ? "bg-amber-50/60" : ""
                    }`}
                  >
                    <span className="block text-[11px] font-semibold text-slate-500 uppercase">
                      {format(day, "EEEE", { locale: tr })}
                    </span>
                    <span
                      className={`inline-block mt-0.5 text-sm font-bold w-7 h-7 leading-7 rounded-full ${
                        isToday ? "bg-amber-500 text-slate-950" : "text-slate-900"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Hafta Günlerinin Randevu Kolonları */}
            <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[500px]">
              {weekDays.map((day) => {
                const dayStr = format(day, "yyyy-MM-dd");
                const dayApps = appointments.filter((a) => a.dateStr === dayStr);

                return (
                  <div
                    key={dayStr}
                    className="p-2 space-y-2 bg-slate-50/20 hover:bg-slate-50/60 transition-colors"
                  >
                    {dayApps.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-3">
                        <button
                          onClick={() => handleCellClick(dayStr, staffList[0]?.id || "", "10:00")}
                          className="text-[11px] font-medium text-slate-400 hover:text-amber-600 p-2 rounded-lg border border-dashed border-slate-200 hover:border-amber-400 transition-all w-full"
                        >
                          + Randevu Ekle
                        </button>
                      </div>
                    ) : (
                      dayApps.map((app) => (
                        <div
                          key={app.id}
                          onClick={(e) => handleEditClick(e, app)}
                          className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer text-xs"
                          style={{
                            borderLeftColor: app.staff.color || "#4f46e5",
                            borderLeftWidth: "4px",
                          }}
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span className="truncate">{app.customer.name}</span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {app.startTime}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-1 truncate">
                            {app.service.name}
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px]">
                            <span className="text-slate-500">{app.staff.name.split(" ")[0]}</span>
                            <span className="font-bold text-slate-900">
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
