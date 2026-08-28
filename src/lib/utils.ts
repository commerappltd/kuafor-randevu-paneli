import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Para birimi formatlayıcı (Örn: ₺450 veya 450 ₺)
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Türkçe Tarih Formatlayıcı
export function formatDateTR(date: Date | string, pattern = "d MMMM yyyy, EEEE"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  try {
    return format(d, pattern, { locale: tr });
  } catch {
    return String(date);
  }
}

// Saat metnini dakikaya çevirir ("14:30" -> 870 dk)
export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

// Dakikayı saat metnine çevirir (870 -> "14:30")
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// Başlangıç saati ve süreye göre bitiş saati hesaplar ("14:00" + 45dk -> "14:45")
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMin = timeToMinutes(startTime);
  const endMin = startMin + durationMinutes;
  return minutesToTime(endMin);
}

// İki saat aralığının çakışıp çakışmadığını kontrol eder
export function isTimeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);

  return sA < eB && eA > sB;
}

// 13 Haneli (+90 5XX XXX XX XX) Telefon Numarası Formatlayıcı
export function formatPhoneNumber(val: string): string {
  if (!val) return "+90 ";
  // Sadece rakamları al
  let digits = val.replace(/\D/g, "");

  // Baştaki 90'ı veya 0'ı temizleyip standart 10 haneli gövdeye dönüştür
  if (digits.startsWith("90")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Maksimum 10 hane cep telefonu
  digits = digits.slice(0, 10);

  // Otomatik Maskeleme: +90 5XX XXX XX XX
  let formatted = "+90";
  if (digits.length > 0) {
    formatted += ` ${digits.slice(0, 3)}`;
  }
  if (digits.length >= 4) {
    formatted += ` ${digits.slice(3, 6)}`;
  }
  if (digits.length >= 7) {
    formatted += ` ${digits.slice(6, 8)}`;
  }
  if (digits.length >= 9) {
    formatted += ` ${digits.slice(8, 10)}`;
  }

  return formatted;
}

// 13 Haneli Telefon Doğrulama Kontrolü (Tam 10 rakam girilmiş mi?)
export function isValidPhoneNumber(val: string): boolean {
  if (!val) return false;
  let digits = val.replace(/\D/g, "");
  if (digits.startsWith("90")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  // Türkiye cep telefonu: 5 ile başlamalı ve tam 10 hane olmalıdır
  return digits.length === 10 && digits.startsWith("5");
}

// Randevu Durumları & Renkleri
export const APPOINTMENT_STATUS = {
  PENDING: {
    label: "Beklemede",
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
  },
  CONFIRMED: {
    label: "Onaylandı",
    bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dot: "bg-blue-500",
  },
  COMPLETED: {
    label: "Tamamlandı",
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  CANCELLED: {
    label: "İptal Edildi",
    bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dot: "bg-rose-500",
  },
} as const;
