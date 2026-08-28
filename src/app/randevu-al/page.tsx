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
  Flame,
  Star,
} from "lucide-react";

const DEFAULT_SERVICES: Service[] = [
  {
    id: "srv-sac-kesim",
    name: "Klasik Saç Kesimi & Yıkama",
    category: "Saç Kesimi",
    durationMinutes: 35,
    price: 450,
    description: "Kişiye özel saç kesimi, argan yağlı yıkama, ferahlatıcı saç masajı ve wax/fön şekillendirme.",
    active: true,
  },
  {
    id: "srv-sakal-tirasi",
    name: "Sakal Tıraşı & Sakal Tasarımı",
    category: "Sakal & Bakım",
    durationMinutes: 25,
    price: 250,
    description: "Geleneksel ustura veya makine ile sakal şekillendirme, sıcak buhar havlusu ve sakal bakım yağı.",
    active: true,
  },
  {
    id: "srv-sac-sakal-kombin",
    name: "Saç + Sakal Kombin Bakım Paketi",
    category: "Kombin Paket",
    durationMinutes: 50,
    price: 600,
    description: "En çok tercih edilen! Detaylı saç kesimi, sakal dizaynı, saç yıkama, sıcak havlu kompresi ve tonik.",
    active: true,
  },
  {
    id: "srv-vip-full-bakim",
    name: "VIP Saç & Sakal + Cilt Maskesi (Full Bakım)",
    category: "Kombin Paket",
    durationMinutes: 65,
    price: 850,
    description: "Komple saç-sakal kesimi, gözenek açıcı buhar, siyah nokta/kil maskesi ve ferahlatıcı ense masajı.",
    active: true,
  },
  {
    id: "srv-damat-vip",
    name: "Damat & Özel Gün VIP Bakım Paketi",
    category: "Özel Paket",
    durationMinutes: 90,
    price: 1500,
    description: "Özel gün seansı: Saç kesimi, sakal tasarımı, medikal cilt bakımı, saç botoksu, el bakımı ve styling.",
    active: true,
  },
  {
    id: "srv-sac-boyama",
    name: "Saç Boyama & Beyaz Kapatma",
    category: "Renklendirme",
    durationMinutes: 45,
    price: 750,
    description: "Doğal tonlarda saç veya sakal renk kırıcı/beyaz kapatıcı profesyonel boya uygulaması.",
    active: true,
  },
  {
    id: "srv-keratin",
    name: "Keratin & Saç Botoksu (Düzleştirme)",
    category: "Özel Bakım & Spa",
    durationMinutes: 60,
    price: 950,
    description: "Yıpranmış saçlar için yoğun keratin yüklemesi, elektriklenme önleyici pürüzsüzleştirme.",
    active: true,
  },
  {
    id: "srv-fon",
    name: "Saç Yıkama & Profesyonel Fön",
    category: "Saç Kesimi",
    durationMinutes: 20,
    price: 200,
    description: "Canlandırıcı şampuan ve saç kremi uygulaması sonrası gün boyu kalıcı profesyonel fön.",
    active: true,
  },
  {
    id: "srv-agda-kas",
    name: "Yüz Ağdası & Kaş Dizaynı",
    category: "Sakal & Bakım",
    durationMinutes: 15,
    price: 150,
    description: "Kulak, burun ağdası, elmacık kemiği ağdası ve ip/cımbızla kaş toparlama işlemi.",
    active: true,
  },
];

const DEFAULT_STAFF: Staff[] = [
  {
    id: "st-ali-karayel",
    name: "Ali Karayel",
    title: "Kurucu & Master Stilist",
    phone: "+90 532 100 20 30",
    email: "ali@kuaforalikarayel.com",
    color: "#dc2626",
    startTime: "09:00",
    endTime: "20:00",
    active: true,
  },
  {
    id: "st-emre-yildiz",
    name: "Emre Yıldız",
    title: "Kıdemli Saç Tasarımcısı",
    phone: "+90 533 200 30 40",
    email: "emre@kuaforalikarayel.com",
    color: "#2563eb",
    startTime: "09:30",
    endTime: "19:30",
    active: true,
  },
  {
    id: "st-can-demir",
    name: "Can Demir",
    title: "Sakal & Cilt Bakım Uzmanı",
    phone: "+90 535 300 40 50",
    email: "can@kuaforalikarayel.com",
    color: "#059669",
    startTime: "10:00",
    endTime: "20:00",
    active: true,
  },
  {
    id: "st-burak-sahin",
    name: "Burak Şahin",
    title: "Renklendirme & Keratin Uzmanı",
    phone: "+90 536 400 50 60",
    email: "burak@kuaforalikarayel.com",
    color: "#d97706",
    startTime: "09:00",
    endTime: "18:30",
    active: true,
  },
];

