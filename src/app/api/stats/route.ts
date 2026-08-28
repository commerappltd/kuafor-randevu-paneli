import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format, subDays, startOfDay, endOfDay, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

export async function GET() {
  try {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");

    // Bugünün randevuları
    const todayAppointments = await prisma.appointment.findMany({
      where: {
        dateStr: todayStr,
      },
      include: {
        customer: true,
        staff: true,
        service: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Bekleyen onaylar (tüm günlerden)
    const pendingApprovalsCount = await prisma.appointment.count({
      where: {
        status: "PENDING",
      },
    });

    // Aktif personel sayısı
    const activeStaffCount = await prisma.staff.count({
      where: {
        active: true,
      },
    });

    // Bugünün cirosu (Tamamlanan + Onaylanan)
    const todayRevenue = todayAppointments
      .filter((a) => a.status === "COMPLETED" || a.status === "CONFIRMED")
      .reduce((sum, a) => sum + a.totalPrice, 0);

    // Son 7 günün randevu ve ciro grafiği
    const weeklyRevenueChart = [];
    for (let i = 6; i >= 0; i--) {
      const dayDate = subDays(today, i);
      const dayStr = format(dayDate, "yyyy-MM-dd");
      const dayName = format(dayDate, "EEEE", { locale: tr });
      const shortDay = format(dayDate, "EEE", { locale: tr });

      const dayAppointments = await prisma.appointment.findMany({
        where: {
          dateStr: dayStr,
        },
      });

      const dayRevenue = dayAppointments
        .filter((a) => a.status === "COMPLETED" || a.status === "CONFIRMED")
        .reduce((sum, a) => sum + a.totalPrice, 0);

      weeklyRevenueChart.push({
        day: shortDay,
        fullDate: dayName,
        revenue: dayRevenue,
        appointments: dayAppointments.length,
      });
    }

    // Popüler hizmetler
    const allAppointments = await prisma.appointment.findMany({
      include: {
        service: true,
      },
    });

    const serviceStatsMap: { [key: string]: { name: string; count: number; revenue: number } } = {};
    for (const app of allAppointments) {
      const sName = app.service.name;
      if (!serviceStatsMap[sName]) {
        serviceStatsMap[sName] = { name: sName, count: 0, revenue: 0 };
      }
      serviceStatsMap[sName].count += 1;
      if (app.status === "COMPLETED" || app.status === "CONFIRMED") {
        serviceStatsMap[sName].revenue += app.totalPrice;
      }
    }

    const popularServices = Object.values(serviceStatsMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      todayAppointmentsCount: todayAppointments.length,
      pendingApprovalsCount,
      todayRevenue,
      activeStaffCount,
      weeklyRevenueChart,
      popularServices,
      todayAppointments,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "İstatistikler alınamadı" }, { status: 500 });
  }
}
