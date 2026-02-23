import { MockupStatus, Prisma, type PrismaClient } from "@prisma/client";

import { getPrismaClient } from "@/server/db/prisma";

export {
  GarmentType,
  PRODUCT_TYPES,
  getProductTypeInfo,
  type MockupLayerType,
  type MockupEditorLayer,
  type MockupEditorState,
  type MockupEditorData,
  type SaveMockupEditorInput,
  type MockupExportFormat,
  type ProductTypeInfo,
} from "../types/mockup-editor-types";

const DEFAULT_DESIGN_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAPSjjvewf3fpztpQFQlVfm9zG6IvAbIWjOTJVabrTBIiaLE8V79jNAQQrN44bKUkTge40gkmyl2CNa6wMYFfyNuEcMtu-j0nvcGkQXQmSnu0RLZ7nnHAMx6lHBp7vO362R_ukQoD-BTRYugJGd-41FqA9DuusQiSbsATk9sk5vPn4XxlDiT0mwp-kg6poHa6yPGeErh6vqx__OwvR8x9JGa-x2ETv1OK53dS4fhFz3izSmdNqv5ZqDofTBUflUHXHfQcD4UXQYw6-T";

const DEFAULT_MOCKUP_PREVIEW =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBO7OJElyXcwkpNMfSdBQ6xRc_N9lKfDPU2K3UO52S3JudJxDVdTTVwQXPXqV50EqeGhg-DudmIOzmsUn8McTq60IY6zBJ66KAEsbC-lAGMdv0Uoi9mWFOYts4Tu_1qw0eYvInkUwHoQVR6KQZnIi1tuA4O1EDtGH4Kbq1jjsPTPFmLO5_d47PlQIynK7ixDIehH9b8_KNu6kRWD-y0pu5ONAKMoxVa78gdM6gRFDUDodYxSEP-ovzf6VZRJIupTKq_qrtgSqYszmM2";

function mapStatus(status: MockupStatus): "Draft" | "Ready" | "Exported" {
  if (status === MockupStatus.READY) return "Ready";
  if (status === MockupStatus.EXPORTED) return "Exported";
  return "Draft";
}

function toJsonObject(value: Prisma.JsonValue | null | undefined): Prisma.JsonObject {
  if (!value || Array.isArray(value) || typeof value !== "object") return {};
  return value as Prisma.JsonObject;
}

function safeLayerType(value: unknown): "design" | "text" {
  return value === "text" ? "text" : "design";
}

function safeNumber(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return value;
}

