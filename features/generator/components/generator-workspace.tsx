"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type MutableRefObject,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { cn } from "@/lib/utils";

import { generateDesignAction } from "../server/generate-design-action";
import { runVariationAction } from "../server/run-variation-action";
import {
  STYLE_PRESETS,
  type GenerateDesignInput,
  type GenerateDesignResult,
  type GeneratedVariation,
  type GeneratorActionType,
  type GeneratorVariationActionInput,
  type GeneratorVariationActionResult,
  type GeneratorWorkspaceOverview,
  type StylePreset,
} from "../types";

const COLOR_SWATCHES = ["#895af6", "#ec4899", "#22d3ee", "#34d399", "#f59e0b", "#0ea5e9"] as const;

const REFERENCE_MAX_SIZE_BYTES = 5_000_000;
const ALLOWED_REFERENCE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const CARD_ACTIONS: Array<{
  label: string;
  type: GeneratorActionType | "EDIT";
  icon: string;
  className: string;
}> = [
  { label: "Upscale", type: "UPSCALE", icon: "zoom_out_map", className: "hover:bg-white/10" },
  { label: "Edit", type: "EDIT", icon: "auto_fix_high", className: "hover:bg-white/10" },
  {
    label: "No BG",
    type: "REMOVE_BACKGROUND",
    icon: "layers_clear",
    className: "hover:bg-white/10",
  },
  {
    label: "Mockup",
    type: "CREATE_MOCKUP",
    icon: "checkroom",
    className: "hover:bg-[#895af6]",
  },
  {
    label: "Sell",
    type: "CREATE_PRODUCT",
    icon: "shopping_cart",
    className: "bg-[#895af6] hover:bg-[#895af6]/90",
  },
] as const;

type ToastTone = "success" | "error" | "info";

type GeneratorToast = {
  id: string;
  tone: ToastTone;
  message: string;
};

type WorkspaceVariation = GeneratedVariation & {
  designId?: string;
  generationId?: string;
  sourcePrompt?: string;
  sourceStylePreset?: StylePreset;
  sourceColors?: string[];
  isSaved?: boolean;
  isFavorite?: boolean;
  isUpscaled?: boolean;
  isBackgroundRemoved?: boolean;
};

function queuePlaceholders(count: number): WorkspaceVariation[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `queued-${index + 1}`,
    status: index === 0 ? "processing" : "queued",
    imageUrl: "",
    queuePosition: index === 0 ? undefined : index,
    estimatedSeconds: index === 0 ? 12 : undefined,
  }));
}

function toastStyle(tone: ToastTone): string {
  if (tone === "success") {
    return "border-emerald-500/35 bg-emerald-500/15 text-emerald-100";
  }

  if (tone === "error") {
    return "border-red-500/35 bg-red-500/15 text-red-100";
  }

  return "border-slate-300/35 bg-slate-700/60 text-slate-100";
}

