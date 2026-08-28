export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  appointments?: Appointment[];
  _count?: {
    appointments: number;
  };
}

export interface Staff {
  id: string;
  name: string;
  title: string;
  phone?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  color: string;
  startTime: string;
  endTime: string;
  active: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  appointments?: Appointment[];
}

export interface Service {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  description?: string | null;
  active: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface Appointment {
  id: string;
  customerId: string;
  customer: Customer;
  staffId: string;
  staff: Staff;
  serviceId: string;
  service: Service;
  appointmentDate: string | Date;
  dateStr: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  totalPrice: number;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DashboardStats {
  todayAppointmentsCount: number;
  pendingApprovalsCount: number;
  todayRevenue: number;
  activeStaffCount: number;
  weeklyRevenueChart: {
    day: string;
    fullDate: string;
    revenue: number;
    appointments: number;
  }[];
  popularServices: {
    name: string;
    count: number;
    revenue: number;
  }[];
  todayAppointments: Appointment[];
}
