import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            service: true,
            staff: true,
          },
          orderBy: { appointmentDate: "desc" },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Müşteri bulunamadı." }, { status: 404 });
    }

    const totalSpent = customer.appointments
      .filter((a) => a.status === "COMPLETED" || a.status === "CONFIRMED")
      .reduce((sum, a) => sum + a.totalPrice, 0);

    return NextResponse.json({
      ...customer,
      totalSpent,
      totalAppointments: customer.appointments.length,
    });
  } catch (error) {
    console.error("Customer GET error:", error);
    return NextResponse.json({ error: "Müşteri detayı alınamadı." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone, email, status, notes } = body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (status !== undefined) data.status = status;
    if (notes !== undefined) data.notes = notes;

    let customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer && phone) {
      customer = await prisma.customer.findUnique({ where: { phone } });
    }

    if (customer) {
      const updated = await prisma.customer.update({
        where: { id: customer.id },
        data,
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.customer.create({
        data: {
          name: name || "Müşteri",
          phone: phone || "05000000000",
          email: email || null,
          status: status || "APPROVED",
          notes: notes || null,
        },
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error("Customer PATCH error:", error);
    return NextResponse.json({ error: "Müşteri güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (existing) {
      await prisma.customer.delete({
        where: { id },
      });
    }

    return NextResponse.json({ success: true, message: "Müşteri silindi." });
  } catch (error) {
    console.error("Customer DELETE error:", error);
    return NextResponse.json({ error: "Müşteri silinemedi." }, { status: 500 });
  }
}
