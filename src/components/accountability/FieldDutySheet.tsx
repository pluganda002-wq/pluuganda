import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { DutyTask } from "@/data/dutyVerification";
import { FieldVerificationCapture } from "@/components/accountability/FieldVerificationCapture";
import { useTelegram } from "@/hooks/useTelegram";
import "./FieldDutySheet.css";

type Props = {
  task: DutyTask | null;
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
};

export function FieldDutySheet({ task, open, onClose, onSubmitted }: Props) {
  const { haptic, showAlert } = useTelegram();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;

    function syncFieldDutyLayout() {
      const nav = document.querySelector(".bottom-nav");
      const viewport = window.visualViewport;
      const layoutTop = Math.max(0, Math.floor(viewport?.offsetTop ?? 0));
      const layoutBottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;

      root.style.setProperty("--plu-field-duty-inset-top", `${layoutTop}px`);

      if (!nav) {
        const fallbackMax = Math.max(220, Math.floor(layoutBottom - layoutTop - 84));
        root.style.setProperty("--plu-bottom-nav-height", "76px");
        root.style.setProperty("--plu-field-duty-max-height", `${fallbackMax}px`);
        return;
      }

      const navTop = nav.getBoundingClientRect().top;
      const clearance = Math.max(0, Math.ceil(layoutBottom - navTop));
      const maxSheet = Math.max(200, Math.floor(navTop - layoutTop - 8));

      root.style.setProperty("--plu-bottom-nav-height", `${clearance}px`);
      root.style.setProperty("--plu-field-duty-max-height", `${maxSheet}px`);
    }

    syncFieldDutyLayout();
    const raf = requestAnimationFrame(syncFieldDutyLayout);

    const nav = document.querySelector(".bottom-nav");
    const ro = nav && typeof ResizeObserver !== "undefined" ? new ResizeObserver(syncFieldDutyLayout) : null;
    ro?.observe(nav as Element);

    const viewport = window.visualViewport;
    window.addEventListener("resize", syncFieldDutyLayout);
    viewport?.addEventListener("resize", syncFieldDutyLayout);
    viewport?.addEventListener("scroll", syncFieldDutyLayout);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", syncFieldDutyLayout);
      viewport?.removeEventListener("resize", syncFieldDutyLayout);
      viewport?.removeEventListener("scroll", syncFieldDutyLayout);
      root.style.removeProperty("--plu-field-duty-inset-top");
      root.style.removeProperty("--plu-bottom-nav-height");
      root.style.removeProperty("--plu-field-duty-max-height");
    };
  }, [open]);

  if (!open || !task) return null;

  function closeSheet() {
    onClose();
  }

  function submitForApproval() {
    haptic("medium");
    showAlert("Field duty submitted for approval. Points apply once verified.");
    onSubmitted();
    closeSheet();
  }

  return createPortal(
    <div className="field-duty-backdrop" role="presentation" onClick={closeSheet}>
      <div
        className="field-duty-sheet field-duty-sheet--proof"
        role="dialog"
        aria-modal="true"
        aria-labelledby="field-duty-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="field-duty-sheet__handle" aria-hidden />
        <header className="field-duty-sheet__head">
          <h3 id="field-duty-title">Field verification</h3>
          <button type="button" className="field-duty-sheet__close" aria-label="Close" onClick={closeSheet}>
            <X size={20} />
          </button>
        </header>

        <div className="field-duty-sheet__scroll field-duty-sheet__scroll--proof">
          <FieldVerificationCapture key={task.id} task={task} onSubmit={submitForApproval} />
        </div>
      </div>
    </div>,
    document.body
  );
}