"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Header from "@/components/admin/Header";
import { formatPrice } from "@/lib/utils";
import { Service } from "@/types";
import {
  Scissors,
  Plus,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Sparkles,
} from "lucide-react";

const CATEGORIES = [
  "ALL",
  "Saç Kesimi",
  "Sakal & Bakım",
  "Renklendirme",
  "Özel Bakım & Spa",
  "Özel Paket",
];

export default function HizmetlerPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Saç Kesimi");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [price, setPrice] = useState(300);
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedCategory === "ALL" 
        ? "/api/services" 
        : `/api/services?category=${encodeURIComponent(selectedCategory)}`;
      const res = await fetch(url);
      if (res.ok) {
        setServices(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleOpenModal = (service?: Service) => {
    setErrorMsg(null);
    if (service) {
      setEditingService(service);
      setName(service.name);
      setCategory(service.category);
      setDurationMinutes(service.durationMinutes);
      setPrice(service.price);
      setDescription(service.description || "");
      setActive(service.active);
    } else {
      setEditingService(null);
      setName("");
      setCategory("Saç Kesimi");
      setDurationMinutes(30);
      setPrice(300);
      setDescription("");
      setActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      if (editingService) {
        const res = await fetch(`/api/services/${editingService.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, category, durationMinutes, price, description, active }),
        });
        if (!res.ok) throw new Error("Hizmet güncellenemedi.");
      } else {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, category, durationMinutes, price, description, active }),
        });
        if (!res.ok) throw new Error("Hizmet eklenemedi.");
      }

      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu hizmeti silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (res.ok) fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await fetch(`/api/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !service.active }),
      });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <Header
        title="Hizmet & Fiyat Kataloğu"
        description="Salonda sunulan kuaförlük işlemleri, süreleri ve güncel fiyat listesi"
        onRefresh={fetchServices}
        isRefreshing={loading}
      />

      <main className="p-8 space-y-6 flex-1">
        {/* Category Filter & Add Button */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {cat === "ALL" ? "Tüm Kategoriler" : cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Yeni Hizmet Ekle
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-2xl p-5 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                service.active ? "border-slate-200/80" : "border-slate-200 opacity-60 bg-slate-50/50"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                      {service.category}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-2">{service.name}</h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(service)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {service.description && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                )}
              </div>

              {/* Bottom Info & Toggle */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{service.durationMinutes} dk</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {formatPrice(service.price)}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleActive(service)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                    service.active
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {service.active ? "Aktif" : "Pasif"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingService ? "Hizmeti Düzenle" : "Yeni Hizmet Ekle"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Hizmet Adı *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Klasik Saç Kesimi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Kategori *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="Saç Kesimi">Saç Kesimi</option>
                  <option value="Sakal & Bakım">Sakal & Bakım</option>
                  <option value="Renklendirme">Renklendirme</option>
                  <option value="Özel Bakım & Spa">Özel Bakım & Spa</option>
                  <option value="Özel Paket">Özel Paket</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Süre (Dakika) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Fiyat (₺) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Hizmet detayları ve kullanılan ürünler..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <label htmlFor="activeCheck" className="text-xs font-semibold text-slate-700">
                  Bu hizmet randevu alımına açık (Aktif)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-xs"
                >
                  {editingService ? "Güncelle" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