export function GeneratorWorkspace({ overview }: { overview: GeneratorWorkspaceOverview }) {
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();
  const [isGenerating, startGenerating] = useTransition();

  const [prompt, setPrompt] = useState(overview.promptHistory[0]?.prompt ?? "");
  const [stylePreset, setStylePreset] = useState<StylePreset>(overview.promptHistory[0]?.stylePreset ?? "Cyberpunk");
  const [variationCount, setVariationCount] = useState(4);
  const [selectedColors, setSelectedColors] = useState<string[]>(
    overview.promptHistory[0]?.colors?.slice(0, 4) ?? ["#895af6"],
  );
  const [referenceImageUrl, setReferenceImageUrl] = useState("");
  const [referenceUploadName, setReferenceUploadName] = useState<string | null>(null);
  const referenceInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState(overview.creditsRemaining);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [compactGrid, setCompactGrid] = useState(false);
  const [results, setResults] = useState<WorkspaceVariation[]>([]);
  const [toasts, setToasts] = useState<GeneratorToast[]>([]);
  const [activeActions, setActiveActions] = useState<Record<string, GeneratorActionType | "SAVE" | undefined>>({});

  const promptRef = useRef<HTMLTextAreaElement | null>(null) as MutableRefObject<HTMLTextAreaElement | null>;
  const toastIdRef = useRef(0);

  const hasResults = results.some((result) => result.status === "completed");

  const helperText = useMemo(() => {
    if (isGenerating) {
      return "Rendering variations...";
    }

    if (hasResults) {
      return `${results.length} variation${results.length === 1 ? "" : "s"} ready`;
    }

    return "Cmd/Ctrl + Enter to generate";
  }, [hasResults, isGenerating, results.length]);

  const visibleResults = useMemo(() => {
    if (!showFavoritesOnly) {
      return results;
    }

    return results.filter((result) => result.status !== "completed" || result.isFavorite);
  }, [results, showFavoritesOnly]);

  function pushToast(tone: ToastTone, message: string) {
    toastIdRef.current += 1;
    const id = `toast-${toastIdRef.current}`;
    setToasts((current) => [...current, { id, tone, message }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2800);
  }

  function toggleColor(color: string) {
    setSelectedColors((current) => {
      if (current.includes(color)) {
        return current.filter((value) => value !== color);
      }

      if (current.length >= 4) {
        return [...current.slice(1), color];
      }

      return [...current, color];
    });
  }

  function updateVariation(variationId: string, updater: (current: WorkspaceVariation) => WorkspaceVariation) {
    setResults((current) =>
      current.map((variation) => {
        if (variation.id !== variationId) {
          return variation;
        }

        return updater(variation);
      }),
    );
  }

  async function generateWithFallback(payload: GenerateDesignInput) {
    try {
      const actionResponse = await generateDesignAction(payload);

      if (actionResponse.ok || actionResponse.code !== "SERVER_ERROR") {
        return actionResponse;
      }
    } catch {
      // Fallback to route handler if server action transport fails in local/dev setups.
    }

    const response = await fetch("/api/generator/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const payloadResponse = (await response.json().catch(() => null)) as GenerateDesignResult | null;

    if (!payloadResponse) {
      return {
        ok: false as const,
        code: "SERVER_ERROR" as const,
        error: "Unable to generate right now. Please try again.",
      };
    }

    return payloadResponse;
  }

  async function runVariationActionWithFallback(payload: GeneratorVariationActionInput) {
    try {
      const actionResponse = await runVariationAction(payload);

      if (actionResponse.ok || actionResponse.code !== "SERVER_ERROR") {
        return actionResponse;
      }
    } catch {
      // Fallback to route handler if server action transport fails in local/dev setups.
    }

    const response = await fetch("/api/generator/action", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const payloadResponse = (await response.json().catch(() => null)) as
      | GeneratorVariationActionResult
      | null;

    if (!payloadResponse) {
      return {
        ok: false as const,
        code: "SERVER_ERROR" as const,
        error: "Unable to complete this action right now.",
      };
    }

    return payloadResponse;
  }

  function runGeneration() {
    if (isGenerating) {
      return;
    }

    if (prompt.trim().length < 8) {
      setError("Prompt must be at least 8 characters.");
      return;
    }

    if (selectedColors.length === 0) {
      setError("Pick at least one color for better results.");
      return;
    }

    setError(null);

    const payload: GenerateDesignInput = {
      prompt,
      stylePreset,
      colors: selectedColors,
      referenceImageUrl: referenceImageUrl.trim() || undefined,
      variationCount,
    };

    setResults(queuePlaceholders(variationCount));

    startGenerating(async () => {
      const response = await generateWithFallback(payload);

      if (!response.ok) {
        setError(response.error);
        setResults([]);
        pushToast("error", response.error);
        return;
      }

      setCreditsRemaining(response.creditsRemaining);
      setResults(
        response.results.map((result) => ({
          ...result,
          designId: response.designId,
          generationId: response.generationId,
          sourcePrompt: payload.prompt,
          sourceStylePreset: payload.stylePreset,
          sourceColors: payload.colors,
          isSaved: false,
          isFavorite: false,
          isUpscaled: false,
          isBackgroundRemoved: false,
        })),
      );
      pushToast("success", "Design variations generated.");
      router.refresh();
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runGeneration();
  }

  function handlePromptKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      runGeneration();
    }
  }

  function applyPromptFromHistory(item: GeneratorWorkspaceOverview["promptHistory"][number]) {
    setPrompt(item.prompt);
    setStylePreset(item.stylePreset);
    setSelectedColors(item.colors.length > 0 ? item.colors.slice(0, 4) : ["#895af6"]);
    setShowFavoritesOnly(false);
    setError(null);
    pushToast("info", "Prompt loaded from history.");

    promptRef.current?.focus();
  }

  function handleEditVariation(variation: WorkspaceVariation) {
    setPrompt(variation.sourcePrompt ?? prompt);
    setStylePreset(variation.sourceStylePreset ?? stylePreset);

    if (variation.sourceColors && variation.sourceColors.length > 0) {
      setSelectedColors(variation.sourceColors.slice(0, 4));
    }

    if (!shouldReduceMotion) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    promptRef.current?.focus();
    pushToast("info", "Loaded prompt for editing.");
  }

  async function handleSaveVariation(variation: WorkspaceVariation) {
    if (!variation.designId || !variation.generationId || variation.status !== "completed") {
      return;
    }

    if (variation.isSaved) {
      updateVariation(variation.id, (current) => ({
        ...current,
        isFavorite: !current.isFavorite,
      }));
      pushToast("info", variation.isFavorite ? "Removed from favorites." : "Added to favorites.");
      return;
    }

    setActiveActions((current) => ({ ...current, [variation.id]: "SAVE" }));

    const response = await runVariationActionWithFallback({
      action: "SAVE",
      designId: variation.designId,
      generationId: variation.generationId,
      variationId: variation.id,
      imageUrl: variation.imageUrl,
    });

    setActiveActions((current) => ({ ...current, [variation.id]: undefined }));

    if (!response.ok) {
      pushToast("error", response.error);
      return;
    }

    updateVariation(variation.id, (current) => ({
      ...current,
      isSaved: true,
      isFavorite: true,
    }));
    pushToast("success", response.message);
    router.refresh();
  }

  async function handleShareVariation(variation: WorkspaceVariation) {
    const shareUrl = variation.imageUrl;

    try {
      const nav = typeof window !== "undefined" ? window.navigator : null;

      if (nav && typeof nav.share === "function") {
        await nav.share({
          title: "MerchForge AI design",
          text: "Check out this generated merch design",
          url: shareUrl,
        });
      } else if (nav?.clipboard?.writeText) {
        await nav.clipboard.writeText(shareUrl);
      }

      pushToast("success", "Share link copied.");
    } catch {
      pushToast("error", "Unable to share this design right now.");
    }
  }

  async function handleCardAction(
    variation: WorkspaceVariation,
    actionType: (typeof CARD_ACTIONS)[number]["type"],
  ) {
    if (variation.status !== "completed") {
      return;
    }

    if (actionType === "EDIT") {
      handleEditVariation(variation);
      return;
    }

    if (!variation.designId || !variation.generationId) {
      pushToast("error", "Missing generation references. Please generate again.");
      return;
    }

    setActiveActions((current) => ({ ...current, [variation.id]: actionType }));

    const response = await runVariationActionWithFallback({
      action: actionType,
      designId: variation.designId,
      generationId: variation.generationId,
      variationId: variation.id,
      imageUrl: variation.imageUrl,
    });

    setActiveActions((current) => ({ ...current, [variation.id]: undefined }));

    if (!response.ok) {
      pushToast("error", response.error);
      return;
    }

    if (typeof response.creditsRemaining === "number") {
      setCreditsRemaining(response.creditsRemaining);
    }

    if (response.imageUrl) {
      updateVariation(variation.id, (current) => ({
        ...current,
        imageUrl: response.imageUrl as string,
        isUpscaled: actionType === "UPSCALE" ? true : current.isUpscaled,
        isBackgroundRemoved:
          actionType === "REMOVE_BACKGROUND" ? true : current.isBackgroundRemoved,
        isFavorite: true,
      }));
    }

    pushToast("success", response.message);
    router.refresh();

    if (response.redirectPath) {
      router.push(response.redirectPath);
    }
  }

  return (
    <>
      <div className="pointer-events-none fixed top-20 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "pointer-events-auto rounded-lg border px-3 py-2 text-xs font-semibold shadow-2xl backdrop-blur-lg",
                toastStyle(toast.tone),
              )}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="custom-scrollbar h-full overflow-y-auto p-4 md:p-8">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <motion.section
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/70">
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-[#895af6]/30 bg-[#895af6]/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-[#895af6] uppercase">
                  {overview.planLabel} Plan
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Credits: <span className="font-bold text-slate-700 dark:text-slate-200">{creditsRemaining}</span> /
                  {" "}
                  {overview.monthlyCredits}
                </p>
              </div>

              <div className="custom-scrollbar flex max-w-full items-center gap-2 overflow-x-auto">
                {overview.promptHistory.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => applyPromptFromHistory(item)}
                    className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-[#895af6]/40 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-300 dark:hover:border-[#895af6]/40"
                    title={item.prompt}
                  >
                    {item.prompt.length > 40 ? `${item.prompt.slice(0, 40)}...` : item.prompt}
                  </button>
                ))}
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="group relative">
                <textarea
                  ref={promptRef}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={handlePromptKeyDown}
                  placeholder="Describe the merch of your dreams (e.g. A cyberpunk oni mask with neon accents, vector art style)..."
                  className="h-32 w-full resize-none rounded-xl border border-slate-200 bg-white p-6 pr-56 text-lg font-medium text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-[#895af6] dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder:text-slate-600"
                />
                <div className="absolute right-4 bottom-4 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{helperText}</span>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="flex items-center gap-2 rounded-lg bg-[#895af6] px-8 py-3 font-bold text-white shadow-[0_0_20px_rgba(137,90,246,0.3)] transition-all active:scale-95 hover:bg-[#895af6]/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="material-symbols-outlined text-xl">auto_awesome</span>
                    {isGenerating ? "Generating..." : "Generate"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-start gap-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                <div className="min-w-[320px] flex-1 space-y-2">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    Style Preset
                  </span>
                  <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-2">
                    {STYLE_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setStylePreset(preset)}
                        className={cn(
                          "whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
                          preset === stylePreset
                            ? "border-[#895af6] bg-[#895af6] text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-[#895af6]/40 dark:border-zinc-800 dark:bg-zinc-800 dark:text-slate-300",
                        )}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    Color Palette
                  </span>
                  <div className="flex items-center gap-2">
                    {COLOR_SWATCHES.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Select color ${color}`}
                        onClick={() => toggleColor(color)}
                        style={{ backgroundColor: color }}
                        className={cn(
                          "size-6 rounded-full transition-transform hover:scale-110",
                          selectedColors.includes(color)
                            ? "ring-2 ring-[#895af6] ring-offset-2 ring-offset-slate-50 dark:ring-offset-zinc-900"
                            : "",
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      Reference Image
                    </span>
                    <button
                      type="button"
                      onClick={() => referenceInputRef.current?.click()}
                      className="text-[11px] font-semibold text-[#895af6] transition-colors hover:text-[#6332fb]"
                    >
                      Upload
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={referenceInputRef}
                      value={referenceImageUrl}
                      onChange={(event) => setReferenceImageUrl(event.target.value)}
                      placeholder="https://image-url.png"
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#895af6] dark:border-zinc-800 dark:bg-zinc-800 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setReferenceImageUrl("");
                        setReferenceUploadName(null);
                        setError(null);
                      }}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition-colors hover:border-[#895af6]/40 hover:text-slate-800 dark:border-zinc-800 dark:text-slate-300"
                    >
                      Clear
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Optional reference URL or upload (+{REFERENCE_MAX_SIZE_BYTES / 1_000_000}MB).
                  </p>
                  {referenceImageUrl ? (
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900/40">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/50 text-[12px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-200">
                        Ref
                      </span>
                      <div className="min-w-0 flex-1 text-ellipsis overflow-hidden">
                        {referenceUploadName ?? referenceImageUrl}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReferenceImageUrl("");
                          setReferenceUploadName(null);
                          setError(null);
                        }}
                        className="text-[10px] font-bold text-[#895af6] underline underline-offset-2"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}
                </div>
                <input
                  type="file"
                  accept={Array.from(ALLOWED_REFERENCE_TYPES).join(",")}
                  className="hidden"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";

                    if (!file) {
                      return;
                    }

                    if (!ALLOWED_REFERENCE_TYPES.has(file.type)) {
                      setError("Unsupported reference format. Use JPG, PNG, WEBP, GIF, or SVG.");
                      return;
                    }

                    if (file.size > REFERENCE_MAX_SIZE_BYTES) {
                      setError("Reference file exceeds 5MB limit.");
                      return;
                    }

                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === "string" && reader.result.startsWith("data:image/")) {
                        setReferenceImageUrl(reader.result);
                        setReferenceUploadName(file.name);
                        pushToast("success", "Reference uploaded. Generate to apply.");
                      } else {
                        setError("Unable to read reference image.");
                      }
                    };

                    reader.onerror = () => {
                      setError("Unable to process reference file.");
                    };

                    reader.readAsDataURL(file);
                  }}
                />

                <div className="w-36 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      Variations
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#895af6]">{variationCount}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={variationCount}
                    onChange={(event) => setVariationCount(Number(event.target.value))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#895af6] dark:bg-zinc-800"
                  />
                </div>
              </div>
            </form>

            {error ? (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            ) : null}
          </motion.section>

          <motion.section
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Your Generations</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFavoritesOnly((current) => !current)}
                  className={cn(
                    "rounded-lg p-2 transition-colors",
                    showFavoritesOnly
                      ? "bg-[#895af6]/15 text-[#895af6]"
                      : "text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800",
                  )}
                  title={showFavoritesOnly ? "Show all generations" : "Show favorites only"}
                >
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCompactGrid((current) => !current)}
                  className={cn(
                    "rounded-lg p-2 transition-colors",
                    compactGrid
                      ? "bg-[#895af6]/15 text-[#895af6]"
                      : "text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800",
                  )}
                  title={compactGrid ? "Standard grid" : "Compact grid"}
                >
                  <span className="material-symbols-outlined">grid_view</span>
                </button>
              </div>
            </div>

            <div
              className={cn(
                "grid grid-cols-1 gap-6 sm:grid-cols-2",
                compactGrid ? "lg:grid-cols-3 xl:grid-cols-5" : "lg:grid-cols-3 xl:grid-cols-4",
              )}
            >
              <AnimatePresence>
                {visibleResults.map((result, index) => {
                  if (result.status === "processing") {
                    return (
                      <motion.article
                        key={result.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="relative flex aspect-square flex-col items-center justify-center space-y-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <div className="absolute inset-0 animate-pulse bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)]" />
                        <div className="relative z-10 flex size-16 items-center justify-center rounded-full bg-slate-200 dark:bg-zinc-800">
                          <span className="material-symbols-outlined text-3xl text-[#895af6]">brush</span>
                        </div>
                        <div className="relative z-10 w-full max-w-[140px] space-y-2">
                          <p className="text-xs font-semibold text-slate-400">Generating...</p>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
                            <motion.div
                              className="h-full rounded-full bg-[#895af6]"
                              initial={{ width: "10%" }}
                              animate={{ width: isGenerating ? "75%" : "100%" }}
                              transition={{
                                duration: isGenerating ? 1.2 : 0.2,
                                repeat: isGenerating ? Number.POSITIVE_INFINITY : 0,
                                repeatType: "mirror",
                              }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400/60">
                            Estimated: {result.estimatedSeconds ?? 12}s
                          </p>
                        </div>
                      </motion.article>
                    );
                  }

                  if (result.status === "queued") {
                    return (
                      <motion.article
                        key={result.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="flex aspect-square flex-col items-center justify-center space-y-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/40"
                      >
                        <div className="size-10 animate-spin rounded-full border-2 border-slate-300 border-t-[#895af6] dark:border-zinc-800 dark:border-t-[#895af6]" />
                        <p className="text-xs font-semibold text-slate-400">Queued</p>
                        <p className="text-[10px] tracking-widest text-slate-400/60 uppercase">
                          #{result.queuePosition ?? index + 1} in line
                        </p>
                      </motion.article>
                    );
                  }

                  const activeAction = activeActions[result.id];
                  const isCardBusy = Boolean(activeAction);

                  return (
                    <motion.article
                      key={result.id}
                      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.985 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.28, delay: index * 0.03 }}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-200 shadow-sm transition-all hover:border-[#895af6]/30 hover:shadow-xl hover:shadow-[#895af6]/5 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <img
                        src={result.imageUrl}
                        alt="Generated merch design"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-1.5">
                        {result.isUpscaled ? (
                          <span className="rounded-full bg-black/50 px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-white uppercase backdrop-blur-md">
                            HD
                          </span>
                        ) : null}
                        {result.isBackgroundRemoved ? (
                          <span className="rounded-full bg-black/50 px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-white uppercase backdrop-blur-md">
                            NO BG
                          </span>
                        ) : null}
                      </div>

                      <div className="absolute inset-0 flex flex-col justify-between bg-slate-900/40 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => void handleSaveVariation(result)}
                            disabled={isCardBusy}
                            className="flex size-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                            title={result.isSaved ? "Toggle favorite" : "Save to design library"}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {result.isSaved ? "favorite" : "favorite_border"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleShareVariation(result)}
                            disabled={isCardBusy}
                            className="flex size-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                            title="Share"
                          >
                            <span className="material-symbols-outlined text-[18px]">share</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/60 p-1.5 shadow-2xl backdrop-blur-xl">
                          {CARD_ACTIONS.map((action) => {
                            const isActionActive = activeAction === action.type;

                            return (
                              <button
                                key={action.label}
                                type="button"
                                onClick={() => void handleCardAction(result, action.type)}
                                disabled={isCardBusy && !isActionActive}
                                className={cn(
                                  "flex flex-1 flex-col items-center gap-1 rounded-lg p-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                                  action.className,
                                  isActionActive ? "bg-white/15" : "",
                                )}
                                title={action.label}
                              >
                                <span
                                  className={cn(
                                    "material-symbols-outlined text-[18px]",
                                    isActionActive ? "animate-spin" : "",
                                  )}
                                >
                                  {isActionActive ? "progress_activity" : action.icon}
                                </span>
                                <span className="text-[8px] font-bold tracking-tight uppercase">
                                  {isActionActive ? "Working" : action.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>

            {!results.length ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                <span className="material-symbols-outlined mb-4 text-6xl">image_search</span>
                <h3 className="text-lg font-semibold">Ready to create?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Describe your idea above to see your first generations here.
                </p>
                <Link
                  href="/dashboard/designs"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  Open Design Library
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            ) : null}

            {results.length > 0 && visibleResults.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-400">
                No favorites yet. Save a design to pin it here.
              </div>
            ) : null}
          </motion.section>
        </div>
      </div>
    </>
  );
}
