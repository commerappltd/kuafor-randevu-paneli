"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, addDays } from "date-fns";
import { tr } from "date-fns/locale";
import { formatPrice, formatDateTR } from "@/lib/utils";
import { Service, Staff } from "@/types";
import {
  Scissors,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Phone,
  User,
  Mail,
  ShieldCheck,
  Check,
  Building,
} from "lucide-react";

export default function RandevuAlPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Data
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection states
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null); // null = "Fark etmez"
  const [selectedDateStr, setSelectedDateStr] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean; availableStaffIds: string[] }[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Contact info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);

  // Fetch initial services and staff
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [servicesRes, staffRes] = await Promise.all([
          fetch("/api/services?activeOnly=true"),
          fetch("/api/staff?activeOnly=true"),
        ]);

        if (servicesRes.ok && staffRes.ok) {
          setServices(await servicesRes.json());
          setStaffList(await staffRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch available slots when service, staff, or date changes
  useEffect(() => {
    if (!selectedService || !selectedDateStr) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const staffParam = selectedStaff ? selectedStaff.id : "ANY";
        const res = await fetch(
          `/api/availability?date=${selectedDateStr}&serviceId=${selectedService.id}&staffId=${staffParam}`
        );
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data.slots || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedService, selectedStaff, selectedDateStr]);

  const categories = ["ALL", ...Array.from(new Set(services.map((s) => s.category)))];
  const filteredServices =
    selectedCategory === "ALL"
      ? services
      : services.filter((s) => s.category === selectedCategory);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    try {
      if (!selectedService || !selectedTime || !customerName || !customerPhone) {
        throw new Error("Lütfen tüm zorunlu alanları doldurunuz.");
      }

      // Personel belirlenmediyse o saatte müsait ilk personeli seç
      let targetStaffId = selectedStaff?.id;
      if (!targetStaffId) {
        const slot = availableSlots.find((s) => s.time === selectedTime);
        if (slot && slot.availableStaffIds.length > 0) {
          targetStaffId = slot.availableStaffIds[0];
        } else if (staffList.length > 0) {
          targetStaffId = staffList[0].id;
        }
      }

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          staffId: targetStaffId,
          dateStr: selectedDateStr,
          startTime: selectedTime,
          customerName,
          customerPhone,
          customerEmail,
          notes,
          status: "PENDING", // Müşteri aldığında ilk durum Beklemede veya Onaylı
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Randevu oluşturulamadı.");
      }

      setCreatedAppointment(data);
      setStep(5); // Başarı adımı
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                Makas & Stil Salon <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h1>
              <p className="text-xs text-slate-400">Online Randevu Portalı</p>
            </div>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60"
          >
            <Building className="w-3.5 h-3.5" />
            Salon Paneli
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 flex flex-col">
        {/* Progress Stepper (Hidden on Success Step 5) */}
        {step < 5 && (
          <div className="mb-8">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { s: 1, label: "Hizmet Seçimi", icon: Scissors },
                { s: 2, label: "Uzman Seçimi", icon: UserCheck },
                { s: 3, label: "Tarih & Saat", icon: Calendar },
                { s: 4, label: "Bilgiler & Onay", icon: ShieldCheck },
              ].map((item) => {
                const Icon = item.icon;
                const isPassed = step > item.s;
                const isCurrent = step === item.s;

                return (
                  <div
                    key={item.s}
                    onClick={() => isPassed && setStep(item.s as any)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isPassed ? "cursor-pointer" : ""
                    } ${
                      isCurrent
                        ? "bg-amber-500/10 border-amber-500 text-amber-400 font-bold"
                        : isPassed
                        ? "bg-slate-900 border-slate-700 text-slate-300"
                        : "bg-slate-900/40 border-slate-800 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {isPassed ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">{item.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step Content Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex-1 flex flex-col justify-between">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <>
              {/* ----------------- ADIM 1: HİZMET SEÇİMİ ----------------- */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Hangi Hizmeti Almak İstersiniz?</h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      İstediğiniz işlemi seçerek randevu adımlarına başlayın.
                    </p>
                  </div>

                  {/* Kategori Filtresi */}
                  <div className="flex flex-wrap items-center gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          selectedCategory === cat
                            ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                            : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                        }`}
                      >
                        {cat === "ALL" ? "Tümü" : cat}
                      </button>
                    ))}
                  </div>

                  {/* Hizmet Listesi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredServices.map((service) => {
                      const isSelected = selectedService?.id === service.id;
                      return (
                        <div
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30"
                              : "bg-slate-800/60 border-slate-700/70 hover:border-slate-600 hover:bg-slate-800"
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-base text-white">{service.name}</h3>
                              <span className="font-bold text-amber-400 text-sm whitespace-nowrap">
                                {formatPrice(service.price)}
                              </span>
                            </div>

                            {service.description && (
                              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                                {service.description}
                              </p>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              {service.durationMinutes} Dakika
                            </span>
                            <span
                              className={`font-semibold ${
                                isSelected ? "text-amber-400" : "text-slate-400"
                              }`}
                            >
                              {isSelected ? "✓ Seçildi" : "Seç"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Devam Butonu */}
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => selectedService && setStep(2)}
                      disabled={!selectedService}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
                    >
                      Uzman Seçimine Geç
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ----------------- ADIM 2: UZMAN SEÇİMİ ----------------- */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Kuaför / Uzman Tercihi</h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Hizmet almak istediğiniz stilisti seçin veya en erken müsait uzmanı tercih edin.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Fark etmez seçeneği */}
                    <div
                      onClick={() => setSelectedStaff(null)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                        selectedStaff === null
                          ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30"
                          : "bg-slate-800/60 border-slate-700/70 hover:border-slate-600 hover:bg-slate-800"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-bold">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">Fark Etmez (İlk Müsait Uzman)</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Tarih ve saatinize en uygun ilk boş stilist atanır.
                        </p>
                      </div>
                    </div>

                    {/* Personel Listesi */}
                    {staffList.map((staff) => {
                      const isSelected = selectedStaff?.id === staff.id;
                      return (
                        <div
                          key={staff.id}
                          onClick={() => setSelectedStaff(staff)}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                            isSelected
                              ? "bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30"
                              : "bg-slate-800/60 border-slate-700/70 hover:border-slate-600 hover:bg-slate-800"
                          }`}
                        >
                          <div
                            className="w-12 h-12 rounded-2xl text-white font-bold text-lg flex items-center justify-center shadow-md shrink-0"
                            style={{ backgroundColor: staff.color }}
                          >
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-white">{staff.name}</h3>
                            <p className="text-xs text-slate-400">{staff.title}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Butonlar */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2.5 text-xs font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Geri
                    </button>

                    <button
                      onClick={() => setStep(3)}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
                    >
                      Tarih ve Saat Seçimine Geç
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ----------------- ADIM 3: TARİH & SAAT SEÇİMİ ----------------- */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Randevu Tarihi ve Saati</h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Salonun müsait saat dilimlerinden size uygun olanı seçiniz.
                    </p>
                  </div>

                  {/* Hızlı Gün Seçimi */}
                  <div className="flex flex-wrap items-center gap-2">
                    {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                      const d = addDays(new Date(), dayOffset);
                      const dStr = format(d, "yyyy-MM-dd");
                      const isSelected = selectedDateStr === dStr;

                      return (
                        <button
                          key={dStr}
                          onClick={() => {
                            setSelectedDateStr(dStr);
                            setSelectedTime("");
                          }}
                          className={`px-4 py-2.5 rounded-xl text-center transition-all ${
                            isSelected
                              ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          <span className="block text-[10px] uppercase font-semibold">
                            {format(d, "EEE", { locale: tr })}
                          </span>
                          <span className="block text-sm font-bold mt-0.5">
                            {format(d, "d MMM", { locale: tr })}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Müsait Saat Slotları */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-500" />
                        Müsait Saat Dilimleri ({formatDateTR(selectedDateStr, "d MMMM yyyy")})
                      </label>
                      <span className="text-[11px] text-slate-500">
                        {selectedService?.durationMinutes} dakikalık işlem süresi
                      </span>
                    </div>

                    {loadingSlots ? (
                      <div className="py-12 text-center text-slate-400 text-sm">
                        Müsait saatler kontrol ediliyor...
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="py-12 text-center text-rose-400 text-sm bg-rose-500/10 rounded-2xl border border-rose-500/20">
                        Bu tarihte müsait randevu saati bulunamadı. Lütfen başka bir gün seçiniz.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                        {availableSlots.map((slot) => {
                          const isSelected = selectedTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                              className={`py-3 px-2 rounded-xl text-center font-bold text-xs transition-all ${
                                !slot.available
                                  ? "bg-slate-800/30 text-slate-600 border border-slate-800/40 line-through cursor-not-allowed"
                                  : isSelected
                                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-105"
                                  : "bg-slate-800 text-slate-200 border border-slate-700 hover:border-amber-500 hover:text-white"
                              }`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Butonlar */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2.5 text-xs font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Geri
                    </button>

                    <button
                      onClick={() => selectedTime && setStep(4)}
                      disabled={!selectedTime}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
                    >
                      İletişim Bilgilerine Geç
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ----------------- ADIM 4: MÜŞTERİ BİLGİLERİ & ONAY ----------------- */}
              {step === 4 && (
                <form onSubmit={handleSubmitBooking} className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">İletişim Bilgileri & Onay</h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Randevunuzu tamamlamak için iletişim bilgilerinizi giriniz.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  {/* Özet Kartı */}
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Seçilen Hizmet:</span>
                      <strong className="text-white">{selectedService?.name}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Kuaför / Uzman:</span>
                      <strong className="text-white">
                        {selectedStaff ? selectedStaff.name : "İlk Müsait Uzman"}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Tarih & Saat:</span>
                      <strong className="text-amber-400">
                        {formatDateTR(selectedDateStr, "d MMMM yyyy, EEEE")} - {selectedTime}
                      </strong>
                    </div>
                    <div className="pt-2 border-t border-slate-700 flex justify-between text-sm font-bold text-white">
                      <span>Toplam Tutar:</span>
                      <span className="text-emerald-400">
                        {selectedService ? formatPrice(selectedService.price) : ""}
                      </span>
                    </div>
                  </div>

                  {/* Form Girişleri */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-amber-500" />
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Örn: Mehmet Özkan"
                        className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-500" />
                        Telefon Numarası *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0532 123 45 67"
                        className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-amber-500" />
                        E-posta Adresi (İsteğe bağlı)
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="ornek@gmail.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Özel Not / İstekleriniz
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Kuaföre iletmek istediğiniz özel bir not veya istek..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Butonlar */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex items-center gap-2 text-slate-400 hover:text-white px-4 py-2.5 text-xs font-semibold"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Geri
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-amber-500/25 transition-all disabled:opacity-50"
                    >
                      {submitting ? "Randevu Oluşturuluyor..." : "Randevuyu Onayla ve Tamamla"}
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* ----------------- ADIM 5: BAŞARI EKRANI ----------------- */}
              {step === 5 && (
                <div className="py-8 text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-white">Randevunuz Başarıyla Oluşturuldu!</h2>
                    <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                      Sayın <strong className="text-white">{customerName}</strong>, randevu talebiniz salona iletilmiştir.
                    </p>
                  </div>

                  {/* Randevu Özeti */}
                  <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-800/80 border border-slate-700 text-left space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">İşlem:</span>
                      <span className="font-bold text-white">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tarih:</span>
                      <span className="font-bold text-white">{formatDateTR(selectedDateStr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Saat:</span>
                      <span className="font-bold text-amber-400">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kuaför / Uzman:</span>
                      <span className="font-bold text-white">
                        {createdAppointment?.staff?.name || selectedStaff?.name || "Atanan Uzman"}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-700 flex justify-between text-sm font-bold">
                      <span className="text-white">Ücret:</span>
                      <span className="text-emerald-400">
                        {selectedService ? formatPrice(selectedService.price) : ""}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setStep(1);
                        setSelectedService(null);
                        setSelectedStaff(null);
                        setSelectedTime("");
                        setCustomerName("");
                        setCustomerPhone("");
                        setCustomerEmail("");
                        setNotes("");
                      }}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
                    >
                      Yeni Bir Randevu Al
                    </button>

                    <Link
                      href="/"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
                    >
                      Yönetim Paneline Git
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Makas & Stil Kuaför & Güzellik Salonu. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