function safeString(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeLayer(input: { x: number; y: number; scale: number; rotation: number }): { x: number; y: number; scale: number; rotation: number } {
  return {
    x: Math.max(0, Math.min(100, input.x)),
    y: Math.max(0, Math.min(100, input.y)),
    scale: Math.max(0.2, Math.min(2.5, input.scale)),
    rotation: Math.max(-180, Math.min(180, input.rotation)),
  };
}

import { GarmentType } from "../types/mockup-editor-types";
import type { MockupEditorState, MockupEditorLayer, MockupEditorData, SaveMockupEditorInput } from "../types/mockup-editor-types";

function defaultState(designImageUrl?: string | null, garmentTypeVal?: GarmentType): MockupEditorState {
  return {
    version: 1,
    garmentType: garmentTypeVal ?? GarmentType.T_SHIRT,
    garmentColor: "#111827",
    productAngle: 0,
    activeLayerId: "layer-design",
    layers: [
      {
        id: "layer-design",
        type: "design",
        name: "Design",
        visible: true,
        x: 50,
        y: 46,
        scale: 1,
        rotation: 0,
        imageUrl: designImageUrl ?? DEFAULT_DESIGN_IMAGE,
      },
      {
        id: "layer-text",
        type: "text",
        name: "Text",
        visible: false,
        x: 50,
        y: 78,
        scale: 1,
        rotation: 0,
        text: "Limited Drop",
        color: "#ffffff",
        fontSize: 38,
      },
    ],
  };
}

function parseMockupState(value: Prisma.JsonValue | null, designImageUrl?: string | null, forcedGarmentType?: GarmentType): MockupEditorState {
  if (!value) return defaultState(designImageUrl, forcedGarmentType);

  const json = toJsonObject(value);
  if (!Array.isArray(json.layers)) return defaultState(designImageUrl, forcedGarmentType);

  const rawLayers = json.layers
    .map((layer) => {
      if (!layer || Array.isArray(layer) || typeof layer !== "object") return null;
      const obj = layer as Record<string, unknown>;
      const transform = normalizeLayer({
        x: safeNumber(obj.x, 50),
        y: safeNumber(obj.y, 50),
        scale: safeNumber(obj.scale, 1),
        rotation: safeNumber(obj.rotation, 0),
      });
      const normalized: MockupEditorLayer = {
        id: safeString(obj.id, `layer-${Math.random().toString(36).slice(2, 8)}`),
        type: safeLayerType(obj.type),
        name: safeString(obj.name, safeLayerType(obj.type) === "text" ? "Text" : "Design"),
        visible: obj.visible !== false,
        ...transform,
        imageUrl: typeof obj.src === "string" ? obj.src : typeof obj.imageUrl === "string" ? obj.imageUrl : undefined,
        text: typeof obj.text === "string" ? obj.text : undefined,
        color: typeof obj.color === "string" ? obj.color : undefined,
        fontSize: typeof obj.fontSize === "number" ? obj.fontSize : undefined,
      } as MockupEditorLayer;
      return normalized;
    })
    .filter((layer): layer is MockupEditorLayer => layer !== null);

  if (rawLayers.length === 0) return defaultState(designImageUrl, forcedGarmentType);

  const hasDesignLayer = rawLayers.some((layer) => layer.type === "design");
  const withDesign: MockupEditorLayer[] = hasDesignLayer
    ? rawLayers
    : [
        ...rawLayers,
        {
          id: "layer-design",
          type: "design",
          name: "Design",
          visible: true,
          x: 50,
          y: 46,
          scale: 1,
          rotation: 0,
          imageUrl: designImageUrl ?? DEFAULT_DESIGN_IMAGE,
        },
      ];

  const activeLayerId =
    typeof json.activeLayerId === "string" && withDesign.some((layer) => layer.id === json.activeLayerId)
      ? json.activeLayerId
      : withDesign[0]?.id ?? "layer-design";

  const garmentColor = typeof json.garmentColor === "string" && json.garmentColor.trim().length > 0 ? json.garmentColor : "#111827";

  const garmentType = Object.values(GarmentType).includes(json.garmentType as GarmentType)
    ? (json.garmentType as GarmentType)
    : (forcedGarmentType ?? GarmentType.T_SHIRT);

  const productAngle = typeof json.productAngle === "number" ? json.productAngle : 0;

  return { version: 1, garmentType, garmentColor, productAngle, activeLayerId, layers: withDesign };
}

function sanitizeState(input: MockupEditorState): MockupEditorState {
  const layers: MockupEditorLayer[] = input.layers
    .map((layer) => {
      const type = safeLayerType(layer.type);
      const transform = normalizeLayer({ x: layer.x, y: layer.y, scale: layer.scale, rotation: layer.rotation });
      return {
        id: safeString(layer.id, `layer-${Date.now().toString(36)}`),
        type,
        name: safeString(layer.name, type === "text" ? "Text" : "Design"),
        visible: layer.visible !== false,
        ...transform,
        imageUrl: type === "design" ? safeString(layer.imageUrl, DEFAULT_DESIGN_IMAGE) : undefined,
        text: type === "text" ? safeString(layer.text, "Limited Drop") : undefined,
        color: type === "text" ? safeString(layer.color, "#ffffff") : undefined,
        fontSize: type === "text" ? Math.max(12, Math.min(96, safeNumber(layer.fontSize, 36))) : undefined,
      } as MockupEditorLayer;
    })
    .slice(0, 8);

  const hasDesign = layers.some((layer) => layer.type === "design");
  if (!hasDesign) {
    const designLayer: MockupEditorLayer = {
      id: "layer-design",
      type: "design",
      name: "Design",
      visible: true,
      x: 50,
      y: 46,
      scale: 1,
      rotation: 0,
      imageUrl: DEFAULT_DESIGN_IMAGE,
    };
    layers.unshift(designLayer as MockupEditorLayer);
  }

  const activeLayerId = layers.some((layer) => layer.id === input.activeLayerId) ? input.activeLayerId : layers[0]?.id ?? "layer-design";
  const garmentColor = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(input.garmentColor) ? input.garmentColor : "#111827";
  const garmentType = Object.values(GarmentType).includes(input.garmentType) ? input.garmentType : GarmentType.T_SHIRT;
  const productAngle = typeof input.productAngle === "number" ? Math.max(0, Math.min(360, input.productAngle)) : 0;

  return { version: 1, garmentType, garmentColor, productAngle, activeLayerId, layers };
}

function stateToJson(state: MockupEditorState): Prisma.InputJsonValue {
  return {
    version: state.version,
    garmentType: state.garmentType,
    garmentColor: state.garmentColor,
    productAngle: state.productAngle,
    activeLayerId: state.activeLayerId,
    layers: state.layers.map((layer) => ({
      id: layer.id,
      type: layer.type,
      name: layer.name,
      visible: layer.visible,
      x: layer.x,
      y: layer.y,
      scale: layer.scale,
      rotation: layer.rotation,
      imageUrl: layer.imageUrl,
      src: layer.imageUrl,
      text: layer.text,
      color: layer.color,
      fontSize: layer.fontSize,
    })),
  } as Prisma.InputJsonValue;
}

function derivePreviewUrl(state: MockupEditorState, fallback?: string | null): string {
  const designLayer = state.layers.find((layer) => layer.type === "design" && layer.visible);
  return designLayer?.imageUrl ?? fallback ?? DEFAULT_MOCKUP_PREVIEW;
}

function ensureOwner(whereUserId: string, userId: string) {
  if (whereUserId !== userId) throw new Error("FORBIDDEN");
}

async function findOwnedMockup(prisma: PrismaClient, userId: string, mockupId: string) {
  return prisma.mockup.findUnique({
    where: { id: mockupId },
    select: {
      id: true,
      userId: true,
      name: true,
      garmentType: true,
      garmentColor: true,
      canvasState: true,
      previewUrl: true,
      printReadyUrl: true,
      dpi: true,
      status: true,
      updatedAt: true,
      design: { select: { primaryImageUrl: true, thumbnailUrl: true } },
    },
  });
}

export async function createBlankMockupForUser(userId: string): Promise<string> {
  const prisma = getPrismaClient();
  const state = defaultState(DEFAULT_DESIGN_IMAGE);

  const mockup = await prisma.mockup.create({
    data: {
      userId,
      name: "Untitled Mockup",
      garmentType: GarmentType.T_SHIRT,
      garmentColor: state.garmentColor,
      canvasState: stateToJson(state),
      previewUrl: derivePreviewUrl(state),
      printReadyUrl: derivePreviewUrl(state),
      status: MockupStatus.DRAFT,
      metadata: { source: "mockup_editor_new" },
    },
    select: { id: true },
  });

  return mockup.id;
}

export async function getMockupEditorDataForUser(userId: string, mockupId: string): Promise<MockupEditorData | null> {
  const prisma = getPrismaClient();
  const mockup = await findOwnedMockup(prisma, userId, mockupId);
  if (!mockup) return null;
  ensureOwner(mockup.userId, userId);

  const designImageUrl = mockup.design?.primaryImageUrl ?? mockup.design?.thumbnailUrl ?? mockup.previewUrl;
  const state = parseMockupState(mockup.canvasState, designImageUrl, mockup.garmentType);

  return {
    id: mockup.id,
    name: mockup.name,
    garmentType: mockup.garmentType.replaceAll("_", " "),
    garmentColor: mockup.garmentColor ?? state.garmentColor,
    status: mapStatus(mockup.status),
    previewUrl: mockup.previewUrl,
    printReadyUrl: mockup.printReadyUrl,
    dpi: mockup.dpi,
    updatedAtIso: mockup.updatedAt.toISOString(),
    state,
  };
}

export async function saveMockupEditorStateForUser(userId: string, input: SaveMockupEditorInput): Promise<MockupEditorData> {
  const prisma = getPrismaClient();
  const existing = await findOwnedMockup(prisma, userId, input.mockupId);
  if (!existing) throw new Error("NOT_FOUND");
  ensureOwner(existing.userId, userId);

  const name = input.name.trim();
  if (name.length < 2) throw new Error("VALIDATION_NAME");

  const state = sanitizeState(input.state);
  const previewUrl = derivePreviewUrl(state, existing.previewUrl);

  const updated = await prisma.mockup.update({
    where: { id: existing.id },
    data: {
      name,
      garmentType: state.garmentType,
      garmentColor: state.garmentColor,
      canvasState: stateToJson(state),
      previewUrl,
      status: MockupStatus.READY,
    },
    select: {
      id: true,
      name: true,
      garmentType: true,
      garmentColor: true,
      canvasState: true,
      previewUrl: true,
      printReadyUrl: true,
      dpi: true,
      status: true,
      updatedAt: true,
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    garmentType: updated.garmentType.replaceAll("_", " "),
    garmentColor: updated.garmentColor ?? state.garmentColor,
    status: mapStatus(updated.status),
    previewUrl: updated.previewUrl,
    printReadyUrl: updated.printReadyUrl,
    dpi: updated.dpi,
    updatedAtIso: updated.updatedAt.toISOString(),
    state,
  };
}

export async function exportMockupForUser(userId: string, mockupId: string, format: "PNG" | "PRINT_READY"): Promise<{ downloadUrl: string; dpi: number }> {
  const prisma = getPrismaClient();
  const mockup = await findOwnedMockup(prisma, userId, mockupId);
  if (!mockup) throw new Error("NOT_FOUND");
  ensureOwner(mockup.userId, userId);

  const state = parseMockupState(mockup.canvasState, mockup.previewUrl);
  const baseUrl = derivePreviewUrl(state, mockup.previewUrl);

  const downloadUrl = (() => {
    const token = Date.now().toString(36);
    try {
      const url = new URL(baseUrl);
      url.searchParams.set("mf_export", format === "PNG" ? "png" : "print");
      url.searchParams.set("mf_v", token);
      return url.toString();
    } catch {
      const separator = baseUrl.includes("?") ? "&" : "?";
      return `${baseUrl}${separator}mf_export=${format === "PNG" ? "png" : "print"}&mf_v=${token}`;
    }
  })();

  const dpi = format === "PRINT_READY" ? 300 : 150;

  await prisma.mockup.update({
    where: { id: mockup.id },
    data: {
      printReadyUrl: downloadUrl,
      dpi,
      status: MockupStatus.EXPORTED,
      metadata: { source: "mockup_export_action", format, exportedAtIso: new Date().toISOString() },
    },
  });

  return { downloadUrl, dpi };
}

export async function deleteMockupForUser(userId: string, mockupId: string): Promise<void> {
  const prisma = getPrismaClient();
  const existing = await findOwnedMockup(prisma, userId, mockupId);
  if (!existing) return;
  ensureOwner(existing.userId, userId);
  await prisma.mockup.delete({ where: { id: existing.id } });
}
