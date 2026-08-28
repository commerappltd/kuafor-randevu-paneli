import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateEndTime, isTimeOverlapping } from "@/lib/utils";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: true,
        staff: true,
        service: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Randevu bulunamadı." }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Appointment get error:", error);
    return NextResponse.json({ error: "Randevu bilgisi alınamadı." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, startTime, staffId, serviceId, dateStr, notes } = body;

    const currentAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: { service: true },
    });

    if (!currentAppointment) {
      return NextResponse.json({ error: "Randevu bulunamadı." }, { status: 404 });
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Eğer tarih, saat, personel veya hizmet değiştiyse çakışma ve süre kontrolü yap
    const targetStaffId = staffId || currentAppointment.staffId;
    const targetDateStr = dateStr || currentAppointment.dateStr;
    const targetStartTime = startTime || currentAppointment.startTime;
    const targetServiceId = serviceId || currentAppointment.serviceId;

    if (startTime || staffId || serviceId || dateStr) {
      let durationMinutes = currentAppointment.service.durationMinutes;
      let price = currentAppointment.totalPrice;

      if (serviceId && serviceId !== currentAppointment.serviceId) {
        const newService = await prisma.service.findUnique({ where: { id: serviceId } });
        if (newService) {
          durationMinutes = newService.durationMinutes;
          price = newService.price;
          updateData.serviceId = serviceId;
          updateData.totalPrice = price;
        }
      }

      const calculatedEndTime = calculateEndTime(targetStartTime, durationMinutes);

      // Çakışma kontrolü (kendi randevusu hariç)
      const existingAppointments = await prisma.appointment.findMany({
        where: {
          staffId: targetStaffId,
          dateStr: targetDateStr,
          id: { not: id },
          status: { not: "CANCELLED" },
        },
      });

      const hasConflict = existingAppointments.some((app) =>
        isTimeOverlapping(targetStartTime, calculatedEndTime, app.startTime, app.endTime)
      );

      if (hasConflict) {
        return NextResponse.json(
          {
            error: "Güncellenen saat diliminde personelin başka bir randevusu bulunmaktadır.",
            conflict: true,
          },
          { status: 409 }
        );
      }

      updateData.staffId = targetStaffId;
      updateData.dateStr = targetDateStr;
      updateData.startTime = targetStartTime;
      updateData.endTime = calculatedEndTime;
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        staff: true,
        service: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Appointment update error:", error);
    return NextResponse.json({ error: "Randevu güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Randevu başarıyla silindi." });
  } catch (error) {
    console.error("Appointment delete error:", error);
    return NextResponse.json({ error: "Randevu silinemedi." }, { status: 500 });
  }
}
