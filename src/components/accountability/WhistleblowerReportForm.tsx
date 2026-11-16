import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { Mic, Square, Trash2 } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { isApiUnavailableError, submitReportApi } from "@/lib/api";
import "@/pages/ReportPage.css";

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

type Props = {
  embedded?: boolean;
  onSubmitted?: (reference: string) => void;
};

export function WhistleblowerReportForm({ embedded = false, onSubmitted }: Props) {
  const uid = useId();
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

  const categoryId = `${uid}-category`;
  const detailsId = `${uid}-details`;
  const contactId = `${uid}-contact`;

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
      showAlert("Add a short written note (20+ letters) or record your voice (2+ seconds).");
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
      onSubmitted?.(result.reference);
    } catch (err) {
      haptic("medium");
      if (isApiUnavailableError(err)) {
        showAlert("Report queued on device. Add MONGODB_URI on Vercel to store securely.");
      } else {
        showAlert("Server error. Please try again.");
        setSubmitted(false);
      }
    }
  }

  if (submitted) {
    return (
      <div className={`whistle-done${embedded ? " whistle-done--embed" : ""}`}>
        <p className="badge badge-green">Submitted</p>
        {reference ? <p className="whistle-done__ref">Ref: {reference}</p> : null}
      </div>
    );
  }

  return (
    <form
      className={`whistle-form${embedded ? " whistle-form--embed card" : " card"}`}
      onSubmit={(e) => void onSubmit(e)}
    >
      {embedded ? <h2 className="whistle-form__title">Whistleblower report</h2> : null}
      <div className="field">
        <label htmlFor={categoryId}>Category</label>
        <select id={categoryId} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="procurement">Public procurement</option>
          <option value="service">Service delivery</option>
          <option value="revenue">Local revenue / fees</option>
          <option value="bribery">Bribery or inducement</option>
          <option value="ghost">Ghost project / stalled works</option>
          <option value="other">Other public resource abuse</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor={detailsId}>What happened?</label>
        <textarea
          id={detailsId}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Where, when, and what you saw."
          rows={embedded ? 3 : 4}
        />
      </div>

      <div className="report-recording">
        <p className="report-recording__hint">Tap the mic and record your submission (optional).</p>
        <div className="report-recording__mic-row">
          {!isRecording ? (
            <button
              type="button"
              className={`report-recording__mic${recording ? " report-recording__mic--saved" : ""}`}
              aria-label={recording ? "Record again" : "Start recording"}
              onClick={() => void startRecording()}
            >
              <Mic size={28} strokeWidth={2.2} />
            </button>
          ) : (
            <button
              type="button"
              className="report-recording__mic report-recording__mic--live"
              aria-label="Stop recording"
              onClick={stopRecording}
            >
              <Square size={22} fill="currentColor" />
            </button>
          )}
          <p className="report-recording__status" aria-live="polite">
            {isRecording
              ? `Recording… ${recordSec}s`
              : recording
                ? `Saved · ${recording.durationSec}s`
                : "No recording yet"}
          </p>
        </div>
        {recording && !isRecording ? (
          <div className="report-recording__saved">
            <audio controls src={recording.url} preload="metadata">
              Your browser does not support audio playback.
            </audio>
            <button type="button" className="report-recording__remove" onClick={clearRecording}>
              <Trash2 size={16} /> Remove
            </button>
          </div>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor={contactId}>Contact (optional)</label>
        <input
          id={contactId}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Phone or email"
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
}