import { X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { PATRIOT_INTERESTS } from "@/data/profileInterests";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";
import { usePatriotAvatar } from "@/hooks/usePatriotAvatar";
import "./ProfileEditorSheet.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ProfileEditorSheet({ open, onClose }: Props) {
  const titleId = useId();
  const { displayName } = useTelegram();
  const { patriotProfile, updatePatriotProfile } = useUser();
  const avatarSrc = usePatriotAvatar();
  const [interests, setInterests] = useState<string[]>(patriotProfile.interests);

  useEffect(() => {
    if (open) setInterests(patriotProfile.interests);
  }, [open, patriotProfile.interests]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const onPhotoPick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      if (file.size > 2_500_000) {
        alert("Please choose an image under 2.5 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updatePatriotProfile({ avatarDataUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [updatePatriotProfile]
  );

  const save = () => {
    updatePatriotProfile({ interests });
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div className="profile-editor" role="presentation">
      <button type="button" className="profile-editor__backdrop" aria-label="Close" onClick={onClose} />
      <div className="profile-editor__sheet" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="profile-editor__head">
          <h2 id={titleId}>Your patriot profile</h2>
          <button type="button" className="profile-editor__close" aria-label="Close" onClick={onClose}>
            <X size={22} aria-hidden />
          </button>
        </header>
        <div className="profile-editor__body">
          <div className="profile-editor__avatar-wrap">
            <img src={avatarSrc} alt="" className="profile-editor__avatar" width={96} height={96} />
            <label className="profile-editor__photo-btn">
              Change photo
              <input type="file" accept="image/*" className="profile-editor__file" onChange={onPhotoPick} />
            </label>
          </div>
          <p className="profile-editor__name">{displayName}</p>
          <p className="profile-editor__hint">Choose interests that match how you serve Uganda.</p>
          <div className="profile-editor__chips">
            {PATRIOT_INTERESTS.map((item) => (
              <button
                key={item}
                type="button"
                className={`profile-editor__chip${interests.includes(item) ? " profile-editor__chip--on" : ""}`}
                aria-pressed={interests.includes(item)}
                onClick={() => toggleInterest(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-primary profile-editor__save" onClick={save}>
            Save profile
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
