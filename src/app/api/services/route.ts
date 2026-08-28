import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_BARBER_SERVICES = [
  {
    name: "Klasik Saç Kesimi & Yıkama",
    category: "Saç Kesimi",
    durationMinutes: 35,
    price: 450,
    description: "Kişiye özel saç kesimi, argan yağlı yıkama, ferahlatıcı saç masajı ve wax/fön şekillendirme.",
    active: true,
  },
  {
    name: "Sakal Tıraşı & Sakal Tasarımı",
    category: "Sakal & Bakım",
    durationMinutes: 25,
    price: 250,
    description: "Geleneksel ustura veya makine ile sakal şekillendirme, sıcak buhar havlusu ve sakal bakım yağı.",
    active: true,
  },
  {
    name: "Saç + Sakal Kombin Bakım Paketi",
    category: "Kombin Paket",
    durationMinutes: 50,
    price: 600,
    description: "En çok tercih edilen! Detaylı saç kesimi, sakal dizaynı, saç yıkama, sıcak havlu kompresi ve tonik.",
    active: true,
  },
  {
    name: "VIP Saç & Sakal + Cilt Maskesi (Full Bakım)",
    category: "Kombin Paket",
    durationMinutes: 65,
    price: 850,
    description: "Komple saç-sakal kesimi, gözenek açıcı buhar, siyah nokta/kil maskesi ve ferahlatıcı ense masajı.",
    active: true,
  },
  {
    name: "Damat & Özel Gün VIP Bakım Paketi",
    category: "Özel Paket",
    durationMinutes: 90,
    price: 1500,
    description: "Özel gün seansı: Saç kesimi, sakal tasarımı, medikal cilt bakımı, saç botoksu, el bakımı ve styling.",
    active: true,
  },
  {
    name: "Saç Boyama & Beyaz Kapatma",
    category: "Renklendirme",
    durationMinutes: 45,
    price: 750,
    description: "Doğal tonlarda saç veya sakal renk kırıcı/beyaz kapatıcı profesyonel boya uygulaması.",
    active: true,
  },
  {
    name: "Keratin & Saç Botoksu (Düzleştirme)",
    category: "Özel Bakım & Spa",
    durationMinutes: 60,
    price: 950,
    description: "Yıpranmış saçlar için yoğun keratin yüklemesi, elektriklenme önleyici pürüzsüzleştirme.",
    active: true,
  },
  {
    name: "Saç Yıkama & Profesyonel Fön",
    category: "Saç Kesimi",
    durationMinutes: 20,
    price: 200,
    description: "Canlandırıcı şampuan ve saç kremi uygulaması sonrası gün boyu kalıcı profesyonel fön.",
    active: true,
  },
  {
    name: "Yüz Ağdası & Kaş Dizaynı",
    category: "Sakal & Bakım",
    durationMinutes: 15,
    price: 150,
    description: "Kulak, burun ağdası, elmacık kemiği ağdası ve ip/cımbızla kaş toparlama işlemi.",
    active: true,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const activeOnly = searchParams.get("activeOnly");

    const where: any = {};
    if (category && category !== "ALL") {
      where.category = category;
    }
    if (activeOnly === "true") {
      where.active = true;
    }

    let services = await prisma.service.findMany({
      where,
      orderBy: [{ price: "asc" }],
    });

    // Eğer veritabanı boşsa otomatik olarak varsayılan hizmetleri ekle
    if (services.length === 0 && (!category || category === "ALL")) {
      for (const item of DEFAULT_BARBER_SERVICES) {
        await prisma.service.create({ data: item });
      }
      services = await prisma.service.findMany({
        where,
        orderBy: [{ price: "asc" }],
      });
    }

    return NextResponse.json(services);
  } catch (error) {
    console.error("Services GET error:", error);
    return NextResponse.json(
      DEFAULT_BARBER_SERVICES.map((s, i) => ({ id: `srv-default-${i}`, ...s }))
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, durationMinutes, price, description, active = true } = body;

    if (!name || !category || !durationMinutes || price === undefined) {
      return NextResponse.json({ error: "Tüm zorunlu alanları doldurunuz." }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        category,
        durationMinutes: Number(durationMinutes),
        price: Number(price),
        description: description || null,
        active: Boolean(active),
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Service create error:", error);
    return NextResponse.json({ error: "Hizmet oluşturulamadı." }, { status: 500 });
  }
}
