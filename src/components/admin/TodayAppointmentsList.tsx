"use client";

import { useState } from "react";
import {
  Clock,
  User,
  Scissors,
  CheckCircle,
  XCircle,
  MessageSquare,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import WhatsAppModal from "./WhatsAppModal";

interface Appointment {
  id: string;
  customerId: string;
  customer: {
    name: string;
    phone: string;
  };
  staffId: string;
  staff: {
    name: string;
    color: string;
  };
  serviceId: string;
  service: {
    name: string;
    durationMinutes: number;
    price: number;
  };
  dateStr: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  totalPrice: number;
  notes?: string;
}

interface TodayAppointmentsListProps {
  appointments: Appointment[];
  onStatusChange: (id: string, newStatus: string) => void;
  onSelectAppointment: (appointment: Appointment) => void;
}

export default function TodayAppointmentsList({
  appointments,
  onStatusChange,
  onSelectAppointment,
}: TodayAppointmentsListProps) {
  const [whatsAppModalAppointment, setWhatsAppModalAppointment] = useState<Appointment | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            Onaylandı
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Tamamlandı
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            İptal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
            Onay Bekliyor
          </span>
        );
    }
  };

  return (
    <div className="bg-[#12131a] rounded-2xl border border-zinc-800/90 shadow-lg overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-base">Günün Randevu Akışı</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Bugüne ait saatlik randevular ve müşteri aksiyonları</p>
        </div>
        <span className="bg-red-950/40 text-red-400 border border-red-800/40 text-xs font-bold px-3 py-1 rounded-full">
          {appointments.length} Seans
        </span>
      </div>

      <div className="divide-y divide-zinc-800/80">
        {appointments.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            <Clock className="w-10 h-10 mx-auto text-zinc-600 mb-2 opacity-50" />
            <p className="text-sm font-semibold text-zinc-300">Bugün için kayıtlı randevu bulunmuyor.</p>
            <p className="text-xs text-zinc-500 mt-1">Yeni bir randevu eklemek için sağ üstteki butonu kullanın.</p>
          </div>
        ) : (
          appointments.map((app) => (
            <div
              key={app.id}
              className="p-4 sm:p-5 hover:bg-zinc-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              {/* Saat & Personel & Müşteri */}
              <div
                className="flex items-start sm:items-center gap-3.5 cursor-pointer flex-1"
                onClick={() => onSelectAppointment(app)}
              >
                {/* Saat Kutusu */}
                <div className="bg-[#0c0d14] border border-zinc-700/80 rounded-xl px-3 py-2 text-center shrink-0 min-w-[70px]">
                  <div className="text-sm font-extrabold text-red-500">{app.startTime}</div>
                  <div className="text-[10px] text-zinc-400 font-medium">{app.endTime}</div>
                </div>

                {/* Personel Renk Çubuğu & Bilgiler */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-1.5 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: app.staff.color || "#dc2626" }}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white truncate">
                        {app.customer.name}
                      </span>
                      {getStatusBadge(app.status)}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-zinc-300">
                        <Scissors className="w-3.5 h-3.5 text-red-500" />
                        {app.service.name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                        {app.staff.name}
                      </span>
                      <span>•</span>
                      <span className="font-extrabold text-red-400">
                        {formatPrice(app.totalPrice)}
                      </span>
                    </div>

                    {app.notes && (
                      <p className="text-[11px] text-zinc-400 mt-1 italic line-clamp-1">
                        Not: {app.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {/* WhatsApp Butonu */}
                <button
                  onClick={() => setWhatsAppModalAppointment(app)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-800/40 text-xs font-semibold transition-colors"
                  title="Müşteriye WhatsApp ile Hatırlat"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden md:inline">WhatsApp</span>
                </button>

                {/* Hızlı Durum Butonları */}
                {app.status === "PENDING" && (
                  <button
                    onClick={() => onStatusChange(app.id, "CONFIRMED")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 text-blue-400 border border-blue-800/40 text-xs font-semibold transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Onayla
                  </button>
                )}

                {app.status === "CONFIRMED" && (
                  <button
                    onClick={() => onStatusChange(app.id, "COMPLETED")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-800/40 text-xs font-semibold transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Tamamla
                  </button>
                )}

                {app.status !== "CANCELLED" && app.status !== "COMPLETED" && (
                  <button
                    onClick={() => onStatusChange(app.id, "CANCELLED")}
                    className="p-1.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="İptal Et"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => onSelectAppointment(app)}
                  className="p-1.5 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Detay & Düzenle"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* WhatsApp Modal */}
      {whatsAppModalAppointment && (
        <WhatsAppModal
          appointment={whatsAppModalAppointment as any}
          onClose={() => setWhatsAppModalAppointment(null)}
        />
      )}
    </div>
  );
}
