export const STYLE_PRESETS = [
  "Cyberpunk",
  "Minimalist",
  "Vintage",
  "Vaporwave",
  "Vector Art",
  "90s Streetwear",
] as const;

export type StylePreset = (typeof STYLE_PRESETS)[number];

export type GenerationCardStatus = "processing" | "queued" | "completed";

export type GeneratedVariation = {
  id: string;
  imageUrl: string;
  status: GenerationCardStatus;
  queuePosition?: number;
  estimatedSeconds?: number;
};

export type GenerateDesignInput = {
  prompt: string;
  stylePreset: StylePreset;
  colors: string[];
  referenceImageUrl?: string;
  variationCount: number;
};

export type GenerateDesignResult =
  | {
      ok: true;
      designId: string;
      generationId: string;
      results: GeneratedVariation[];
      creditsRemaining: number;
    }
  | {
      ok: false;
      error: string;
      code: GeneratorErrorCode;
    };

export type GeneratorErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION"
  | "NOT_FOUND"
  | "INSUFFICIENT_CREDITS"
  | "SERVER_ERROR";

export type GeneratorActionType = "UPSCALE" | "REMOVE_BACKGROUND" | "SAVE" | "CREATE_MOCKUP" | "CREATE_PRODUCT";

export type GeneratorVariationActionInput = {
  action: GeneratorActionType;
  designId: string;
  generationId: string;
  variationId: string;
  imageUrl: string;
};

export type GeneratorVariationActionResult =
  | {
      ok: true;
      action: GeneratorActionType;
      message: string;
      imageUrl?: string;
      designId?: string;
      mockupId?: string;
      productId?: string;
      redirectPath?: string;
      creditsRemaining?: number;
    }
  | {
      ok: false;
      code: GeneratorErrorCode;
      error: string;
    };

export type GeneratorPromptHistoryItem = {
  id: string;
  prompt: string;
  stylePreset: StylePreset;
  colors: string[];
  createdAtIso: string;
};

export type GeneratorWorkspaceOverview = {
  creditsRemaining: number;
  monthlyCredits: number;
  planLabel: "Free" | "Pro" | "Business";
  promptHistory: GeneratorPromptHistoryItem[];
};
