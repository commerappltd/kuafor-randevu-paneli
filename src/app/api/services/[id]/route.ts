import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        appointments: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Hizmet bulunamadı." }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Service GET error:", error);
    return NextResponse.json({ error: "Hizmet alınamadı." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, category, durationMinutes, price, description, active } = body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (category !== undefined) data.category = category;
    if (durationMinutes !== undefined) data.durationMinutes = Number(durationMinutes);
    if (price !== undefined) data.price = Number(price);
    if (description !== undefined) data.description = description;
    if (active !== undefined) data.active = Boolean(active);

    const updated = await prisma.service.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Service PATCH error:", error);
    return NextResponse.json({ error: "Hizmet güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Hizmet silindi." });
  } catch (error) {
    console.error("Service DELETE error:", error);
    return NextResponse.json({ error: "Hizmet silinemedi." }, { status: 500 });
  }
}
