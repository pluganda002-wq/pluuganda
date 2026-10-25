import { ChevronDown } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  barVariant?: "gold" | "teal";
  defaultOpen?: boolean;
  sectionId?: string;
  children: ReactNode;
  className?: string;
};

export function HomeAccordionSection({
  title,
  subtitle,
  barVariant = "gold",
  defaultOpen = false,
  sectionId,
  children,
  className = "",
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!sectionId) return;
    const sync = () => {
      if (window.location.hash === `#${sectionId}`) {
        setOpen(true);
        requestAnimationFrame(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [sectionId]);
  const panelId = useId();
  const barClass =
    barVariant === "teal" ? "home-col-bar home-col-bar--alt" : "home-col-bar";

  return (
    <section
      id={sectionId}
      className={`home-box home-accordion${className ? ` ${className}` : ""}`}
    >
      <button
        type="button"
        className={`home-accordion__trigger ${barClass}${open ? " home-accordion__trigger--open" : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="home-accordion__trigger-text">
          <span className="home-accordion__title">{title}</span>
          {subtitle ? <span className="home-accordion__subtitle">{subtitle}</span> : null}
        </span>
        <ChevronDown size={18} className="home-accordion__chev" aria-hidden />
      </button>
      <div
        id={panelId}
        className={`home-accordion__panel${open ? " home-accordion__panel--open" : ""}`}
        hidden={!open}
      >
        <div className="home-accordion__panel-inner">{children}</div>
      </div>
    </section>
  );
}
