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
    if (name !== undefined) data.name = name;
    if (title !== undefined) data.title = title;
    if (phone !== undefined) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (color !== undefined) data.color = color;
    if (startTime !== undefined) data.startTime = startTime;
    if (endTime !== undefined) data.endTime = endTime;
    if (active !== undefined) data.active = Boolean(active);

    const updated = await prisma.staff.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Staff PATCH error:", error);
    return NextResponse.json({ error: "Personel güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.staff.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Personel silindi." });
  } catch (error) {
    console.error("Staff DELETE error:", error);
    return NextResponse.json({ error: "Personel silinemedi." }, { status: 500 });
  }
}
