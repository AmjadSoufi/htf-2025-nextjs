"use client";

import React from "react";

interface VerificationData {
  isVerified: boolean;
  confidence: number;
  detectedSpecies: string | null;
  matchScore: number;
  reasons: string[];
  timestamp: string;
}

interface Props {
  verification: VerificationData | null;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
}

export default function VerificationBadge({
  verification,
  size = "md",
  showDetails = false,
}: Props) {
  if (!verification) {
    return null;
  }

  const { isVerified, confidence, reasons } = verification;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  };

  const iconSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (isVerified) {
    return (
      <div className="inline-flex items-center gap-1">
        <div
          className={`${sizeClasses[size]} bg-green-500/20 border-2 border-green-500/50 text-green-400 rounded-full font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,197,94,0.3)]`}
          title={`AI Verified - ${(confidence * 100).toFixed(1)}% confidence`}
        >
          <span className={iconSize[size]}>✓</span>
          <span>AI Verified</span>
          {showDetails && (
            <span className="text-xs opacity-80">
              {(confidence * 100).toFixed(0)}%
            </span>
          )}
        </div>
        {showDetails && (
          <div className="ml-2 text-xs text-text-secondary">
            <div className="font-semibold text-green-400 mb-1">
              Verification Details:
            </div>
            <ul className="list-disc list-inside space-y-0.5">
              {reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Low confidence or not verified
  return (
    <div className="inline-flex items-center gap-1">
      <div
        className={`${sizeClasses[size]} bg-orange-500/20 border-2 border-orange-500/50 text-orange-400 rounded-full font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(249,115,22,0.3)]`}
        title={`Low confidence - ${(confidence * 100).toFixed(1)}%`}
      >
        <span className={iconSize[size]}>⚠</span>
        <span>Unverified</span>
        {showDetails && (
          <span className="text-xs opacity-80">
            {(confidence * 100).toFixed(0)}%
          </span>
        )}
      </div>
      {showDetails && (
        <div className="ml-2 text-xs text-text-secondary">
          <div className="font-semibold text-orange-400 mb-1">
            Verification Issues:
          </div>
          <ul className="list-disc list-inside space-y-0.5">
            {reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Compact confidence meter component
export function ConfidenceMeter({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  const color =
    confidence >= 0.75
      ? "from-green-500 to-emerald-400"
      : confidence >= 0.5
      ? "from-yellow-500 to-orange-400"
      : "from-orange-500 to-red-400";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-panel-bg border border-panel-border rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs font-bold min-w-[3rem] text-right">
        {percentage}%
      </div>
    </div>
  );
}
