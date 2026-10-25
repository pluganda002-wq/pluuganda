import { useCallback, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";

export function useProfilePhotoUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { updatePatriotProfile } = useUser();
  const { showAlert } = useTelegram();

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        showAlert("Please choose an image file (JPG, PNG, or WebP).");
        return;
      }
      if (file.size > 2_500_000) {
        showAlert("Please choose an image under 2.5 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          updatePatriotProfile({ avatarDataUrl: reader.result });
        }
      };
      reader.onerror = () => showAlert("Could not read that image. Try another file.");
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [showAlert, updatePatriotProfile]
  );

  return { inputRef, openPicker, onFileChange };
}
