import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly");

    const where: any = {};
    if (activeOnly === "true") {
      where.active = true;
    }

    const staffList = await prisma.staff.findMany({
      where,
      include: {
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(staffList);
  } catch (error) {
    console.error("Staff GET error:", error);
    return NextResponse.json({ error: "Personel listesi alınamadı." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, title, phone, email, color = "#3b82f6", startTime = "09:00", endTime = "19:00", active = true } = body;

    if (!name || !title) {
      return NextResponse.json({ error: "İsim ve unvan zorunludur." }, { status: 400 });
    }

    const staff = await prisma.staff.create({
      data: {
        name,
        title,
        phone: phone || null,
        email: email || null,
        color,
        startTime,
        endTime,
        active: Boolean(active),
      },
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error("Staff create error:", error);
    return NextResponse.json({ error: "Personel oluşturulamadı." }, { status: 500 });
  }
}
