/**
 * AI Verification System - Example Usage
 *
 * This file demonstrates how to use the AI verification components
 * and integrate them into your application.
 */

import VerificationBadge, {
  ConfidenceMeter,
} from "@/components/VerificationBadge";

// Example 1: High Confidence Verification
const highConfidenceExample = {
  isVerified: true,
  confidence: 0.92,
  detectedSpecies: "Great White Shark",
  matchScore: 0.92,
  reasons: [
    "High confidence match (92.0%)",
    "Fish features detected successfully",
    "Species characteristics match Great White Shark",
    "Good image quality",
  ],
  timestamp: new Date().toISOString(),
};

// Example 2: Low Confidence Verification
const lowConfidenceExample = {
  isVerified: false,
  confidence: 0.38,
  detectedSpecies: "Unknown",
  matchScore: 0.38,
  reasons: [
    "Low confidence match",
    "No clear fish detected in image",
    "Image quality too low",
  ],
  timestamp: new Date().toISOString(),
};

// Example 3: Moderate Confidence
const moderateConfidenceExample = {
  isVerified: false,
  confidence: 0.58,
  detectedSpecies: "Tuna",
  matchScore: 0.58,
  reasons: [
    "Moderate confidence - manual review recommended",
    "Some fish features detected",
    "Species characteristics partially match",
  ],
  timestamp: new Date().toISOString(),
};

/**
 * Usage Examples
 */

// Display verification badge
function ExampleBadge() {
  return (
    <div>
      {/* Small badge */}
      <VerificationBadge verification={highConfidenceExample} size="sm" />

      {/* Medium badge with details */}
      <VerificationBadge
        verification={highConfidenceExample}
        size="md"
        showDetails={true}
      />

      {/* Large badge */}
      <VerificationBadge verification={highConfidenceExample} size="lg" />
    </div>
  );
}

// Display confidence meter
function ExampleMeter() {
  return (
    <div className="space-y-4">
      <ConfidenceMeter confidence={0.92} /> {/* High */}
      <ConfidenceMeter confidence={0.58} /> {/* Medium */}
      <ConfidenceMeter confidence={0.38} /> {/* Low */}
    </div>
  );
}

// Complete verification flow
async function verifyFishPhoto(
  imageData: string,
  fishName: string,
  fishSpecies?: string
) {
  try {
    // Step 1: Call AI verification API
    const response = await fetch("/api/verify-fish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageData,
        fishName,
        fishSpecies,
      }),
    });

    if (!response.ok) {
      throw new Error("Verification failed");
    }

    const data = await response.json();
    const verification = data.verification;

    // Step 2: Check verification result
    if (verification.isVerified) {
      console.log("✅ Photo verified!", verification);
      // Proceed with upload
      return { success: true, verification };
    } else {
      console.log("⚠️ Low confidence", verification);
      // Ask user to confirm
      const confirmed = confirm(
        `Low confidence (${(verification.confidence * 100).toFixed(1)}%)\n` +
          `Reasons: ${verification.reasons.join(", ")}\n\n` +
          `Continue anyway?`
      );

      if (confirmed) {
        return { success: true, verification, userOverride: true };
      } else {
        return { success: false, verification };
      }
    }
  } catch (error) {
    console.error("Verification error:", error);
    return { success: false, error };
  }
}

// Integration example
async function handlePhotoUpload(file: File, fish: any) {
  // Convert file to base64
  const reader = new FileReader();
  reader.onload = async () => {
    const dataUrl = reader.result as string;

    // Verify with AI
    const result = await verifyFishPhoto(dataUrl, fish.name, fish.species);

    if (result.success) {
      // Upload sighting with verification data
      await fetch("/api/sightings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fishId: fish.id,
          imageData: dataUrl,
          verification: result.verification,
          // ... other fields
        }),
      });
    }
  };
  reader.readAsDataURL(file);
}

export {
  highConfidenceExample,
  lowConfidenceExample,
  moderateConfidenceExample,
  ExampleBadge,
  ExampleMeter,
  verifyFishPhoto,
  handlePhotoUpload,
};
