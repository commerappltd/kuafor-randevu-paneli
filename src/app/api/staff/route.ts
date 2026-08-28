import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_BARBER_STAFF = [
  {
    name: "Ali Karayel",
    title: "Kurucu & Master Stilist",
    phone: "+90 532 100 20 30",
    email: "ali@kuaforalikarayel.com",
    color: "#dc2626",
    startTime: "09:00",
    endTime: "20:00",
    active: true,
  },
  {
    name: "Emre Yıldız",
    title: "Kıdemli Saç Tasarımcısı",
    phone: "+90 533 200 30 40",
    email: "emre@kuaforalikarayel.com",
    color: "#2563eb",
    startTime: "09:30",
    endTime: "19:30",
    active: true,
  },
  {
    name: "Can Demir",
    title: "Sakal & Cilt Bakım Uzmanı",
    phone: "+90 535 300 40 50",
    email: "can@kuaforalikarayel.com",
    color: "#059669",
    startTime: "10:00",
    endTime: "20:00",
    active: true,
  },
  {
    name: "Burak Şahin",
    title: "Renklendirme & Keratin Uzmanı",
    phone: "+90 536 400 50 60",
    email: "burak@kuaforalikarayel.com",
    color: "#d97706",
    startTime: "09:00",
    endTime: "18:30",
    active: true,
  },
];

let inMemoryStaff: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly");

    const where: any = {};
    if (activeOnly === "true") {
      where.active = true;
    }

    let staffList: any[] = [];
    try {
      staffList = await prisma.staff.findMany({
        where,
        include: {
          _count: {
            select: { appointments: true },
          },
        },
        orderBy: { name: "asc" },
      });
    } catch (e) {
      console.warn("Staff findMany fallback:", e);
    }

    if (staffList.length === 0) {
      try {
        for (const item of DEFAULT_BARBER_STAFF) {
          await prisma.staff.create({ data: item });
        }
        staffList = await prisma.staff.findMany({
          where,
          include: {
            _count: {
              select: { appointments: true },
            },
          },
          orderBy: { name: "asc" },
        });
      } catch {
        // In-memory fallback
      }
    }

    if (staffList.length === 0) {
      staffList = DEFAULT_BARBER_STAFF.map((s, i) => ({
        id: `st-${i + 1}`,
        ...s,
        _count: { appointments: 0 },
      }));
    }

    for (const memStaff of inMemoryStaff) {
      if (!staffList.some((s) => s.id === memStaff.id || s.name === memStaff.name)) {
        staffList.push(memStaff);
      }
    }

    return NextResponse.json(staffList);
  } catch (error) {
    console.error("Staff GET error:", error);
    return NextResponse.json(
      DEFAULT_BARBER_STAFF.map((s, i) => ({
        id: `st-${i + 1}`,
        ...s,
        _count: { appointments: 0 },
      }))
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, title, phone, email, color = "#dc2626", startTime = "09:00", endTime = "20:00", active = true } = body;

    if (!name || !title) {
      return NextResponse.json({ error: "Lütfen isim ve unvan alanlarını doldurunuz." }, { status: 400 });
    }

    const cleanStaff = {
      name: String(name).trim(),
      title: String(title).trim(),
      phone: phone ? String(phone).trim() : null,
      email: email ? String(email).trim() : null,
      color: String(color),
      startTime: String(startTime),
      endTime: String(endTime),
      active: Boolean(active),
    };

    let createdStaff: any = null;
    try {
      createdStaff = await prisma.staff.create({
        data: cleanStaff,
      });
    } catch (prismaErr) {
      console.warn("Prisma staff create fallback:", prismaErr);
      createdStaff = {
        id: `st-${Date.now()}`,
        ...cleanStaff,
        _count: { appointments: 0 },
      };
    }

    if (createdStaff) {
      inMemoryStaff.push(createdStaff);
      return NextResponse.json(createdStaff, { status: 201 });
    }

    return NextResponse.json(
      { id: `st-${Date.now()}`, ...cleanStaff, _count: { appointments: 0 } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Staff create error:", error);
    return NextResponse.json({ error: "Personel oluşturulamadı." }, { status: 500 });
  }
}
