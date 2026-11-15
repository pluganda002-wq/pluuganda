import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  ACCOUNTABILITY_PROGRAMME,
  ACCOUNTABILITY_QUEUE,
  type AccountabilityQueueItem,
} from "@/data/accountabilityProgramme";
import { CASE_TRACKER } from "@/data/plu";
import { useTelegram } from "@/hooks/useTelegram";
import {
  Bluetooth,
  CloudOff,
  Gauge,
  Lock,
  MapPin,
  Radio,
  RefreshCw,
  SlidersHorizontal,
  Wifi,
} from "lucide-react";
import "./ProgrammesPage.css";

function QueueCard({ item }: { item: AccountabilityQueueItem }) {
  return (
    <article className={`prog-queue prog-queue--${item.priority}`}>
      <div className="prog-queue__head">
        <span className={`prog-queue__badge prog-queue__badge--${item.priority}`}>{item.priorityLabel}</span>
        <span className="prog-queue__time">{item.timeLabel}</span>
      </div>
      <div className="prog-queue__body">
        <div className="prog-queue__copy">
          <h3 className="prog-queue__title">{item.title}</h3>
          <p className="prog-queue__sub">{item.subtitle}</p>
          <dl className="prog-queue__meta">
            <div>
              <MapPin size={12} aria-hidden />
              <span>
                {item.region} · {item.coords}
              </span>
            </div>
            <div>
              <Lock size={12} aria-hidden />
              <span>{item.hash}</span>
            </div>
          </dl>
          <p className="prog-queue__sync">
            <span>{item.sizeLabel}</span>
            <span>{item.syncNote}</span>
          </p>
        </div>
        <div className={`prog-queue__thumb prog-queue__thumb--${item.thumbVariant}`} aria-hidden />
      </div>
      <div className="prog-queue__foot">
        <span>{item.footStatus}</span>
        <Link to={item.inspectTo} className="prog-queue__inspect">
          <SlidersHorizontal size={15} /> Inspect
        </Link>
      </div>
    </article>
  );
}

export function ProgrammesPage() {
  const { haptic, showAlert } = useTelegram();
  const [syncAttempt, setSyncAttempt] = useState(1);
  const [lowBandwidth, setLowBandwidth] = useState(true);

  const online = typeof navigator !== "undefined" ? navigator.onLine : true;
  const queuedCount = ACCOUNTABILITY_QUEUE.length;
  const vaultMb = useMemo(() => 24.6 + queuedCount * 8.2, [queuedCount]);

  function onForceSync() {
    haptic("medium");
    setSyncAttempt((n) => n + 1);
    if (online) {
      showAlert("Uplink available. Opening the national projects & corruption tracker.");
    } else {
      showAlert("No uplink yet. Reports stay encrypted in your local vault until connectivity returns.");
    }
  }

  return (
    <main className="institutional-page prog-page">
      <div className="institutional-page__body prog-page__body">
        <header className="prog-hero">
          <p className="prog-hero__kicker">PLU mini app · Programmes</p>
          <h1 className="prog-hero__title">{ACCOUNTABILITY_PROGRAMME.title}</h1>
          <p className="prog-hero__lead">{ACCOUNTABILITY_PROGRAMME.summary}</p>
          <Link to="/programmes/anti-corruption" className="prog-hero__about">
            Listen · Organise · Act →
          </Link>
        </header>

        <section className="prog-vault card" aria-labelledby="prog-vault-title">
          <div className="prog-vault__head">
            <CloudOff size={20} aria-hidden />
            <div>
              <h2 id="prog-vault-title">{online ? "Secure field vault" : "Offline field vault"}</h2>
              <p>{online ? "Encrypted uplink detected" : "No cellular uplink detected"}</p>
            </div>
            <span className={`prog-vault__mesh${online ? " prog-vault__mesh--up" : ""}`}>
              {online ? "Uplink live" : "Local mesh active"}
            </span>
          </div>
          <div className="prog-vault__grid">
            <div>
              <strong>{queuedCount}</strong>
              <span>Queued</span>
            </div>
            <div>
              <strong>{vaultMb.toFixed(1)} MB</strong>
              <span>Cache vault</span>
            </div>
            <div>
              <strong>{online ? "AUTO" : "HOLD"}</strong>
              <span>Protocol</span>
            </div>
          </div>
          <p className="prog-vault__note">
            Whistleblower and field proofs are stored locally first, then routed to the integrity workflow when uplink
            is stable.
          </p>
        </section>

        <h2 className="prog-section-title">Accountability actions</h2>
        <div className="prog-queue-list">
          {ACCOUNTABILITY_QUEUE.map((item) => (
            <QueueCard key={item.id} item={item} />
          ))}
        </div>

        <div className="prog-actions">
          <Link to="/integrity" className="btn btn-primary prog-actions__open">
            Open national projects & corruption tracker
          </Link>
          <button type="button" className="btn btn-secondary prog-actions__sync" onClick={onForceSync}>
            <RefreshCw size={18} />
            Force uplink check &amp; sync
            <span className="prog-actions__retry">Retry #{syncAttempt}</span>
          </button>
        </div>

        <section className="prog-resiliency" aria-labelledby="prog-resiliency-title">
          <h2 id="prog-resiliency-title" className="prog-section-title">
            Field resiliency
          </h2>
          <div className="prog-resiliency__card card">
            <div className="prog-resiliency__copy">
              <Bluetooth size={20} aria-hidden />
              <p>
                <strong>Bluetooth / P2P handoff (pilot)</strong>
                <span>Offload encrypted queue to a patriot with Starlink at the baraza tent.</span>
              </p>
            </div>
            <Link to="/integrity/report" className="prog-resiliency__btn" onClick={() => haptic("light")}>
              File report
            </Link>
          </div>
          <div className="prog-resiliency__card card">
            <div className="prog-resiliency__copy">
              <Radio size={20} aria-hidden />
              <p>
                <strong>SMS / USSD beacon (pilot)</strong>
                <span>Compressed tip hash when only 2G is available.</span>
              </p>
            </div>
            <button
              type="button"
              className="prog-resiliency__btn"
              onClick={() => {
                haptic("light");
                showAlert(
                  "USSD pilot registers your district code — full report still needs uplink or the secure form."
                );
              }}
            >
              Send <span className="prog-resiliency__pts">+5 pts</span>
            </button>
          </div>
          <label className="prog-compactor">
            <span>
              <Gauge size={16} /> Low bandwidth compactor
            </span>
            <input
              type="checkbox"
              checked={lowBandwidth}
              onChange={(e) => {
                setLowBandwidth(e.target.checked);
                haptic("light");
              }}
            />
          </label>
        </section>

        <section className="prog-cases card" aria-labelledby="prog-cases-title">
          <div className="prog-cases__head">
            <Wifi size={18} aria-hidden />
            <h2 id="prog-cases-title">Public case tracker</h2>
          </div>
          <ul className="prog-cases__list">
            {CASE_TRACKER.map((c) => (
              <li key={c.id}>
                <strong>{c.id}</strong>
                <span>{c.title}</span>
                <em>{c.status}</em>
              </li>
            ))}
          </ul>
          <Link to="/integrity" className="prog-cases__more">
            View all tracked projects →
          </Link>
        </section>

        <footer className="prog-footer">
          <Lock size={14} aria-hidden />
          <p>
            <strong>Proof-of-presence integrity</strong> — Field timestamps and SHA-256 hashes help deter tampering
            before cases reach lawful institutions.
          </p>
          <span>Patriotic League of Uganda · Accountability cryptographic core</span>
        </footer>
      </div>
    </main>
  );
}