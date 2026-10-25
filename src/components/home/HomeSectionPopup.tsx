import { ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  title: string;
  barVariant?: "gold" | "teal";
  children: ReactNode;
  className?: string;
};

export function HomeSectionPopup({
  title,
  barVariant = "gold",
  children,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const barClass =
    barVariant === "teal" ? "home-col-bar home-col-bar--alt" : "home-col-bar";

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  return (
    <>
      <section className={`home-box home-section-popup${className ? ` ${className}` : ""}`}>
        <button
          type="button"
          className={`home-section-popup__trigger ${barClass}`}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <span className="home-section-popup__title">{title}</span>
          <ChevronRight size={18} className="home-section-popup__chev" aria-hidden />
        </button>
      </section>

      {open
        ? createPortal(
            <div className="home-popup" role="presentation">
              <button
                type="button"
                className="home-popup__backdrop"
                aria-label="Close"
                onClick={close}
              />
              <div
                className="home-popup__sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
              >
                <header className="home-popup__head">
                  <h2 id={titleId} className="home-popup__heading">
                    {title}
                  </h2>
                  <button type="button" className="home-popup__close" aria-label="Close" onClick={close}>
                    <X size={22} aria-hidden />
                  </button>
                </header>
                <div
                  className="home-popup__body"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("a")) close();
                  }}
                >
                  {children}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
