"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";

import {
  deleteMockupEditorAction,
  exportMockupEditorAction,
  saveMockupEditorAction,
} from "../server/mockup-editor-actions";
import {
  PRODUCT_TYPES,
  getProductTypeInfo,
  getFrameUrl,
  GarmentType,
  type MockupEditorData,
  type MockupEditorLayer,
  type MockupEditorState,
  type MockupLayerType,
  type ProductTypeInfo,
} from "../types/mockup-editor-types";

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

type RotateDragState = {
  startAngle: number;
  currentAngle: number;
};

type FrameRotateState = {
  startX: number;
  currentFrame: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clamp360(value: number): number {
  return ((value % 360) + 360) % 360;
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

function getProductPlaceholder(type: GarmentType): string {
  const product = getProductTypeInfo(type);
  switch (type) {
    case GarmentType.MUG:
      return "Mug";
    case GarmentType.HAT:
    case GarmentType.CAP:
      return "Hat";
    case GarmentType.POSTER:
    case GarmentType.CANVAS:
      return "Poster";
    case GarmentType.STICKER:
      return "Sticker";
    case GarmentType.TOTE_BAG:
      return "Tote Bag";
    case GarmentType.PHONE_CASE:
      return "Phone Case";
    case GarmentType.NOTEBOOK:
      return "Notebook";
    default:
      return product.name;
  }
}

export function MockupEditorWorkspace({ mockup }: { mockup: MockupEditorData }) {
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const rotateDragRef = useRef<RotateDragState | null>(null);
  const toastIdRef = useRef(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "layers">("products");

  const [name, setName] = useState(mockup.name);
  const [state, setState] = useState<MockupEditorState>(mockup.state);
  const [status, setStatus] = useState<MockupEditorData["status"]>(mockup.status);
  const [lastSavedAt, setLastSavedAt] = useState(mockup.updatedAtIso);
  const [printReadyUrl, setPrintReadyUrl] = useState<string | null>(mockup.printReadyUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toasts, setToasts] = useState<EditorToast[]>([]);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isPreloading, setIsPreloading] = useState(false);

  const currentProduct = useMemo(
    () => getProductTypeInfo(state.garmentType),
    [state.garmentType]
  );

  const totalFrames = currentProduct.frames;
  const has360Support = totalFrames > 1;

  useEffect(() => {
    if (!has360Support) return;
    
    setIsPreloading(true);
    const framesToPreload = totalFrames;
    let loadedCount = 0;
    
    for (let i = 1; i <= framesToPreload; i++) {
      const img = new window.Image();
      img.src = getFrameUrl(currentProduct.frameBaseUrl, i, totalFrames);
      img.onload = () => {
        loadedCount++;
        if (loadedCount === framesToPreload) {
          setIsPreloading(false);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === framesToPreload) {
          setIsPreloading(false);
        }
      };
    }
  }, [currentProduct.frameBaseUrl, totalFrames, has360Support]);

  const activeLayer = useMemo(
    () => state.layers.find((layer) => layer.id === state.activeLayerId) ?? state.layers[0],
    [state.activeLayerId, state.layers]
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

  function setGarmentType(type: GarmentType) {
    const product = getProductTypeInfo(type);
    setState((current) => ({
      ...current,
      garmentType: type,
      garmentColor: product.colors[0] ?? current.garmentColor,
    }));
  }

  function moveLayer(direction: "up" | "down") {
    setState((current) => {
      const index = current.layers.findIndex((layer) => layer.id === current.activeLayerId);
      if (index === -1) return current;

      const targetIndex = direction === "up" ? index + 1 : index - 1;
      if (targetIndex < 0 || targetIndex >= current.layers.length) return current;

      const layers = [...current.layers];
      const [moved] = layers.splice(index, 1);
      layers.splice(targetIndex, 0, moved);

      return { ...current, layers };
    });
  }

  function addTextLayer() {
    const existingText = state.layers.find((layer) => layer.type === "text");
    if (existingText) {
      updateLayer(existingText.id, (layer) => ({ ...layer, visible: true }));
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
    if (!activeLayer || activeLayer.type !== "text") return;

    setState((current) => {
      const nextLayers = current.layers.filter((layer) => layer.id !== activeLayer.id);
      const fallbackLayerId = nextLayers.find((layer) => layer.type === "design")?.id ?? nextLayers[0]?.id ?? "";
      return { ...current, activeLayerId: fallbackLayerId, layers: nextLayers };
    });
  }

  function resetActiveLayerTransform() {
    if (!activeLayer) return;
    updateLayer(activeLayer.id, (layer) => ({
      ...layer,
      x: 50,
      y: layer.type === "text" ? 78 : 46,
      scale: 1,
      rotation: 0,
    }));
  }

  function centerActiveLayer() {
    if (!activeLayer) return;
    updateLayer(activeLayer.id, (layer) => ({ ...layer, x: 50, y: 50 }));
  }

  function handleLayerPointerDown(event: ReactPointerEvent<HTMLDivElement>, layer: MockupEditorLayer) {
    if (isSaving || isExporting || isDeleting || !layer.visible) return;
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

  const handleRotateStart = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (isSaving || isExporting || isDeleting || !has360Support) return;
    event.preventDefault();
    const startX = event.clientX;
    rotateDragRef.current = {
      startAngle: startX,
      currentAngle: currentFrame,
    };
  }, [isSaving, isExporting, isDeleting, has360Support, currentFrame] as const);

  useEffect(() => {
    function onPointerMove(event: PointerEvent) {
      const drag = dragStateRef.current;
      const canvas = canvasRef.current;
      if (!drag || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

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
      if (!drag) return;
      if (drag.pointerId !== event.pointerId) return;
      dragStateRef.current = null;
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  useEffect(() => {
    function onRotateMove(event: PointerEvent) {
      const rotate = rotateDragRef.current;
      if (!rotate || !has360Support) return;

      const deltaX = event.clientX - rotate.startAngle;
      const frameChange = Math.floor(deltaX / 10);
      let newFrame = ((rotate.currentAngle + frameChange - 1) % totalFrames) + 1;
      if (newFrame <= 0) newFrame += totalFrames;

      setCurrentFrame(newFrame);
      
      const newAngle = ((newFrame - 1) / totalFrames) * 360;
      setState((current) => ({ ...current, productAngle: newAngle }));
    }

    function onRotateUp() {
      rotateDragRef.current = null;
    }

    if (has360Support) {
      window.addEventListener("pointermove", onRotateMove);
      window.addEventListener("pointerup", onRotateUp);
    }

    return () => {
      window.removeEventListener("pointermove", onRotateMove);
      window.removeEventListener("pointerup", onRotateUp);
    };
  }, [has360Support, totalFrames]);

  async function saveMockup(options?: { silent?: boolean }) {
    if (isSaving || isExporting || isDeleting) return { ok: false as const };

    setIsSaving(true);
    const response = await saveMockupEditorAction({
      mockupId: mockup.id,
      name,
      garmentColor: state.garmentColor,
      state,
    });
    setIsSaving(false);

    if (!response.ok) {
      if (!options?.silent) pushToast("error", response.error);
      return { ok: false as const };
    }

    setName(response.mockup.name);
    setState(response.mockup.state);
    setStatus(response.mockup.status);
    setLastSavedAt(response.mockup.updatedAtIso);
    setPrintReadyUrl(response.mockup.printReadyUrl);
    if (!options?.silent) pushToast("success", response.message);
    router.refresh();
    return { ok: true as const };
  }

  async function exportMockup(format: "PNG" | "PRINT_READY") {
    if (isSaving || isExporting || isDeleting) return;

    setIsExporting(true);
    const saveResult = await saveMockup({ silent: true });
    if (!saveResult.ok) {
      setIsExporting(false);
      pushToast("error", "Save changes before exporting.");
      return;
    }

    const response = await exportMockupEditorAction({ mockupId: mockup.id, format });
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
    if (isSaving || isExporting || isDeleting) return;
    const confirmed = window.confirm("Delete this mockup permanently?");
    if (!confirmed) return;

    setIsDeleting(true);
    const response = await deleteMockupEditorAction({ mockupId: mockup.id });
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
                toneClass(toast.tone)
              )}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex h-screen flex-col bg-slate-50 dark:bg-zinc-950">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/mockups"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-300"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span className="hidden sm:inline">Mockups</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-40 rounded border border-transparent bg-transparent text-sm font-semibold text-slate-900 outline-none focus:border-[#895af6] dark:text-slate-100 sm:w-64"
            />
            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold", statusClass(status))}>
              {status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn(
                "rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800",
                sidebarOpen && "bg-slate-100 dark:bg-zinc-800"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">sidebar</span>
            </button>

            <div className="hidden h-4 w-px bg-slate-200 dark:bg-zinc-800 sm:block" />

            <button
              type="button"
              onClick={() => void saveMockup()}
              disabled={isSaving || isExporting || isDeleting}
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-200 sm:flex"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              {isSaving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={() => void exportMockup("PNG")}
              disabled={isSaving || isExporting || isDeleting}
              className="flex items-center gap-1.5 rounded-lg border border-[#895af6]/40 bg-[#895af6]/10 px-3 py-1.5 text-xs font-semibold text-[#895af6] transition-colors hover:bg-[#895af6]/15 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span className="hidden sm:inline">{isExporting ? "Exporting..." : "Export"}</span>
            </button>

            <button
              type="button"
              onClick={() => void exportMockup("PRINT_READY")}
              disabled={isSaving || isExporting || isDeleting}
              className="flex items-center gap-1.5 rounded-lg bg-[#895af6] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#895af6]/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="material-symbols-outlined text-[16px]">high_quality</span>
              <span className="hidden sm:inline">300 DPI</span>
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex border-b border-slate-200 dark:border-zinc-800">
                  <button
                    onClick={() => setActiveTab("products")}
                    className={cn(
                      "flex-1 px-3 py-2.5 text-xs font-semibold transition-colors",
                      activeTab === "products"
                        ? "border-b-2 border-[#895af6] text-[#895af6]"
                        : "text-slate-500 dark:text-slate-400"
                    )}
                  >
                    Products
                  </button>
                  <button
                    onClick={() => setActiveTab("layers")}
                    className={cn(
                      "flex-1 px-3 py-2.5 text-xs font-semibold transition-colors",
                      activeTab === "layers"
                        ? "border-b-2 border-[#895af6] text-[#895af6]"
                        : "text-slate-500 dark:text-slate-400"
                    )}
                  >
                    Layers
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  {activeTab === "products" ? (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase">
                        Product Type
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {PRODUCT_TYPES.map((product) => (
                          <button
                            key={product.type}
                            onClick={() => setGarmentType(product.type)}
                            className={cn(
                              "flex flex-col items-center gap-1 rounded-lg border p-2.5 transition-all",
                              state.garmentType === product.type
                                ? "border-[#895af6] bg-[#895af6]/10"
                                : "border-slate-200 hover:border-slate-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                            )}
                          >
                            <span className="material-symbols-outlined text-[24px] text-slate-600 dark:text-slate-300">
                              {product.icon}
                            </span>
                            <span className="text-[10px] font-medium text-slate-700 dark:text-slate-200">
                              {product.name}
                            </span>
                          </button>
                        ))}
                      </div>

                      <p className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase">
                        Color
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {currentProduct.colors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() =>
                              setState((current) => ({ ...current, garmentColor: color }))
                            }
                            style={{ backgroundColor: color }}
                            className={cn(
                              "size-7 rounded-full border-2 transition-all hover:scale-110",
                              state.garmentColor === color
                                ? "border-[#895af6] ring-2 ring-[#895af6]/35"
                                : "border-slate-300 dark:border-zinc-700",
                              color === "transparent" && "bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAABtJREFUGFdjZEACjFDBgBFqmJAo+PLlC38kBwfWCRgMAADyBgX/3u6l3QAAAABJRU5ErkJggg==')] bg-contain"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase">
                          Layers
                        </p>
                        <button
                          type="button"
                          onClick={addTextLayer}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-300"
                        >
                          <span className="material-symbols-outlined text-[12px]">add</span>
                          Text
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {state.layers.map((layer, index) => {
                          const isActive = layer.id === state.activeLayerId;
                          return (
                            <button
                              key={layer.id}
                              type="button"
                              onClick={() => setActiveLayer(layer.id)}
                              className={cn(
                                "flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-left transition-colors",
                                isActive
                                  ? "border-[#895af6]/45 bg-[#895af6]/10"
                                  : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/80"
                              )}
                            >
                              <span>
                                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100">
                                  {layer.name}
                                </span>
                                <span className="text-[9px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
                                  {layerTitle(layer.type)}
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLayerVisibility(layer.id);
                                }}
                                className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-zinc-700"
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  {layer.visible ? "visibility" : "visibility_off"}
                                </span>
                              </button>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <main className="flex-1 overflow-hidden">
            <div className="flex h-full flex-col">
              <div className="flex flex-1 items-center justify-center p-4">
                <div className="relative w-full max-w-lg" style={{ aspectRatio: currentProduct.aspectRatio * 1.2 }}>
                  <div
                    ref={canvasRef}
                    className={cn(
                      "relative h-full w-full overflow-hidden rounded-2xl shadow-2xl",
                      "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-950"
                    )}
                  >
                    {has360Support ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src={getFrameUrl(currentProduct.frameBaseUrl, currentFrame, totalFrames)}
                          alt={`Product view ${currentFrame}`}
                          className="h-full w-full object-contain"
                          draggable={false}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative" style={{ width: '85%', height: '85%' }}>
                            {currentProduct.printAreas.map((area, i) => (
                              <div
                                key={i}
                                className="absolute pointer-events-none"
                                style={{
                                  left: `${area.x - area.width / 2}%`,
                                  top: `${area.y - area.height / 2}%`,
                                  width: `${area.width}%`,
                                  height: `${area.height}%`,
                                }}
                              >
                                {state.layers.map((layer, index) => {
                                  if (!layer.visible) return null;
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
                                      onPointerDown={(e) => handleLayerPointerDown(e, layer)}
                                      className={cn(
                                        "absolute select-none rounded px-1 transition-all",
                                        isActive ? "ring-2 ring-[#895af6]/50" : "",
                                        isSaving || isExporting || isDeleting
                                          ? "cursor-not-allowed"
                                          : "cursor-grab active:cursor-grabbing"
                                      )}
                                    >
                                      {layer.type === "design" ? (
                                        <img
                                          src={layer.imageUrl ?? designPreviewLayer?.imageUrl ?? mockup.previewUrl ?? ""}
                                          alt="Design layer"
                                          className="pointer-events-none max-w-32 rounded shadow-lg"
                                          draggable={false}
                                        />
                                      ) : (
                                        <span
                                          className="pointer-events-none block whitespace-nowrap font-black uppercase tracking-[0.08em]"
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
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="relative w-[85%] rounded-2xl shadow-2xl transition-colors"
                          style={{ backgroundColor: state.garmentColor }}
                        >
                          <div className="absolute inset-0 rounded-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                            {currentProduct.printAreas.map((area, i) => (
                              <div
                                key={i}
                                className="absolute pointer-events-none"
                                style={{
                                  left: `${area.x - area.width / 2}%`,
                                  top: `${area.y - area.height / 2}%`,
                                  width: `${area.width}%`,
                                  height: `${area.height}%`,
                                  border: "1px dashed rgba(255,255,255,0.3)",
                                  borderRadius: "4px",
                                }}
                              />
                            ))}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center" style={{ padding: "15%" }}>
                            {state.layers.map((layer, index) => {
                              if (!layer.visible) return null;
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
                                  onPointerDown={(e) => handleLayerPointerDown(e, layer)}
                                  className={cn(
                                    "absolute select-none rounded px-1 transition-all",
                                    isActive ? "ring-2 ring-[#895af6]/50" : "",
                                    isSaving || isExporting || isDeleting
                                      ? "cursor-not-allowed"
                                      : "cursor-grab active:cursor-grabbing"
                                  )}
                                >
                                  {layer.type === "design" ? (
                                    <img
                                      src={layer.imageUrl ?? designPreviewLayer?.imageUrl ?? mockup.previewUrl ?? ""}
                                      alt="Design layer"
                                      className="pointer-events-none max-w-32 rounded shadow-lg"
                                      draggable={false}
                                    />
                                  ) : (
                                    <span
                                      className="pointer-events-none block whitespace-nowrap font-black uppercase tracking-[0.08em]"
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
                      </div>
                    )}

                    {has360Support && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                        <button
                          onPointerDown={handleRotateStart}
                          disabled={isPreloading}
                          className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-medium text-white backdrop-blur-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[14px]">360</span>
                          {isPreloading ? "Loading..." : "Drag to rotate"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="material-symbols-outlined text-[14px]">drag_indicator</span>
                  Drag layers to position
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Angle: {Math.round(state.productAngle)}°</span>
                </div>
              </div>
            </div>
          </main>

          <AnimatePresence mode="wait">
            {rightPanelOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="border-b border-slate-200 p-3 dark:border-zinc-800">
                  <p className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase">
                    Active Layer
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {activeLayer ? activeLayer.name : "No layer selected"}
                  </p>
                </div>

                {activeLayer ? (
                  <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    <div className="space-y-3">
                      <label className="grid gap-1">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          X Position
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={0.5}
                          value={activeLayer.x}
                          onChange={(e) =>
                            updateLayer(activeLayer.id, (layer) => ({
                              ...layer,
                              x: Number(e.target.value),
                            }))
                          }
                          className="h-1.5 w-full cursor-pointer rounded bg-slate-200 accent-[#895af6] dark:bg-zinc-800"
                        />
                      </label>

                      <label className="grid gap-1">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          Y Position
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={0.5}
                          value={activeLayer.y}
                          onChange={(e) =>
                            updateLayer(activeLayer.id, (layer) => ({
                              ...layer,
                              y: Number(e.target.value),
                            }))
                          }
                          className="h-1.5 w-full cursor-pointer rounded bg-slate-200 accent-[#895af6] dark:bg-zinc-800"
                        />
                      </label>

                      <label className="grid gap-1">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          Scale
                        </span>
                        <input
                          type="range"
                          min={0.2}
                          max={2.5}
                          step={0.01}
                          value={activeLayer.scale}
                          onChange={(e) =>
                            updateLayer(activeLayer.id, (layer) => ({
                              ...layer,
                              scale: Number(e.target.value),
                            }))
                          }
                          className="h-1.5 w-full cursor-pointer rounded bg-slate-200 accent-[#895af6] dark:bg-zinc-800"
                        />
                      </label>

                      <label className="grid gap-1">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          Rotation
                        </span>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          step={1}
                          value={activeLayer.rotation}
                          onChange={(e) =>
                            updateLayer(activeLayer.id, (layer) => ({
                              ...layer,
                              rotation: Number(e.target.value),
                            }))
                          }
                          className="h-1.5 w-full cursor-pointer rounded bg-slate-200 accent-[#895af6] dark:bg-zinc-800"
                        />
                      </label>
                    </div>

                    {activeLayer.type === "text" && (
                      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                        <p className="text-[10px] font-bold tracking-[0.1em] text-slate-400 uppercase">
                          Text Content
                        </p>
                        <input
                          value={activeLayer.text ?? ""}
                          onChange={(e) =>
                            updateLayer(activeLayer.id, (layer) => ({
                              ...layer,
                              text: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 outline-none transition-colors focus:border-[#895af6] dark:border-zinc-700 dark:bg-zinc-950 dark:text-slate-100"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="color"
                            value={activeLayer.color ?? "#ffffff"}
                            onChange={(e) =>
                              updateLayer(activeLayer.id, (layer) => ({
                                ...layer,
                                color: e.target.value,
                              }))
                            }
                            className="h-8 w-full cursor-pointer rounded border border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-950"
                          />
                          <input
                            type="number"
                            min={12}
                            max={96}
                            value={activeLayer.fontSize ?? 36}
                            onChange={(e) =>
                              updateLayer(activeLayer.id, (layer) => ({
                                ...layer,
                                fontSize: clamp(Number(e.target.value), 12, 96),
                              }))
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-slate-100"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={removeActiveTextLayer}
                          className="w-full rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-[10px] font-semibold text-red-500 transition-colors hover:bg-red-500/20"
                        >
                          Remove Text Layer
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={centerActiveLayer}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-[10px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-200"
                      >
                        Center
                      </button>
                      <button
                        type="button"
                        onClick={resetActiveLayerTransform}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-[10px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-200"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLayer("up")}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-[10px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-200"
                      >
                        Forward
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLayer("down")}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-[10px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-200"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center p-4">
                    <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                      Select a layer to edit its properties
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-200 p-3 dark:border-zinc-800">
                  <button
                    onClick={() => setRightPanelOpen(false)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-300"
                  >
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    Hide Panel
                  </button>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {!rightPanelOpen && (
            <button
              onClick={() => setRightPanelOpen(true)}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-l-lg border border-l-0 border-slate-200 bg-white p-2 text-slate-500 shadow-lg transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-400"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
          )}
        </div>

        <footer className="flex h-10 shrink-0 items-center justify-between border-t border-slate-200 bg-white px-4 text-[10px] text-slate-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>Last saved {localDate(lastSavedAt)}</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">{currentProduct.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void deleteMockup()}
              disabled={isSaving || isExporting || isDeleting}
              className="flex items-center gap-1 text-red-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[14px]">delete</span>
              Delete
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
