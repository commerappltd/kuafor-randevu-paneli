"use client";

import { useState } from "react";
import { Clock, Scissors, UserCheck, Phone, CheckCircle, XCircle, MoreVertical, Edit2, Check } from "lucide-react";
import { formatPrice, APPOINTMENT_STATUS } from "@/lib/utils";
import { Appointment } from "@/types";

interface TodayAppointmentsListProps {
  appointments: Appointment[];
  onStatusChange: (id: string, newStatus: string) => Promise<void>;
  onEdit: (appointment: Appointment) => void;
}

export default function TodayAppointmentsList({
  appointments,
  onStatusChange,
  onEdit,
}: TodayAppointmentsListProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleAction = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await onStatusChange(id, status);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Bugünün Randevu Akışı</h3>
          <p className="text-xs text-slate-500 mt-0.5">Bugün salonda gerçekleşecek tüm seanslar</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          Toplam {appointments.length} Randevu
        </span>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">Bugün için henüz randevu bulunmuyor.</p>
          <p className="text-xs text-slate-400 mt-0.5">Yeni bir randevu ekleyerek takvimi doldurabilirsiniz.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {appointments.map((app) => {
            const statusConfig = APPOINTMENT_STATUS[app.status] || APPOINTMENT_STATUS.PENDING;
            const isUpdating = updatingId === app.id;

            return (
              <div
                key={app.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Sol: Saat & Müşteri & Hizmet */}
                <div className="flex items-start gap-4">
                  {/* Saat Rozeti */}
                  <div className="bg-slate-100 px-3 py-2 rounded-xl text-center shrink-0 min-w-[70px] border border-slate-200/60">
                    <span className="block text-xs font-bold text-slate-900">{app.startTime}</span>
                    <span className="block text-[10px] text-slate-500 font-medium">{app.endTime}</span>
                  </div>

                  {/* Detaylar */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{app.customer.name}</h4>
                      <a
                        href={`tel:${app.customer.phone}`}
                        className="text-[11px] text-slate-500 hover:text-amber-600 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60 transition-colors"
                      >
                        <Phone className="w-3 h-3 text-slate-400" />
                        {app.customer.phone}
                      </a>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Scissors className="w-3.5 h-3.5 text-amber-600" />
                        {app.service.name}
                      </span>
                      <span>•</span>
                      <span
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md font-medium text-xs text-white"
                        style={{ backgroundColor: app.staff.color || "#4f46e5" }}
                      >
                        <UserCheck className="w-3 h-3" />
                        {app.staff.name}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-slate-900">{formatPrice(app.totalPrice)}</span>
                    </div>

                    {app.notes && (
                      <p className="text-xs text-slate-400 italic mt-1 bg-amber-50/50 px-2 py-0.5 rounded inline-block">
                        Not: {app.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sağ: Durum & Hızlı Aksiyonlar */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${statusConfig.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                    {statusConfig.label}
                  </span>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                    {app.status === "PENDING" && (
                      <button
                        onClick={() => handleAction(app.id, "CONFIRMED")}
                        disabled={isUpdating}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium flex items-center gap-1"
                        title="Onayla"
                      >
                        <Check className="w-4 h-4" />
                        <span className="hidden sm:inline">Onayla</span>
                      </button>
                    )}

                    {app.status === "CONFIRMED" && (
                      <button
                        onClick={() => handleAction(app.id, "COMPLETED")}
                        disabled={isUpdating}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors text-xs font-medium flex items-center gap-1"
                        title="Tamamlandı Olarak İşaretle"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Tamamla</span>
                      </button>
                    )}

                    {app.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleAction(app.id, "CANCELLED")}
                        disabled={isUpdating}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="İptal Et"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onEdit(app)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
