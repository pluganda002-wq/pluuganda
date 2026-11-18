const STORAGE_KEY = "plu-tourism-bookings-v1";

export type TourismBookingBase = {
  id: string;
  reference: string;
  kind: "package" | "enquiry";
  fullName: string;
  phone: string;
  district: string;
  createdAt: string;
};

export type TourismPackageBooking = TourismBookingBase & {
  kind: "package";
  packageId: string;
  packageTitle: string;
  departLabel?: string;
  travellers: number;
  notes?: string;
};

export type TourismEnquiryBooking = TourismBookingBase & {
  kind: "enquiry";
  theme: string;
  travellerType: string;
  preferredDates: string;
  travellers: number;
  notes?: string;
};

export type TourismBooking = TourismPackageBooking | TourismEnquiryBooking;

function newId() {
  return `tb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createTourismReference(): string {
  return `TRV-${Math.floor(10000 + Math.random() * 90000)}`;
}

export function loadTourismBookings(): TourismBooking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TourismBooking[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTourismBooking(entry: TourismBooking) {
  const list = loadTourismBookings().filter((r) => r.id !== entry.id);
  list.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
}

export function buildPackageBooking(
  data: Omit<TourismPackageBooking, "id" | "reference" | "createdAt" | "kind">
): TourismPackageBooking {
  return {
    kind: "package",
    id: newId(),
    reference: createTourismReference(),
    createdAt: new Date().toISOString(),
    ...data,
  };
}

export function buildEnquiryBooking(
  data: Omit<TourismEnquiryBooking, "id" | "reference" | "createdAt" | "kind">
): TourismEnquiryBooking {
  return {
    kind: "enquiry",
    id: newId(),
    reference: createTourismReference(),
    createdAt: new Date().toISOString(),
    ...data,
  };
}

export function countPackageBookings(packageId: string): number {
  return loadTourismBookings().filter((r) => r.kind === "package" && r.packageId === packageId).length;
}

export function isRegisteredForPackage(packageId: string, phone: string): boolean {
  const normalized = phone.replace(/\D/g, "");
  return loadTourismBookings().some(
    (r) =>
      r.kind === "package" &&
      r.packageId === packageId &&
      r.phone.replace(/\D/g, "") === normalized
  );
}