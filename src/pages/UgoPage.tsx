import { Link } from "react-router-dom";

const LOGO = "/branding/ugo-ride.png";

export function UgoPage() {
  return (
    <main className="page mobility-app-page">
      <img src={LOGO} alt="" className="mobility-app-page__logo" width={140} height={140} />
      <div className="card">
        <h1 className="mobility-app-page__title">UGo Ride</h1>
        <p className="mobility-app-page__lead">
          Car rides for members travelling to PLU events and community service. This app opens separately from
          Tugende.
        </p>
        <p className="badge badge-blue" style={{ display: "inline-block", marginBottom: 12 }}>
          Partner onboarding
        </p>
        <p className="mobility-app-page__muted">Full booking and payments will connect in the next release.</p>
      </div>
      <Link to="/" className="mobility-app-page__back">
        Back to Home
      </Link>
    </main>
  );
}
