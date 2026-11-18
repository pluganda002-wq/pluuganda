import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { ImageGallery } from "@/components/media/ImageGallery";
import { useTourismContent } from "@/context/ServiceContentContext";
import "./TourismPage.css";

export function TourismRegionPage() {
  const { regionId } = useParams<{ regionId: string }>();
  const { regions } = useTourismContent();
  const region = regions.find((r) => r.id === regionId);

  if (!region) {
    return (
      <main className="page tourism-page">
        <p>Region not found.</p>
        <Link to="/tourism" className="btn btn-ghost">
          Back to tourism
        </Link>
      </main>
    );
  }

  return (
    <main className="page tourism-page">
      <div className="tourism-region-hero">
        <img src={region.coverImage} alt="" />
      </div>
      <PageHeader title={region.name} subtitle={region.highlights} />
      <p className="tourism-region__tip" style={{ marginTop: 0 }}>
        {region.tip}
      </p>
      <ImageGallery images={region.gallery} title="Places to explore" />
      <Link to="/tourism" className="btn btn-primary" style={{ marginTop: 16 }}>
        Register for a trip
      </Link>
    </main>
  );
}