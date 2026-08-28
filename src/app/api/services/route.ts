import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const services = await prisma.service.findMany({
      where,
      orderBy: [{ category: "asc" }, { price: "asc" }],
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Services GET error:", error);
    return NextResponse.json({ error: "Hizmetler yüklenemedi." }, { status: 500 });
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
