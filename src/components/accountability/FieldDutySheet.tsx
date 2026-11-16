import { useEffect, useState } from "react";
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
  const [submitReady, setSubmitReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) setSubmitReady(false);
  }, [open, task?.id]);

  if (!open || !task) return null;

  function closeSheet() {
    setSubmitReady(false);
    onClose();
  }

  function submitForApproval() {
    if (!submitReady) return;
    haptic("medium");
    showAlert("Field duty submitted for approval. Points apply once verified.");
    onSubmitted();
    closeSheet();
  }

  return (
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

        <FieldVerificationCapture
          key={task.id}
          task={task}
          onSubmitReady={setSubmitReady}
        />

        <p className="field-duty-sheet__mission">{task.title}</p>

        <button
          type="button"
          className="field-duty-sheet__submit"
          disabled={!submitReady}
          aria-disabled={!submitReady}
          onClick={submitForApproval}
        >
          Submit for approval
        </button>
      </div>
    </div>
  );
}