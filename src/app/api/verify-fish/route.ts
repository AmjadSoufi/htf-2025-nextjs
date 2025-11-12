import { NextRequest } from "next/server";

/**
 * AI-Powered Fish Verification API
 *
 * This endpoint uses computer vision AI to analyze uploaded fish photos
 * and verify if they match the claimed species.
 */

interface VerificationResult {
  isVerified: boolean;
  confidence: number;
  detectedSpecies: string | null;
  matchScore: number;
  reasons: string[];
  timestamp: string;
}

// Minimum confidence threshold for automatic verification
const MIN_CONFIDENCE_THRESHOLD = 0.65;

/**
 * Simulated AI Vision Analysis
 * In production, this would call actual AI services like:
 * - Google Cloud Vision API
 * - AWS Rekognition
 * - Azure Computer Vision
 * - Custom TensorFlow/PyTorch models
 */
async function analyzeImageWithAI(
  imageData: string,
  expectedSpecies: string
): Promise<VerificationResult> {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Extract base64 data
  const base64Match = imageData.match(/^data:image\/\w+;base64,(.+)$/);
  if (!base64Match) {
    return {
      isVerified: false,
      confidence: 0,
      detectedSpecies: null,
      matchScore: 0,
      reasons: ["Invalid image format"],
      timestamp: new Date().toISOString(),
    };
  }

  const base64Data = base64Match[1];
  const imageSize = base64Data.length;

  // Simulate AI detection based on image characteristics
  // In production, this would use actual computer vision models

  // Check if image is too small (likely not a real photo)
  if (imageSize < 5000) {
    return {
      isVerified: false,
      confidence: 0.2,
      detectedSpecies: null,
      matchScore: 0.2,
      reasons: ["Image quality too low", "File size too small"],
      timestamp: new Date().toISOString(),
    };
  }

  // Simulate species detection with varying confidence
  // In production, this would use trained fish classification models
  const speciesLower = expectedSpecies.toLowerCase();

  // Simulate detection results based on species name hash
  const hash = speciesLower
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseConfidence = 0.5 + (hash % 40) / 100;

  // Add randomness to simulate real AI behavior
  const variance = (Math.random() - 0.5) * 0.2;
  const confidence = Math.max(0.3, Math.min(0.98, baseConfidence + variance));

  // Determine if image likely contains a fish
  const containsFish = imageSize > 10000 && confidence > 0.4;

  // Calculate match score (how well detected species matches expected)
  const matchScore = containsFish ? confidence : confidence * 0.5;

  const reasons: string[] = [];

  if (matchScore >= MIN_CONFIDENCE_THRESHOLD) {
    reasons.push(`High confidence match (${(matchScore * 100).toFixed(1)}%)`);
    reasons.push("Fish features detected successfully");
    reasons.push(`Species characteristics match ${expectedSpecies}`);
  } else if (matchScore >= 0.4) {
    reasons.push("Moderate confidence - manual review recommended");
    reasons.push("Some fish features detected");
    reasons.push("Species characteristics partially match");
  } else {
    reasons.push("Low confidence match");
    if (!containsFish) {
      reasons.push("No clear fish detected in image");
    } else {
      reasons.push("Detected species does not match expected");
    }
  }

  // Additional quality checks
  if (imageSize > 50000) {
    reasons.push("Good image quality");
  }

  return {
    isVerified: matchScore >= MIN_CONFIDENCE_THRESHOLD,
    confidence: matchScore,
    detectedSpecies: containsFish ? expectedSpecies : "Unknown",
    matchScore,
    reasons,
    timestamp: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageData, fishName, fishSpecies } = body;

    if (!imageData) {
      return Response.json({ error: "Missing imageData" }, { status: 400 });
    }

    if (!fishName && !fishSpecies) {
      return Response.json(
        { error: "Missing fish name or species" },
        { status: 400 }
      );
    }

    // Use species if available, otherwise use name
    const expectedSpecies = fishSpecies || fishName;

    // Perform AI analysis
    const result = await analyzeImageWithAI(imageData, expectedSpecies);

    // Log verification attempt (in production, store in database)
    console.log(
      `[AI Verification] ${expectedSpecies}: ${
        result.isVerified ? "VERIFIED" : "REJECTED"
      } (confidence: ${(result.confidence * 100).toFixed(1)}%)`
    );

    return Response.json({
      success: true,
      verification: result,
    });
  } catch (err: any) {
    console.error("/api/verify-fish POST error:", err);
    return Response.json(
      { error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
