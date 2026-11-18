import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { ImageGallery } from "@/components/media/ImageGallery";
import { useCharityContent } from "@/context/ServiceContentContext";

export function CharityDrivePage() {
  const { driveId } = useParams<{ driveId: string }>();
  const { drives } = useCharityContent();
  const drive = drives.find((d) => d.id === driveId);

  if (!drive) {
    return (
      <main className="page">
        <p>Drive not found.</p>
        <Link to="/charity" className="btn btn-ghost">
          Back to charity
        </Link>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="tourism-region-hero">
        <img src={drive.coverImage} alt="" />
      </div>
      <PageHeader title={drive.name} subtitle={drive.summary ?? `${drive.raised} of ${drive.goal}`} />
      <p style={{ margin: "0 0 12px", color: "var(--plu-gold)", fontWeight: 700 }}>
        {drive.raised} of {drive.goal}
      </p>
      <ImageGallery images={drive.gallery} title="Programme photos" />
      <button type="button" className="btn btn-primary" style={{ marginTop: 12 }}>
        Contribute (coming soon)
      </button>
      <Link to="/charity" className="btn btn-ghost" style={{ marginTop: 8 }}>
        ← All charity drives
      </Link>
    </main>
  );
}