"use client";

import { useState } from "react";
import { X, MessageSquare, Send, Copy, Check, Sparkles, Phone } from "lucide-react";
import { formatPrice, formatDateTR } from "@/lib/utils";
import { Appointment } from "@/types";

interface WhatsAppModalProps {
  isOpen?: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export default function WhatsAppModal({
  isOpen = true,
  onClose,
  appointment,
}: WhatsAppModalProps) {
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<"reminder" | "confirmation" | "delay">("reminder");
  const [customMessage, setCustomMessage] = useState<string>("");

  if (!isOpen || !appointment) return null;

  // Telefon numarasını WhatsApp formatına uygun hale getirme (boşlukları temizle, 90 ekle)
  const cleanPhone = appointment.customer.phone
    .replace(/\D/g, "")
    .replace(/^0/, ""); // Baştaki 0'ı kaldır

  const internationalPhone = cleanPhone.startsWith("90") ? cleanPhone : `90${cleanPhone}`;

  // Şablon Mesajlar
  const templates = {
    reminder: `Sayın ${appointment.customer.name}, 

📅 *${formatDateTR(appointment.dateStr, "d MMMM yyyy, EEEE")}* günü saat *${appointment.startTime}* için *${appointment.service.name}* randevunuz bulunmaktadır.

💈 *Uzman Kuaförünüz:* ${appointment.staff.name}
📍 *Salon:* Kuaför Ali Karayel
💰 *Tutar:* ${formatPrice(appointment.totalPrice)}

Sizi ağırlamaktan mutluluk duyarız. Randevunuzda herhangi bir değişiklik yapmak isterseniz lütfen bu mesajı yanıtlayınız. ✨`,

    confirmation: `Sayın *${appointment.customer.name}*,

✅ Kuaför Ali Karayel randevunuz başarıyla *ONAYLANMIŞTIR*!

✂️ *Hizmet:* ${appointment.service.name}
💈 *Uzman Kuaför:* ${appointment.staff.name}
📅 *Tarih:* ${formatDateTR(appointment.dateStr, "d MMMM yyyy, EEEE")}
⏰ *Saat:* ${appointment.startTime} - ${appointment.endTime}
📍 *Adres:* Nispetiye Caddesi No:42, Levent / İstanbul
💰 *Ücret:* ${formatPrice(appointment.totalPrice)}

⚠️ *ÖNEMLİ BİLGİLENDİRME:* Randevunuza katılamayacaksanız, kuaförlerimizin çalışma düzeni ve diğer müşterilerimizin mağdur olmaması adına lütfen en az 30 dakika (yarım saat) öncesinden mobil uygulamamız veya web sitemiz üzerinden randevunuzu iptal ediniz veya bildiriniz.

Sizi salonumuzda ağırlamaktan mutluluk duyacağız! 👑✂️`,

    delay: `Sayın ${appointment.customer.name}, 

Öncelikle salonumuzdaki yoğunluktan dolayı anlayışınız için teşekkür ederiz. Bugün saat *${appointment.startTime}* olan randevunuzda yaklaşık *15-20 dakikalık* küçük bir gecikme yaşanabilir. 

Sizi en iyi şekilde ağırlamak için hazırlıklarımız devam ediyor. Bilginize sunarız. 🙏`,
  };

  const messageToSend = customMessage || templates[selectedTemplate];

  const handleSendWhatsApp = () => {
    const encodedText = encodeURIComponent(messageToSend);
    const waUrl = `https://wa.me/${internationalPhone}?text=${encodedText}`;
    window.open(waUrl, "_blank");
    onClose();
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(messageToSend);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-emerald-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">WhatsApp Randevu Bildirimi</h3>
              <p className="text-xs text-emerald-100">{appointment.customer.name} ({appointment.customer.phone})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Şablon Seçici */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Bildirim Şablonu Seçin
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "reminder", label: "Randevu Hatırlatma" },
                { key: "confirmation", label: "Randevu Onayı" },
                { key: "delay", label: "Gecikme Bilgisi" },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(t.key as any);
                    setCustomMessage("");
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedTemplate === t.key && !customMessage
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mesaj Önizleme ve Düzenleme */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Gönderilecek Mesaj (Düzenleyebilirsiniz)
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Kopyalandı!" : "Metni Kopyala"}
              </button>
            </div>

            <textarea
              rows={8}
              value={messageToSend}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>
              <strong>"WhatsApp'ta Aç ve Gönder"</strong> butonuna bastığınızda müşterinin WhatsApp sohbeti otomatik olarak mesaj hazır şekilde açılacaktır.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Vazgeç
          </button>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            WhatsApp&apos;ta Aç ve Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
