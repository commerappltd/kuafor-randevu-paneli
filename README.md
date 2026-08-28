# 💈 Makas & Stil | Kuaför Randevu ve Yönetim Sistemi

Modern kuaförler, berberler ve güzellik salonları için geliştirilmiş fullstack randevu, müşteri CRM, personel ve gelir yönetim paneli.

---

## 🌟 Öne Çıkan Özellikler

1. **📊 Yönetici Dashboard (Genel Bakış)**
   - Günlük randevu sayısı, bekleyen müşteri onayları, anlık ciro ve aktif personel takibi.
   - Haftalık gelir ve randevu trendi grafiği (Recharts).
   - Popüler kuaför işlemleri sıralaması.
   - Bugünün randevu akışı ve tek tıkla durum güncelleme (Onayla, Tamamla, İptal).

2. **📅 İnteraktif Randevu Takvimi**
   - **Günlük / Personel Görünümü**: Uzman kuaförlerin sütun bazlı saatlik timeline'ı. Boş saatlere tıklayarak anında randevu oluşturma.
   - **Haftalık Görünüm**: Haftanın tüm günlerini ve doluluk oranlarını tek ekranda görme.
   - **Çakışma Kontrolü**: Aynı personele aynı saatte çakışan randevu verilmesini engelleyen akıllı algoritma.

3. **📋 Randevu Yönetimi & Filtreleme**
   - Müşteri adı, telefon, tarih, uzman ve duruma göre detaylı filtreleme.
   - Randevu düzenleme, saat kaydırma ve silme.

4. **👥 Müşteri CRM & Geçmiş Takibi**
   - Müşteri rehberi, özel tercihler/notlar (örn. alerji, saç kesim modeli tercihi).
   - Müşterinin geçmiş tüm randevuları, ziyaret sıklığı ve salona bıraktığı toplam ciro.

5. **✂️ Hizmet Kataloğu & Fiyatlandırma**
   - Kategori bazlı hizmet listesi (Saç Kesimi, Sakal & Bakım, Renklendirme, Özel Bakım & Spa, Paketler).
   - Hizmet süresi, fiyatı ve açıklamalarını düzenleme.

6. **💈 Personel / Uzman Yönetimi**
   - Çalışan kuaförlerin unvanları, mesai saatleri (örn. 09:00 - 19:00), iletişim bilgileri.
   - Takvimde kolay ayırt edebilmek için kişiselleştirilmiş renk teması.

7. **💰 Finans & Gelir Analizi**
   - Tahsil edilen net ciro, onaylı beklenen ciro, ortalama seans tutarı.
   - Personel bazında ciro ve kazanç dağılım grafikleri.
   - Kategori bazında ciro pasta grafiği.

8. **🌐 Müşteri Online Randevu Portalı (`/randevu-al`)**
   - Müşterilerin cep telefonundan veya bilgisayardan randevu alabileceği 4 adımlı rezervasyon akışı.
   - Dolu saatleri otomatik kilitleyen canlı müsaitlik motoru.

---

## 🚀 Başlatma ve Kurulum

### 1. Geliştirme Sunucusunu Başlatma
```bash
cd kuafor-paneli
npm run dev
```

Uygulama tarayıcınızda açılacaktır:
- **Yönetim Paneli**: `http://localhost:3000`
- **Müşteri Online Randevu Portalı**: `http://localhost:3000/randevu-al`

### 2. Veritabanını Sıfırlama ve Örnek Verileri Yükleme (Opsiyonel)
```bash
npx prisma db push
npx prisma db seed
```

---

## 🛠 Kullanılan Teknolojiler
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Stil & Tasarım**: Tailwind CSS + Lucide Icons
- **Grafikler**: Recharts
- **Veritabanı & ORM**: SQLite + Prisma ORM *(PostgreSQL ve Supabase'e geçişe hazır)*
- **Tarih Kütüphanesi**: date-fns (Türkçe yerelleştirme ile)
