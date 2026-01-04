import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationResult {
  isValid: boolean;
  category: "pothole" | "waste" | "water" | "other" | "invalid";
  title: string;
  confidence: number;
  isSpam: boolean;
  reason: string;
}

// Validation helpers
const isValidBase64Image = (data: string): boolean => {
  // Check if it's a valid base64 data URL
  return data.startsWith('data:image/') && data.includes(';base64,');
};

const isValidLatitude = (lat: unknown): lat is number => {
  return typeof lat === 'number' && lat >= -90 && lat <= 90 && !isNaN(lat);
};

const isValidLongitude = (lng: unknown): lng is number => {
  return typeof lng === 'number' && lng >= -180 && lng <= 180 && !isNaN(lng);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof body !== 'object' || body === null) {
      return new Response(
        JSON.stringify({ error: "Request body must be an object" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64, latitude, longitude } = body as Record<string, unknown>;

    // Validate imageBase64
    if (typeof imageBase64 !== 'string' || !imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isValidBase64Image(imageBase64)) {
      return new Response(
        JSON.stringify({ error: "Invalid image format. Must be base64 encoded." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check image size (base64 is ~33% larger than binary, limit to ~10MB original)
    if (imageBase64.length > 15 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Image too large. Maximum size is 10MB." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate latitude
    if (!isValidLatitude(latitude)) {
      return new Response(
        JSON.stringify({ error: "Latitude must be a number between -90 and 90" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate longitude
    if (!isValidLongitude(longitude)) {
      return new Response(
        JSON.stringify({ error: "Longitude must be a number between -180 and 180" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verifying hazard image with Gemini AI");
    console.log("Location:", latitude, longitude);

    const systemPrompt = `You are an AI that verifies urban infrastructure hazard reports for a civic platform called Earth Lens. 
Your job is to analyze images and determine if they show legitimate urban issues like:
- Potholes or road damage
- Illegal waste dumping or garbage accumulation  
- Water contamination, flooding, or drainage issues
- Other legitimate infrastructure problems

You must detect and reject:
- Spam, inappropriate content, or unrelated images
- Fake or manipulated photos
- Images that don't show actual hazards
- Selfies, screenshots, or non-photo content

Respond ONLY with valid JSON.`;

    const userPrompt = `Analyze this image for urban hazard verification.
Reported Location: ${(latitude as number).toFixed(4)}°, ${(longitude as number).toFixed(4)}°

Respond with this exact JSON structure:
{
  "isValid": true/false,
  "category": "pothole" | "waste" | "water" | "other" | "invalid",
  "title": "Brief descriptive title of the hazard",
  "confidence": 0-100,
  "isSpam": true/false,
  "reason": "Brief explanation of your assessment"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              { type: "image_url", image_url: { url: imageBase64 } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI verification failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    console.log("AI response received");

    // Parse the JSON response
    let result: VerificationResult;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Default to pending manual review
      result = {
        isValid: false,
        category: "other",
        title: "Pending Manual Review",
        confidence: 0,
        isSpam: false,
        reason: "AI could not analyze the image. Flagged for manual review."
      };
    }

    console.log("Verification completed:", result.category, result.isValid);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("verify-hazard error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
