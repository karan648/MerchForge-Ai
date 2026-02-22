"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

import {
  deleteMockupEditorAction,
  exportMockupEditorAction,
  saveMockupEditorAction,
} from "../server/mockup-editor-actions";
import type {
  MockupEditorData,
  MockupEditorLayer,
  MockupEditorState,
  MockupLayerType,
} from "../server/mockup-editor-service";

type ToastTone = "success" | "error" | "info";

type EditorToast = {
  id: string;
  tone: ToastTone;
  message: string;
};

type DragState = {
  layerId: string;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
};

const GARMENT_COLORS = ["#111827", "#1f2937", "#ffffff", "#a855f7", "#0ea5e9", "#f43f5e"] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toneClass(tone: ToastTone): string {
  if (tone === "success") {
    return "border-emerald-500/35 bg-emerald-500/15 text-emerald-100";
  }

  if (tone === "error") {
    return "border-red-500/35 bg-red-500/15 text-red-100";
  }

  return "border-slate-300/35 bg-slate-700/65 text-slate-100";
}

function statusClass(status: MockupEditorData["status"]): string {
  if (status === "Ready") {
    return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
  }

  if (status === "Exported") {
    return "bg-[#895af6]/15 text-[#895af6] border-[#895af6]/30";
  }

  return "bg-slate-500/10 text-slate-500 border-slate-400/30";
}

function layerTitle(type: MockupLayerType): string {
  return type === "text" ? "Text" : "Design";
}

