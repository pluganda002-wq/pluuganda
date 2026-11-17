import { Link } from "react-router-dom";
import { EndorsementPassCard } from "@/components/endorsement/EndorsementPassCard";
import { useUser } from "@/context/UserContext";
import "@/pages/EndorsePage.css";

export function EndorsePassPage() {
  const { endorsementReceipt } = useUser();

  if (!endorsementReceipt) {
    return (
      <main className="page page--endorse">
        <div className="card" style={{ padding: 16 }}>
          <h1 className="endorse-form__title" style={{ marginBottom: 8 }}>
            Endorsement pass
          </h1>
          <p className="endorse-form__subtitle">
            No endorsement pass on this device yet. Complete the public endorsement form to receive your QR pass
            and number.
          </p>
          <Link to="/endorse" className="btn btn-primary" style={{ marginTop: 14, width: "100%" }}>
            Go to endorsement form
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page page--endorse">
      <EndorsementPassCard receipt={endorsementReceipt} />
      <Link to="/endorse" className="btn btn-ghost" style={{ marginTop: 12 }}>
        ← Endorsement campaign
      </Link>
    </main>
  );
}