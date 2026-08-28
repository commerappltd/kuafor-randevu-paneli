import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateEndTime, isTimeOverlapping, timeToMinutes, minutesToTime } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");
    const staffId = searchParams.get("staffId");

    if (!dateStr || !serviceId) {
      return NextResponse.json(
        { error: "Tarih ve Hizmet seçimi zorunludur." },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: "Hizmet bulunamadı." }, { status: 404 });
    }

    // Personelleri getir
    const staffWhere: any = { active: true };
    if (staffId && staffId !== "ANY") {
      staffWhere.id = staffId;
    }

    const staffList = await prisma.staff.findMany({
      where: staffWhere,
      include: {
        appointments: {
          where: {
            dateStr,
            status: { not: "CANCELLED" },
          },
        },
      },
    });

    if (staffList.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    // 09:00 ile 20:00 arasında 30 dakikalık dilimler oluştur
    const startOfDayMin = 9 * 60; // 09:00
    const endOfDayMin = 20 * 60; // 20:00
    const stepMin = 30; // 30 dakikalık periyotlar

    const slots: {
      time: string;
      available: boolean;
      availableStaffIds: string[];
    }[] = [];

    for (let current = startOfDayMin; current + service.durationMinutes <= endOfDayMin; current += stepMin) {
      const slotStartTime = minutesToTime(current);
      const slotEndTime = calculateEndTime(slotStartTime, service.durationMinutes);

      // Bu dilimde müsait olan personelleri bul
      const availableStaff = staffList.filter((staff) => {
        const staffStart = timeToMinutes(staff.startTime || "09:00");
        const staffEnd = timeToMinutes(staff.endTime || "19:00");

        // Personelin çalışma saatleri içinde mi?
        if (current < staffStart || timeToMinutes(slotEndTime) > staffEnd) {
          return false;
        }

        // Personelin çakışan randevusu var mı?
        const hasConflict = staff.appointments.some((app) =>
          isTimeOverlapping(slotStartTime, slotEndTime, app.startTime, app.endTime)
        );

        return !hasConflict;
      });

      slots.push({
        time: slotStartTime,
        available: availableStaff.length > 0,
        availableStaffIds: availableStaff.map((s) => s.id),
      });
    }

    return NextResponse.json({
      service,
      durationMinutes: service.durationMinutes,
      slots,
    });
  } catch (error) {
    console.error("Availability GET error:", error);
    return NextResponse.json({ error: "Müsaitlik bilgisi alınamadı." }, { status: 500 });
  }
}
