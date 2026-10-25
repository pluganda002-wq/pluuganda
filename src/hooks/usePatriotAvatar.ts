import { useMemo } from "react";
import { useUser } from "@/context/UserContext";
import { useTelegram } from "@/hooks/useTelegram";

const FALLBACK = "/branding/plu-service-points-icon.png";

export function usePatriotAvatar() {
  const { patriotProfile } = useUser();
  const { user } = useTelegram();

  return useMemo(() => {
    if (patriotProfile.avatarDataUrl) return patriotProfile.avatarDataUrl;
    if (user?.photo_url) return user.photo_url;
    return FALLBACK;
  }, [patriotProfile.avatarDataUrl, user?.photo_url]);
}
