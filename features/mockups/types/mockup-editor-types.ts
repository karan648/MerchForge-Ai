import { GarmentType as GarmentTypeEnum } from "@prisma/client";

export const GarmentType = GarmentTypeEnum;
export type GarmentType = GarmentTypeEnum;

export type MockupLayerType = "design" | "text";

export type MockupEditorLayer = {
  id: string;
  type: MockupLayerType;
  name: string;
  visible: boolean;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  imageUrl?: string;
  text?: string;
  color?: string;
  fontSize?: number;
};

export type MockupEditorState = {
  version: number;
  garmentType: GarmentType;
  garmentColor: string;
  productAngle: number;
  activeLayerId: string;
  layers: MockupEditorLayer[];
};

export type MockupEditorData = {
  id: string;
  name: string;
  garmentType: string;
  garmentColor: string;
  status: "Draft" | "Ready" | "Exported";
  previewUrl: string | null;
  printReadyUrl: string | null;
  dpi: number;
  updatedAtIso: string;
  state: MockupEditorState;
};

export type SaveMockupEditorInput = {
  mockupId: string;
  name: string;
  garmentType?: GarmentType;
  garmentColor: string;
  state: MockupEditorState;
};

export type MockupExportFormat = "PNG" | "PRINT_READY";

export type ProductFrameConfig = {
  productId: string;
  frames: number;
  baseUrl: string;
  designArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type ProductTypeInfo = {
  type: GarmentType;
  name: string;
  description: string;
  icon: string;
  colors: string[];
  printAreas: { name: string; x: number; y: number; width: number; height: number }[];
  aspectRatio: number;
  frames: number;
  frameBaseUrl: string;
};

export const PRODUCT_TYPES: ProductTypeInfo[] = [
  {
    type: GarmentType.T_SHIRT,
    name: "T-Shirt",
    description: "Classic cotton t-shirt",
    icon: "checkroom",
    colors: ["#111827", "#1f2937", "#ffffff", "#a855f7", "#0ea5e9", "#f43f5e", "#22c55e", "#f59e0b"],
    printAreas: [{ name: "Center", x: 50, y: 45, width: 40, height: 50 }],
    aspectRatio: 4 / 5,
    frames: 36,
    frameBaseUrl: "/products/tshirt",
  },
  {
    type: GarmentType.HOODIE,
    name: "Hoodie",
    description: "Premium hoodie",
    icon: "ac_unit",
    colors: ["#111827", "#1f2937", "#374151", "#4f46e5", "#dc2626"],
    printAreas: [{ name: "Center", x: 50, y: 42, width: 45, height: 55 }],
    aspectRatio: 4 / 5,
    frames: 36,
    frameBaseUrl: "/products/hoodie",
  },
  {
    type: GarmentType.SWEATSHIRT,
    name: "Sweatshirt",
    description: "Comfortable sweatshirt",
    icon: "dry_cleaning",
    colors: ["#111827", "#1f2937", "#ffffff", "#6b7280", "#3b82f6"],
    printAreas: [{ name: "Center", x: 50, y: 43, width: 42, height: 52 }],
    aspectRatio: 4 / 5,
    frames: 36,
    frameBaseUrl: "/products/sweatshirt",
  },
  {
    type: GarmentType.SWEATER,
    name: "Sweater",
    description: "Knit sweater",
    icon: "layers",
    colors: ["#78350f", "#92400e", "#1f2937", "#ffffff", "#9ca3af"],
    printAreas: [{ name: "Center", x: 50, y: 44, width: 40, height: 50 }],
    aspectRatio: 4 / 5,
    frames: 36,
    frameBaseUrl: "/products/sweater",
  },
  {
    type: GarmentType.TANK_TOP,
    name: "Tank Top",
    description: "Sleeveless tee",
    icon: "checkroom",
    colors: ["#ffffff", "#111827", "#1f2937", "#a855f7", "#0ea5e9"],
    printAreas: [{ name: "Center", x: 50, y: 45, width: 35, height: 50 }],
    aspectRatio: 4 / 5,
    frames: 36,
    frameBaseUrl: "/products/tank-top",
  },
  {
    type: GarmentType.HAT,
    name: "Hat",
    description: "Beanie style",
    icon: "face",
    colors: ["#111827", "#1f2937", "#374151", "#dc2626", "#3b82f6"],
    printAreas: [{ name: "Front", x: 50, y: 50, width: 60, height: 30 }],
    aspectRatio: 1,
    frames: 36,
    frameBaseUrl: "/products/hat",
  },
  {
    type: GarmentType.CAP,
    name: "Cap",
    description: "Baseball cap",
    icon: "sports_baseball",
    colors: ["#111827", "#1f2937", "#ffffff", "#dc2626", "#2563eb"],
    printAreas: [{ name: "Front", x: 50, y: 45, width: 50, height: 25 }],
    aspectRatio: 1,
    frames: 36,
    frameBaseUrl: "/products/cap",
  },
  {
    type: GarmentType.MUG,
    name: "Mug",
    description: "Ceramic mug",
    icon: "coffee",
    colors: ["#ffffff", "#111827", "#3b82f6", "#10b981", "#f59e0b"],
    printAreas: [
      { name: "Front", x: 35, y: 50, width: 30, height: 60 },
      { name: "Back", x: 85, y: 50, width: 30, height: 60 },
    ],
    aspectRatio: 1,
    frames: 36,
    frameBaseUrl: "/products/mug",
  },
  {
    type: GarmentType.POSTER,
    name: "Poster",
    description: "Wall poster",
    icon: "image",
    colors: ["#ffffff"],
    printAreas: [{ name: "Full", x: 50, y: 50, width: 90, height: 90 }],
    aspectRatio: 3 / 4,
    frames: 1,
    frameBaseUrl: "/products/poster",
  },
  {
    type: GarmentType.CANVAS,
    name: "Canvas",
    description: "Art canvas print",
    icon: "palette",
    colors: ["#ffffff"],
    printAreas: [{ name: "Full", x: 50, y: 50, width: 90, height: 90 }],
    aspectRatio: 1,
    frames: 1,
    frameBaseUrl: "/products/canvas",
  },
  {
    type: GarmentType.STICKER,
    name: "Sticker",
    description: "Die-cut sticker",
    icon: "star",
    colors: ["#ffffff", "transparent"],
    printAreas: [{ name: "Full", x: 50, y: 50, width: 90, height: 90 }],
    aspectRatio: 1,
    frames: 1,
    frameBaseUrl: "/products/sticker",
  },
  {
    type: GarmentType.TOTE_BAG,
    name: "Tote Bag",
    description: "Canvas tote",
    icon: "shopping_bag",
    colors: ["#f5f5f4", "#1f2937", "#78350f", "#0ea5e9"],
    printAreas: [{ name: "Center", x: 50, y: 50, width: 60, height: 50 }],
    aspectRatio: 1,
    frames: 36,
    frameBaseUrl: "/products/tote-bag",
  },
  {
    type: GarmentType.PHONE_CASE,
    name: "Phone Case",
    description: "Smartphone case",
    icon: "smartphone",
    colors: ["#111827", "#ffffff", "#3b82f6", "#ec4899", "#10b981"],
    printAreas: [{ name: "Back", x: 50, y: 50, width: 80, height: 80 }],
    aspectRatio: 1,
    frames: 36,
    frameBaseUrl: "/products/phone-case",
  },
  {
    type: GarmentType.NOTEBOOK,
    name: "Notebook",
    description: "Hardcover notebook",
    icon: "book",
    colors: ["#111827", "#1f2937", "#78350f", "#3b82f6", "#dc2626"],
    printAreas: [{ name: "Cover", x: 50, y: 50, width: 80, height: 80 }],
    aspectRatio: 3 / 4,
    frames: 36,
    frameBaseUrl: "/products/notebook",
  },
];

export function getProductTypeInfo(type: GarmentType): ProductTypeInfo {
  return PRODUCT_TYPES.find((p) => p.type === type) ?? PRODUCT_TYPES[0];
}

export function getFrameUrl(baseUrl: string, frameIndex: number, totalFrames: number): string {
  const paddedIndex = String(frameIndex).padStart(2, "0");
  return `${baseUrl}/${paddedIndex}.webp`;
}
