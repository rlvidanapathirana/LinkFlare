"use client";

import { useRef } from "react";
import { X, Download, Copy, Check } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";

interface Props {
  shortUrl: string;
  slug: string;
  onClose: () => void;
}

export default function QRModal({ shortUrl, slug, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const canvasId = `qr-modal-canvas-${slug}`;

  const handleDownload = () => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `linkflare-qr-${slug}.png`;
    a.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content p-6 text-center" style={{ maxWidth: 380 }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg font-display" style={{ color: "var(--text)" }}>QR Code</h3>
          <button onClick={onClose} className="btn-ghost w-8 h-8 p-0" id="close-qr-btn"><X size={16} /></button>
        </div>

        {/* QR Code */}
        <div className="inline-block p-4 rounded-2xl bg-white mb-4 shadow-lg">
          <QRCodeCanvas
            id={canvasId}
            value={shortUrl}
            size={200}
            bgColor="#ffffff"
            fgColor="#1e1b4b"
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Short URL */}
        <p className="font-mono text-sm font-medium mb-5 truncate" style={{ color: "var(--accent)" }}>
          {shortUrl}
        </p>

        <div className="flex gap-2">
          <button onClick={handleCopy} className="btn-secondary flex-1" id="copy-qr-url-btn">
            {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy URL</>}
          </button>
          <button onClick={handleDownload} className="btn-primary flex-1" id="download-qr-modal-btn">
            <Download size={15} /> Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}
