import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  WHISTLEBLOWER_DISCLAIMER_FULL,
  WHISTLEBLOWER_DISCLAIMER_SHORT,
} from "@/data/accountabilityProgramme";
import { useTelegram } from "@/hooks/useTelegram";

export function WhistleblowerDisclaimer() {
  const [open, setOpen] = useState(false);
  const { haptic } = useTelegram();

  return (
    <div className="whistle-disclaimer">
      <p className="whistle-disclaimer__short">{WHISTLEBLOWER_DISCLAIMER_SHORT}</p>
      {open ? (
        <ul className="whistle-disclaimer__list">
          {WHISTLEBLOWER_DISCLAIMER_FULL.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
      <button
        type="button"
        className="whistle-disclaimer__more"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          haptic("light");
        }}
      >
        {open ? (
          <>
            View less <ChevronUp size={16} />
          </>
        ) : (
          <>
            View more <ChevronDown size={16} />
          </>
        )}
      </button>
    </div>
  );
}