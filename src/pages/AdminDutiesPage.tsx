import { useMemo, useState } from "react";
import type { DutyIconKey, DutyTask } from "@/data/dutyVerification";
import {
  DIGITAL_PLATFORM_PRESETS,
  newDigitalTaskFromPreset,
} from "@/data/digitalActivityPresets";
import { DutyPlatformIcon } from "@/components/accountability/DutyPlatformIcon";
import { useDutyConfig } from "@/context/DutyConfigContext";
import { useTelegram } from "@/hooks/useTelegram";
import "./AdminDutiesPage.css";

const PLATFORM_CTA: Partial<Record<DutyIconKey, string>> = {
  youtube: "Subscribe",
  tiktok: "Follow",
  facebook: "Like",
  zoom: "Join",
  telegram: "Join",
  whatsapp: "Share",
  x: "Repost",
  education: "Start",
};

const ROUTE_OPTIONS = [
  { value: "", label: "In-app duty page only" },
  { value: "/social", label: "Social feed" },
  { value: "/tv", label: "PLU TV" },
  { value: "/integrity", label: "Projects dashboard" },
  { value: "/education", label: "Civic education" },
];

function DigitalTaskEditor({
  task,
  onChange,
  onRemove,
}: {
  task: DutyTask;
  onChange: (patch: Partial<DutyTask>) => void;
  onRemove: () => void;
}) {
  return (
    <article className="admin-duty__card admin-duty__card--digital">
      <div className="admin-duty__card-head">
        <span className="admin-duty__platform-preview">
          <DutyPlatformIcon iconKey={task.iconKey} size={32} />
        </span>
        <h3 className="admin-duty__card-title">{task.title}</h3>
        <button type="button" className="admin-duty__remove" onClick={onRemove}>
          Remove
        </button>
      </div>
      <label className="admin-duty__field">
        <span>Title</span>
        <input
          value={task.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </label>
      <label className="admin-duty__field">
        <span>Subtitle</span>
        <input
          value={task.subtitle ?? ""}
          onChange={(e) => onChange({ subtitle: e.target.value })}
        />
      </label>
      <label className="admin-duty__field">
        <span>Platform icon</span>
        <select
          value={task.iconKey ?? "link"}
          onChange={(e) => {
            const iconKey = e.target.value as DutyIconKey;
            onChange({
              iconKey,
              cta: PLATFORM_CTA[iconKey] ?? task.cta,
            });
          }}
        >
          <option value="youtube">YouTube</option>
          <option value="tiktok">TikTok</option>
          <option value="facebook">Facebook</option>
          <option value="zoom">Zoom</option>
          <option value="telegram">Telegram</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="x">X (Twitter)</option>
          <option value="share">Share (generic)</option>
          <option value="education">Education</option>
        </select>
      </label>
      <div className="admin-duty__row">
        <label className="admin-duty__field">
          <span>Button label</span>
          <input value={task.cta} onChange={(e) => onChange({ cta: e.target.value })} />
        </label>
        <label className="admin-duty__field admin-duty__field--narrow">
          <span>Points</span>
          <input
            type="number"
            min={0}
            value={task.points}
            onChange={(e) => onChange({ points: Number(e.target.value) || 0 })}
          />
        </label>
      </div>
      <label className="admin-duty__field">
        <span>Open route</span>
        <select
          value={task.actionTo ?? ""}
          onChange={(e) => onChange({ actionTo: e.target.value || undefined })}
        >
          {ROUTE_OPTIONS.map((o) => (
            <option key={o.value || "none"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-duty__field">
        <span>Telegram / external link (optional)</span>
        <input
          value={task.externalUrl ?? ""}
          onChange={(e) => onChange({ externalUrl: e.target.value || undefined })}
          placeholder="https://t.me/..."
        />
      </label>
      <label className="admin-duty__field">
        <span>Instructions (duty brief)</span>
        <textarea
          rows={3}
          value={task.instructions ?? ""}
          onChange={(e) => onChange({ instructions: e.target.value || undefined })}
        />
      </label>
    </article>
  );
}

function FieldTaskEditor({
  task,
  onChange,
}: {
  task: DutyTask;
  onChange: (patch: Partial<DutyTask>) => void;
}) {
  return (
    <article className="admin-duty__card admin-duty__card--field">
      <h3 className="admin-duty__card-title">{task.title}</h3>
      <label className="admin-duty__field">
        <span>Title</span>
        <input value={task.title} onChange={(e) => onChange({ title: e.target.value })} />
      </label>
      <label className="admin-duty__field">
        <span>Category tag</span>
        <input
          value={task.categoryLabel ?? ""}
          onChange={(e) => onChange({ categoryLabel: e.target.value || undefined })}
        />
      </label>
      <label className="admin-duty__field">
        <span>Location</span>
        <input value={task.location ?? ""} onChange={(e) => onChange({ location: e.target.value || undefined })} />
      </label>
      <label className="admin-duty__field">
        <span>Description</span>
        <textarea
          rows={3}
          value={task.description ?? ""}
          onChange={(e) => onChange({ description: e.target.value || undefined })}
        />
      </label>
      <div className="admin-duty__row">
        <label className="admin-duty__field admin-duty__field--narrow">
          <span>Points</span>
          <input
            type="number"
            min={0}
            value={task.points}
            onChange={(e) => onChange({ points: Number(e.target.value) || 0 })}
          />
        </label>
        <label className="admin-duty__field">
          <span>Button label</span>
          <input value={task.cta} onChange={(e) => onChange({ cta: e.target.value })} />
        </label>
      </div>
    </article>
  );
}

function AssigneeTaskEditor({
  task,
  onChange,
  variant,
}: {
  task: DutyTask;
  onChange: (patch: Partial<DutyTask>) => void;
  variant: "advanced" | "classified";
}) {
  return (
    <article className={`admin-duty__card admin-duty__card--${variant}`}>
      <h3 className="admin-duty__card-title">{task.title}</h3>
      <label className="admin-duty__field">
        <span>Title</span>
        <input value={task.title} onChange={(e) => onChange({ title: e.target.value })} />
      </label>
      <label className="admin-duty__field">
        <span>Subtitle</span>
        <input value={task.subtitle ?? ""} onChange={(e) => onChange({ subtitle: e.target.value || undefined })} />
      </label>
      {variant === "classified" ? (
        <>
          <label className="admin-duty__field">
            <span>Directive description</span>
            <textarea
              rows={3}
              value={task.description ?? ""}
              onChange={(e) => onChange({ description: e.target.value || undefined })}
            />
          </label>
          <label className="admin-duty__field">
            <span>Open route (optional)</span>
            <select
              value={task.actionTo ?? ""}
              onChange={(e) => onChange({ actionTo: e.target.value || undefined })}
            >
              {ROUTE_OPTIONS.map((o) => (
                <option key={o.value || "none"} value={o.value}>
                  {o.label}
                </option>
              ))}
              <option value="/integrity/report">Civic watch report</option>
            </select>
          </label>
        </>
      ) : null}
      <label className="admin-duty__field">
        <span>Assignee Telegram user ID</span>
        <input
          inputMode="numeric"
          placeholder="e.g. 123456789"
          value={task.assigneeTelegramId ?? ""}
          onChange={(e) => {
            const v = e.target.value.trim();
            onChange({
              assigneeTelegramId: v ? Number(v) : undefined,
              cta: v ? "Open" : "Locked",
            });
          }}
        />
      </label>
      <label className="admin-duty__field">
        <span>Assignee label</span>
        <input
          value={task.assigneeLabel ?? ""}
          onChange={(e) => onChange({ assigneeLabel: e.target.value || undefined })}
          placeholder="District coordinator"
        />
      </label>
      <div className="admin-duty__row">
        <label className="admin-duty__field admin-duty__field--narrow">
          <span>Points</span>
          <input
            type="number"
            min={0}
            value={task.points}
            onChange={(e) => onChange({ points: Number(e.target.value) || 0 })}
          />
        </label>
        <label className="admin-duty__field">
          <span>Button label</span>
          <input value={task.cta} onChange={(e) => onChange({ cta: e.target.value })} />
        </label>
      </div>
    </article>
  );
}

export function AdminDutiesPage() {
  const {
    tasks,
    source,
    loading,
    updateTask,
    addTask,
    removeTask,
    resetToDefaults,
    saveToServer,
    isAdmin,
    adminLogin,
    adminLogout,
  } = useDutyConfig();
  const { showAlert } = useTelegram();
  const [password, setPassword] = useState("");
  const [serverPassword, setServerPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const digital = useMemo(() => tasks.filter((t) => t.kind === "digital"), [tasks]);
  const field = useMemo(() => tasks.filter((t) => t.kind === "field"), [tasks]);
  const advanced = useMemo(() => tasks.filter((t) => t.kind === "advanced"), [tasks]);
  const classified = useMemo(() => tasks.filter((t) => t.kind === "classified"), [tasks]);

  if (!isAdmin) {
    return (
      <main className="page admin-duty">
        <header className="admin-duty__head">
          <p className="admin-duty__tag">Secretariat</p>
          <h1>Duty administration</h1>
          <p className="admin-duty__lead">
            Configure digital & field duties and assign advanced / classified tasks.
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
      showAlert("Duties published for all patriots.");
      setServerPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      showAlert(msg.includes("401") ? "Server rejected password." : "Could not publish. Saved on this device only.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page admin-duty">
      <header className="admin-duty__head">
        <p className="admin-duty__tag">Secretariat</p>
        <h1>Duty administration</h1>
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

      <section className="admin-duty__section">
        <h2>Digital duties</h2>
        <p className="admin-duty__hint">
          Add an activity — platform logo is set automatically. Edit title, points, and links below.
        </p>
        <div className="admin-duty__platform-add" role="list">
          {DIGITAL_PLATFORM_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="admin-duty__platform-btn"
              onClick={() => addTask(newDigitalTaskFromPreset(preset))}
            >
              <DutyPlatformIcon iconKey={preset.id} size={28} />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
        {digital.map((task) => (
          <DigitalTaskEditor
            key={task.id}
            task={task}
            onChange={(patch) => updateTask(task.id, patch)}
            onRemove={() => removeTask(task.id)}
          />
        ))}
      </section>

      <section className="admin-duty__section">
        <h2>Field actions</h2>
        <p className="admin-duty__hint">Parish mobilisation, handbooks, community welfare tasks.</p>
        {field.map((task) => (
          <FieldTaskEditor key={task.id} task={task} onChange={(patch) => updateTask(task.id, patch)} />
        ))}
      </section>

      <section className="admin-duty__section">
        <h2>Advanced assignments</h2>
        <p className="admin-duty__hint">Telegram user ID required to unlock each duty.</p>
        {advanced.map((task) => (
          <AssigneeTaskEditor
            key={task.id}
            task={task}
            variant="advanced"
            onChange={(patch) => updateTask(task.id, patch)}
          />
        ))}
      </section>

      <section className="admin-duty__section">
        <h2>Classified directives</h2>
        <p className="admin-duty__hint">
          Only assigned patriots see the Classified tab. Use for &quot;Report this account&quot; and similar.
        </p>
        {classified.map((task) => (
          <AssigneeTaskEditor
            key={task.id}
            task={task}
            variant="classified"
            onChange={(patch) => updateTask(task.id, patch)}
          />
        ))}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            addTask({
              id: `cls-${Date.now()}`,
              kind: "classified",
              categoryLabel: "Classified",
              title: "Report this account",
              subtitle: "Integrity directive",
              description: "Follow secretariat briefing. Do not disclose assignment.",
              points: 100,
              cta: "Locked",
              iconKey: "classified",
              actionTo: "/integrity/report",
              assigneeLabel: "Assign patriot below",
            })
          }
        >
          + Add classified duty
        </button>
      </section>

      <section className="admin-duty__publish card">
        <h2>Publish to server</h2>
        <p className="admin-duty__hint">
          Uses <code>ADMIN_ITEM_PASSWORD_MANAGE_TASKS</code> on Vercel. Patriots load duties from the database.
        </p>
        <label className="admin-duty__field">
          <span>Server password</span>
          <input
            type="password"
            value={serverPassword}
            onChange={(e) => setServerPassword(e.target.value)}
          />
        </label>
        <button type="button" className="btn btn-primary" disabled={saving} onClick={() => void onSaveServer()}>
          {saving ? "Publishing…" : "Publish duties"}
        </button>
      </section>
    </main>
  );
}