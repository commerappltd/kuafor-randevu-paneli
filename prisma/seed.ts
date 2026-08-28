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

  // 1. Personeller (Kuaför Ali Karayel Ekibi)
  const staffMembers = await Promise.all([
    prisma.staff.create({
      data: {
        name: "Ali Karayel",
        title: "Kurucu & Master Stilist",
        phone: "+90 532 100 20 30",
        email: "ali@kuaforalikarayel.com",
        color: "#dc2626", // Yakut Kırmızısı
        startTime: "09:00",
        endTime: "20:00",
        active: true,
      },
    }),
    prisma.staff.create({
      data: {
        name: "Emre Yıldız",
        title: "Kıdemli Saç Tasarımcısı",
        phone: "+90 533 200 30 40",
        email: "emre@kuaforalikarayel.com",
        color: "#2563eb", // Safir Mavisi
        startTime: "09:30",
        endTime: "19:30",
        active: true,
      },
    }),
    prisma.staff.create({
      data: {
        name: "Can Demir",
        title: "Sakal & Cilt Bakım Uzmanı",
        phone: "+90 535 300 40 50",
        email: "can@kuaforalikarayel.com",
        color: "#059669", // Zümrüt Yeşili
        startTime: "10:00",
        endTime: "20:00",
        active: true,
      },
    }),
    prisma.staff.create({
      data: {
        name: "Burak Şahin",
        title: "Renklendirme & Keratin Uzmanı",
        phone: "+90 536 400 50 60",
        email: "burak@kuaforalikarayel.com",
        color: "#d97706", // Amber
        startTime: "09:00",
        endTime: "18:30",
        active: true,
      },
    }),
  ]);

  console.log(`✓ ${staffMembers.length} personel oluşturuldu.`);

  // 2. Kuaför Hizmetleri (Saç, Sakal, Saç-Sakal Kombin, VIP)
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "Klasik Saç Kesimi & Yıkama",
        category: "Saç Kesimi",
        durationMinutes: 35,
        price: 450,
        description: "Kişiye özel saç kesimi, argan yağlı yıkama, ferahlatıcı saç masajı ve wax/fön şekillendirme.",
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Sakal Tıraşı & Sakal Tasarımı",
        category: "Sakal & Bakım",
        durationMinutes: 25,
        price: 250,
        description: "Geleneksel ustura veya makine ile sakal şekillendirme, sıcak buhar havlusu ve sakal bakım yağı.",
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Saç + Sakal Kombin Bakım Paketi",
        category: "Kombin Paket",
        durationMinutes: 50,
        price: 600,
        description: "En çok tercih edilen! Detaylı saç kesimi, sakal dizaynı, saç yıkama, sıcak havlu kompresi ve tonik.",
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "VIP Saç & Sakal + Cilt Maskesi (Full Bakım)",
        category: "Kombin Paket",
        durationMinutes: 65,
        price: 850,
        description: "Komple saç-sakal kesimi, gözenek açıcı buhar, siyah nokta/kil maskesi ve ferahlatıcı ense masajı.",
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Damat & Özel Gün VIP Bakım Paketi",
        category: "Özel Paket",
        durationMinutes: 90,
        price: 1500,
        description: "Özel gün seansı: Saç kesimi, sakal tasarımı, medikal cilt bakımı, saç botoksu, el bakımı ve styling.",
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Saç Boyama & Beyaz Kapatma",
        category: "Renklendirme",
        durationMinutes: 45,
        price: 750,
        description: "Doğal tonlarda saç veya sakal renk kırıcı/beyaz kapatıcı profesyonel boya uygulaması.",
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Keratin & Saç Botoksu (Düzleştirme)",
        category: "Özel Bakım & Spa",
        durationMinutes: 60,
        price: 950,
        description: "Yıpranmış saçlar için yoğun keratin yüklemesi, elektriklenme önleyici pürüzsüzleştirme.",
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Saç Yıkama & Profesyonel Fön",
        category: "Saç Kesimi",
        durationMinutes: 20,
        price: 200,
        description: "Canlandırıcı şampuan ve saç kremi uygulaması sonrası gün boyu kalıcı profesyonel fön.",
        active: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Yüz Ağdası & Kaş Dizaynı",
        category: "Sakal & Bakım",
        durationMinutes: 15,
        price: 150,
        description: "Kulak, burun ağdası, elmacık kemiği ağdası ve ip/cımbızla kaş toparlama işlemi.",
        active: true,
      },
    }),
  ]);

  console.log(`✓ ${services.length} hizmet tanımlandı.`);

  // 3. Örnek Müşteriler
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "Mehmet Özkan",
        phone: "0532 111 22 33",
        email: "mehmet.ozkan@gmail.com",
        notes: "Saçlar yanlar 2 numara, üstler makas. Kahve ikramı: Sade.",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Serkan Aydın",
        phone: "0533 444 55 66",
        email: "serkan.aydin@hotmail.com",
        notes: "Sakal şekillendirme sivri çene stili.",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Volkan Çelik",
        phone: "0535 777 88 99",
        email: "volkan.celik@gmail.com",
        notes: "VIP Kombin müşterisi. Cilt hassas, özel tonik kullanılır.",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Emre Koç",
        phone: "0536 999 00 11",
        email: "emre.koc@yahoo.com",
        notes: "Haftalık fön ve ense düzeltme müdavimi.",
      },
    }),
  ]);

  console.log(`✓ ${customers.length} müşteri kaydı oluşturuldu.`);

  // 4. Örnek Randevular (Bugün ve Hafta)
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const yesterdayStr = format(subDays(new Date(), 1), "yyyy-MM-dd");
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");

  await prisma.appointment.createMany({
    data: [
      {
        customerId: customers[0].id,
        staffId: staffMembers[0].id,
        serviceId: services[2].id, // Saç + Sakal Kombin
        appointmentDate: new Date(`${todayStr}T10:00:00`),
        dateStr: todayStr,
        startTime: "10:00",
        endTime: "10:50",
        status: "CONFIRMED",
        totalPrice: 600,
        notes: "Kombin paket, kahve rica etti.",
      },
      {
        customerId: customers[1].id,
        staffId: staffMembers[1].id,
        serviceId: services[0].id, // Saç Kesimi
        appointmentDate: new Date(`${todayStr}T11:30:00`),
        dateStr: todayStr,
        startTime: "11:30",
        endTime: "12:05",
        status: "COMPLETED",
        totalPrice: 450,
      },
      {
        customerId: customers[2].id,
        staffId: staffMembers[2].id,
        serviceId: services[3].id, // VIP Full Bakım
        appointmentDate: new Date(`${todayStr}T14:00:00`),
        dateStr: todayStr,
        startTime: "14:00",
        endTime: "15:05",
        status: "CONFIRMED",
        totalPrice: 850,
      },
      {
        customerId: customers[3].id,
        staffId: staffMembers[0].id,
        serviceId: services[1].id, // Sakal
        appointmentDate: new Date(`${todayStr}T16:00:00`),
        dateStr: todayStr,
        startTime: "16:00",
        endTime: "16:25",
        status: "PENDING",
        totalPrice: 250,
      },
      {
        customerId: customers[0].id,
        staffId: staffMembers[0].id,
        serviceId: services[2].id,
        appointmentDate: new Date(`${tomorrowStr}T11:00:00`),
        dateStr: tomorrowStr,
        startTime: "11:00",
        endTime: "11:50",
        status: "CONFIRMED",
        totalPrice: 600,
      },
      {
        customerId: customers[1].id,
        staffId: staffMembers[1].id,
        serviceId: services[0].id,
        appointmentDate: new Date(`${yesterdayStr}T15:00:00`),
        dateStr: yesterdayStr,
        startTime: "15:00",
        endTime: "15:35",
        status: "COMPLETED",
        totalPrice: 450,
      },
    ],
  });

  console.log("✨ Tohumlama tamamlandı!");
}

main()
  .catch((e) => {
    console.error("Tohumlama hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
