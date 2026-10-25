import { useState } from "react";
import { ProfileEditorSheet } from "./ProfileEditorSheet";
import { usePatriotAvatar } from "@/hooks/usePatriotAvatar";
import "./HomeProfileAvatar.css";

type Props = {
  className?: string;
};

export function HomeProfileAvatar({ className = "" }: Props) {
  const avatarSrc = usePatriotAvatar();
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`home-profile-avatar${className ? ` ${className}` : ""}`}
        aria-label="Edit your profile photo and interests"
        onClick={() => setEditorOpen(true)}
      >
        <img src={avatarSrc} alt="" width={40} height={40} className="home-profile-avatar__img" />
      </button>
      <ProfileEditorSheet open={editorOpen} onClose={() => setEditorOpen(false)} />
    </>
  );
}
