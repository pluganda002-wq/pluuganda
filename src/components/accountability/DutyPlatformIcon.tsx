import type { CSSProperties, ReactNode } from "react";
import type { DutyIconKey } from "@/data/dutyVerification";
import {
  BookOpen,
  Camera,
  GraduationCap,
  Link2,
  Radio,
  Share2,
  Shield,
  Users,
} from "lucide-react";

type Props = {
  iconKey?: DutyIconKey;
  size?: number;
  className?: string;
};

function BrandBox({
  size,
  className,
  children,
  style,
}: {
  size: number;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`duty-platform-icon${className ? ` ${className}` : ""}`}
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
      aria-hidden
    >
      {children}
    </span>
  );
}

function YoutubeIcon({ size }: { size: number }) {
  return (
    <BrandBox size={size} style={{ color: "#fff" }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2" y="5" width="20" height="14" rx="4" fill="#FF0000" />
        <path d="M10 9.5v5l5-2.5-5-2.5z" fill="#fff" />
      </svg>
    </BrandBox>
  );
}

function TikTokIcon({ size }: { size: number }) {
  return (
    <BrandBox size={size}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <rect width="24" height="24" rx="6" fill="#000" />
        <path
          d="M16.5 8.2v2.1a3.4 3.4 0 01-2-.6v5.8a3.45 3.45 0 11-2.4-3.25V9.3a5.5 5.5 0 005.8 5.5v-2.2a3.3 3.3 0 01-1.4-.3V8.2h1.5z"
          fill="#25F4EE"
        />
        <path
          d="M15.5 7.7v2.6c-.7-.2-1.4-.4-2.1-.4v3.9a2.45 2.45 0 11-1.7-2.3V8.1a4.5 4.5 0 004.3 4.3V10a2.8 2.8 0 01-.5-.3V7.7h1z"
          fill="#FE2C55"
        />
      </svg>
    </BrandBox>
  );
}

function FacebookIcon({ size }: { size: number }) {
  return (
    <BrandBox size={size}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="11" fill="#1877F2" />
        <path
          d="M13.2 7.5h2V5.2h-2c-2.3 0-3.7 1.4-3.7 3.6v1.7H8.5V12h1.9v6.5h2.6V12h2.4l.4-2.2h-2.8V8.6c0-.7.5-1.1 1.2-1.1z"
          fill="#fff"
        />
      </svg>
    </BrandBox>
  );
}

function ZoomIcon({ size }: { size: number }) {
  return (
    <BrandBox size={size}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <rect width="24" height="24" rx="6" fill="#2D8CFF" />
        <path
          d="M5 8h9.5v8H5V8zm11.2 2.2 3.3-2.2v8l-3.3-2.2V10.2z"
          fill="#fff"
        />
      </svg>
    </BrandBox>
  );
}

function TelegramIcon({ size }: { size: number }) {
  return (
    <BrandBox size={size}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="11" fill="#26A5E4" />
        <path
          d="M5.5 11.2l11.8-4.6c1.2-.5 2.2.3 1.8 1.7l-2 7.5c-.3 1.2-1 1.2-1.6.8l-3.4-2.5-1.6 1.5c-.2.2-.3.4-.7.4l.2-3.4 6.3-5.7c.3-.2-.1-.4-.4-.2L8.6 13.2l-3.3-1c-.7-.2-.7-.7.2-1z"
          fill="#fff"
        />
      </svg>
    </BrandBox>
  );
}

function WhatsAppIcon({ size }: { size: number }) {
  return (
    <BrandBox size={size}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="11" fill="#25D366" />
        <path
          d="M8.2 7.4c2.8-2.3 7-1.9 9.3.9 1.5 2 1.3 4.8-.5 6.6-.9.9-2.1 1.4-3.4 1.4-4.2 0-5.8-3.2-5.3-6.2l-1.8-.5c-.3 2.4 1.2 5.2 3.9 6.3.3.1.5.2.8.1l1.6-.8.7.5c1 .7 2.2 1.1 3.5 1.1h.1c2.7 0 5-2.3 5-5.1-.1-2.9-2.6-5.2-5.5-5.2-.9 0-1.8.2-2.6.6z"
          fill="#fff"
        />
      </svg>
    </BrandBox>
  );
}

function XIcon({ size }: { size: number }) {
  return (
    <BrandBox size={size}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <rect width="24" height="24" rx="6" fill="#000" />
        <path
          d="M6.5 6.5h2.3l3.4 4.6 3.9-4.6h2.1l-4.8 5.6 5.2 6.3h-2.3l-3.7-4.4-4.2 4.4H6.5l5.1-5.9-5.1-6.1zm3.5 12.8h1.2l7.6-9.1h-1.2l-7.6 9.1z"
          fill="#fff"
        />
      </svg>
    </BrandBox>
  );
}

const LUCIDE: Partial<Record<DutyIconKey, typeof Share2>> = {
  share: Share2,
  education: GraduationCap,
  field: Camera,
  book: BookOpen,
  cleanup: Users,
  classified: Shield,
  link: Link2,
};

export function DutyPlatformIcon({ iconKey, size = 24, className }: Props) {
  switch (iconKey) {
    case "youtube":
    case "tv":
      return <YoutubeIcon size={size} />;
    case "tiktok":
      return <TikTokIcon size={size} />;
    case "facebook":
    case "social":
      return <FacebookIcon size={size} />;
    case "zoom":
      return <ZoomIcon size={size} />;
    case "telegram":
      return <TelegramIcon size={size} />;
    case "whatsapp":
      return <WhatsAppIcon size={size} />;
    case "x":
      return <XIcon size={size} />;
    default: {
      const Icon = LUCIDE[iconKey ?? "link"] ?? Radio;
      return (
        <BrandBox size={size} className={className}>
          <Icon size={Math.round(size * 0.72)} strokeWidth={2} />
        </BrandBox>
      );
    }
  }
}