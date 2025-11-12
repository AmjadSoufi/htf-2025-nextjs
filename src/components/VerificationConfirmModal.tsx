"use client";

import React from "react";
import { ConfidenceMeter } from "./VerificationBadge";

interface VerificationData {
  isVerified: boolean;
  confidence: number;
  detectedSpecies: string | null;
  matchScore: number;
  reasons: string[];
  timestamp: string;
}

interface Props {
  open: boolean;
  verification: VerificationData | null;
  fishName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function VerificationConfirmModal({
  open,
  verification,
  fishName,
  onConfirm,
  onCancel,
}: Props) {
  if (!open || !verification) return null;

  const confidencePercent = Math.round(verification.confidence * 100);
  const isLowConfidence = verification.confidence < 0.65;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative max-w-md w-full bg-gradient-to-br from-[#0a1829] via-[#081525] to-[#021018] border-2 border-orange-500/50 rounded-xl shadow-[0_0_50px_rgba(249,115,22,0.4)] p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500/20 border-2 border-orange-500/50 flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-orange-400 mb-1">
              AI Verification Warning
            </h2>
            <p className="text-sm text-text-secondary">
              Low confidence match detected
            </p>
          </div>
        </div>

        {/* Fish Info */}
        <div className="bg-panel-bg/30 border border-panel-border rounded-lg p-3 mb-4">
          <div className="text-xs text-text-secondary mb-1">
            Attempting to verify:
          </div>
          <div className="text-base font-bold text-sonar-green">{fishName}</div>
        </div>

        {/* Confidence Score */}
        <div className="bg-panel-bg/30 border border-panel-border rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-text-secondary">
              AI Confidence Score
            </span>
            <span
              className={`text-2xl font-bold ${
                confidencePercent >= 50 ? "text-yellow-400" : "text-orange-400"
              }`}
            >
              {confidencePercent}%
            </span>
          </div>
          <ConfidenceMeter confidence={verification.confidence} />

          {verification.detectedSpecies && (
            <div className="mt-3 text-xs text-text-secondary">
              Detected:{" "}
              <span className="text-white">{verification.detectedSpecies}</span>
            </div>
          )}
        </div>

        {/* Reasons */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-6">
          <div className="text-sm font-semibold text-orange-400 mb-2">
            Verification Issues:
          </div>
          <ul className="space-y-1.5">
            {verification.reasons.map((reason, idx) => (
              <li
                key={idx}
                className="text-xs text-text-secondary flex items-start gap-2"
              >
                <span className="text-orange-400 flex-shrink-0 mt-0.5">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Warning Message */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
          <div className="flex items-start gap-2">
            <span className="text-red-400 text-lg flex-shrink-0">⚡</span>
            <div className="text-xs text-red-300">
              <strong>Note:</strong> Submitting unverified sightings may affect
              data quality. Please ensure the photo clearly shows{" "}
              <strong>{fishName}</strong>.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-panel-bg border-2 border-panel-border hover:border-sonar-green/50 text-white rounded-lg font-semibold transition-all hover:bg-panel-bg/80"
          >
            ← Retake Photo
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-orange-600/20 border-2 border-orange-600/50 hover:bg-orange-600/30 text-orange-300 hover:text-orange-200 rounded-lg font-semibold transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]"
          >
            Submit Anyway →
          </button>
        </div>

        {/* Tip */}
        <div className="mt-4 text-center text-xs text-text-secondary">
          💡 Tip: Better lighting and closer photos improve verification
          accuracy
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
