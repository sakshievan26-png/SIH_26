// src/components/upload/UploadScreen.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Camera,
  RefreshCw,
  FileCheck,
  User,
  Shield,
  CheckCircle2,
  Image as ImageIcon,
  VideoOff,
  UserX,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import type { DocumentType } from "../../contracts/common";
import type { ScreeningInput, DemoScenario } from "../../hooks/useScreeningFlow";
import { cn } from "../../lib/utils";

interface UploadScreenProps {
  onStartScreening: (input: ScreeningInput) => void;
}

// ─────────────────────────────────────────────────────────────
// PRESET GRAPHICS (SVGs for instant judge demonstration)
// ─────────────────────────────────────────────────────────────

// Clean, authentic passport
const SAMPLE_DOC_GENUINE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='440' height='280' viewBox='0 0 440 280' fill='%230f172a'><rect width='440' height='280' rx='14' fill='%230b1329' stroke='%2338bdf8' stroke-width='2'/><rect x='15' y='15' width='410' height='40' rx='8' fill='%231e293b'/><text x='30' y='40' fill='%2338bdf8' font-family='monospace' font-weight='bold' font-size='15'>REPUBLIC OF INDIA • PASSPORT</text><rect x='25' y='75' width='90' height='115' rx='8' fill='%231e293b' stroke='%2338bdf8' stroke-width='1.5'/><circle cx='70' cy='120' r='28' fill='%2338bdf8'/><path d='M45 175 Q70 140 95 175' fill='%2338bdf8'/><circle cx='105' cy='85' r='12' fill='%2322c55e' fill-opacity='0.4'/><text x='130' y='95' fill='%23e2e8f0' font-family='sans-serif' font-size='13' font-weight='bold'>AMIT KUMAR SHARMA</text><text x='130' y='120' fill='%2394a3b8' font-family='monospace' font-size='12'>DOC NO: Z1234567</text><text x='130' y='142' fill='%2394a3b8' font-family='monospace' font-size='12'>NATIONALITY: IND</text><text x='130' y='164' fill='%2394a3b8' font-family='monospace' font-size='12'>DOB: 15/05/1990</text><text x='130' y='186' fill='%2394a3b8' font-family='monospace' font-size='12'>EXPIRY: 14/05/2030</text><rect x='25' y='210' width='390' height='55' rx='6' fill='%23020617' stroke='%231e293b'/><text x='35' y='232' fill='%2322c55e' font-family='monospace' font-size='11'>P&lt;INDSHARM&lt;&lt;AMIT&lt;KUMAR&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text><text x='35' y='252' fill='%2322c55e' font-family='monospace' font-size='11'>Z1234567&lt;6IND9005153M3005144&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;4</text></svg>";

// Matching traveler live photo
const SAMPLE_LIVE_GENUINE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320' viewBox='0 0 320 320' fill='%230f172a'><rect width='320' height='320' rx='14' fill='%230b1329' stroke='%2322c55e' stroke-width='2'/><circle cx='160' cy='125' r='52' fill='%2338bdf8'/><path d='M90 240 Q160 170 230 240' fill='%2338bdf8'/><rect x='30' y='270' width='260' height='32' rx='6' fill='%231e293b'/><text x='160' y='291' text-anchor='middle' fill='%2322c55e' font-family='monospace' font-size='11' font-weight='bold'>LIVE CAPTURE: MATCHES DOCUMENT</text></svg>";

// Mismatched traveler live photo (different subject)
const SAMPLE_LIVE_MISMATCH =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320' viewBox='0 0 320 320' fill='%230f172a'><rect width='320' height='320' rx='14' fill='%232a0808' stroke='%23ef4444' stroke-width='2'/><circle cx='160' cy='120' r='54' fill='%23f97316'/><rect x='130' y='110' width='60' height='12' rx='4' fill='%230f172a'/><path d='M80 245 Q160 180 240 245' fill='%23f97316'/><rect x='30' y='270' width='260' height='32' rx='6' fill='%23450a0a'/><text x='160' y='291' text-anchor='middle' fill='%23f87171' font-family='monospace' font-size='11' font-weight='bold'>LIVE CAPTURE: DIFFERENT PERSON</text></svg>";

