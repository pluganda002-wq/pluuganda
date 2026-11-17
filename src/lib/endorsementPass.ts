export type EndorsementReceipt = {
  reference: string;
  fullName: string;
  district: string;
  recordedAt: string;
  status: string;
};

export const ENDORSEMENT_RECEIPT_KEY = "plu-bot-endorsement-receipt-v1";
const ENDORSEMENT_NINS_KEY = "plu-bot-endorsement-nins-v1";

function loadSubmittedNins(): Set<string> {
  try {
    const raw = localStorage.getItem(ENDORSEMENT_NINS_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(list.map((n) => n.toUpperCase()));
  } catch {
    return new Set();
  }
}

export function rememberSubmittedNationalId(nationalId: string) {
  const normalized = nationalId.trim().toUpperCase().replace(/\s+/g, "");
  if (!normalized) return;
  const set = loadSubmittedNins();
  set.add(normalized);
  localStorage.setItem(ENDORSEMENT_NINS_KEY, JSON.stringify([...set]));
}

export function isNationalIdSubmittedLocally(nationalId: string): boolean {
  const normalized = nationalId.trim().toUpperCase().replace(/\s+/g, "");
  return loadSubmittedNins().has(normalized);
}

export function createLocalEndorsementReference(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const salt = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `END-${stamp}-${salt}`;
}

export function endorsementQrPayload(reference: string): string {
  return `https://plu.org.ug/verify?endorsement=${encodeURIComponent(reference)}`;
}

export function loadEndorsementReceipt(): EndorsementReceipt | null {
  try {
    const raw = localStorage.getItem(ENDORSEMENT_RECEIPT_KEY);
    return raw ? (JSON.parse(raw) as EndorsementReceipt) : null;
  } catch {
    return null;
  }
}

export function saveEndorsementReceipt(receipt: EndorsementReceipt) {
  localStorage.setItem(ENDORSEMENT_RECEIPT_KEY, JSON.stringify(receipt));
}