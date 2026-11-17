export type EndorsementReceipt = {
  reference: string;
  fullName: string;
  district: string;
  recordedAt: string;
  status: string;
};

export const ENDORSEMENT_RECEIPT_KEY = "plu-bot-endorsement-receipt-v1";

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