import { FormEvent, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
  BUBU_CATEGORIES,
  BUBU_FEATURED,
  BUBU_PILLARS,
  BUBU_TAGLINE,
} from "@/data/plu";
import { useTelegram } from "@/hooks/useTelegram";
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

export function BuyUgandaPage() {
  const { showAlert } = useTelegram();
  const [business, setBusiness] = useState("");
  const [product, setProduct] = useState("");
  const [district, setDistrict] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    showAlert("Thank you! Your Made-in-Uganda listing request is saved locally (demo). Secretariat review coming soon.");
  }

  return (
    <main className="page">
      <PageHeader title="Buy Uganda, Build Uganda" subtitle={BUBU_TAGLINE} />

      <div className="card bubu-banner">
        <ShoppingBag size={28} color="var(--plu-gold)" />
        <p>
          Every purchase of Ugandan goods creates jobs, keeps wealth at home and builds a stronger economy for
          all patriots.
        </p>
      </div>

      <h2 className="section-title">Campaign pillars</h2>
      {BUBU_PILLARS.map((p) => (
        <div key={p.title} className="card">
          <strong>{p.title}</strong>
          <p style={{ margin: "6px 0 0", fontSize: "0.85rem", color: "var(--plu-muted)" }}>{p.text}</p>
        </div>
      ))}

      <h2 className="section-title" style={{ marginTop: 20 }}>
        Shop categories
      </h2>
      <div className="stat-grid" style={{ marginBottom: 12 }}>
        {BUBU_CATEGORIES.map((c) => (
          <div key={c.id} className="stat-pill" style={{ gridColumn: "span 1" }}>
            <strong style={{ fontSize: "0.8rem" }}>{c.name}</strong>
            <span style={{ fontSize: "0.6rem", lineHeight: 1.2, display: "block", marginTop: 4 }}>
              {c.examples}
            </span>
          </div>
        ))}
      </div>

      <h2 className="section-title">Featured local suppliers</h2>
      {BUBU_FEATURED.map((v) => (
        <div key={v.name} className="card">
          <span className="badge badge-gold">{v.tag}</span>
          <p style={{ margin: "8px 0 2px", fontWeight: 600 }}>{v.name}</p>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--plu-muted)" }}>{v.district}</p>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: 10 }}
            onClick={() => showAlert("Marketplace checkout connects in a future PLU BOT release.")}
          >
            View supplier
          </button>
        </div>
      ))}

      <h2 className="section-title" style={{ marginTop: 20 }}>
        List your Ugandan business
      </h2>
      <form className="card" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="business">Business name</label>
          <input
            id="business"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder="Registered enterprise"
          />
        </div>
        <div className="field">
          <label htmlFor="product">Product or service</label>
          <input
            id="product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="What do you sell?"
          />
        </div>
        <div className="field">
          <label htmlFor="district">District</label>
          <input
            id="district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="e.g. Gulu"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit for BUBU directory
        </button>
      </form>

      <Link to="/tourism" className="btn btn-ghost" style={{ marginTop: 12 }}>
        Explore tourism →
      </Link>
    </main>
  );
}
