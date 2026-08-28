"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Header from "@/components/admin/Header";
import AppointmentModal from "@/components/admin/AppointmentModal";
import { formatDateTR, formatPhoneNumber, isValidPhoneNumber } from "@/lib/utils";
import { Customer, Staff } from "@/types";
import {
  UserCog,
  Users,
  UserCheck,
  ShieldCheck,
  Plus,
  Search,
  KeyRound,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  Mail,
  Lock,
  Sparkles,
  ChevronRight,
  UserPlus,
} from "lucide-react";

interface UnifiedUser {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
  status: "APPROVED" | "PENDING_APPROVAL" | "REJECTED";
  createdAt?: string;
  notes?: string | null;
  rawItem?: any;
}

export default function KullaniciYonetimiPage() {
  const [users, setUsers] = useState<UnifiedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");

  // Modal State for Edit / Add
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [editingUser, setEditingUser] = useState<UnifiedUser | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "STAFF" | "ADMIN">("CUSTOMER");
  const [status, setStatus] = useState<"APPROVED" | "PENDING_APPROVAL" | "REJECTED">("APPROVED");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");

  // Appointment Modal
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentCustomerInfo, setAppointmentCustomerInfo] = useState<{ name: string; phone: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [custRes, staffRes] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/staff"),
      ]);

      const unified: UnifiedUser[] = [];

      // Add default admin
      unified.push({
        id: "admin-1",
        name: "Ali Karayel (Admin)",
        phone: "+90 532 100 20 30",
        email: "admin@kuaforalikarayel.com",
        role: "ADMIN",
        status: "APPROVED",
        createdAt: "2026-01-01T00:00:00.000Z",
        notes: "Sistem ve Salon Baş Yöneticisi",
      });

      if (staffRes.ok) {
        const staffData: Staff[] = await staffRes.json();
        staffData.forEach((s) => {
          unified.push({
            id: s.id,
            name: s.name,
            phone: s.phone || "",
            email: s.email || null,
            role: "STAFF",
            status: s.active ? "APPROVED" : "REJECTED",
            notes: s.title,
            rawItem: s,
          });
        });
      }

      if (custRes.ok) {
        const custData: Customer[] = await custRes.json();
        custData.forEach((c) => {
          unified.push({
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email || null,
            role: "CUSTOMER",
            status: (c.status as any) || "APPROVED",
            createdAt: typeof c.createdAt === "string" ? c.createdAt : c.createdAt ? new Date(c.createdAt).toISOString() : undefined,
            notes: c.notes,
            rawItem: c,
          });
        });
      }

      setUsers(unified);
    } catch (err) {
      console.error("Kullanıcılar yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setModalMode("ADD");
    setEditingUser(null);
    setName("");
    setPhone("");
    setEmail("");
    setRole("CUSTOMER");
    setStatus("APPROVED");
    setPassword("");
    setNotes("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UnifiedUser) => {
    setModalMode("EDIT");
    setEditingUser(user);
    setName(user.name);
    setPhone(user.phone);
    setEmail(user.email || "");
    setRole(user.role);
    setStatus(user.status);
    setPassword("");
    setNotes(user.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidPhoneNumber(phone)) {
      alert("Lütfen geçerli ve 13 haneli (+90 5XX XXX XX XX) telefon numarasını eksiksiz giriniz.");
      return;
    }

    const payload = {
      name,
      phone,
      email,
      role,
      status,
      password: password || undefined,
      notes,
    };

    if (modalMode === "EDIT" && editingUser) {
      // Optimistic UI
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...payload } : u))
      );
      setIsModalOpen(false);

      if (editingUser.role === "CUSTOMER") {
        await fetch(`/api/customers/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, email, status, notes, password }),
        });
      } else if (editingUser.role === "STAFF") {
        await fetch(`/api/staff/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, email, active: status === "APPROVED" }),
        });
      }
    } else {
      // Create new user
      const tempId = `usr-${Date.now()}`;
      const newUser: UnifiedUser = {
        id: tempId,
        name,
        phone,
        email,
        role,
        status,
        notes,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
      setIsModalOpen(false);

      if (role === "CUSTOMER") {
        await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, email, status, notes, password }),
        });
      } else if (role === "STAFF") {
        await fetch("/api/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, title: "Kuaför / Stilist", phone, email }),
        });
      }
    }

    fetchUsers();
  };

  const handleDeleteUser = async (user: UnifiedUser) => {
    if (!confirm(`"${user.name}" kullanıcısını silmek istediğinize emin misiniz?`)) return;
    setUsers((prev) => prev.filter((u) => u.id !== user.id));

    try {
      if (user.role === "CUSTOMER") {
        await fetch(`/api/customers/${user.id}`, { method: "DELETE" });
      } else if (user.role === "STAFF") {
        await fetch(`/api/staff/${user.id}`, { method: "DELETE" });
      }
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (user: UnifiedUser, newStatus: "APPROVED" | "REJECTED") => {
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );

    try {
      if (user.role === "CUSTOMER") {
        await fetch(`/api/customers/${user.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
      } else if (user.role === "STAFF") {
        await fetch(`/api/staff/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: newStatus === "APPROVED" }),
        });
      }
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAppointmentForUser = (user: UnifiedUser) => {
    setAppointmentCustomerInfo({ name: user.name, phone: user.phone });
    setIsAppointmentModalOpen(true);
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedRoleFilter === "ALL") return true;
    if (selectedRoleFilter === "CUSTOMER") return u.role === "CUSTOMER";
    if (selectedRoleFilter === "STAFF") return u.role === "STAFF";
    if (selectedRoleFilter === "ADMIN") return u.role === "ADMIN";
    if (selectedRoleFilter === "PENDING") return u.status === "PENDING_APPROVAL";

    return true;
  });

  const countTotal = users.length;
  const countCustomers = users.filter((u) => u.role === "CUSTOMER").length;
  const countStaff = users.filter((u) => u.role === "STAFF").length;
  const countPending = users.filter((u) => u.status === "PENDING_APPROVAL").length;

  return (
    <AdminLayout>
      <Header
        title="Kullanıcı Yönetimi & Manuel İşlem Masası"
        description="Müşteri, personel ve yönetici hesapları, şifre sıfırlama ve manuel yetki kontrolleri"
        onRefresh={fetchUsers}
        isRefreshing={loading}
      />

      <main className="p-4 sm:p-8 space-y-6 flex-1">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c0d14] border border-zinc-800/80 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Toplam Kullanıcı</span>
              <div className="w-8 h-8 rounded-xl bg-zinc-800/80 flex items-center justify-center text-zinc-300">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white mt-2">{countTotal}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Sistemdeki tüm kayıtlı hesaplar</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c0d14] border border-zinc-800/80 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Mobil & Web Müşteri</span>
              <div className="w-8 h-8 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-red-400 mt-2">{countCustomers}</div>
            <p className="text-[10px] text-zinc-500 mt-1">VIP kayıtlı müşteri portföyü</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c0d14] border border-zinc-800/80 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Kuaför / Uzman</span>
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-400">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-blue-400 mt-2">{countStaff}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Aktif stilist & usta kadrosu</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c0d14] border border-zinc-800/80 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Onay Bekleyenler</span>
              <div className="w-8 h-8 rounded-xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-400 mt-2">{countPending}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Mobil app onay masasında bekleyen</p>
          </div>
        </div>

        {/* Filter Bar & Action Button */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0c0d14] border border-zinc-800/80 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {[
              { id: "ALL", label: `Tümü (${countTotal})` },
              { id: "CUSTOMER", label: `Müşteriler (${countCustomers})` },
              { id: "STAFF", label: `Personeller (${countStaff})` },
              { id: "PENDING", label: `Onay Bekleyenler (${countPending})` },
              { id: "ADMIN", label: "Yöneticiler (1)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedRoleFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedRoleFilter === tab.id
                    ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                    : "bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Add Button */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="İsim, telefon veya e-posta ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600"
              />
            </div>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Manuel Kullanıcı Ekle</span>
            </button>
          </div>
        </div>

        {/* Users List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-[#0c0d14] rounded-2xl border border-zinc-800">
              <Users className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
              <h3 className="font-bold text-white text-base">Kullanıcı Bulunamadı</h3>
              <p className="text-xs text-zinc-400 mt-1">Arama kriterlerinize uygun kayıt bulunmuyor.</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isCustomer = user.role === "CUSTOMER";
              const isStaff = user.role === "STAFF";
              const isAdmin = user.role === "ADMIN";

              return (
                <div
                  key={user.id}
                  className="p-5 rounded-2xl bg-[#0c0d14] border border-zinc-800/90 shadow-lg hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Avatar & Badges */}
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-base shadow-md ${
                            isAdmin
                              ? "bg-gradient-to-br from-red-600 to-amber-600"
                              : isStaff
                              ? "bg-blue-600"
                              : "bg-zinc-800 text-red-400"
                          }`}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                            {user.name}
                            {isAdmin && <ShieldCheck className="w-4 h-4 text-red-500" />}
                          </h3>
                          <span
                            className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md mt-0.5 ${
                              isAdmin
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : isStaff
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                            }`}
                          >
                            {isAdmin ? "YÖNETİCİ" : isStaff ? "KUAFÖR / PERSONEL" : "MÜŞTERİ"}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded-lg ${
                          user.status === "APPROVED"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : user.status === "PENDING_APPROVAL"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-red-500/15 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {user.status === "APPROVED"
                          ? "ONAYLI"
                          : user.status === "PENDING_APPROVAL"
                          ? "ONAY BEKLİYOR"
                          : "ASKIDA / PASİF"}
                      </span>
                    </div>

                    {/* Details Info */}
                    <div className="space-y-1.5 text-xs text-zinc-400 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/60 mb-4">
                      {user.phone ? (
                        <div className="flex items-center gap-2 text-zinc-300 font-medium">
                          <Phone className="w-3.5 h-3.5 text-red-500" />
                          <span>{user.phone}</span>
                        </div>
                      ) : null}

                      {user.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      ) : null}

                      {user.notes ? (
                        <div className="text-[11px] text-zinc-500 italic pt-1 border-t border-zinc-800/40">
                          {user.notes}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Approve / Reject Toggle */}
                      {user.status === "PENDING_APPROVAL" && (
                        <button
                          onClick={() => handleToggleStatus(user, "APPROVED")}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md shadow-emerald-600/30"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Onayla
                        </button>
                      )}

                      {/* Manual Booking Button for Customer */}
                      <button
                        onClick={() => handleCreateAppointmentForUser(user)}
                        title="Bu kullanıcıya manuel randevu oluştur"
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-red-400 hover:text-white border border-zinc-800 text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Randevu Yaz</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        title="Kullanıcıyı Düzenle & Şifre Değiştir"
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {!isAdmin && (
                      <button
                        onClick={() => handleDeleteUser(user)}
                        title="Kullanıcıyı Sil"
                        className="p-1.5 rounded-lg bg-red-950/30 hover:bg-red-600 text-red-400 hover:text-white border border-red-900/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Manual Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0c0d14] border border-zinc-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500">
                  <UserCog className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    {modalMode === "ADD" ? "Yeni Manuel Kullanıcı Ekle" : "Kullanıcıyı Düzenle"}
                  </h3>
                  <p className="text-[11px] text-zinc-400">Yönetim konsolu manuel işlem formu</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Telefon Numarası * (13 Hane)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+90 5XX XXX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border text-xs text-white placeholder:text-zinc-600 focus:outline-none ${
                      phone && !isValidPhoneNumber(phone)
                        ? "border-red-500/80 focus:border-red-500"
                        : "border-zinc-800 focus:border-red-600"
                    }`}
                  />
                  {phone && !isValidPhoneNumber(phone) && (
                    <p className="text-[10px] text-red-400 font-semibold mt-1">
                      ⚠️ 13 haneli (+90 5XX...) eksiksiz giriniz.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Kullanıcı Rolü
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="CUSTOMER">Müşteri (VIP)</option>
                    <option value="STAFF">Kuaför / Personel</option>
                    <option value="ADMIN">Yönetici (Admin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  E-Posta (İsteğe bağlı)
                </label>
                <input
                  type="email"
                  placeholder="kullanici@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Durum / Onay
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="APPROVED">Onaylı (Aktif)</option>
                    <option value="PENDING_APPROVAL">Onay Bekliyor</option>
                    <option value="REJECTED">Askıda / Reddedildi</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Şifre Belirle
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Yönetici Notu
                </label>
                <textarea
                  rows={2}
                  placeholder="Müşteri tercihleri veya personel notu..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30"
                >
                  {modalMode === "ADD" ? "Kullanıcıyı Oluştur" : "Değişiklikleri Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Modal for Manual Booking */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </AdminLayout>
  );
}
