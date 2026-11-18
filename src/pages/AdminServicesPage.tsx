import { useMemo, useState } from "react";
import type { AdminSectionId } from "@/data/adminServiceModules";
import { SERVICE_ADMIN_MODULES } from "@/data/adminServiceModules";
import { useServiceContent } from "@/context/ServiceContentContext";
import { readAdminSession } from "@/lib/adminAuth";
import type {
  CharityDriveEntry,
  FeaturedSupplierEntry,
  GalleryImage,
  PillarEntry,
  ServiceListingEntry,
  ServiceModuleId,
  TourismRegionEntry,
} from "@/types/serviceContent";
import type { TourismPackage } from "@/data/tourismProgramme";
import { useTelegram } from "@/hooks/useTelegram";
import "@/pages/AdminDutiesPage.css";

function newItemId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

function GalleryEditor({
  gallery,
  onChange,
}: {
  gallery: GalleryImage[];
  onChange: (next: GalleryImage[]) => void;
}) {
  return (
    <div className="admin-duty__gallery-block">
      <p className="admin-duty__hint">Gallery images (URL path e.g. /tourism/wildlife-1.jpg)</p>
      {gallery.map((g, i) => (
        <div key={g.id} className="admin-duty__row">
          <label className="admin-duty__field">
            <span>Image URL</span>
            <input
              value={g.src}
              onChange={(e) => {
                const next = [...gallery];
                next[i] = { ...g, src: e.target.value };
                onChange(next);
              }}
            />
          </label>
          <label className="admin-duty__field">
            <span>Caption</span>
            <input
              value={g.caption ?? ""}
              onChange={(e) => {
                const next = [...gallery];
                next[i] = { ...g, caption: e.target.value };
                onChange(next);
              }}
            />
          </label>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() =>
          onChange([...gallery, { id: newItemId("img"), src: "", caption: "" }])
        }
      >
        Add photo
      </button>
    </div>
  );
}

export function AdminServicesPage() {
  const {
    content,
    source,
    loading,
    updateModule,
    resetToDefaults,
    saveToServer,
    isAdmin,
    adminLogin,
    adminLogout,
  } = useServiceContent();
  const { showAlert } = useTelegram();
  const [password, setPassword] = useState("");
  const [serverPassword, setServerPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [moduleId, setModuleId] = useState<ServiceModuleId>("tourism");
  const [section, setSection] = useState<AdminSectionId>("regions");

  const moduleConfig = useMemo(
    () => SERVICE_ADMIN_MODULES.find((m) => m.id === moduleId) ?? SERVICE_ADMIN_MODULES[0],
    [moduleId]
  );

  const signedIn = isAdmin || readAdminSession();

  if (!signedIn) {
    return (
      <main className="page admin-duty">
        <header className="admin-duty__head">
          <p className="admin-duty__tag">Secretariat</p>
          <h1>Services content</h1>
          <p className="admin-duty__lead">
            Manage tourism themes, packages, youth forums, Buy Uganda listings, and other service
            modules.
          </p>
        </header>
        <form
          className="admin-duty__login card"
          onSubmit={(e) => {
            e.preventDefault();
            if (!adminLogin(password)) {
              showAlert("Incorrect admin password.");
              return;
            }
            setPassword("");
          }}
        >
          <label className="admin-duty__field">
            <span>Admin password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" className="btn btn-primary">
            Sign in
          </button>
        </form>
      </main>
    );
  }

  async function onSaveServer() {
    if (!serverPassword.trim()) {
      showAlert("Enter the server admin password to publish.");
      return;
    }
    setSaving(true);
    try {
      await saveToServer(serverPassword.trim());
      showAlert("Service content published for all patriots.");
      setServerPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      showAlert(msg.includes("401") ? "Server rejected password." : "Could not publish. Saved on this device only.");
    } finally {
      setSaving(false);
    }
  }

  function setTourismRegions(regions: TourismRegionEntry[]) {
    updateModule("tourism", { regions });
  }

  function setTourismPackages(packages: TourismPackage[]) {
    updateModule("tourism", { packages });
  }

  function setPillars(module: ServiceModuleId, pillars: PillarEntry[]) {
    if (module === "tourism") updateModule("tourism", { pillars });
    if (module === "youth") updateModule("youth", { pillars });
    if (module === "buy-uganda") updateModule("buy-uganda", { pillars });
  }

  return (
    <main className="page admin-duty">
      <header className="admin-duty__head">
        <p className="admin-duty__tag">Secretariat</p>
        <h1>Services content</h1>
        <p className="admin-duty__meta">
          Source: {loading ? "Loading…" : source} · Changes apply locally immediately
        </p>
        <div className="admin-duty__toolbar">
          <button type="button" className="btn btn-ghost" onClick={resetToDefaults}>
            Reset defaults
          </button>
          <button type="button" className="btn btn-ghost" onClick={adminLogout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="admin-duty__section card" style={{ marginBottom: 12 }}>
        <label className="admin-duty__field">
          <span>Service module</span>
          <select
            value={moduleId}
            onChange={(e) => {
              const next = e.target.value as ServiceModuleId;
              setModuleId(next);
              const cfg = SERVICE_ADMIN_MODULES.find((m) => m.id === next);
              setSection(cfg?.sections[0]?.id ?? "listings");
            }}
          >
            {SERVICE_ADMIN_MODULES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-duty__field">
          <span>Content type</span>
          <select value={section} onChange={(e) => setSection(e.target.value as AdminSectionId)}>
            {moduleConfig.sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {moduleId === "tourism" && section === "regions"
        ? content.tourism.regions.map((region, index) => (
            <article key={region.id} className="admin-duty__card admin-duty__card--field">
              <div className="admin-duty__card-head">
                <h3 className="admin-duty__card-title">{region.name || "New theme"}</h3>
                <button
                  type="button"
                  className="admin-duty__remove"
                  onClick={() =>
                    setTourismRegions(content.tourism.regions.filter((r) => r.id !== region.id))
                  }
                >
                  Remove
                </button>
              </div>
              <label className="admin-duty__field">
                <span>Name</span>
                <input
                  value={region.name}
                  onChange={(e) => {
                    const next = [...content.tourism.regions];
                    next[index] = { ...region, name: e.target.value };
                    setTourismRegions(next);
                  }}
                />
              </label>
              <label className="admin-duty__field">
                <span>Highlights</span>
                <textarea
                  rows={2}
                  value={region.highlights}
                  onChange={(e) => {
                    const next = [...content.tourism.regions];
                    next[index] = { ...region, highlights: e.target.value };
                    setTourismRegions(next);
                  }}
                />
              </label>
              <label className="admin-duty__field">
                <span>Tip</span>
                <input
                  value={region.tip}
                  onChange={(e) => {
                    const next = [...content.tourism.regions];
                    next[index] = { ...region, tip: e.target.value };
                    setTourismRegions(next);
                  }}
                />
              </label>
              <label className="admin-duty__field">
                <span>Cover image URL</span>
                <input
                  value={region.coverImage}
                  onChange={(e) => {
                    const next = [...content.tourism.regions];
                    next[index] = { ...region, coverImage: e.target.value };
                    setTourismRegions(next);
                  }}
                />
              </label>
              <GalleryEditor
                gallery={region.gallery}
                onChange={(gallery) => {
                  const next = [...content.tourism.regions];
                  next[index] = { ...region, gallery };
                  setTourismRegions(next);
                }}
              />
            </article>
          ))
        : null}

      {moduleId === "tourism" && section === "regions" ? (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginBottom: 16 }}
          onClick={() =>
            setTourismRegions([
              ...content.tourism.regions,
              {
                id: newItemId("region"),
                name: "New theme",
                highlights: "",
                tip: "",
                coverImage: "/tourism/wildlife-cover.jpg",
                gallery: [],
              },
            ])
          }
        >
          Add explore theme
        </button>
      ) : null}

      {moduleId === "tourism" && section === "packages"
        ? content.tourism.packages.map((pkg, index) => (
            <article key={pkg.id} className="admin-duty__card admin-duty__card--digital">
              <div className="admin-duty__card-head">
                <h3 className="admin-duty__card-title">{pkg.title}</h3>
                <button
                  type="button"
                  className="admin-duty__remove"
                  onClick={() =>
                    setTourismPackages(content.tourism.packages.filter((p) => p.id !== pkg.id))
                  }
                >
                  Remove
                </button>
              </div>
              <label className="admin-duty__field">
                <span>Title</span>
                <input
                  value={pkg.title}
                  onChange={(e) => {
                    const next = [...content.tourism.packages];
                    next[index] = { ...pkg, title: e.target.value };
                    setTourismPackages(next);
                  }}
                />
              </label>
              <label className="admin-duty__field">
                <span>Summary</span>
                <textarea
                  rows={2}
                  value={pkg.summary}
                  onChange={(e) => {
                    const next = [...content.tourism.packages];
                    next[index] = { ...pkg, summary: e.target.value };
                    setTourismPackages(next);
                  }}
                />
              </label>
              <div className="admin-duty__row">
                <label className="admin-duty__field admin-duty__field--narrow">
                  <span>Spots</span>
                  <input
                    type="number"
                    value={pkg.spots}
                    onChange={(e) => {
                      const next = [...content.tourism.packages];
                      next[index] = { ...pkg, spots: Number(e.target.value) || 0 };
                      setTourismPackages(next);
                    }}
                  />
                </label>
              </div>
            </article>
          ))
        : null}

      {moduleId === "tourism" && section === "packages" ? (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginBottom: 16 }}
          onClick={() =>
            setTourismPackages([
              ...content.tourism.packages,
              {
                id: newItemId("pkg"),
                title: "New package",
                region: "Central",
                duration: "2 days",
                status: "open",
                statusLabel: "Register interest",
                spots: 30,
                summary: "",
              },
            ])
          }
        >
          Add package
        </button>
      ) : null}

      {section === "pillars" && (moduleId === "tourism" || moduleId === "youth" || moduleId === "buy-uganda")
        ? (moduleId === "tourism"
            ? content.tourism.pillars
            : moduleId === "youth"
              ? content.youth.pillars
              : content["buy-uganda"].pillars
          ).map((pillar, index, arr) => (
            <article key={pillar.id} className="admin-duty__card">
              <label className="admin-duty__field">
                <span>Title</span>
                <input
                  value={pillar.title}
                  onChange={(e) => {
                    const next = [...arr];
                    next[index] = { ...pillar, title: e.target.value };
                    setPillars(moduleId, next);
                  }}
                />
              </label>
              <label className="admin-duty__field">
                <span>Body</span>
                <textarea
                  rows={2}
                  value={pillar.body}
                  onChange={(e) => {
                    const next = [...arr];
                    next[index] = { ...pillar, body: e.target.value };
                    setPillars(moduleId, next);
                  }}
                />
              </label>
            </article>
          ))
        : null}

      {moduleId === "youth" && section === "forums"
        ? content.youth.forums.map((ev, index) => (
            <article key={ev.id} className="admin-duty__card">
              <div className="admin-duty__card-head">
                <h3 className="admin-duty__card-title">{ev.title}</h3>
                <button
                  type="button"
                  className="admin-duty__remove"
                  onClick={() =>
                    updateModule("youth", {
                      forums: content.youth.forums.filter((f) => f.id !== ev.id),
                    })
                  }
                >
                  Remove
                </button>
              </div>
              <label className="admin-duty__field">
                <span>Title</span>
                <input
                  value={ev.title}
                  onChange={(e) => {
                    const next = [...content.youth.forums];
                    next[index] = { ...ev, title: e.target.value };
                    updateModule("youth", { forums: next });
                  }}
                />
              </label>
              <label className="admin-duty__field">
                <span>Spots</span>
                <input
                  type="number"
                  value={ev.spots}
                  onChange={(e) => {
                    const next = [...content.youth.forums];
                    next[index] = { ...ev, spots: Number(e.target.value) || 0 };
                    updateModule("youth", { forums: next });
                  }}
                />
              </label>
            </article>
          ))
        : null}

      {moduleId === "youth" && section === "forums" ? (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginBottom: 16 }}
          onClick={() =>
            updateModule("youth", {
              forums: [
                ...content.youth.forums,
                {
                  id: newItemId("forum"),
                  title: "New forum",
                  dateLabel: "",
                  dateIso: "",
                  location: "",
                  spots: 40,
                  summary: "",
                },
              ],
            })
          }
        >
          Add forum event
        </button>
      ) : null}

      {moduleId === "buy-uganda" && section === "featured"
        ? content["buy-uganda"].featured.map((f, index) => (
            <article key={f.id} className="admin-duty__card">
              <FeaturedEditor
                item={f}
                onChange={(patch) => {
                  const next = [...content["buy-uganda"].featured];
                  next[index] = { ...f, ...patch };
                  updateModule("buy-uganda", { featured: next });
                }}
                onRemove={() =>
                  updateModule("buy-uganda", {
                    featured: content["buy-uganda"].featured.filter((x) => x.id !== f.id),
                  })
                }
              />
            </article>
          ))
        : null}

      {moduleId === "buy-uganda" && section === "featured" ? (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginBottom: 16 }}
          onClick={() =>
            updateModule("buy-uganda", {
              featured: [
                ...content["buy-uganda"].featured,
                {
                  id: newItemId("supplier"),
                  name: "New supplier",
                  district: "",
                  tag: "Made in Uganda",
                  coverImage: "",
                  gallery: [],
                },
              ],
            })
          }
        >
          Add supplier
        </button>
      ) : null}

      {moduleId === "charity" && section === "drives"
        ? content.charity.drives.map((d, index) => (
            <article key={d.id} className="admin-duty__card">
              <CharityEditor
                drive={d}
                onChange={(patch) => {
                  const next = [...content.charity.drives];
                  next[index] = { ...d, ...patch };
                  updateModule("charity", { drives: next });
                }}
                onRemove={() =>
                  updateModule("charity", {
                    drives: content.charity.drives.filter((x) => x.id !== d.id),
                  })
                }
              />
            </article>
          ))
        : null}

      {moduleId === "charity" && section === "drives" ? (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginBottom: 16 }}
          onClick={() =>
            updateModule("charity", {
              drives: [
                ...content.charity.drives,
                {
                  id: newItemId("drive"),
                  name: "New drive",
                  raised: "UGX 0",
                  goal: "UGX 0",
                  coverImage: "/branding/plu-hero-banner.png",
                  gallery: [],
                },
              ],
            })
          }
        >
          Add charity drive
        </button>
      ) : null}

      {section === "listings" &&
      moduleId !== "tourism" &&
      moduleId !== "youth" &&
      moduleId !== "buy-uganda" &&
      moduleId !== "charity"
        ? listingsFor(content, moduleId).map((item, index) => (
            <article key={item.id} className="admin-duty__card">
              <ListingEditor
                item={item}
                onChange={(patch) => {
                  const list = listingsFor(content, moduleId);
                  const next = [...list];
                  next[index] = { ...item, ...patch };
                  setListings(moduleId, next, updateModule);
                }}
                onRemove={() => {
                  const list = listingsFor(content, moduleId);
                  setListings(
                    moduleId,
                    list.filter((x) => x.id !== item.id),
                    updateModule
                  );
                }}
              />
            </article>
          ))
        : null}

      {section === "listings" &&
      moduleId !== "tourism" &&
      moduleId !== "youth" &&
      moduleId !== "buy-uganda" &&
      moduleId !== "charity" ? (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginBottom: 16 }}
          onClick={() => {
            const list = listingsFor(content, moduleId);
            setListings(
              moduleId,
              [
                ...list,
                {
                  id: newItemId("listing"),
                  title: "New listing",
                  coverImage: "/branding/plu-services-hero.png",
                  gallery: [],
                },
              ],
              updateModule
            );
          }}
        >
          Add listing
        </button>
      ) : null}

      <section className="admin-duty__section card">
        <h2>Publish to server</h2>
        <label className="admin-duty__field">
          <span>Admin password</span>
          <input
            type="password"
            value={serverPassword}
            onChange={(e) => setServerPassword(e.target.value)}
          />
        </label>
        <button type="button" className="btn btn-primary" disabled={saving} onClick={() => void onSaveServer()}>
          {saving ? "Publishing…" : "Publish content"}
        </button>
      </section>
    </main>
  );
}

