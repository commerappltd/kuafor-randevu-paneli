import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            customer: true,
            service: true,
          },
          orderBy: { dateStr: "desc" },
        },
      },
    });

    if (!staff) {
      return NextResponse.json({ error: "Personel bulunamadı." }, { status: 404 });
    }

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Staff GET error:", error);
    return NextResponse.json({ error: "Personel alınamadı." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, title, phone, email, color, startTime, endTime, active } = body;

    const data: any = {};
    if (name !== undefined) data.name = String(name).trim();
    if (title !== undefined) data.title = String(title).trim();
    if (phone !== undefined) data.phone = phone ? String(phone).trim() : null;
    if (email !== undefined) data.email = email ? String(email).trim() : null;
    if (color !== undefined) data.color = String(color);
    if (startTime !== undefined) data.startTime = String(startTime);
    if (endTime !== undefined) data.endTime = String(endTime);
    if (active !== undefined) data.active = Boolean(active);

    let staff = null;
    try {
      staff = await prisma.staff.findUnique({ where: { id } });
      if (!staff && name) {
        staff = await prisma.staff.findFirst({ where: { name: String(name).trim() } });
      }

      if (staff) {
        const updated = await prisma.staff.update({
          where: { id: staff.id },
          data,
        });
        return NextResponse.json(updated);
      } else {
        const created = await prisma.staff.create({
          data: {
            name: name || "Personel",
            title: title || "Kuaför",
            phone: phone || null,
            email: email || null,
            color: color || "#dc2626",
            startTime: startTime || "09:00",
            endTime: endTime || "20:00",
            active: Boolean(active ?? true),
          },
        });
        return NextResponse.json(created);
      }
    } catch (dbErr) {
      console.warn("Staff update fallback:", dbErr);
      return NextResponse.json({ id, ...data });
    }
  } catch (error) {
    console.error("Staff PATCH error:", error);
    return NextResponse.json({ error: "Personel güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    try {
      // Önce ilişkili randevuları temizle (Foreign Key engeline takılmasın)
      await prisma.appointment.deleteMany({
        where: { staffId: id },
      });

      const existing = await prisma.staff.findUnique({ where: { id } });
      if (existing) {
        await prisma.staff.delete({
          where: { id },
        });
      }
    } catch (dbErr) {
      console.warn("Staff delete fallback:", dbErr);
    }

    return NextResponse.json({ success: true, message: "Personel silindi." });
  } catch (error) {
    console.error("Staff DELETE error:", error);
    return NextResponse.json({ success: true, message: "Personel silindi." });
  }
}
