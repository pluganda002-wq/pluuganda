import { useEffect, useRef, useState } from "react";
import { Download, Link as LinkIcon, Printer, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import type { EndorsementReceipt } from "@/lib/endorsementPass";
import { endorsementQrPayload } from "@/lib/endorsementPass";
import { useTelegram } from "@/hooks/useTelegram";

type Props = {
  receipt: EndorsementReceipt;
  compact?: boolean;
  onSubmitForAnother?: () => void;
  onBackToMyPass?: () => void;
};

export function EndorsementPassCard({
  receipt,
  compact = false,
  onSubmitForAnother,
  onBackToMyPass,
}: Props) {
  const { showAlert, haptic } = useTelegram();
  const passRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const verifyUrl = endorsementQrPayload(receipt.reference);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(verifyUrl, {
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
  }, [verifyUrl, compact]);

  const recorded = new Date(receipt.recordedAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const shareText = `PLU presidential endorsement recorded for ${receipt.fullName}. Reference: ${receipt.reference}`;

  function downloadQr() {
    if (!qrDataUrl) return;
    const anchor = document.createElement("a");
    anchor.href = qrDataUrl;
    anchor.download = `${receipt.reference}-qr.png`;
    anchor.click();
    haptic("light");
  }

  function printPass() {
    const node = passRef.current;
    if (!node) return;
    const win = window.open("", "_blank", "noopener,noreferrer,width=420,height=640");
    if (!win) {
      showAlert("Allow pop-ups to print the endorsement pass.");
      return;
    }
    win.document.write(`<!DOCTYPE html><html><head><title>${receipt.reference}</title>
      <style>
        body { font-family: system-ui, sans-serif; text-align: center; padding: 24px; color: #1a1a1a; }
        h1 { font-size: 1.1rem; margin: 0 0 8px; }
        .ref { font-weight: 800; letter-spacing: 0.06em; margin: 12px 0; }
        img { max-width: 240px; height: auto; }
        p { font-size: 0.85rem; color: #555; }
      </style></head><body>
      <h1>${receipt.fullName}</h1>
      <p>${receipt.district} · Campaign 2031</p>
      <p class="ref">${receipt.reference}</p>
      ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR code" />` : ""}
      <p>${verifyUrl}</p>
      <p>Recorded ${recorded}</p>
      <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };</script>
      </body></html>`);
    win.document.close();
    haptic("light");
  }

  async function sharePass() {
    haptic("light");
    if (navigator.share) {
      try {
        if (qrDataUrl) {
          const blob = await fetch(qrDataUrl).then((r) => r.blob());
          const file = new File([blob], `${receipt.reference}-qr.png`, { type: "image/png" });
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({
              title: "PLU Endorsement Pass",
              text: shareText,
              url: verifyUrl,
              files: [file],
            });
            return;
          }
        }
        await navigator.share({ title: "PLU Endorsement Pass", text: `${shareText}\n${verifyUrl}` });
        return;
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${verifyUrl}`);
      showAlert("Endorsement details copied. Paste into WhatsApp, X, or Facebook.");
    } catch {
      showAlert(`${shareText}\n${verifyUrl}`);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      haptic("light");
      showAlert("Verification link copied.");
    } catch {
      showAlert(verifyUrl);
    }
  }

  function openShareUrl(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const socialText = encodeURIComponent(`${shareText} ${verifyUrl}`);
  const socialUrl = encodeURIComponent(verifyUrl);

  return (
    <div ref={passRef} className={`endorse-pass card endorse-pass--print${compact ? " endorse-pass--compact" : ""}`}>
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

      <div className="endorse-pass__actions">
        <button type="button" className="endorse-pass__action" onClick={downloadQr} disabled={!qrDataUrl}>
          <Download size={16} aria-hidden />
          Download QR
        </button>
        <button type="button" className="endorse-pass__action" onClick={printPass}>
          <Printer size={16} aria-hidden />
          Print
        </button>
        <button type="button" className="endorse-pass__action" onClick={() => void sharePass()}>
          <Share2 size={16} aria-hidden />
          Share
        </button>
        <button type="button" className="endorse-pass__action" onClick={() => void copyLink()}>
          <LinkIcon size={16} aria-hidden />
          Copy link
        </button>
      </div>

      <div className="endorse-pass__social" role="group" aria-label="Share to platforms">
        <button
          type="button"
          className="endorse-pass__social-btn"
          onClick={() => openShareUrl(`https://wa.me/?text=${socialText}`)}
        >
          WhatsApp
        </button>
        <button
          type="button"
          className="endorse-pass__social-btn"
          onClick={() => openShareUrl(`https://twitter.com/intent/tweet?text=${socialText}`)}
        >
          X
        </button>
        <button
          type="button"
          className="endorse-pass__social-btn"
          onClick={() => openShareUrl(`https://www.facebook.com/sharer/sharer.php?u=${socialUrl}`)}
        >
          Facebook
        </button>
      </div>

      <p className="endorse-pass__hint">
        Scan to verify with PLU. Your pass is also in{" "}
        <Link to="/endorse/pass">Profile → Endorsement pass</Link>.
      </p>
      <p className="endorse-pass__foot">
        Recorded {recorded} · Status: {receipt.status.replace(/_/g, " ")}
      </p>

      {onBackToMyPass ? (
        <button type="button" className="btn btn-ghost endorse-pass__another" onClick={onBackToMyPass}>
          Back to my endorsement pass
        </button>
      ) : null}
      {onSubmitForAnother ? (
        <button type="button" className="btn btn-secondary endorse-pass__another" onClick={onSubmitForAnother}>
          Submit endorsement for another person
        </button>
      ) : null}
    </div>
  );
}