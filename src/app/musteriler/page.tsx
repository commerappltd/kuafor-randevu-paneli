"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Header from "@/components/admin/Header";
import { formatPrice, formatDateTR } from "@/lib/utils";
import { Customer } from "@/types";
import {
  Search,
  Plus,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Edit2,
  Trash2,
  X,
  User,
  Scissors,
} from "lucide-react";

const APPOINTMENT_STATUS = {
  PENDING: { label: "Onay Bekliyor", bg: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
  CONFIRMED: { label: "Onaylandı", bg: "bg-blue-500/15 text-blue-400 border border-blue-500/30" },
  COMPLETED: { label: "Tamamlandı", bg: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
  CANCELLED: { label: "İptal Edildi", bg: "bg-red-500/15 text-red-400 border border-red-500/30" },
};

export default function MusterilerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const url = search ? `/api/customers?search=${encodeURIComponent(search)}` : "/api/customers";
      const res = await fetch(url);
      if (res.ok) {
        setCustomers(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleOpenModal = (customer?: Customer) => {
    setErrorMsg(null);
    if (customer) {
      setEditingCustomer(customer);
      setName(customer.name);
      setPhone(customer.phone);
      setEmail(customer.email || "");
      setNotes(customer.notes || "");
    } else {
      setEditingCustomer(null);
      setName("");
      setPhone("");
      setEmail("");
      setNotes("");
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const payload = { name, phone, email, notes };
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : "/api/customers";
      const method = editingCustomer ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Müşteri kaydedilemedi.");

      setIsModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu müşteriyi ve ilişkili geçmişini silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <Header
        title="Müşteri Yönetimi (CRM)"
        description="Müşteri veri tabanı, randevu sıklığı ve sadakat takibi"
        onRefresh={fetchCustomers}
        isRefreshing={loading}
      />

      <main className="p-4 sm:p-8 space-y-6 flex-1">
        {/* Search & Actions Top Bar */}
        <div className="bg-[#12131a] p-4 sm:p-5 rounded-2xl border border-zinc-800/90 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="İsim, telefon veya e-posta ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-xs font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
            />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Yeni Müşteri Kaydı
          </button>
        </div>

        {/* Customer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {customers.length === 0 ? (
            <div className="col-span-full py-16 text-center text-zinc-500 bg-[#12131a] rounded-2xl border border-zinc-800">
              Kayıtlı müşteri bulunamadı.
            </div>
          ) : (
            customers.map((c: any) => (
              <div
                key={c.id}
                className="bg-[#12131a] rounded-2xl p-5 border border-zinc-800/90 shadow-md hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top: Avatar & Name */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-600 to-red-800 text-white font-black text-base flex items-center justify-center shadow-md shadow-red-600/20">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{c.name}</h4>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <a href={`tel:${c.phone}`} className="flex items-center gap-1 hover:text-red-400">
                            <Phone className="w-3 h-3 text-red-500" />
                            {c.phone}
                          </a>
                          <a
                            href={`https://wa.me/${c.phone.replace(/\D/g, "").replace(/^0/, "").startsWith("90") ? c.phone.replace(/\D/g, "").replace(/^0/, "") : `90${c.phone.replace(/\D/g, "").replace(/^0/, "")}`}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 transition-colors flex items-center gap-1 text-[10px] font-bold border border-emerald-800/40"
                            title="WhatsApp'ta Yaz"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(c)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {c.email && (
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-2.5">
                      <Mail className="w-3 h-3 text-zinc-500" />
                      <span>{c.email}</span>
                    </div>
                  )}

                  {/* Notes */}
                  {c.notes && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#0c0d14] border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed">
                      <span className="font-bold block text-[10px] text-red-400 uppercase tracking-wider mb-0.5">
                        Müşteri Notu:
                      </span>
                      {c.notes}
                    </div>
                  )}
                </div>

                {/* Bottom Stats & Action */}
                <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Ziyaret</span>
                      <span className="font-bold text-white">{c.totalAppointments || 0} kez</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Toplam Ciro</span>
                      <span className="font-bold text-red-400">{formatPrice(c.totalSpent || 0)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCustomerForHistory(c)}
                    className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 px-3 py-1.5 rounded-xl transition-all"
                  >
                    Geçmişi Gör
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Customer Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#12131a] rounded-2xl max-w-md w-full shadow-2xl border border-zinc-800 overflow-hidden">
            <div className="px-6 py-4.5 bg-[#0c0d14] text-white flex items-center justify-between border-b border-zinc-800">
              <h3 className="font-bold text-base text-white">
                {editingCustomer ? "Müşteri Bilgilerini Güncelle" : "Yeni Müşteri Kaydı"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Telefon Numarası *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0532 000 00 00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  E-posta (İsteğe bağlı)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Özel İstekler / Müşteri Notu
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Örn: Hassas cilt, kahve tercihi, favori stil..."
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white text-xs font-medium placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all"
                >
                  {editingCustomer ? "Güncelle" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Appointment History Modal */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#12131a] rounded-2xl max-w-lg w-full shadow-2xl border border-zinc-800 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-6 py-4.5 bg-[#0c0d14] text-white flex items-center justify-between border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-base text-white">{selectedCustomerForHistory.name} - Randevu Geçmişi</h3>
                <p className="text-xs text-zinc-400">{selectedCustomerForHistory.phone}</p>
              </div>
              <button
                onClick={() => setSelectedCustomerForHistory(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {(!selectedCustomerForHistory.appointments || selectedCustomerForHistory.appointments.length === 0) ? (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  Kayıtlı randevu geçmişi bulunamadı.
                </div>
              ) : (
                selectedCustomerForHistory.appointments.map((app: any) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-xl border border-zinc-800 bg-[#0c0d14] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{formatDateTR(app.dateStr, "d MMMM yyyy")}</span>
                        <span className="text-zinc-400 font-normal">({app.startTime})</span>
                      </div>
                      <div className="text-zinc-400 mt-1 flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5 text-red-500" />
                        <span>{app.service?.name}</span>
                        <span>•</span>
                        <span className="text-zinc-500">{app.staff?.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-red-400">{formatPrice(app.totalPrice)}</div>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${APPOINTMENT_STATUS[app.status as keyof typeof APPOINTMENT_STATUS]?.bg || ""}`}>
                        {APPOINTMENT_STATUS[app.status as keyof typeof APPOINTMENT_STATUS]?.label || app.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