function listingsFor(
  content: ReturnType<typeof useServiceContent>["content"],
  moduleId: ServiceModuleId
): ServiceListingEntry[] {
  const slice = content[moduleId];
  if (slice && "listings" in slice) return slice.listings;
  return [];
}

function setListings(
  moduleId: ServiceModuleId,
  listings: ServiceListingEntry[],
  updateModule: ReturnType<typeof useServiceContent>["updateModule"]
) {
  if (moduleId === "csr") updateModule("csr", { listings });
  if (moduleId === "education") updateModule("education", { listings });
  if (moduleId === "tv") updateModule("tv", { listings });
  if (moduleId === "mobility") updateModule("mobility", { listings });
  if (moduleId === "leadership") updateModule("leadership", { listings });
  if (moduleId === "projects") updateModule("projects", { listings });
}

function FeaturedEditor({
  item,
  onChange,
  onRemove,
}: {
  item: FeaturedSupplierEntry;
  onChange: (patch: Partial<FeaturedSupplierEntry>) => void;
  onRemove: () => void;
}) {
  return (
    <>
      <div className="admin-duty__card-head">
        <h3 className="admin-duty__card-title">{item.name}</h3>
        <button type="button" className="admin-duty__remove" onClick={onRemove}>
          Remove
        </button>
      </div>
      <label className="admin-duty__field">
        <span>Name</span>
        <input value={item.name} onChange={(e) => onChange({ name: e.target.value })} />
      </label>
      <label className="admin-duty__field">
        <span>District</span>
        <input value={item.district} onChange={(e) => onChange({ district: e.target.value })} />
      </label>
      <label className="admin-duty__field">
        <span>Cover image URL</span>
        <input
          value={item.coverImage ?? ""}
          onChange={(e) => onChange({ coverImage: e.target.value })}
        />
      </label>
    </>
  );
}

