import { useEffect, useRef, useState } from "react";
import { Camera, MapPin, X } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import "./FieldDutySheet.css";

type Pin = { lat: number; lng: number; label: string };

type Props = {
  taskTitle: string;
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
};

export function FieldDutySheet({ taskTitle, open, onClose, onSubmitted }: Props) {
  const { haptic, showAlert } = useTelegram();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [pin, setPin] = useState<Pin | null>(null);
  const [pinning, setPinning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  function resetAndClose() {
    setPhotoPreview(null);
    setPhotoName(null);
    setPin(null);
    onClose();
  }

  function onPhotoPick(file: File | null) {
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoName(file.name);
    haptic("light");
  }

  function clearPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setPhotoName(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function pinLocation() {
    if (!navigator.geolocation) {
      showAlert("Location not available on this device.");
      return;
    }
    setPinning(true);
    haptic("light");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPin({
          lat,
          lng,
          label: `${lat.toFixed(5)}°, ${lng.toFixed(5)}°`,
        });
        setPinning(false);
        haptic("medium");
      },
      () => {
        setPinning(false);
        showAlert("Allow location access to pin your field duty.");
      },
      { enableHighAccuracy: true, timeout: 12_000 }
    );
  }

  function submitForApproval() {
    if (!photoName || !pin) {
      showAlert("Add a photo and pin your location before submitting.");
      return;
    }
    haptic("medium");
    showAlert("Field duty submitted for approval. Points apply once verified.");
    onSubmitted();
    resetAndClose();
  }

  return (
    <div className="field-duty-backdrop" role="presentation" onClick={resetAndClose}>
      <div
        className="field-duty-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="field-duty-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="field-duty-sheet__handle" aria-hidden />
        <header className="field-duty-sheet__head">
          <h3 id="field-duty-title">Field verification</h3>
          <button type="button" className="field-duty-sheet__close" aria-label="Close" onClick={resetAndClose}>
            <X size={20} />
          </button>
        </header>
        <p className="field-duty-sheet__task">{taskTitle}</p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="field-duty-sheet__file"
          onChange={(e) => onPhotoPick(e.target.files?.[0] ?? null)}
        />
        <button type="button" className="field-duty-sheet__btn" onClick={() => fileRef.current?.click()}>
          <Camera size={18} aria-hidden /> Capture picture
        </button>
        {photoPreview ? (
          <div className="field-duty-sheet__preview">
            <img src={photoPreview} alt="Field capture preview" />
            <button type="button" onClick={clearPhoto}>
              Remove
            </button>
          </div>
        ) : null}

        <button
          type="button"
          className="field-duty-sheet__btn"
          disabled={pinning}
          onClick={() => void pinLocation()}
        >
          <MapPin size={18} aria-hidden /> {pinning ? "Pinning…" : pin ? "Location pinned" : "Pin location"}
        </button>
        {pin ? <p className="field-duty-sheet__pin">{pin.label}</p> : null}

        <button type="button" className="field-duty-sheet__submit" onClick={submitForApproval}>
          Submit for approval
        </button>
      </div>
    </div>
  );
}