import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, password } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Ad Soyad ve Telefon numarası zorunludur." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();

    const existing = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu telefon numarasıyla daha önce kayıt olunmuş." },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        email: email ? email.trim() : null,
        password: password || "123456",
        status: "PENDING_APPROVAL", // Yeni mobil kayıtlar mutlaka onaya düşer!
        notes: "Mobil uygulama üzerinden kayıt oldu.",
      },
    });

    return NextResponse.json(
      {
        message: "Kayıt talebiniz başarıyla alındı. Yönetici onayının ardından hesabınız aktif edilecektir.",
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          status: customer.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Customer register error:", error);
    return NextResponse.json(
      { error: "Kayıt işlemi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
