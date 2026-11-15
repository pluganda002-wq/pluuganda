import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Mic, Square, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useTelegram } from "@/hooks/useTelegram";
import { isApiUnavailableError, submitReportApi } from "@/lib/api";
import "./ReportPage.css";

const MAX_RECORD_SEC = 120;
const MIN_RECORD_SEC = 2;

type SavedRecording = {
  blob: Blob;
  url: string;
  durationSec: number;
  mimeType: string;
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function ReportPage() {
  const { user, haptic, showAlert } = useTelegram();
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [category, setCategory] = useState("procurement");
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");
  const [recording, setRecording] = useState<SavedRecording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      stopStream();
      if (recording?.url) URL.revokeObjectURL(recording.url);
    };
  }, [recording?.url]);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia) {
      showAlert("Recording needs microphone access. Use Telegram on your phone.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const durationSec = Math.max(
          MIN_RECORD_SEC,
          Math.round((Date.now() - recordStartRef.current) / 1000)
        );
        const url = URL.createObjectURL(blob);
        setRecording((prev) => {
          if (prev?.url) URL.revokeObjectURL(prev.url);
          return { blob, url, durationSec, mimeType };
        });
        stopStream();
        setIsRecording(false);
        if (tickRef.current) {
          clearInterval(tickRef.current);
          tickRef.current = null;
        }
        haptic("light");
      };
      mediaRecorderRef.current = recorder;
      recordStartRef.current = Date.now();
      setRecordSec(0);
      setIsRecording(true);
      recorder.start(250);
      haptic("medium");
      tickRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordStartRef.current) / 1000);
        setRecordSec(elapsed);
        if (elapsed >= MAX_RECORD_SEC) stopRecording();
      }, 500);
    } catch {
      showAlert("Microphone permission denied. Allow mic access in Telegram or browser settings.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
  }

  function clearRecording() {
    if (recording?.url) URL.revokeObjectURL(recording.url);
    setRecording(null);
    setRecordSec(0);
    haptic("light");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const hasRecording = Boolean(recording && recording.durationSec >= MIN_RECORD_SEC);
    if (details.trim().length < 20 && !hasRecording) {
      showAlert("Add at least 20 characters of detail, or attach a voice recording (min 2 seconds).");
      return;
    }
    if (isRecording) {
      showAlert("Stop the recording before you submit.");
      return;
    }

    let audioRecording: { mimeType: string; durationSec: number; dataBase64: string } | undefined;
    if (recording) {
      const dataBase64 = await blobToBase64(recording.blob);
      if (dataBase64.length > 2_500_000) {
        showAlert("Recording is too large. Record a shorter message (under 2 minutes).");
        return;
      }
      audioRecording = {
        mimeType: recording.mimeType,
        durationSec: recording.durationSec,
        dataBase64,
      };
    }

    setSubmitted(true);
    try {
      const result = await submitReportApi({
        category,
        details: details.trim() || "(Voice report — see attached recording.)",
        contact: contact.trim() || undefined,
        telegramId: user?.id,
        audioRecording,
      });
      setReference(result.reference);
      haptic("medium");
      showAlert(`Report received. Reference: ${result.reference}`);
    } catch (err) {
      haptic("medium");
      if (isApiUnavailableError(err)) {
        showAlert("Report queued on device. Add MONGODB_URI on Vercel to store securely.");
      } else {
        showAlert("Server error. Please try again or contact the Secretariat.");
        setSubmitted(false);
      }
    }
  }

  if (submitted) {
    return (
      <main className="page">
        <PageHeader title="Report submitted" subtitle="Thank you for protecting public resources." />
        <div className="card">
          <p className="badge badge-green">Queued for review</p>
          {reference ? (
            <p style={{ marginTop: 12, fontWeight: 600 }}>Reference: {reference}</p>
          ) : null}
          <p style={{ marginTop: 12, color: "var(--plu-muted)", fontSize: "0.9rem" }}>
            Your report is encrypted in transit. Do not share sensitive identity details in open channels.
          </p>
        </div>
        <Link to="/integrity" className="btn btn-secondary" style={{ marginTop: 16 }}>
          Back to corruption tracker
        </Link>
      </main>
    );
  }

  return (
    <main className="page">
      <PageHeader
        title="Whistleblower report"
        subtitle="Written details, optional voice recording, and encrypted handling for the integrity workflow."
      />
      <form className="card" onSubmit={(e) => void onSubmit(e)}>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="procurement">Public procurement</option>
            <option value="service">Service delivery</option>
            <option value="revenue">Local revenue / fees</option>
            <option value="bribery">Bribery or inducement</option>
            <option value="ghost">Ghost project / stalled works</option>
            <option value="other">Other public resource abuse</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="details">What happened?</label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe the incident, location, dates and any references (avoid naming victims)."
          />
        </div>

        <div className="report-recording">
          <span className="report-recording__label">Voice recording (optional)</span>
          <p className="report-recording__hint">
            Record a secure voice note instead of or with your written report. Max {MAX_RECORD_SEC} seconds.
          </p>
          <p
            className={`report-recording__timer${isRecording ? "" : " report-recording__timer--idle"}`}
            aria-live="polite"
          >
            {isRecording
              ? `Recording… ${recordSec}s`
              : recording
                ? `Saved · ${recording.durationSec}s`
                : "Not recording"}
          </p>
          <div className="report-recording__actions">
            {!isRecording ? (
              <button type="button" className="btn btn-secondary" onClick={() => void startRecording()}>
                <Mic size={18} /> Record
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={stopRecording}>
                <Square size={16} fill="currentColor" /> Stop
              </button>
            )}
            {recording && !isRecording ? (
              <button type="button" className="btn btn-secondary" onClick={clearRecording}>
                <Trash2 size={18} /> Remove
              </button>
            ) : null}
          </div>
          {recording && !isRecording ? (
            <>
              <p className="report-recording__status">Recording will be submitted with your report.</p>
              <audio controls src={recording.url} preload="metadata">
                Your browser does not support audio playback.
              </audio>
            </>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="contact">Optional contact (encrypted in production)</label>
          <input
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Phone or email for follow-up"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit report
        </button>
      </form>
    </main>
  );
}