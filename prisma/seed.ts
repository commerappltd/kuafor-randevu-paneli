import { PrismaClient } from "@prisma/client";
import { format, addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Veritabanı temizleniyor ve tohumlama başlıyor...");

  // Temizle
  await prisma.appointment.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.service.deleteMany();
  await prisma.staff.deleteMany();

  // 1. Personeller
  const staffMembers = await Promise.all([
    prisma.staff.create({
      data: {
        name: "Ahmet Yılmaz",
        title: "Master Berber & Baş Stilist",
        phone: "+90 532 100 20 30",
        email: "ahmet@salonelegance.com",
        color: "#4f46e5", // Indigo
        startTime: "09:00",
        endTime: "19:30",
        active: true,
      },
    }),
    prisma.staff.create({
      data: {
        name: "Elif Kaya",
        title: "Saç Tasarım & Renklendirme Uzmanı",
        phone: "+90 533 200 30 40",
        email: "elif@salonelegance.com",
        color: "#db2777", // Pembe/Fuşya
        startTime: "10:00",
        endTime: "20:00",
        active: true,
      },
    }),
    prisma.staff.create({
      data: {
        name: "Can Demir",
        title: "Sakal & Cilt Bakım Uzmanı",
        phone: "+90 535 300 40 50",
        email: "can@salonelegance.com",
        color: "#059669", // Zümrüt Yeşili
        startTime: "09:30",
        endTime: "19:00",
        active: true,
      },
    }),
    prisma.staff.create({
      data: {
        name: "Burak Şahin",
        title: "Stilist & Çocuk Traşı Uzmanı",
        phone: "+90 536 400 50 60",
        email: "burak@salonelegance.com",
        color: "#d97706", // Amber
        startTime: "09:00",
        endTime: "18:00",
        active: true,
      },
    }),
  ]);

  console.log(`✓ ${staffMembers.length} personel oluşturuldu.`);

  // 2. Hizmetler
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "Klasik Saç Kesimi & Yıkama",
        category: "Saç Kesimi",
        durationMinutes: 45,
        price: 450,
        description: "Kişiye özel saç kesimi, yıkama, fön ve şekillendirici uygulama.",
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Sakal Tıraşı & Sıcak Havlu Bakımı",
        category: "Sakal & Bakım",
        durationMinutes: 30,
        price: 300,
        description: "Geleneksel ustura tıraşı, sıcak buhar havlusu ve yatıştırıcı balsam.",
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "VIP Saç & Sakal Kombin",
        category: "Özel Paket",
        durationMinutes: 60,
        price: 700,
        description: "Detaylı saç kesimi, sakal dizaynı, yıkama, yüz maskesi ve masaj.",
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Saç Boyama & Tonlama",
        category: "Renklendirme",
        durationMinutes: 90,
        price: 1200,
        description: "Amonyaksız organik saç boyası ile renklendirme ve parlaklık cilası.",
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Keratin & Botoks Saç Bakımı",
        category: "Özel Bakım & Spa",
        durationMinutes: 75,
        price: 1500,
        description: "Yıpranmış saçları onaran yoğun keratin ve nem yüklemesi.",
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Çocuk Saç Kesimi",
        category: "Saç Kesimi",
        durationMinutes: 30,
        price: 350,
        description: "Çocuklara özel eğlenceli ve konforlu saç kesimi.",
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Cilt Maskesi & Yüz Masajı",
        category: "Özel Bakım & Spa",
        durationMinutes: 30,
        price: 400,
        description: "Gözenek temizleyici siyah maske ve rahatlatıcı yüz masajı.",
        active: true,
      },
    }),
  ]);

  console.log(`✓ ${services.length} hizmet tanımlandı.`);

  // 3. Müşteriler
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "Mehmet Özkan",
        phone: "+90 532 555 11 22",
        email: "mehmet.ozkan@gmail.com",
        notes: "Her zaman kısa yanlar, üstler uzun model tercih ediyor. Çay ikramı sever.",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Zeynep Aksoy",
        phone: "+90 533 444 22 33",
        email: "zeynep.aksoy@outlook.com",
        notes: "Alerjik saç derisi var, organik şampuan kullanılmalı.",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Emre Yıldırım",
        phone: "+90 535 333 44 55",
        email: "emre.yildirim@hotmail.com",
        notes: "Sakal düzeltme ve bıyık dizaynı her 2 haftada bir.",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Selin Çelik",
        phone: "+90 536 222 55 66",
        email: "selin.celik@gmail.com",
        notes: "Röfle ve tonlama müşterisi.",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Kemal Arslan",
        phone: "+90 537 111 66 77",
        email: "kemal.arslan@gmail.com",
        notes: "VIP paket düzenli randevu alır.",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Deniz Güler",
        phone: "+90 538 999 77 88",
        email: "deniz.guler@yahoo.com",
        notes: "Hızlı randevuları tercih ediyor.",
      },
    }),
  ]);

  console.log(`✓ ${customers.length} müşteri kaydı oluşturuldu.`);

  // 4. Randevular (Bugün, Dün, Yarın ve Önümüzdeki Günler)
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const yesterdayStr = format(subDays(today, 1), "yyyy-MM-dd");
  const tomorrowStr = format(addDays(today, 1), "yyyy-MM-dd");
  const inTwoDaysStr = format(addDays(today, 2), "yyyy-MM-dd");

  const appointmentData = [
    // Bugünkü Randevular
    {
      customerId: customers[0].id,
      staffId: staffMembers[0].id, // Ahmet
      serviceId: services[0].id, // Saç Kesimi
      appointmentDate: today,
      dateStr: todayStr,
      startTime: "10:00",
      endTime: "10:45",
      status: "COMPLETED",
      totalPrice: services[0].price,
      notes: "Zamanında geldi, çok memnun kaldı.",
    },
    {
      customerId: customers[1].id,
      staffId: staffMembers[1].id, // Elif
      serviceId: services[3].id, // Boya & Tonlama
      appointmentDate: today,
      dateStr: todayStr,
      startTime: "11:00",
      endTime: "12:30",
      status: "CONFIRMED",
      totalPrice: services[3].price,
      notes: "Küllü kumral tonlama yapılacak.",
    },
    {
      customerId: customers[2].id,
      staffId: staffMembers[2].id, // Can
      serviceId: services[1].id, // Sakal & Sıcak havlu
      appointmentDate: today,
      dateStr: todayStr,
      startTime: "13:30",
      endTime: "14:00",
      status: "CONFIRMED",
      totalPrice: services[1].price,
      notes: "Sıcak buhar ve sakal bakım yağı uygulanacak.",
    },
    {
      customerId: customers[4].id,
      staffId: staffMembers[0].id, // Ahmet
      serviceId: services[2].id, // VIP Saç Sakal
      appointmentDate: today,
      dateStr: todayStr,
      startTime: "15:00",
      endTime: "16:00",
      status: "PENDING",
      totalPrice: services[2].price,
      notes: "Müşteri online randevu aldı, onay bekleniyor.",
    },
    {
      customerId: customers[5].id,
      staffId: staffMembers[3].id, // Burak
      serviceId: services[5].id, // Çocuk Saç Kesimi
      appointmentDate: today,
      dateStr: todayStr,
      startTime: "16:30",
      endTime: "17:00",
      status: "PENDING",
      totalPrice: services[5].price,
      notes: "Oğlu Ali ile gelecek.",
    },

    // Dünkü Randevular (Finans istatistikleri için)
    {
      customerId: customers[3].id,
      staffId: staffMembers[1].id,
      serviceId: services[4].id, // Keratin
      appointmentDate: subDays(today, 1),
      dateStr: yesterdayStr,
      startTime: "14:00",
      endTime: "15:15",
      status: "COMPLETED",
      totalPrice: services[4].price,
      notes: "İşlem tamamlandı.",
    },
    {
      customerId: customers[0].id,
      staffId: staffMembers[0].id,
      serviceId: services[2].id, // VIP
      appointmentDate: subDays(today, 1),
      dateStr: yesterdayStr,
      startTime: "16:00",
      endTime: "17:00",
      status: "COMPLETED",
      totalPrice: services[2].price,
      notes: "Kredi kartı ile ödendi.",
    },

    // Yarınki Randevular
    {
      customerId: customers[4].id,
      staffId: staffMembers[2].id,
      serviceId: services[6].id, // Cilt Maskesi
      appointmentDate: addDays(today, 1),
      dateStr: tomorrowStr,
      startTime: "11:00",
      endTime: "11:30",
      status: "CONFIRMED",
      totalPrice: services[6].price,
      notes: "Maske sonrası bakım kremi uygulanacak.",
    },
    {
      customerId: customers[2].id,
      staffId: staffMembers[0].id,
      serviceId: services[0].id,
      appointmentDate: addDays(today, 1),
      dateStr: tomorrowStr,
      startTime: "14:30",
      endTime: "15:15",
      status: "CONFIRMED",
      totalPrice: services[0].price,
      notes: "",
    },

    // Gelecek Günler
    {
      customerId: customers[1].id,
      staffId: staffMembers[1].id,
      serviceId: services[4].id,
      appointmentDate: addDays(today, 2),
      dateStr: inTwoDaysStr,
      startTime: "10:30",
      endTime: "11:45",
      status: "CONFIRMED",
      totalPrice: services[4].price,
      notes: "Özel randevu.",
    },
  ];

  for (const app of appointmentData) {
    await prisma.appointment.create({ data: app });
  }

  console.log(`✓ ${appointmentData.length} örnek randevu başarıyla eklendi.`);
  console.log("✨ Tohumlama tamamlandı!");
}

main()
  .catch((e) => {
    console.error("Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