// Tampered passport (visible cut boundary, altered DOB patch)
const SAMPLE_DOC_TAMPERED =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='440' height='280' viewBox='0 0 440 280' fill='%230f172a'><rect width='440' height='280' rx='14' fill='%23180d0d' stroke='%23f59e0b' stroke-width='2'/><rect x='15' y='15' width='410' height='40' rx='8' fill='%232c1212'/><text x='30' y='40' fill='%23f87171' font-family='monospace' font-weight='bold' font-size='15'>PASSPORT [FORGERY SUSPECT]</text><rect x='25' y='75' width='90' height='115' rx='8' fill='%23450a0a' stroke='%23ef4444' stroke-width='2' stroke-dasharray='4,4'/><circle cx='70' cy='120' r='28' fill='%23f97316'/><path d='M45 175 Q70 140 95 175' fill='%23f97316'/><text x='70' y='70' text-anchor='middle' fill='%23ef4444' font-family='monospace' font-size='9' font-weight='bold'>[SWAPPED PHOTO]</text><text x='130' y='95' fill='%23e2e8f0' font-family='sans-serif' font-size='13' font-weight='bold'>AMIT KUMAR SHARMA</text><text x='130' y='120' fill='%2394a3b8' font-family='monospace' font-size='12'>DOC NO: Z1234567</text><text x='130' y='142' fill='%2394a3b8' font-family='monospace' font-size='12'>NATIONALITY: IND</text><rect x='126' y='150' width='165' height='20' fill='%23ef4444' fill-opacity='0.2' stroke='%23ef4444' stroke-width='1'/><text x='130' y='164' fill='%23fca5a5' font-family='monospace' font-size='12' font-weight='bold'>DOB: 15/05/1990 [ALTERED]</text><text x='130' y='186' fill='%2394a3b8' font-family='monospace' font-size='12'>EXPIRY: 14/05/2030</text><rect x='25' y='210' width='390' height='55' rx='6' fill='%23020617' stroke='%23ef4444'/><text x='35' y='232' fill='%23f59e0b' font-family='monospace' font-size='11'>P&lt;INDSHARM&lt;&lt;AMIT&lt;KUMAR&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text><text x='35' y='252' fill='%23f59e0b' font-family='monospace' font-size='11'>Z1234567&lt;6IND8408223M3005144&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;4</text></svg>";

