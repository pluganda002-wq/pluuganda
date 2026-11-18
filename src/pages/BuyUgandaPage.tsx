import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BuyUgandaBusinessCard } from "@/components/buyUganda/BuyUgandaBusinessCard";
import { BuyUgandaCategoryCard } from "@/components/buyUganda/BuyUgandaCategoryCard";
import { BuyUgandaIntroductionForm } from "@/components/buyUganda/BuyUgandaIntroductionForm";
import { BUBU_TAGLINE } from "@/data/plu";
import { UGANDA_DISTRICTS } from "@/data/ugandaDistricts";
import { useBuyUgandaContent } from "@/context/ServiceContentContext";
import { useUser } from "@/context/UserContext";
import { isApiUnavailableError, submitBuyUgandaRequestApi } from "@/lib/api";
import { createBubuReference } from "@/lib/buyUgandaIntroductions";
import { useTelegram } from "@/hooks/useTelegram";
import type { BuyUgandaBusinessEntry } from "@/types/serviceContent";
import "./BuyUgandaPage.css";

type Panel = "categories" | "directory" | "list";

export function BuyUgandaPage() {
  const { pillars, categories, businesses, featured } = useBuyUgandaContent();
  const { member } = useUser();
  const { user, showAlert, haptic } = useTelegram();
  const [panel, setPanel] = useState<Panel>("categories");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [activeBusiness, setActiveBusiness] = useState<BuyUgandaBusinessEntry | null>(null);
  const [introMode, setIntroMode] = useState(false);
  const [introDoneRef, setIntroDoneRef] = useState<string | null>(null);
  const [business, setBusiness] = useState("");
  const [product, setProduct] = useState("");
  const [listingName, setListingName] = useState(member?.fullName ?? "");
  const [listingPhone, setListingPhone] = useState(member?.phone ?? "");
  const [listDistrict, setListDistrict] = useState(member?.district ?? "");
  const [listingSubmitting, setListingSubmitting] = useState(false);

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return businesses;
    return businesses.filter((b) => b.categoryId === categoryFilter);
  }, [businesses, categoryFilter]);

  const categoryName = useMemo(
    () => categories.find((c) => c.id === categoryFilter)?.name ?? "All categories",
    [categories, categoryFilter]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!business.trim() || !product.trim() || !listDistrict) {
      showAlert("Complete business name, product, and district.");
      return;
    }
    if (!listingName.trim() || !listingPhone.trim()) {
      showAlert("Add your contact name and phone so secretariat can reach you.");
      return;
    }
    const reference = createBubuReference();
    setListingSubmitting(true);
    try {
      await submitBuyUgandaRequestApi({
        kind: "listing",
        reference,
        fullName: listingName.trim(),
        phone: listingPhone.trim(),
        district: listDistrict,
        businessName: business.trim(),
        productOrService: product.trim(),
        telegramId: user?.id,
        telegramUsername: user?.username,
      });
    } catch (err) {
      if (!isApiUnavailableError(err)) {
        showAlert("Could not reach server. Your listing draft is noted — try again when online.");
        setListingSubmitting(false);
        return;
      }
    } finally {
      setListingSubmitting(false);
    }
    showAlert(`Listing received. Reference: ${reference}. Secretariat will review your business.`);
    setBusiness("");
    setProduct("");
    haptic("medium");
  }

  function openBusiness(b: BuyUgandaBusinessEntry) {
    haptic("light");
    setIntroMode(false);
    setIntroDoneRef(null);
    setActiveBusiness(b);
  }

  function closeBusinessModal() {
    setActiveBusiness(null);
    setIntroMode(false);
    setIntroDoneRef(null);
  }

  function selectCategory(id: string) {
    haptic("light");
    setCategoryFilter(id);
    setPanel("directory");
  }

  return (
    <main className="page bubu-page">
      <PageHeader title="Buy Uganda, Build Uganda" subtitle={BUBU_TAGLINE} />

      <section className="card bubu-hero" aria-labelledby="bubu-hero-title">
        <div className="bubu-hero__media">
          <img src="/buy-uganda/hero-cover.jpg" alt="" loading="eager" />
        </div>
        <div className="bubu-hero__body">
          <ShoppingBag size={26} color="var(--plu-gold)" aria-hidden />
          <h2 id="bubu-hero-title" className="bubu-hero__title">
            Local products, national pride
          </h2>
          <p>
            Every purchase of Ugandan goods keeps jobs at home, grows MSMEs, and strengthens the
            economy our patriots are building district by district.
          </p>
        </div>
      </section>

      <div className="bubu-page__pillars">
        {pillars.map((p) => (
          <article key={p.id} className="bubu-pillar">
            <strong>{p.title}</strong>
            <p>{p.body}</p>
          </article>
        ))}
      </div>

      <div className="bubu-page__tabs" role="tablist" aria-label="Buy Uganda">
        {(
          [
            ["categories", "Categories"],
            ["directory", `Directory (${businesses.length})`],
            ["list", "List your business"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={panel === id}
            className={`bubu-page__tab${panel === id ? " bubu-page__tab--active" : ""}`}
            onClick={() => setPanel(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {panel === "categories" ? (
        <>
          <p className="bubu-page__intro">
            Tap a category to browse verified-style listings in the business directory.
          </p>
          <div className="bubu-category-grid">
            {categories.map((c) => (
              <BuyUgandaCategoryCard
                key={c.id}
                category={c}
                active={categoryFilter === c.id}
                onSelect={() => selectCategory(c.id)}
              />
            ))}
          </div>

          <h2 className="section-title">Featured suppliers</h2>
          <div className="bubu-featured-scroll">
            {featured.map((f) => {
              const match = businesses.find((b) => b.id === f.id || b.name === f.name);
              return (
                <article key={f.id} className="bubu-featured card">
                  {f.coverImage ? (
                    <img className="bubu-featured__img" src={f.coverImage} alt="" loading="lazy" />
                  ) : null}
                  <span className="badge badge-gold">{f.tag}</span>
                  <p className="bubu-featured__name">{f.name}</p>
                  <p className="bubu-featured__meta">{f.district}</p>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      if (match) openBusiness(match);
                      else showAlert(`${f.name} — full catalogue connects in the next PLU BOT release.`);
                    }}
                  >
                    Open profile
                  </button>
                </article>
              );
            })}
          </div>
        </>
      ) : null}

      {panel === "directory" ? (
        <>
          <div className="bubu-filters" role="group" aria-label="Filter by category">
            <button
              type="button"
              className={`bubu-filter${categoryFilter === "all" ? " bubu-filter--active" : ""}`}
              onClick={() => setCategoryFilter("all")}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`bubu-filter${categoryFilter === c.id ? " bubu-filter--active" : ""}`}
                onClick={() => setCategoryFilter(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
          <p className="bubu-page__intro">
            Showing <strong>{filtered.length}</strong> businesses · {categoryName}
          </p>
          <div className="bubu-business-grid">
            {filtered.map((b) => (
              <BuyUgandaBusinessCard key={b.id} business={b} onView={() => openBusiness(b)} />
            ))}
          </div>
        </>
      ) : null}

      {panel === "list" ? (
        <form className="card bubu-list-form" onSubmit={onSubmit}>
          <h2 className="section-title" style={{ marginTop: 0 }}>
            Join the BUBU directory
          </h2>
          <p className="bubu-page__intro" style={{ marginTop: 0 }}>
            Registered Ugandan enterprises can submit products for secretariat verification and public
            listing.
          </p>
          <div className="field">
            <label htmlFor="business">Business name</label>
            <input
              id="business"
              value={business}
              onChange={(e) => setBusiness(e.target.value)}
              placeholder="Registered enterprise"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="product">Product or service</label>
            <input
              id="product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="What do you sell?"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="listing-contact">Your name (contact)</label>
            <input
              id="listing-contact"
              value={listingName}
              onChange={(e) => setListingName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="listing-phone">Your phone</label>
            <input
              id="listing-phone"
              value={listingPhone}
              onChange={(e) => setListingPhone(e.target.value)}
              inputMode="tel"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="district">District</label>
            <select
              id="district"
              value={listDistrict}
              onChange={(e) => setListDistrict(e.target.value)}
              required
            >
              <option value="">Select district</option>
              {UGANDA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={listingSubmitting}>
            {listingSubmitting ? "Submitting…" : "Submit for BUBU directory"}
          </button>
        </form>
      ) : null}

      <Link to="/tourism" className="btn btn-ghost" style={{ marginTop: 12 }}>
        Explore tourism →
      </Link>

      {activeBusiness ? (
        <div
          className="bubu-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bubu-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeBusinessModal();
          }}
        >
          <div className="bubu-modal__panel" onClick={(e) => e.stopPropagation()}>
            <div className="bubu-modal__hero">
              <img src={activeBusiness.coverImage} alt="" />
            </div>
            <div className="bubu-modal__head">
              <div style={{ minWidth: 0 }}>
                <span className="badge badge-gold">{activeBusiness.tag}</span>
                <h2 id="bubu-modal-title" style={{ margin: "6px 0 0", fontSize: "1.05rem", lineHeight: 1.3 }}>
                  {activeBusiness.name}
                </h2>
              </div>
              <button type="button" className="btn btn-ghost" onClick={closeBusinessModal}>
                Close
              </button>
            </div>
            <div className="bubu-modal__body">
              <p>{activeBusiness.summary}</p>
              <p className="bubu-modal__products">
                <strong>Catalogue:</strong> {activeBusiness.products}
              </p>
              <p className="bubu-modal__district">
                <strong>District:</strong> {activeBusiness.district}
              </p>

              {introDoneRef ? (
                <p className="card bubu-intro-done">
                  Introduction sent. Reference: <strong>{introDoneRef}</strong>. Expect contact from PLU or the
                  supplier soon.
                </p>
              ) : introMode ? (
                <BuyUgandaIntroductionForm
                  business={activeBusiness}
                  onSubmitted={(ref) => {
                    setIntroDoneRef(ref);
                    setIntroMode(false);
                    showAlert(`Introduction request received. Reference: ${ref}`);
                  }}
                />
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  onClick={() => setIntroMode(true)}
                >
                  Request introduction
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}