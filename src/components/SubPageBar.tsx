import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./SubPageBar.css";

export function SubPageBar({ title, backTo }: { title?: string; backTo?: string }) {
  const navigate = useNavigate();

  return (
    <div className="sub-page-bar">
      <button
        type="button"
        className="sub-page-bar__back"
        onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
        aria-label="Back"
      >
        <ArrowLeft size={20} />
      </button>
      {title ? <span className="sub-page-bar__title">{title}</span> : null}
    </div>
  );
}
