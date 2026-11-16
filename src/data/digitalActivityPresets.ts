import type { DutyIconKey, DutyTask } from "@/data/dutyVerification";

export type DigitalPlatformPreset = {
  id: DutyIconKey;
  label: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultCta: string;
  defaultPoints: number;
  defaultActionTo?: string;
};

export const DIGITAL_PLATFORM_PRESETS: DigitalPlatformPreset[] = [
  {
    id: "youtube",
    label: "YouTube",
    defaultTitle: "Subscribe to official channel",
    defaultSubtitle: "YouTube",
    defaultCta: "Subscribe",
    defaultPoints: 25,
    defaultActionTo: "/tv",
  },
  {
    id: "tiktok",
    label: "TikTok",
    defaultTitle: "Follow PLU on TikTok",
    defaultSubtitle: "Like & share clips",
    defaultCta: "Follow",
    defaultPoints: 20,
    defaultActionTo: "/social",
  },
  {
    id: "facebook",
    label: "Facebook",
    defaultTitle: "Like official PLU page",
    defaultSubtitle: "Facebook",
    defaultCta: "Like",
    defaultPoints: 15,
    defaultActionTo: "/social",
  },
  {
    id: "zoom",
    label: "Zoom",
    defaultTitle: "Join civic Zoom briefing",
    defaultSubtitle: "Live briefing",
    defaultCta: "Join",
    defaultPoints: 50,
  },
  {
    id: "telegram",
    label: "Telegram",
    defaultTitle: "Join PLU Telegram channel",
    defaultSubtitle: "Digital mobilisation",
    defaultCta: "Join",
    defaultPoints: 20,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    defaultTitle: "Share update on WhatsApp",
    defaultSubtitle: "Forward to patriots",
    defaultCta: "Share",
    defaultPoints: 15,
    defaultActionTo: "/social",
  },
  {
    id: "x",
    label: "X",
    defaultTitle: "Like and repost on X",
    defaultSubtitle: "Social endorsement",
    defaultCta: "Repost",
    defaultPoints: 20,
    defaultActionTo: "/social",
  },
];

export function newDigitalTaskFromPreset(preset: DigitalPlatformPreset): DutyTask {
  const slug = Date.now().toString(36);
  return {
    id: `dig-${preset.id}-${slug}`,
    kind: "digital",
    categoryLabel: "Digital solidarity",
    title: preset.defaultTitle,
    subtitle: preset.defaultSubtitle,
    points: preset.defaultPoints,
    cta: preset.defaultCta,
    iconKey: preset.id,
    actionTo: preset.defaultActionTo,
  };
}