function CharityEditor({
  drive,
  onChange,
  onRemove,
}: {
  drive: CharityDriveEntry;
  onChange: (patch: Partial<CharityDriveEntry>) => void;
  onRemove: () => void;
}) {
  return (
    <>
      <div className="admin-duty__card-head">
        <h3 className="admin-duty__card-title">{drive.name}</h3>
        <button type="button" className="admin-duty__remove" onClick={onRemove}>
          Remove
        </button>
      </div>
      <label className="admin-duty__field">
        <span>Name</span>
        <input value={drive.name} onChange={(e) => onChange({ name: e.target.value })} />
      </label>
      <label className="admin-duty__field">
        <span>Cover image URL</span>
        <input value={drive.coverImage} onChange={(e) => onChange({ coverImage: e.target.value })} />
      </label>
      <GalleryEditor
        gallery={drive.gallery}
        onChange={(gallery) => onChange({ gallery })}
      />
    </>
  );
}

function ListingEditor({
  item,
  onChange,
  onRemove,
}: {
  item: ServiceListingEntry;
  onChange: (patch: Partial<ServiceListingEntry>) => void;
  onRemove: () => void;
}) {
  return (
    <>
      <div className="admin-duty__card-head">
        <h3 className="admin-duty__card-title">{item.title}</h3>
        <button type="button" className="admin-duty__remove" onClick={onRemove}>
          Remove
        </button>
      </div>
      <label className="admin-duty__field">
        <span>Title</span>
        <input value={item.title} onChange={(e) => onChange({ title: e.target.value })} />
      </label>
      <label className="admin-duty__field">
        <span>Subtitle</span>
        <input value={item.subtitle ?? ""} onChange={(e) => onChange({ subtitle: e.target.value })} />
      </label>
      <label className="admin-duty__field">
        <span>Cover image URL</span>
        <input value={item.coverImage} onChange={(e) => onChange({ coverImage: e.target.value })} />
      </label>
      <GalleryEditor gallery={item.gallery} onChange={(gallery) => onChange({ gallery })} />
    </>
  );
}