export function UploadScreen({ onStartScreening }: UploadScreenProps) {
  const [docType, setDocType] = useState<DocumentType>("passport");
  const [docImage, setDocImage] = useState<string | null>(null);
  const [liveImage, setLiveImage] = useState<string | null>(null);
  const [scenario, setScenario] = useState<DemoScenario>("genuine");
  const [isDragging, setIsDragging] = useState(false);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser environment.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      mediaStreamRef.current = stream;
      setCameraActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to access webcam.";
      setCameraError(msg + " You can use the fallback photo upload below.");
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (cameraActive && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraActive]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setLiveImage(dataUrl);
      stopCamera();
    }
  };

  const handleDocFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        setDocImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLivePhotoFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        setLiveImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleDocFile(e.dataTransfer.files[0]);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // THREE DISTINCT DEMO PRESETS
  // ─────────────────────────────────────────────────────────────

  const loadPreset = (targetScenario: DemoScenario) => {
    setScenario(targetScenario);
    setDocType("passport");
    stopCamera();

    if (targetScenario === "genuine") {
      setDocImage(SAMPLE_DOC_GENUINE);
      setLiveImage(SAMPLE_LIVE_GENUINE);
    } else if (targetScenario === "mismatch") {
      setDocImage(SAMPLE_DOC_GENUINE); // Clean passport
      setLiveImage(SAMPLE_LIVE_MISMATCH); // Different traveler face
    } else if (targetScenario === "tampered") {
      setDocImage(SAMPLE_DOC_TAMPERED); // Swapped photo & altered DOB
      setLiveImage(SAMPLE_LIVE_MISMATCH); // Compounding mismatch
    }
  };

  const isReady = Boolean(docImage && liveImage);

  const handleSubmit = () => {
    if (!docImage || !liveImage) return;
    stopCamera();
    onStartScreening({
      documentImageBase64: docImage,
      livePhotoBase64: liveImage,
      documentType: docType,
      scenario,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner / Officer Checkpoint Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                  Intelligent Document Screening Station
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Live Terminal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Checkpoint CP-SIH26-001 • 8-Module Multi-Vector Identity &amp; Integrity Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-slate-300">Demo Presets for Judges</span>
          </div>
        </div>

        {/* THREE DISTINCT DEMO PRESETS BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          {/* Demo 1: Genuine */}
          <button
            type="button"
            onClick={() => loadPreset("genuine")}
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
              scenario === "genuine" && docImage
                ? "bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-500/40"
                : "bg-slate-950/60 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-950"
            )}
          >
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-100">Demo 1: Genuine</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                  PASS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Valid passport • Matching face • Verified DOB &amp; security watermark
              </p>
            </div>
          </button>

          {/* Demo 2: Mismatch */}
          <button
            type="button"
            onClick={() => loadPreset("mismatch")}
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
              scenario === "mismatch" && docImage
                ? "bg-red-500/15 border-red-500/50 shadow-md shadow-red-950/30 ring-1 ring-red-500/40"
                : "bg-slate-950/60 border-slate-800 hover:border-red-500/40 hover:bg-slate-950"
            )}
          >
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 mt-0.5">
              <UserX className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-100">Demo 2: Mismatch</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300">
                  REJECT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Clean document, impersonator photo. Biometric face verification fails.
              </p>
            </div>
          </button>

          {/* Demo 3: Tampered */}
          <button
            type="button"
            onClick={() => loadPreset("tampered")}
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
              scenario === "tampered" && docImage
                ? "bg-amber-500/15 border-amber-500/50 shadow-md shadow-amber-950/30 ring-1 ring-amber-500/40"
                : "bg-slate-950/60 border-slate-800 hover:border-amber-500/40 hover:bg-slate-950"
            )}
          >
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-100">Demo 3: Tampered</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                  FORGERY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Altered photo &amp; DOB patch • High ELA anomaly • Multi-vector failure
              </p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document Upload Section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-200">1. Document Intake</h3>
            </div>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocumentType)}
              className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="passport">Passport</option>
              <option value="visa">Visa</option>
              <option value="national_id">National ID</option>
              <option value="driving_license">Driving License</option>
              <option value="permit">Residence Permit</option>
            </select>
          </div>

          <p className="text-xs text-slate-400">
            Upload document front page (high-resolution image) for OCR, validation, barcode, watermark, and tampering scans.
          </p>

          {/* Upload Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative flex-1 min-h-[220px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all",
              isDragging
                ? "border-blue-500 bg-blue-500/10"
                : docImage
                ? "border-emerald-500/40 bg-slate-950/60"
                : "border-slate-800 hover:border-slate-700 bg-slate-950/40"
            )}
          >
            {docImage ? (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
                <div className="relative max-h-48 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-md">
                  <img
                    src={docImage}
                    alt="Document preview"
                    className="max-h-40 object-contain w-auto rounded"
                  />
                  <div className="absolute top-2 right-2 bg-emerald-500/90 text-white p-1 rounded-full shadow">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-200 transition">
                    Replace Document
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleDocFile(e.target.files[0])}
                    />
                  </label>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => setDocImage(null)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center space-y-3 w-full h-full">
                <div className="p-3 bg-slate-900 rounded-full border border-slate-800 text-slate-400">
                  <Upload className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <span className="text-sm font-medium text-blue-400 hover:underline">
                    Browse document image
                  </span>
                  <span className="text-sm text-slate-400"> or drag and drop</span>
                  <p className="text-[11px] text-slate-500 mt-1">Supports ICAO Doc 9303 Passports &amp; Visas</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleDocFile(e.target.files[0])}
                />
              </label>
            )}
          </div>
        </div>

        {/* Live Facial Capture Section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-200">2. Live Traveler Capture</h3>
            </div>
            {liveImage && (
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400">
            Real-time biometric capture for 1:1 face match and anti-spoofing liveness verification.
          </p>

          <div className="relative flex-1 min-h-[220px] rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden flex flex-col items-center justify-center p-4">
            {cameraActive ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-h-48 object-cover rounded-lg border border-slate-700 transform scale-x-[-1]"
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-28 h-36 border-2 border-dashed border-blue-400/70 rounded-full animate-pulse" />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={captureSnapshot}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Capture Photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : liveImage ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="relative max-h-44 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                  <img
                    src={liveImage}
                    alt="Traveler capture"
                    className="max-h-36 object-contain rounded"
                  />
                  <div className="absolute top-2 right-2 bg-emerald-500/90 text-white p-1 rounded-full shadow">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <RefreshCw className="w-3 h-3" /> Retake with Webcam
                  </button>
                  <span className="text-slate-600">•</span>
                  <label className="cursor-pointer text-xs text-slate-400 hover:text-slate-200">
                    Upload File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleLivePhotoFile(e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400 text-xs font-medium rounded-lg transition"
                  >
                    <Camera className="w-4 h-4" />
                    Open Live Webcam
                  </button>
                </div>

                <div className="flex items-center gap-2 text-slate-600 text-xs">
                  <span className="h-px w-12 bg-slate-800" />
                  <span>or fallback</span>
                  <span className="h-px w-12 bg-slate-800" />
                </div>

                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md transition">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  Upload Portrait File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleLivePhotoFile(e.target.files[0])}
                  />
                </label>

                {cameraError && (
                  <div className="mt-2 text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-md p-2 flex items-start gap-1.5 text-left max-w-sm">
                    <VideoOff className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-400" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/90">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              isReady ? "bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" : "bg-slate-700"
            )}
          />
          <div className="text-xs">
            {isReady ? (
              <p className="text-emerald-400 font-medium">
                Ready for automated inspection pipeline • Active Scenario:{" "}
                <span className="uppercase font-mono font-bold text-white">{scenario}</span>
              </p>
            ) : (
              <p className="text-slate-400">
                Awaiting {!docImage && "Document Image"}
                {!docImage && !liveImage && " and "}
                {!liveImage && "Live Traveler Photo"}
              </p>
            )}
            <p className="text-[11px] text-slate-500">
              Pipeline triggers OCR, Rule Validation, Tampering, Barcode, Watermark, Face Match, Risk Scoring, &amp; Blockchain Audit.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isReady}
          className={cn(
            "w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg",
            isReady
              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 cursor-pointer"
              : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800"
          )}
        >
          <Shield className="w-4 h-4" />
          Begin Automated Screening
        </button>
      </div>
    </div>
  );
}
