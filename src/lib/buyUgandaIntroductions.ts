const STORAGE_KEY = "plu-bubu-introductions-v1";

export type BuyUgandaIntroduction = {
  id: string;
  reference: string;
  businessId: string;
  businessName: string;
  fullName: string;
  phone: string;
  district: string;
  message?: string;
  createdAt: string;
};

function newId() {
  return `bi-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createBubuReference(): string {
  return `BUBU-${Math.floor(10000 + Math.random() * 90000)}`;
}

export function loadBuyUgandaIntroductions(): BuyUgandaIntroduction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BuyUgandaIntroduction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBuyUgandaIntroduction(entry: BuyUgandaIntroduction) {
  const list = loadBuyUgandaIntroductions().filter((r) => r.id !== entry.id);
  list.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 40)));
}

export function buildIntroduction(
  data: Omit<BuyUgandaIntroduction, "id" | "reference" | "createdAt">
): BuyUgandaIntroduction {
  return {
    id: newId(),
    reference: createBubuReference(),
    createdAt: new Date().toISOString(),
    ...data,
  };
}

export function hasIntroductionForBusiness(businessId: string, phone: string): boolean {
  const normalized = phone.replace(/\D/g, "");
  return loadBuyUgandaIntroductions().some(
    (r) => r.businessId === businessId && r.phone.replace(/\D/g, "") === normalized
  );
}