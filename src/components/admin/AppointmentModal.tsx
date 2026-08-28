"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, Scissors, UserCheck, User, Phone, AlertCircle, Check } from "lucide-react";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";
import { Appointment, Service, Staff, Customer } from "@/types";

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
  initialStaffId?: string;
  initialTime?: string;
  editAppointment?: Appointment | null;
}

export default function AppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
  initialStaffId,
  initialTime,
  editAppointment,
}: AppointmentModalProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form States
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [dateStr, setDateStr] = useState(initialDate || format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState(initialTime || "10:00");
  const [status, setStatus] = useState<string>("CONFIRMED");
  const [notes, setNotes] = useState("");

  // Load initial dropdown data
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [servicesRes, staffRes, customersRes] = await Promise.all([
          fetch("/api/services?activeOnly=true"),
          fetch("/api/staff?activeOnly=true"),
          fetch("/api/customers"),
        ]);

        const [servicesData, staffData, customersData] = await Promise.all([
          servicesRes.json(),
          staffRes.json(),
          customersRes.json(),
        ]);

        setServices(servicesData);
        setStaffList(staffData);
        setCustomers(customersData);

        // Edit appointment setup
        if (editAppointment) {
          setSelectedCustomerId(editAppointment.customerId);
          setSelectedServiceId(editAppointment.serviceId);
          setSelectedStaffId(editAppointment.staffId);
          setDateStr(editAppointment.dateStr);
          setStartTime(editAppointment.startTime);
          setStatus(editAppointment.status);
          setNotes(editAppointment.notes || "");
          setIsNewCustomer(false);
        } else {
          // Default selections for new
          if (servicesData.length > 0) setSelectedServiceId(servicesData[0].id);
          if (staffData.length > 0) setSelectedStaffId(initialStaffId || staffData[0].id);
          if (initialDate) setDateStr(initialDate);
          if (initialTime) setStartTime(initialTime);
          if (customersData.length > 0) {
            setSelectedCustomerId(customersData[0].id);
          } else {
            setIsNewCustomer(true);
          }
          setStatus("CONFIRMED");
          setNotes("");
        }
      } catch (err) {
        console.error("Modal data fetch error:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [isOpen, editAppointment, initialDate, initialStaffId, initialTime]);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      if (editAppointment) {
        // Edit mode (PATCH)
        const res = await fetch(`/api/appointments/${editAppointment.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceId: selectedServiceId,
            staffId: selectedStaffId,
            dateStr,
            startTime,
            status,
            notes,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Randevu güncellenemedi.");
        }
      } else {
        // Create mode (POST)
        const payload: any = {
          serviceId: selectedServiceId,
          staffId: selectedStaffId,
          dateStr,
          startTime,
          status,
          notes,
        };

        if (isNewCustomer) {
          payload.customerName = customerName;
          payload.customerPhone = customerPhone;
          payload.customerEmail = customerEmail;
        } else {
          payload.customerId = selectedCustomerId;
        }

        const res = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Randevu oluşturulamadı.");
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-[#0c0d14] text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {editAppointment ? "Randevuyu Düzenle" : "Yeni Randevu Oluştur"}
              </h3>
              <p className="text-xs text-zinc-400">
                {editAppointment ? `${editAppointment.customer.name} için randevu` : "Müşteri ve saat bilgilerini giriniz"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customer Selection / New Customer */}
          {!editAppointment && (
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-600" />
                  Müşteri Bilgisi
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewCustomer(!isNewCustomer)}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline"
                >
                  {isNewCustomer ? "Kayıtlı Müşterilerden Seç" : "+ Yeni Müşteri Ekle"}
                </button>
              </div>

              {!isNewCustomer ? (
                <div>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Müşteri Adı Soyadı *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required={isNewCustomer}
                  />
                  <input
                    type="tel"
                    placeholder="Telefon Numarası * (örn. 0532 123 45 67)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required={isNewCustomer}
                  />
                  <input
                    type="email"
                    placeholder="E-posta Adresi (İsteğe bağlı)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Service & Staff Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Service */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-amber-600" />
                Hizmet
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                required
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMinutes} dk - {formatPrice(s.price)})
                  </option>
                ))}
              </select>
              {selectedService && (
                <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>Süre: {selectedService.durationMinutes} dk</span>
                  <span className="font-semibold text-slate-800">{formatPrice(selectedService.price)}</span>
                </div>
              )}
            </div>

            {/* Staff */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                Kuaför / Uzman
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                required
              >
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.title})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                Randevu Tarihi
              </label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                required
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Başlangıç Saati
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Randevu Durumu
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: "PENDING", label: "Beklemede", color: "hover:border-amber-500 peer-checked:bg-amber-50 peer-checked:border-amber-500 peer-checked:text-amber-700" },
                { key: "CONFIRMED", label: "Onaylandı", color: "hover:border-blue-500 peer-checked:bg-blue-50 peer-checked:border-blue-500 peer-checked:text-blue-700" },
                { key: "COMPLETED", label: "Tamamlandı", color: "hover:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:border-emerald-500 peer-checked:text-emerald-700" },
                { key: "CANCELLED", label: "İptal", color: "hover:border-rose-500 peer-checked:bg-rose-50 peer-checked:border-rose-500 peer-checked:text-rose-700" },
              ].map((st) => (
                <label
                  key={st.key}
                  className="cursor-pointer text-center"
                >
                  <input
                    type="radio"
                    name="status"
                    value={st.key}
                    checked={status === st.key}
                    onChange={(e) => setStatus(e.target.value)}
                    className="sr-only peer"
                  />
                  <div className={`py-2 px-1 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 transition-all ${st.color}`}>
                    {st.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Not / Özel İstekler (Opsiyonel)
            </label>
            <textarea
              rows={2}
              placeholder="Örn: Yanlar 2 numara kesilsin, kahve ikramı..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submitting || loadingData}
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? "Kaydediliyor..." : editAppointment ? "Güncelle" : "Randevuyu Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
