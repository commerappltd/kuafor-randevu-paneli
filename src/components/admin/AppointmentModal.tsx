"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, Scissors, UserCheck, User, Phone, AlertCircle, Check } from "lucide-react";
import { format } from "date-fns";
import { formatPrice, formatPhoneNumber, isValidPhoneNumber } from "@/lib/utils";
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
      setErrorMsg(null);
      try {
        const [servicesRes, staffRes, customersRes] = await Promise.all([
          fetch("/api/services?activeOnly=true"),
          fetch("/api/staff?activeOnly=true"),
          fetch("/api/customers"),
        ]);

        const servicesData = servicesRes.ok ? await servicesRes.json() : [];
        const staffData = staffRes.ok ? await staffRes.json() : [];
        const customersData = customersRes.ok ? await customersRes.json() : [];

        const validServices = Array.isArray(servicesData) ? servicesData : [];
        const validStaff = Array.isArray(staffData) ? staffData : [];
        const validCustomers = Array.isArray(customersData) ? customersData : [];

        setServices(validServices);
        setStaffList(validStaff);
        setCustomers(validCustomers);

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
          if (validServices.length > 0) setSelectedServiceId(validServices[0].id);
          if (validStaff.length > 0) setSelectedStaffId(initialStaffId || validStaff[0].id);
          if (initialDate) setDateStr(initialDate);
          if (initialTime) setStartTime(initialTime);
          if (validCustomers.length > 0) {
            setSelectedCustomerId(validCustomers[0].id);
            setIsNewCustomer(false);
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

  const selectedService = (services || []).find((s) => s.id === selectedServiceId);

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
          if (!customerName.trim() || !customerPhone.trim()) {
            throw new Error("Lütfen müşteri adı ve telefon numarasını giriniz.");
          }
          if (!isValidPhoneNumber(customerPhone)) {
            throw new Error("Lütfen geçerli ve 13 haneli (+90 5XX XXX XX XX) telefon numarasını eksiksiz giriniz.");
          }
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
      <div className="bg-[#12131a] rounded-2xl max-w-lg w-full shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-[#0c0d14] text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {editAppointment ? "Randevuyu Düzenle" : "Yeni Randevu Oluştur"}
              </h3>
              <p className="text-xs text-zinc-400">
                {editAppointment ? `${editAppointment.customer?.name} için randevu` : "Müşteri ve randevu detaylarını giriniz"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 overflow-y-auto flex-1 text-zinc-200">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Customer Selection Section */}
          {!editAppointment && (
            <div className="space-y-3 bg-[#0c0d14] p-4 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-red-500" />
                  Müşteri Bilgisi
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewCustomer(!isNewCustomer)}
                  className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline"
                >
                  {isNewCustomer ? "Kayıtlı Müşterilerden Seç" : "+ Yeni Müşteri Ekle"}
                </button>
              </div>

              {!isNewCustomer && customers.length > 0 ? (
                <div>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#12131a] text-white text-xs font-medium focus:outline-none focus:border-red-600"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#12131a] text-white text-xs font-medium placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                    required={isNewCustomer}
                  />
                  <input
                    type="tel"
                    placeholder="Telefon Numarası * (+90 5XX XXX XX XX)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(formatPhoneNumber(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#12131a] text-white text-xs font-medium placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                    required={isNewCustomer}
                  />
                  <input
                    type="email"
                    placeholder="E-posta Adresi (İsteğe bağlı)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#12131a] text-white text-xs font-medium placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                  />
                </div>
              )}
            </div>
          )}

          {/* Service & Staff Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Service */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-red-500" />
                Hizmet
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium focus:outline-none focus:border-red-600"
                required
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {formatPrice(s.price)} ({s.durationMinutes} dk)
                  </option>
                ))}
              </select>
            </div>

            {/* Staff */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-red-500" />
                Kuaför / Uzman
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium focus:outline-none focus:border-red-600"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-500" />
                Tarih
              </label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium focus:outline-none focus:border-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                Saat
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium focus:outline-none focus:border-red-600"
                required
              />
            </div>
          </div>

          {/* Price & Duration Info Badge */}
          {selectedService && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-xs">
              <span className="text-zinc-300">
                Tahmini Süre: <strong className="text-white">{selectedService.durationMinutes} dakika</strong>
              </span>
              <span className="font-extrabold text-red-400 text-sm">
                Tutar: {formatPrice(selectedService.price)}
              </span>
            </div>
          )}

          {/* Status (Only for edit or custom) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Randevu Durumu
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "CONFIRMED", label: "Onaylandı", color: "text-blue-400 border-blue-500/40" },
                { id: "COMPLETED", label: "Tamamlandı", color: "text-emerald-400 border-emerald-500/40" },
                { id: "CANCELLED", label: "İptal", color: "text-red-400 border-red-500/40" },
              ].map((s) => (
                <label
                  key={s.id}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                    status === s.id
                      ? `bg-red-950/40 border-red-600 text-white shadow-sm`
                      : "bg-[#0c0d14] border-zinc-800 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s.id}
                    checked={status === s.id}
                    onChange={(e) => setStatus(e.target.value)}
                    className="sr-only"
                  />
                  <span>{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Not / Özel İstekler (Opsiyonel)
            </label>
            <textarea
              rows={2}
              placeholder="Örn: Yanlar 2 numara kesilsin, kahve ikramı..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium placeholder:text-zinc-600 focus:outline-none focus:border-red-600 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 text-xs font-bold hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submitting || loadingData}
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? "Kaydediliyor..." : editAppointment ? "Güncelle" : "Randevuyu Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
