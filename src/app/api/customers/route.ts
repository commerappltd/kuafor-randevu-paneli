import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        appointments: {
          include: {
            service: true,
            staff: true,
          },
          orderBy: { dateStr: "desc" },
        },
      },
      orderBy: { name: "asc" },
    });

    // Her müşterinin toplam harcamasını ve randevu sayısını hesaplayalım
    const enrichedCustomers = customers.map((c) => {
      const totalSpent = c.appointments
        .filter((a) => a.status === "COMPLETED" || a.status === "CONFIRMED")
        .reduce((sum, a) => sum + a.totalPrice, 0);

      return {
        ...c,
        totalSpent,
        totalAppointments: c.appointments.length,
      };
    });

    return NextResponse.json(enrichedCustomers);
  } catch (error) {
    console.error("Customers GET error:", error);
    return NextResponse.json({ error: "Müşteriler alınamadı." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, notes } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "İsim ve telefon zorunludur." }, { status: 400 });
    }

    const existing = await prisma.customer.findUnique({
      where: { phone },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu telefon numarasına ait bir müşteri zaten kayıtlı." },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email: email || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Customer create error:", error);
    return NextResponse.json({ error: "Müşteri oluşturulamadı." }, { status: 500 });
  }
}
