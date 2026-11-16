import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { Mic, Paperclip, Square, X } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { CIVIC_WATCH_FORM_TITLE } from "@/data/accountabilityProgramme";
import { WhistleblowerDisclaimer } from "@/components/accountability/WhistleblowerDisclaimer";
import { isApiUnavailableError, submitReportApi } from "@/lib/api";
import "@/pages/ReportPage.css";

const MAX_RECORD_SEC = 120;
const MIN_RECORD_SEC = 2;
const MAX_FILE_BYTES = 5_000_000;

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
  const [shareIdentity, setShareIdentity] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [recording, setRecording] = useState<SavedRecording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryId = `${uid}-category`;
  const detailsId = `${uid}-details`;
  const nameId = `${uid}-name`;
  const phoneId = `${uid}-phone`;
  const identityToggleId = `${uid}-identity`;

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

  function onPickFile() {
    fileInputRef.current?.click();
  }

  function onFileChange(file: File | null) {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      showAlert("File too large. Use a file under 5 MB.");
      return;
    }
    setAttachmentName(file.name);
    haptic("light");
  }

  function clearAttachment() {
    setAttachmentName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const hasRecording = Boolean(recording && recording.durationSec >= MIN_RECORD_SEC);
    const hasAttachment = Boolean(attachmentName);
    const trimmed = details.trim();
    const longEnough = trimmed.length >= 20;

    if (!longEnough && !hasRecording && !hasAttachment) {
      showAlert("Add a short note, record voice, or attach a file.");
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

    let detailBody =
      trimmed ||
      (hasRecording ? "(Voice report — see attached recording.)" : "(Report with attachment.)");
    if (hasAttachment && attachmentName) {
      detailBody += `\n\n[Attachment: ${attachmentName}]`;
    }

    const contactParts = [fullName.trim(), phone.trim()].filter(Boolean);
    const contact = shareIdentity && contactParts.length > 0 ? contactParts.join(" · ") : undefined;

    setSubmitted(true);
    try {
      const result = await submitReportApi({
        category,
        details: detailBody,
        contact,
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
      {embedded ? <h2 className="whistle-form__title">{CIVIC_WATCH_FORM_TITLE}</h2> : null}
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
      <div className="field field--details">
        <label htmlFor={detailsId}>What happened?</label>
        <textarea
          id={detailsId}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Where, when, and what you saw."
          rows={embedded ? 7 : 6}
        />
      </div>

      <ReportMediaControls
        compact
        isRecording={isRecording}
        recordSec={recordSec}
        recording={recording}
        attachmentName={attachmentName}
        fileInputRef={fileInputRef}
        onStartRecording={() => void startRecording()}
        onStopRecording={stopRecording}
        onClearRecording={clearRecording}
        onPickFile={onPickFile}
        onFileChange={onFileChange}
        onClearAttachment={clearAttachment}
      />

      <label className="whistle-identity-toggle" htmlFor={identityToggleId}>
        <input
          id={identityToggleId}
          type="checkbox"
          checked={shareIdentity}
          onChange={(e) => setShareIdentity(e.target.checked)}
        />
        I choose to share my name and phone
      </label>

      {shareIdentity ? (
        <div className="whistle-identity__fields">
          <div className="field">
            <label htmlFor={nameId}>Full name</label>
            <input
              id={nameId}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="field">
            <label htmlFor={phoneId}>Phone number</label>
            <input
              id={phoneId}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 07xx xxx xxx"
            />
          </div>
        </div>
      ) : null}

      <WhistleblowerDisclaimer />

      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
}

type MediaControlProps = {
  compact?: boolean;
  isRecording: boolean;
  recordSec: number;
  recording: SavedRecording | null;
  attachmentName: string | null;
  fileInputRef: { current: HTMLInputElement | null };
  onStartRecording: () => void;
  onStopRecording: () => void;
  onClearRecording: () => void;
  onPickFile: () => void;
  onFileChange: (file: File | null) => void;
  onClearAttachment: () => void;
};

function ReportMediaControls(props: MediaControlProps) {
  const {
    compact = false,
    isRecording,
    recordSec,
    recording,
    attachmentName,
    fileInputRef,
    onStartRecording,
    onStopRecording,
    onClearRecording,
    onPickFile,
    onFileChange,
    onClearAttachment,
  } = props;

  const micSize = compact ? 18 : 22;
  const clipSize = compact ? 14 : 16;

  return (
    <div className={`report-media${compact ? " report-media--compact" : ""}`}>
      <div className="report-media__row">
        {!isRecording ? (
          <button
            type="button"
            className={`report-media__mic${recording ? " report-media__mic--saved" : ""}`}
            aria-label={recording ? "Record again" : "Record voice"}
            onClick={onStartRecording}
          >
            <Mic size={micSize} strokeWidth={2.2} />
          </button>
        ) : (
          <button
            type="button"
            className="report-media__mic report-media__mic--live"
            aria-label="Stop recording"
            onClick={onStopRecording}
          >
            <Square size={compact ? 16 : 18} fill="currentColor" />
            <span className="report-media__time">{recordSec}s</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="report-media__file-input"
          accept="image/*,.pdf,.doc,.docx,audio/*,video/*"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
        <button type="button" className="report-media__attach" onClick={onPickFile}>
          <Paperclip size={clipSize} />
          Attach
        </button>
      </div>

      {recording && !isRecording ? (
        <div className="report-media__playback">
          <audio controls src={recording.url} preload="metadata" />
          <button type="button" className="report-media__clear" onClick={onClearRecording} aria-label="Remove recording">
            <X size={16} />
          </button>
        </div>
      ) : null}

      {attachmentName ? (
        <p className="report-media__file">
          <Paperclip size={14} /> {attachmentName}
          <button type="button" onClick={onClearAttachment} aria-label="Remove file">
            <X size={14} />
          </button>
        </p>
      ) : null}
    </div>
  );
}