/**
 * MTN MoMo Collections (RequestToPay) — wire env vars on Vercel to go live.
 * Docs: https://momodeveloper.mtn.com/
 */
export function isMomoConfigured() {
  return Boolean(
    process.env.MOMO_API_USER &&
      process.env.MOMO_API_KEY &&
      process.env.MOMO_SUBSCRIPTION_KEY &&
      process.env.MOMO_TARGET_ENVIRONMENT
  );
}

function momoBaseUrl() {
  return process.env.MOMO_BASE_URL || "https://sandbox.momodeveloper.mtn.com";
}

async function momoToken() {
  const res = await fetch(`${momoBaseUrl()}/collection/token/`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.MOMO_SUBSCRIPTION_KEY,
      Authorization: `Basic ${Buffer.from(`${process.env.MOMO_API_USER}:${process.env.MOMO_API_KEY}`).toString("base64")}`,
    },
  });
  if (!res.ok) throw new Error("MoMo auth failed");
  const data = await res.json();
  return data.access_token;
}

export async function requestToPay({ amountUgx, phone, externalId, payerMessage }) {
  if (!isMomoConfigured()) {
    return { mode: "demo", status: "completed", reference: externalId };
  }

  const token = await momoToken();
  const referenceId = externalId;
  const body = {
    amount: String(amountUgx),
    currency: "UGX",
    externalId,
    payer: { partyIdType: "MSISDN", partyId: phone.replace(/\D/g, "") },
    payerMessage: payerMessage || "Tugende wallet top-up",
    payeeNote: "PLU Tugende",
  };

  const create = await fetch(`${momoBaseUrl()}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": referenceId,
      "X-Target-Environment": process.env.MOMO_TARGET_ENVIRONMENT,
      "Ocp-Apim-Subscription-Key": process.env.MOMO_SUBSCRIPTION_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (create.status !== 202) {
    const text = await create.text();
    throw new Error(text || "MoMo request failed");
  }

  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    const statusRes = await fetch(`${momoBaseUrl()}/collection/v1_0/requesttopay/${referenceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Target-Environment": process.env.MOMO_TARGET_ENVIRONMENT,
        "Ocp-Apim-Subscription-Key": process.env.MOMO_SUBSCRIPTION_KEY,
      },
    });
    if (!statusRes.ok) continue;
    const statusData = await statusRes.json();
    if (statusData.status === "SUCCESSFUL") {
      return { mode: "momo", status: "completed", reference: referenceId, financialTransactionId: statusData.financialTransactionId };
    }
    if (statusData.status === "FAILED") {
      throw new Error("Mobile money payment declined or timed out.");
    }
  }

  return { mode: "momo", status: "pending", reference: referenceId };
}

export async function transferDisbursement({ amountUgx, phone, externalId, payeeMessage }) {
  if (!isMomoConfigured()) {
    return { mode: "demo", status: "pending", reference: externalId };
  }
  // Disbursement API uses a separate product/subscription — enable when MOMO_DISBURSEMENT_* env is set.
  void amountUgx;
  void phone;
  void payeeMessage;
  return { mode: "momo", status: "pending", reference: externalId };
}
