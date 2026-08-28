import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["PENDING_APPROVAL", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Geçerli bir durum belirtiniz (PENDING_APPROVAL, APPROVED, REJECTED)." },
        { status: 400 }
      );
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error("Customer status PATCH error:", error);
    return NextResponse.json({ error: "Müşteri durumu güncellenemedi." }, { status: 500 });
  }
}
