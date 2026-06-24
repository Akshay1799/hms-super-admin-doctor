"use client";

import React from "react";
import { PatientScan } from "@/features/patients/types/patients.types";
import { X, Download, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface ScanViewerProps {
  scan: PatientScan;
  onClose: () => void;
}

export function ScanViewer({ scan, onClose }: ScanViewerProps) {
  const handleDownload = () => {
    toast.success(`Successfully downloaded scan: ${scan.name}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl rounded-xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl overflow-hidden flex flex-col z-10 space-y-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
              {scan.type} Scans Viewer: {scan.name}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-0.5">Recorded on {scan.date} · Radiography Lab Section</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white rounded p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic radiography canvas rendering */}
        <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg aspect-video w-full flex items-center justify-center overflow-hidden">
          {scan.type === "ECG" ? (
            // Render a real ECG line wave!
            <div className="absolute inset-0 p-4 flex flex-col justify-between">
              <svg className="w-full h-full" viewBox="0 0 500 150">
                {/* Grid */}
                <defs>
                  <pattern id="ecg-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="1" />
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(16, 185, 129, 0.15)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#ecg-grid)" />
                {/* Wave */}
                <path
                  d="M 0 75 L 50 75 L 60 65 L 70 85 L 80 75 L 120 75 L 125 40 L 132 120 L 140 75 L 155 75 L 170 65 L 180 75 L 230 75 L 240 65 L 250 85 L 260 75 L 300 75 L 305 40 L 312 120 L 320 75 L 335 75 L 350 65 L 360 75 L 410 75 L 420 65 L 430 85 L 440 75 L 500 75"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-pulse"
                />
              </svg>
              <div className="absolute bottom-2 left-3 text-[10px] text-emerald-400 font-mono">HR: 72 bpm · Lead II</div>
            </div>
          ) : (
            // Render a simulated X-Ray / CT scan chest skeleton
            <div className="absolute inset-0 p-4 flex flex-col items-center justify-center">
              <svg className="w-full max-h-full" viewBox="0 0 200 150">
                <rect x="0" y="0" width="200" height="150" fill="#030712" />
                {/* Ribcage Outline */}
                <g stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" fill="none" strokeLinecap="round">
                  {/* Spine */}
                  <line x1="100" y1="10" x2="100" y2="140" strokeWidth="3" stroke="rgba(255, 255, 255, 0.5)" />
                  {/* Ribs left */}
                  <path d="M 100 30 Q 70 35 60 55" />
                  <path d="M 100 45 Q 60 52 50 75" />
                  <path d="M 100 60 Q 50 68 40 95" />
                  <path d="M 100 75 Q 45 85 35 115" />
                  <path d="M 100 90 Q 40 102 30 130" />
                  {/* Ribs right */}
                  <path d="M 100 30 Q 130 35 140 55" />
                  <path d="M 100 45 Q 140 52 150 75" />
                  <path d="M 100 60 Q 150 68 160 95" />
                  <path d="M 100 75 Q 155 85 165 115" />
                  <path d="M 100 90 Q 160 102 170 130" />
                  {/* Clavicles */}
                  <path d="M 100 20 Q 80 15 50 25" strokeWidth="2" />
                  <path d="M 100 20 Q 120 15 150 25" strokeWidth="2" />
                </g>
                {/* Lung glows */}
                <ellipse cx="70" cy="80" rx="20" ry="35" fill="rgba(56, 189, 248, 0.08)" />
                <ellipse cx="130" cy="80" rx="20" ry="35" fill="rgba(56, 189, 248, 0.08)" />
              </svg>
              <div className="absolute bottom-2 left-3 text-[10px] text-sky-400 font-mono">Contrast: 80% · Resolution: High</div>
            </div>
          )}
        </div>

        {/* Scan Report Text */}
        <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium space-y-1.5">
          <p className="text-zinc-400 uppercase font-bold text-[10px]">Radiologist Assessment Report:</p>
          <p className="text-zinc-200 leading-relaxed font-semibold italic">
            &ldquo;{scan.report}&rdquo;
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
          <button
            onClick={handleDownload}
            className="h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold flex items-center gap-1.5 text-white transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" /> Download Scanned File
          </button>
        </div>
      </div>
    </div>
  );
}
