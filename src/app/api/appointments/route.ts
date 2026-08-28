import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateEndTime, isTimeOverlapping } from "@/lib/utils";
import { parseISO } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const staffId = searchParams.get("staffId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};

    if (date) {
      where.dateStr = date;
    } else if (startDate && endDate) {
      where.dateStr = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (staffId && staffId !== "ALL") {
      where.staffId = staffId;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.customer = {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
        ],
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        staff: true,
        service: true,
      },
      orderBy: [
        { dateStr: "asc" },
        { startTime: "asc" },
      ],
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Appointments fetch error:", error);
    return NextResponse.json({ error: "Randevular alınamadı" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      staffId,
      serviceId,
      dateStr,
      startTime,
      notes,
      status = "CONFIRMED",
    } = body;

    if (!staffId || !serviceId || !dateStr || !startTime) {
      return NextResponse.json(
        { error: "Lütfen personel, hizmet, tarih ve saat alanlarını eksiksiz doldurun." },
        { status: 400 }
      );
    }

    // 1. Hizmet bilgisini al ve süreyi hesapla
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: "Seçilen hizmet bulunamadı." }, { status: 404 });
    }

    const endTime = calculateEndTime(startTime, service.durationMinutes);

    // 2. Çakışma kontrolü (Seçilen personelin bu saat aralığında başka aktif randevusu var mı?)
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        staffId,
        dateStr,
        status: {
          not: "CANCELLED",
        },
      },
    });

    const hasConflict = existingAppointments.some((app) =>
      isTimeOverlapping(startTime, endTime, app.startTime, app.endTime)
    );

    if (hasConflict) {
      return NextResponse.json(
        {
          error: "Seçilen saat diliminde personelin başka bir randevusu bulunmaktadır. Lütfen başka bir saat seçin.",
          conflict: true,
        },
        { status: 409 }
      );
    }

    // 3. Müşteriyi bul veya oluştur
    let finalCustomerId = customerId;
    if (!finalCustomerId) {
      if (!customerName || !customerPhone) {
        return NextResponse.json(
          { error: "Müşteri adı ve telefon numarası zorunludur." },
          { status: 400 }
        );
      }

      // Telefon numarasına göre kontrol et
      let existingCustomer = await prisma.customer.findUnique({
        where: { phone: customerPhone },
      });

      if (!existingCustomer) {
        existingCustomer = await prisma.customer.create({
          data: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail || null,
          },
        });
      }
      finalCustomerId = existingCustomer.id;
    }

    // 4. Randevuyu oluştur
    const appointmentDate = parseISO(`${dateStr}T${startTime}:00`);

    const appointment = await prisma.appointment.create({
      data: {
        customerId: finalCustomerId,
        staffId,
        serviceId,
        appointmentDate,
        dateStr,
        startTime,
        endTime,
        status,
        totalPrice: service.price,
        notes: notes || null,
      },
      include: {
        customer: true,
        staff: true,
        service: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Appointment creation error:", error);
    return NextResponse.json({ error: "Randevu oluşturulamadı." }, { status: 500 });
  }
}