function localDate(valueIso: string): string {
  return new Date(valueIso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MockupEditorWorkspace({ mockup }: { mockup: MockupEditorData }) {
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const toastIdRef = useRef(0);

  const [name, setName] = useState(mockup.name);
  const [state, setState] = useState<MockupEditorState>(mockup.state);
  const [status, setStatus] = useState<MockupEditorData["status"]>(mockup.status);
  const [lastSavedAt, setLastSavedAt] = useState(mockup.updatedAtIso);
  const [printReadyUrl, setPrintReadyUrl] = useState<string | null>(mockup.printReadyUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toasts, setToasts] = useState<EditorToast[]>([]);

  const activeLayer = useMemo(
    () => state.layers.find((layer) => layer.id === state.activeLayerId) ?? state.layers[0],
    [state.activeLayerId, state.layers],
  );

  function pushToast(tone: ToastTone, message: string) {
    toastIdRef.current += 1;
    const id = `mockup-toast-${toastIdRef.current}`;
    setToasts((current) => [...current, { id, tone, message }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2600);
  }

  function updateLayer(layerId: string, updater: (layer: MockupEditorLayer) => MockupEditorLayer) {
    setState((current) => ({
      ...current,
      layers: current.layers.map((layer) => (layer.id === layerId ? updater(layer) : layer)),
    }));
  }

  function setActiveLayer(layerId: string) {
    setState((current) => ({
      ...current,
      activeLayerId: layerId,
    }));
  }

  function toggleLayerVisibility(layerId: string) {
    updateLayer(layerId, (layer) => ({
      ...layer,
      visible: !layer.visible,
    }));
  }

  function moveLayer(direction: "up" | "down") {
    setState((current) => {
      const index = current.layers.findIndex((layer) => layer.id === current.activeLayerId);
      if (index === -1) {
        return current;
      }

      const targetIndex = direction === "up" ? index + 1 : index - 1;
      if (targetIndex < 0 || targetIndex >= current.layers.length) {
        return current;
      }

      const layers = [...current.layers];
      const [moved] = layers.splice(index, 1);
      layers.splice(targetIndex, 0, moved);

      return {
        ...current,
        layers,
      };
    });
  }

  function addTextLayer() {
    const existingText = state.layers.find((layer) => layer.type === "text");

    if (existingText) {
      updateLayer(existingText.id, (layer) => ({
        ...layer,
        visible: true,
      }));
      setActiveLayer(existingText.id);
      return;
    }

    const textLayer: MockupEditorLayer = {
      id: `layer-text-${Date.now().toString(36)}`,
      type: "text",
      name: "Text",
      visible: true,
      x: 50,
      y: 78,
      scale: 1,
      rotation: 0,
      text: "Limited Drop",
      color: "#ffffff",
      fontSize: 36,
    };

    setState((current) => ({
      ...current,
      activeLayerId: textLayer.id,
      layers: [...current.layers, textLayer],
    }));
  }

  function removeActiveTextLayer() {
    if (!activeLayer || activeLayer.type !== "text") {
      return;
    }

    setState((current) => {
      const nextLayers = current.layers.filter((layer) => layer.id !== activeLayer.id);
      const fallbackLayerId = nextLayers.find((layer) => layer.type === "design")?.id ?? nextLayers[0]?.id ?? "";

      return {
        ...current,
        activeLayerId: fallbackLayerId,
        layers: nextLayers,
      };
    });
  }

  function resetActiveLayerTransform() {
    if (!activeLayer) {
      return;
    }

    updateLayer(activeLayer.id, (layer) => ({
      ...layer,
      x: 50,
      y: layer.type === "text" ? 78 : 46,
      scale: 1,
      rotation: 0,
    }));
  }

  function centerActiveLayer() {
    if (!activeLayer) {
      return;
    }

    updateLayer(activeLayer.id, (layer) => ({
      ...layer,
      x: 50,
      y: 50,
    }));
  }

  function handleLayerPointerDown(event: ReactPointerEvent<HTMLDivElement>, layer: MockupEditorLayer) {
    if (isSaving || isExporting || isDeleting || !layer.visible) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setActiveLayer(layer.id);

    dragStateRef.current = {
      layerId: layer.id,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: layer.x,
      startY: layer.y,
    };
  }

  useEffect(() => {
    function onPointerMove(event: PointerEvent) {
      const drag = dragStateRef.current;
      const canvas = canvasRef.current;

      if (!drag || !canvas) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }

      const deltaX = ((event.clientX - drag.startClientX) / rect.width) * 100;
      const deltaY = ((event.clientY - drag.startClientY) / rect.height) * 100;

      updateLayer(drag.layerId, (layer) => ({
        ...layer,
        x: clamp(drag.startX + deltaX, 0, 100),
        y: clamp(drag.startY + deltaY, 0, 100),
      }));
    }

    function onPointerUp(event: PointerEvent) {
      const drag = dragStateRef.current;
      if (!drag) {
        return;
      }

      if (drag.pointerId !== event.pointerId) {
        return;
      }

      dragStateRef.current = null;
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  async function saveMockup(options?: { silent?: boolean }) {
    if (isSaving || isExporting || isDeleting) {
      return { ok: false as const };
    }

    setIsSaving(true);

    const response = await saveMockupEditorAction({
      mockupId: mockup.id,
      name,
      garmentColor: state.garmentColor,
      state,
    });

    setIsSaving(false);

    if (!response.ok) {
      if (!options?.silent) {
        pushToast("error", response.error);
      }
      return { ok: false as const };
    }

    setName(response.mockup.name);
    setState(response.mockup.state);
    setStatus(response.mockup.status);
    setLastSavedAt(response.mockup.updatedAtIso);
    setPrintReadyUrl(response.mockup.printReadyUrl);

    if (!options?.silent) {
      pushToast("success", response.message);
    }

    router.refresh();

    return { ok: true as const };
  }

  async function exportMockup(format: "PNG" | "PRINT_READY") {
    if (isSaving || isExporting || isDeleting) {
      return;
    }

    setIsExporting(true);

    const saveResult = await saveMockup({ silent: true });
    if (!saveResult.ok) {
      setIsExporting(false);
      pushToast("error", "Save changes before exporting.");
      return;
    }

    const response = await exportMockupEditorAction({
      mockupId: mockup.id,
      format,
    });

    setIsExporting(false);

    if (!response.ok) {
      pushToast("error", response.error);
      return;
    }

    setStatus("Exported");
    setPrintReadyUrl(response.downloadUrl);
    pushToast("success", response.message);

    if (typeof window !== "undefined") {
      window.open(response.downloadUrl, "_blank", "noopener,noreferrer");
    }

    router.refresh();
  }

  async function deleteMockup() {
    if (isSaving || isExporting || isDeleting) {
      return;
    }

    const confirmed = window.confirm("Delete this mockup permanently?");
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    const response = await deleteMockupEditorAction({
      mockupId: mockup.id,
    });
    setIsDeleting(false);

    if (!response.ok) {
      pushToast("error", response.error);
      return;
    }

    pushToast("success", response.message);
    router.push(response.redirectPath);
    router.refresh();
  }

  const designPreviewLayer = state.layers.find((layer) => layer.type === "design" && layer.visible);

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
                toneClass(toast.tone),
              )}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="custom-scrollbar h-full overflow-y-auto p-4 md:p-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <motion.section
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/70"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/mockups"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-300"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Mockups
                  </Link>

                  <span className={cn("rounded-full border px-2 py-1 text-[11px] font-bold", statusClass(status))}>
                    {status}
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                  Mockup Editor
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Last saved {localDate(lastSavedAt)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void saveMockup()}
                  disabled={isSaving || isExporting || isDeleting}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-200"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  {isSaving ? "Saving..." : "Save"}
                </button>

                <button
                  type="button"
                  onClick={() => void exportMockup("PNG")}
                  disabled={isSaving || isExporting || isDeleting}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#895af6]/40 bg-[#895af6]/10 px-3 py-2 text-sm font-semibold text-[#895af6] transition-colors hover:bg-[#895af6]/15 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  {isExporting ? "Exporting..." : "Export PNG"}
                </button>

                <button
                  type="button"
                  onClick={() => void exportMockup("PRINT_READY")}
                  disabled={isSaving || isExporting || isDeleting}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#895af6] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#895af6]/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="material-symbols-outlined text-[18px]">high_quality</span>
                  300 DPI
                </button>

                <button
                  type="button"
                  onClick={() => void deleteMockup()}
                  disabled={isSaving || isExporting || isDeleting}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </motion.section>

          <div className="grid gap-6 xl:grid-cols-[320px_1fr_300px]">
            <motion.aside
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.02 }}
              className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/70"
            >
              <section className="space-y-2">
                <p className="text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">Mockup Name</p>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-[#895af6] dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-100"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{mockup.garmentType}</p>
              </section>

              <section className="space-y-2">
                <p className="text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">Garment Color</p>
                <div className="flex flex-wrap gap-2">
                  {GARMENT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setState((current) => ({
                          ...current,
                          garmentColor: color,
                        }))
                      }
                      style={{ backgroundColor: color }}
                      className={cn(
                        "size-7 rounded-full border transition-transform hover:scale-110",
                        state.garmentColor === color
                          ? "border-[#895af6] ring-2 ring-[#895af6]/35"
                          : "border-slate-300 dark:border-zinc-700",
                      )}
                    />
                  ))}
                </div>
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">Layers</p>
                  <button
                    type="button"
                    onClick={addTextLayer}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-300"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    Text
                  </button>
                </div>

                <div className="space-y-2">
                  {state.layers.map((layer, index) => {
                    const isActive = layer.id === state.activeLayerId;
                    return (
                      <button
                        key={layer.id}
                        type="button"
                        onClick={() => setActiveLayer(layer.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors",
                          isActive
                            ? "border-[#895af6]/45 bg-[#895af6]/10"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/80",
                        )}
                      >
                        <span>
                          <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">{layer.name}</span>
                          <span className="text-[10px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                            {layerTitle(layer.type)} · Layer {index + 1}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleLayerVisibility(layer.id);
                            }}
                            className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-zinc-700"
                          >
                            <span className="material-symbols-outlined text-[17px]">
                              {layer.visible ? "visibility" : "visibility_off"}
                            </span>
                          </button>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {printReadyUrl ? (
                <section className="rounded-lg border border-[#895af6]/30 bg-[#895af6]/8 p-3">
                  <p className="text-xs font-semibold text-[#895af6]">Latest Export</p>
                  <a
                    href={printReadyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 line-clamp-2 text-[11px] text-slate-600 underline-offset-2 hover:underline dark:text-slate-300"
                  >
                    {printReadyUrl}
                  </a>
                </section>
              ) : null}
            </motion.aside>

            <motion.section
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/70"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Live Canvas</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Drag layers directly on canvas</p>
              </div>

              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 p-5 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
                <div
                  ref={canvasRef}
                  className="relative mx-auto aspect-[4/5] w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-300 bg-[#101827] shadow-2xl dark:border-zinc-800"
                >
                  <div
                    className="absolute inset-[8%] rounded-[24%_24%_16%_16%] shadow-inner"
                    style={{ backgroundColor: state.garmentColor }}
                  />

                  {state.layers.map((layer, index) => {
                    if (!layer.visible) {
                      return null;
                    }

                    const style: CSSProperties = {
                      left: `${layer.x}%`,
                      top: `${layer.y}%`,
                      transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scale(${layer.scale})`,
                      zIndex: 10 + index,
                    };

                    const isActive = layer.id === state.activeLayerId;

                    return (
                      <div
                        key={layer.id}
                        style={style}
                        onPointerDown={(event) => handleLayerPointerDown(event, layer)}
                        className={cn(
                          "absolute select-none rounded px-1 transition-all",
                          isActive ? "ring-2 ring-[#895af6]/50" : "",
                          isSaving || isExporting || isDeleting ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
                        )}
                      >
                        {layer.type === "design" ? (
                          <img
                            src={layer.imageUrl ?? designPreviewLayer?.imageUrl ?? mockup.previewUrl ?? ""}
                            alt="Design layer"
                            className="pointer-events-none h-40 w-40 rounded object-cover shadow-2xl"
                          />
                        ) : (
                          <span
                            className="pointer-events-none block whitespace-nowrap font-black tracking-[0.08em] uppercase"
                            style={{
                              color: layer.color ?? "#ffffff",
                              fontSize: `${layer.fontSize ?? 36}px`,
                              textShadow: "0 2px 8px rgba(0,0,0,0.45)",
                            }}
                          >
                            {layer.text}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.section>

            <motion.aside
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.08 }}
              className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/70"
            >
              <section className="space-y-2">
                <p className="text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">Active Layer</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {activeLayer ? activeLayer.name : "No layer selected"}
                </p>
              </section>

              {activeLayer ? (
                <>
                  <section className="space-y-3">
                    <label className="grid gap-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">X Position</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={0.5}
                        value={activeLayer.x}
                        onChange={(event) =>
                          updateLayer(activeLayer.id, (layer) => ({
                            ...layer,
                            x: Number(event.target.value),
                          }))
                        }
                        className="h-1.5 w-full cursor-pointer rounded bg-slate-200 accent-[#895af6] dark:bg-zinc-800"
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Y Position</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={0.5}
                        value={activeLayer.y}
                        onChange={(event) =>
                          updateLayer(activeLayer.id, (layer) => ({
                            ...layer,
                            y: Number(event.target.value),
                          }))
                        }
                        className="h-1.5 w-full cursor-pointer rounded bg-slate-200 accent-[#895af6] dark:bg-zinc-800"
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Scale</span>
                      <input
                        type="range"
                        min={0.2}
                        max={2.5}
                        step={0.01}
                        value={activeLayer.scale}
                        onChange={(event) =>
                          updateLayer(activeLayer.id, (layer) => ({
                            ...layer,
                            scale: Number(event.target.value),
                          }))
                        }
                        className="h-1.5 w-full cursor-pointer rounded bg-slate-200 accent-[#895af6] dark:bg-zinc-800"
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Rotation</span>
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        step={1}
                        value={activeLayer.rotation}
                        onChange={(event) =>
                          updateLayer(activeLayer.id, (layer) => ({
                            ...layer,
                            rotation: Number(event.target.value),
                          }))
                        }
                        className="h-1.5 w-full cursor-pointer rounded bg-slate-200 accent-[#895af6] dark:bg-zinc-800"
                      />
                    </label>
                  </section>

                  {activeLayer.type === "text" ? (
                    <section className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                      <p className="text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase">Text Content</p>
                      <input
                        value={activeLayer.text ?? ""}
                        onChange={(event) =>
                          updateLayer(activeLayer.id, (layer) => ({
                            ...layer,
                            text: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-[#895af6] dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-100"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="color"
                          value={activeLayer.color ?? "#ffffff"}
                          onChange={(event) =>
                            updateLayer(activeLayer.id, (layer) => ({
                              ...layer,
                              color: event.target.value,
                            }))
                          }
                          className="h-9 w-full cursor-pointer rounded border border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                        />
                        <input
                          type="number"
                          min={12}
                          max={96}
                          value={activeLayer.fontSize ?? 36}
                          onChange={(event) =>
                            updateLayer(activeLayer.id, (layer) => ({
                              ...layer,
                              fontSize: clamp(Number(event.target.value), 12, 96),
                            }))
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-100"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={removeActiveTextLayer}
                        className="w-full rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/20"
                      >
                        Remove Text Layer
                      </button>
                    </section>
                  ) : null}

                  <section className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={centerActiveLayer}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-200"
                    >
                      Center
                    </button>
                    <button
                      type="button"
                      onClick={resetActiveLayerTransform}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-200"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLayer("up")}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-200"
                    >
                      Bring Forward
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLayer("down")}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-200"
                    >
                      Send Back
                    </button>
                  </section>
                </>
              ) : null}

              <Link
                href="/dashboard/store-builder"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#895af6]/35 bg-[#895af6]/10 px-3 py-2 text-sm font-semibold text-[#895af6] transition-colors hover:bg-[#895af6]/15"
              >
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                Open Store Builder
              </Link>
            </motion.aside>
          </div>
        </div>
      </div>
    </>
  );
}
