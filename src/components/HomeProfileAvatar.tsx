import { Camera } from "lucide-react";
import { useState } from "react";
import { ProfileEditorSheet } from "./ProfileEditorSheet";
import { usePatriotAvatar } from "@/hooks/usePatriotAvatar";
import { useProfilePhotoUpload } from "@/hooks/useProfilePhotoUpload";
import "./HomeProfileAvatar.css";

type Props = {
  className?: string;
};

export function HomeProfileAvatar({ className = "" }: Props) {
  const avatarSrc = usePatriotAvatar();
  const { inputRef, openPicker, onFileChange } = useProfilePhotoUpload();
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <>
      <div className={`home-profile-avatar-wrap${className ? ` ${className}` : ""}`}>
        <button
          type="button"
          className="home-profile-avatar"
          aria-label="Upload profile photo"
          onClick={openPicker}
        >
          <img src={avatarSrc} alt="" width={40} height={40} className="home-profile-avatar__img" />
          <span className="home-profile-avatar__badge" aria-hidden>
            <Camera size={12} strokeWidth={2.5} />
          </span>
        </button>
        <button
          type="button"
          className="home-profile-avatar__interests"
          onClick={() => setEditorOpen(true)}
        >
          Interests
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="home-profile-avatar__file"
          aria-hidden
          tabIndex={-1}
          onChange={onFileChange}
        />
      </div>
      <ProfileEditorSheet open={editorOpen} onClose={() => setEditorOpen(false)} />
    </>
  );
}