export default function RandevuAlPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Data
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [staffList, setStaffList] = useState<Staff[]>(DEFAULT_STAFF);
  const [loading, setLoading] = useState(false);

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
      try {
        const savedUser = localStorage.getItem("kuafor_current_customer");
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed.name) setCustomerName(parsed.name);
          if (parsed.phone) setCustomerPhone(parsed.phone);
          if (parsed.email) setCustomerEmail(parsed.email);
        }
      } catch {}

      try {
        const [servicesRes, staffRes] = await Promise.all([
          fetch("/api/services?activeOnly=true"),
          fetch("/api/staff?activeOnly=true"),
        ]);

        if (servicesRes.ok) {
          const servData = await servicesRes.json();
          if (Array.isArray(servData) && servData.length > 0) {
            setServices(servData);
          }
        }

        if (staffRes.ok) {
          const staffData = await staffRes.json();
          if (Array.isArray(staffData) && staffData.length > 0) {
            setStaffList(staffData);
          }
        }
      } catch (err) {
        console.error("RandevuAl verisi alınamadı, varsayılanlar devrede:", err);
      }
    };
    init();
  }, []);

  // Fetch available slots when Service, Staff or Date changes
  useEffect(() => {
    if (!selectedService || !selectedDateStr) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedTime("");
      try {
        let url = `/api/availability?date=${selectedDateStr}&serviceId=${selectedService.id}`;
        if (selectedStaff) {
          url += `&staffId=${selectedStaff.id}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.slots) && data.slots.length > 0) {
            setAvailableSlots(data.slots);
            return;
          }
        }
        
        // Fallback default slots if API slots is empty
        const defaultHours = [
          "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
          "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
          "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
        ];
        setAvailableSlots(
          defaultHours.map((h) => ({
            time: h,
            available: true,
            availableStaffIds: staffList.map((s) => s.id),
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedService, selectedStaff, selectedDateStr, staffList]);

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
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Randevu kaydedilemedi.");
      }

      const appData = await res.json();
      setCreatedAppointment(appData);

      try {
        localStorage.setItem(
          "kuafor_current_customer",
          JSON.stringify({ name: customerName, phone: customerPhone, email: customerEmail })
        );
      } catch {}

      setStep(5); // Success step
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800/80 bg-[#0c0d14]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold shadow-md shadow-red-600/30">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-white tracking-tight flex items-center gap-1.5">
                Kuaför Ali Karayel <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              </h1>
              <p className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">Executive Booking Lounge</p>
            </div>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800"
          >
            <Building className="w-3.5 h-3.5" />
            Salon Paneli
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 py-6 sm:py-10 flex-1 flex flex-col">
        {/* Wizard Steps Navigation */}
        {step < 5 && (
          <div className="mb-8">
            <div className="grid grid-cols-4 gap-2">
              {[
                { s: 1, title: "Hizmet" },
                { s: 2, title: "Uzman" },
                { s: 3, title: "Tarih & Saat" },
                { s: 4, title: "Onay" },
              ].map((item) => (
                <div
                  key={item.s}
                  className={`flex flex-col items-center py-2.5 rounded-xl border transition-all text-center ${
                    step === item.s
                      ? "bg-red-950/40 border-red-600/80 text-red-400 font-bold shadow-md shadow-red-600/15"
                      : step > item.s
                      ? "bg-zinc-900/90 border-emerald-500/40 text-emerald-400 font-semibold"
                      : "bg-zinc-900/40 border-zinc-800 text-zinc-600"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider font-bold">
                    Adım {item.s}
                  </span>
                  <span className="text-xs sm:text-sm font-bold truncate px-1">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step Container Card */}
        <div className="bg-[#12131a] border border-zinc-800/90 rounded-2xl p-5 sm:p-8 shadow-2xl flex-1 flex flex-col justify-between">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <>
              {/* STEP 1: HİZMET SEÇİMİ */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      Hangi Hizmeti Almak İstersiniz?
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                      Özel saç kesimi, sakal tasarımı veya kombi VIP bakım paketlerimizden dilediğinizi seçin.
                    </p>
                  </div>

                  {/* Kategori Filtreleri */}
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedCategory === cat
                            ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                            : "bg-[#0c0d14] text-zinc-400 hover:text-white border border-zinc-800"
                        }`}
                      >
                        {cat === "ALL" ? "Tümü" : cat}
                      </button>
                    ))}
                  </div>

                  {/* Hizmet Kartları */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filteredServices.map((service) => {
                      const isSelected = selectedService?.id === service.id;
                      const isPopular = service.category === "Kombin Paket" || service.name.includes("Saç + Sakal");

                      return (
                        <div
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between relative ${
                            isSelected
                              ? "bg-red-950/30 border-red-600 shadow-xl shadow-red-600/25 scale-[1.01]"
                              : "bg-[#0c0d14] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60"
                          }`}
                        >
                          {isPopular && (
                            <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" /> Popüler
                            </span>
                          )}

                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300">
                                {service.category}
                              </span>
                              <span className="text-base sm:text-lg font-black text-red-400">
                                {formatPrice(service.price)}
                              </span>
                            </div>

                            <h3 className="font-bold text-white text-sm sm:text-base mt-2.5">
                              {service.name}
                            </h3>
                            {service.description && (
                              <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                                {service.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/80 text-xs text-zinc-400">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-3.5 h-3.5 text-red-500" />
                              {service.durationMinutes} dakika
                            </span>

                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                                isSelected
                                  ? "bg-red-600 border-red-600 text-white"
                                  : "border-zinc-700"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!selectedService}
                      className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-red-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Devam Et (Uzman Seçimi)
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: UZMAN SEÇİMİ */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      Kuaför / Stilist Tercihiniz
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                      İşleminizi yapmasını istediğiniz uzmanı seçebilir veya ilk müsait uzmanı tercih edebilirsiniz.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Fark etmez seçeneği */}
                    <div
                      onClick={() => setSelectedStaff(null)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedStaff === null
                          ? "bg-red-950/30 border-red-600 shadow-lg shadow-red-600/20"
                          : "bg-[#0c0d14] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-red-400 font-bold">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">Fark Etmez</h3>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Seçtiğiniz saatte en uygun uzman atanır
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          selectedStaff === null
                            ? "bg-red-600 border-red-600 text-white"
                            : "border-zinc-700"
                        }`}
                      >
                        {selectedStaff === null && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Personeller */}
                    {staffList.map((staff) => {
                      const isSelected = selectedStaff?.id === staff.id;
                      return (
                        <div
                          key={staff.id}
                          onClick={() => setSelectedStaff(staff)}
                          className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-red-950/30 border-red-600 shadow-lg shadow-red-600/20"
                              : "bg-[#0c0d14] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-md"
                              style={{ backgroundColor: staff.color || "#dc2626" }}
                            >
                              {staff.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-sm">{staff.name}</h3>
                              <p className="text-xs text-zinc-400 mt-0.5">{staff.title}</p>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                              isSelected
                                ? "bg-red-600 border-red-600 text-white"
                                : "border-zinc-700"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-6 flex items-center justify-between border-t border-zinc-800">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Geri Dön
                    </button>

                    <button
                      onClick={() => setStep(3)}
                      className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-red-600/30 transition-all"
                    >
                      Devam Et (Tarih & Saat)
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: TARİH & SAAT SEÇİMİ */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      Randevu Tarihi ve Saati
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                      Gelecek 7 gün içinden size en uygun zamanı belirleyin.
                    </p>
                  </div>

                  {/* Gün Seçici */}
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
                      Tarih Seçimi
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                        const dateObj = addDays(new Date(), dayOffset);
                        const dateStr = format(dateObj, "yyyy-MM-dd");
                        const isSelected = selectedDateStr === dateStr;

                        return (
                          <button
                            key={dayOffset}
                            type="button"
                            onClick={() => setSelectedDateStr(dateStr)}
                            className={`p-3 rounded-2xl border text-center transition-all ${
                              isSelected
                                ? "bg-red-600 border-red-600 text-white font-bold shadow-lg shadow-red-600/30 scale-105"
                                : "bg-[#0c0d14] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                            }`}
                          >
                            <span className="text-[10px] block uppercase font-medium">
                              {format(dateObj, "EEE", { locale: tr })}
                            </span>
                            <span className="text-base sm:text-lg font-black block mt-0.5">
                              {format(dateObj, "d")}
                            </span>
                            <span className="text-[9px] block text-zinc-400">
                              {format(dateObj, "MMM", { locale: tr })}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Saat Slotları */}
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
                      Müsait Saatler ({formatDateTR(selectedDateStr, "d MMMM yyyy")})
                    </label>

                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="p-8 text-center bg-[#0c0d14] border border-zinc-800 rounded-2xl text-zinc-400">
                        <Clock className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                        <p className="text-xs font-bold">Bu tarihte müsait randevu saati bulunmamaktadır.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                        {availableSlots.map((slot) => {
                          const isSelected = selectedTime === slot.time;

                          if (!slot.available) {
                            return (
                              <div
                                key={slot.time}
                                className="py-2.5 px-3 rounded-xl bg-zinc-900/30 border border-zinc-800/40 text-center text-xs font-semibold text-zinc-600 cursor-not-allowed line-through"
                              >
                                {slot.time}
                              </div>
                            );
                          }

                          return (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => setSelectedTime(slot.time)}
                              className={`py-2.5 px-3 rounded-xl border text-center text-xs font-bold transition-all ${
                                isSelected
                                  ? "bg-red-600 border-red-600 text-white shadow-md shadow-red-600/30 scale-105"
                                  : "bg-[#0c0d14] border-zinc-800 text-zinc-300 hover:border-red-600/50 hover:text-white"
                              }`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="pt-6 flex items-center justify-between border-t border-zinc-800">
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Geri Dön
                    </button>

                    <button
                      onClick={() => setStep(4)}
                      disabled={!selectedTime}
                      className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-red-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Devam Et (İletişim & Onay)
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: İLETİŞİM & ONAY */}
              {step === 4 && (
                <form onSubmit={handleSubmitBooking} className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      İletişim Bilgileri & Randevu Özeti
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                      Randevunuzu tamamlamak için lütfen bilgilerinizi giriniz.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs font-semibold">
                      {errorMessage}
                    </div>
                  )}

                  {/* Özet Kartı */}
                  <div className="p-5 rounded-2xl bg-[#0c0d14] border border-zinc-800 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Seçilen Hizmet:</span>
                      <span className="font-bold text-white text-sm">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Uzman Stilist:</span>
                      <span className="font-bold text-white">
                        {selectedStaff ? selectedStaff.name : "İlk Müsait Uzman"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Tarih & Saat:</span>
                      <span className="font-black text-red-400">
                        {formatDateTR(selectedDateStr, "d MMMM yyyy, EEEE")} - Saat {selectedTime}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-sm">
                      <span className="font-bold text-zinc-300">Toplam Ücret:</span>
                      <span className="font-black text-emerald-400 text-base">
                        {selectedService ? formatPrice(selectedService.price) : "0 ₺"}
                      </span>
                    </div>
                  </div>

                  {/* VIP Üye Otomatik Bilgi Kartı */}
                  {customerName || customerPhone ? (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#12131a] to-[#12131a] border border-red-800/60 flex items-center justify-between shadow-lg shadow-red-950/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500 font-black">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white">{customerName || "VIP Müşterimiz"}</span>
                            <span className="text-[9px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full shadow-sm">
                              Üye Bilgileri Otomatik Geldi
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {customerPhone} {customerEmail ? `• ${customerEmail}` : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerName("");
                          setCustomerPhone("");
                          setCustomerEmail("");
                          try {
                            localStorage.removeItem("kuafor_current_customer");
                          } catch {}
                        }}
                        className="text-[11px] text-zinc-400 hover:text-red-400 transition-colors font-medium underline"
                      >
                        Temizle / Değiştir
                      </button>
                    </div>
                  ) : null}

                  {/* Müşteri Formu */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                        Adınız Soyadınız *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          placeholder="Örn: Mehmet Özkan"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-xs font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                        Telefon Numaranız *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                        <input
                          type="tel"
                          required
                          placeholder="0532 123 45 67"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-xs font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                        E-Posta Adresiniz (İsteğe bağlı)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          placeholder="ornek@mail.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-xs font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                        Özel Notunuz (İsteğe bağlı)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Örn: Saç kesiminde yanlar kısa üstler uzun olsun..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-xs font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex items-center justify-between border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Geri Dön
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-xl shadow-red-600/30 disabled:opacity-50 transition-all hover:scale-105"
                    >
                      {submitting ? "Oluşturuluyor..." : "Randevuyu Onayla"}
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 5: BAŞARI EKRANI */}
              {step === 5 && (
                <div className="text-center py-8 sm:py-12 space-y-6">
                  <div className="w-20 h-20 rounded-3xl bg-red-950/40 border border-red-600 flex items-center justify-center text-red-500 mx-auto shadow-2xl shadow-red-600/30">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      Randevu Talebiniz Alındı!
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-md mx-auto">
                      Sayın <span className="text-white font-bold">{customerName}</span>, randevu kaydınız başarıyla oluşturuldu. Salonumuz sizinle en kısa sürede iletişime geçecektir.
                    </p>
                  </div>

                  <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#0c0d14] border border-zinc-800 text-left text-xs space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">İşlem:</span>
                      <span className="font-bold text-white">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Tarih & Saat:</span>
                      <span className="font-black text-red-400">
                        {formatDateTR(selectedDateStr, "d MMMM yyyy, EEEE")} - {selectedTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Telefon:</span>
                      <span className="font-medium text-white">{customerPhone}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                    <button
                      onClick={() => {
                        setStep(1);
                        setSelectedService(null);
                        setSelectedStaff(null);
                        setSelectedTime("");
                        setCustomerName("");
                        setCustomerPhone("");
                        setNotes("");
                      }}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs transition-colors"
                    >
                      Yeni Bir Randevu Al
                    </button>

                    <Link
                      href="/"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs transition-all shadow-md shadow-red-600/30"
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
      <footer className="border-t border-zinc-800/60 py-6 text-center text-xs text-zinc-500">
        <p>© 2026 Kuaför Ali Karayel Salonu. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
