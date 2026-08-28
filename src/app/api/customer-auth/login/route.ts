import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "Lütfen telefon numaranızı giriniz." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim();

    // Müşteriyi bul
    const customer = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Bu telefon numarasıyla kayıtlı bir müşteri bulunamadı. Lütfen önce kayıt olunuz." },
        { status: 404 }
      );
    }

    // Şifre kontrolü (eğer şifre varsa)
    if (customer.password && password && customer.password !== password) {
      return NextResponse.json(
        { error: "Hatalı şifre girdiniz. Lütfen tekrar deneyiniz." },
        { status: 401 }
      );
    }

    // Onay durumu kontrolü
    if (customer.status === "PENDING_APPROVAL") {
      return NextResponse.json(
        {
          error: "Hesabınız henüz Kuaför Ali Karayel salon yöneticisi tarafından onaylanmadı. Onaylandığında giriş yapabileceksiniz.",
          status: "PENDING_APPROVAL",
          customer: {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            status: customer.status,
          },
        },
        { status: 403 }
      );
    }

    if (customer.status === "REJECTED") {
      return NextResponse.json(
        {
          error: "Hesap başvurunuz onaylanmadı. Detaylı bilgi için lütfen salonumuzla iletişime geçiniz.",
          status: "REJECTED",
        },
        { status: 403 }
      );
    }

    // Başarılı Giriş (APPROVED)
    return NextResponse.json({
      message: "Giriş başarılı.",
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        status: customer.status,
      },
    });
  } catch (error) {
    console.error("Customer login error:", error);
    return NextResponse.json(
      { error: "Giriş yapılırken bir sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
