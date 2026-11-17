import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import type { EndorsementReceipt } from "@/lib/endorsementPass";
import { endorsementQrPayload } from "@/lib/endorsementPass";

type Props = {
  receipt: EndorsementReceipt;
  compact?: boolean;
};

export function EndorsementPassCard({ receipt, compact = false }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(endorsementQrPayload(receipt.reference), {
      margin: 1,
      width: compact ? 168 : 220,
      color: { dark: "#3d321f", light: "#fffef9" },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [receipt.reference, compact]);

  const recorded = new Date(receipt.recordedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className={`endorse-pass card${compact ? " endorse-pass--compact" : ""}`}>
      <p className="badge badge-green">Endorsement recorded</p>
      <h2 className="endorse-pass__title">{receipt.fullName}</h2>
      <p className="endorse-pass__meta">
        {receipt.district} · Campaign 2031
      </p>
      <p className="endorse-pass__number" aria-label="Endorsement number">
        {receipt.reference}
      </p>
      {qrDataUrl ? (
        <img
          className="endorse-pass__qr"
          src={qrDataUrl}
          width={compact ? 168 : 220}
          height={compact ? 168 : 220}
          alt={`QR code for endorsement ${receipt.reference}`}
        />
      ) : (
        <div className="endorse-pass__qr endorse-pass__qr--loading" aria-hidden />
      )}
      <p className="endorse-pass__hint">
        Scan to verify this endorsement number with PLU. Saved on this device — also in{" "}
        <Link to="/endorse/pass">Profile → Endorsement pass</Link>.
      </p>
      <p className="endorse-pass__foot">
        Recorded {recorded} · Status: {receipt.status.replace(/_/g, " ")}
      </p>
    </div>
  );
}