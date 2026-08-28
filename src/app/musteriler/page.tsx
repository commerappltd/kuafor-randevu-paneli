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
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Smartphone,
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
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"APPROVED" | "PENDING_APPROVAL" | "REJECTED">("APPROVED");
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

  const pendingCount = customers.filter((c) => c.status === "PENDING_APPROVAL").length;
  const approvedCount = customers.filter((c) => c.status === "APPROVED" || !c.status).length;

  const filteredCustomers = customers.filter((c) => {
    if (activeTab === "PENDING") return c.status === "PENDING_APPROVAL";
    if (activeTab === "APPROVED") return c.status === "APPROVED" || !c.status;
    return true;
  });

  const handleUpdateStatus = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/customers/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchCustomers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (customer?: Customer) => {
    setErrorMsg(null);
    if (customer) {
      setEditingCustomer(customer);
      setName(customer.name);
      setPhone(customer.phone);
      setEmail(customer.email || "");
      setNotes(customer.notes || "");
      setStatus(customer.status || "APPROVED");
    } else {
      setEditingCustomer(null);
      setName("");
      setPhone("");
      setEmail("");
      setNotes("");
      setStatus("APPROVED");
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const payload = { name, phone, email, notes, status };

      if (editingCustomer) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === editingCustomer.id ? { ...c, ...payload } : c))
        );
        setIsModalOpen(false);

        await fetch(`/api/customers/${editingCustomer.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        const tempId = `cust-${Date.now()}`;
        const newCustomerItem: Customer = {
          id: tempId,
          name,
          phone,
          email,
          notes,
          status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCustomers((prev) => [newCustomerItem, ...prev]);
        setIsModalOpen(false);

        await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      fetchCustomers();
    } catch (err: any) {
      console.warn("Müşteri kaydetme uyarısı:", err);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu müşteriyi ve ilişkili geçmişini silmek istediğinize emin misiniz?")) return;
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/customers/${id}`, { method: "DELETE" });
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <Header
        title="Müşteri Yönetimi & Mobil Onay Masası"
        description="Müşteri veri tabanı, Google Play/App Store üyelik onayları ve seans takibi"
        onRefresh={fetchCustomers}
        isRefreshing={loading}
      />

      <main className="p-4 sm:p-8 space-y-6 flex-1">
        {/* Top Filter and Search Bar */}
        <div className="bg-[#12131a] p-4 sm:p-5 rounded-2xl border border-zinc-800/90 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full lg:w-auto">
            {/* Tabs */}
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "ALL"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "bg-[#0c0d14] text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              Tüm Müşteriler ({customers.length})
            </button>

            <button
              onClick={() => setActiveTab("PENDING")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "PENDING"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "bg-[#0c0d14] text-amber-400 hover:text-amber-300 border border-amber-500/30"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Onay Bekleyenler ({pendingCount})
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("APPROVED")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "APPROVED"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "bg-[#0c0d14] text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              Onaylananlar ({approvedCount})
            </button>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="İsim veya telefon ile ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-zinc-800 bg-[#0c0d14] text-xs font-medium text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
              />
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Yeni Müşteri
            </button>
          </div>
        </div>

        {/* Customer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full py-16 text-center text-zinc-500 bg-[#12131a] rounded-2xl border border-zinc-800">
              {activeTab === "PENDING"
                ? "Şu anda onay bekleyen mobil müşteri başvurusu yok. Harika!"
                : "Müşteri bulunamadı."}
            </div>
          ) : (
            filteredCustomers.map((c: any) => {
              const isPending = c.status === "PENDING_APPROVAL";
              const isRejected = c.status === "REJECTED";

              return (
                <div
                  key={c.id}
                  className={`bg-[#12131a] rounded-2xl p-5 border transition-all flex flex-col justify-between relative ${
                    isPending
                      ? "border-amber-500/50 shadow-lg shadow-amber-500/10"
                      : "border-zinc-800/90 hover:border-zinc-700"
                  }`}
                >
                  {/* Status Banner for Pending */}
                  {isPending && (
                    <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" />
                        Mobil Uygulama Kaydı (Onay Bekliyor)
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-red-600/30">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">{c.name}</h3>
                          <div className="flex items-center gap-1 mt-0.5">
                            {isPending ? (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md">
                                Onay Bekliyor
                              </span>
                            ) : isRejected ? (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-md">
                                Reddedildi
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Onaylı Üye
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenModal(c)}
                          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-950/40 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Contact details */}
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Phone className="w-3.5 h-3.5 text-red-500" />
                        <span className="font-medium">{c.phone}</span>
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Mail className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="truncate">{c.email}</span>
                        </div>
                      )}
                      {c.notes && (
                        <div className="mt-2.5 p-2.5 bg-[#0c0d14] rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400 italic">
                          "{c.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pending Approval Action Buttons */}
                  {isPending ? (
                    <div className="mt-4 pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleUpdateStatus(c.id, "APPROVED")}
                        className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Onayla
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(c.id, "REJECTED")}
                        className="flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-rose-900/60 hover:text-rose-300 text-zinc-400 py-2 rounded-xl text-xs font-bold border border-zinc-700 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reddet
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase font-bold">Toplam Ciro</span>
                        <span className="font-extrabold text-sm text-red-400">
                          {formatPrice(c.totalSpent || 0)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 rounded-xl border border-emerald-500/30 transition-colors"
                          title="WhatsApp Mesaj Gönder"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => setSelectedCustomerForHistory(c)}
                          className="text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800/90 hover:bg-zinc-700 px-3 py-1.5 rounded-xl border border-zinc-700 transition-colors"
                        >
                          Geçmiş ({c.totalAppointments || 0})
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Müşteri Ekle/Düzenle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12131a] border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-extrabold text-base text-white">
                {editingCustomer ? "Müşteri Bilgilerini Düzenle" : "Yeni Müşteri Ekle"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-zinc-400 block mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Mehmet Özkan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white focus:outline-none focus:border-red-600 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1">Telefon Numarası *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 0532 111 22 33"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white focus:outline-none focus:border-red-600 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1">E-Posta (İsteğe bağlı)</label>
                <input
                  type="email"
                  placeholder="ornek@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white focus:outline-none focus:border-red-600 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1">Üyelik / Onay Durumu</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white focus:outline-none focus:border-red-600 font-medium"
                >
                  <option value="APPROVED">Onaylı Üye (Giriş Yapabilir & Randevu Alabilir)</option>
                  <option value="PENDING_APPROVAL">Onay Bekliyor (Mobil Başvuru Sırasında)</option>
                  <option value="REJECTED">Reddedildi / Engellendi</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-400 block mb-1">Özel Notlar</label>
                <textarea
                  rows={2}
                  placeholder="Örn: Saç kesim stili, ikram tercihleri vb."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-[#0c0d14] text-white focus:outline-none focus:border-red-600 font-medium resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-md shadow-red-600/30"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Randevu Geçmişi Modalı */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12131a] border border-zinc-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-extrabold text-base text-white">
                  {selectedCustomerForHistory.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Tüm Seans & Randevu Geçmişi</p>
              </div>
              <button
                onClick={() => setSelectedCustomerForHistory(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {(!selectedCustomerForHistory.appointments || selectedCustomerForHistory.appointments.length === 0) ? (
                <div className="py-8 text-center text-zinc-500">Kayıtlı seans bulunamadı.</div>
              ) : (
                selectedCustomerForHistory.appointments.map((a: any) => (
                  <div key={a.id} className="p-3 bg-[#0c0d14] rounded-xl border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{a.service?.name}</div>
                      <div className="text-zinc-400 text-[11px] mt-0.5">
                        {formatDateTR(a.dateStr, "d MMMM yyyy")} • Saat {a.startTime} ({a.staff?.name})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-red-400">{formatPrice(a.totalPrice)}</div>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        a.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-400" :
                        a.status === "CONFIRMED" ? "bg-blue-500/15 text-blue-400" :
                        a.status === "CANCELLED" ? "bg-red-500/15 text-red-400" :
                        "bg-amber-500/15 text-amber-400"
                      }`}>
                        {a.status}
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
