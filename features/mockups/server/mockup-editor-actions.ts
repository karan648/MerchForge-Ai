"use server";

import { revalidatePath } from "next/cache";

import { getSessionUserId } from "@/features/onboarding/server/session-user";

import type {
  MockupEditorData,
  MockupExportFormat,
  MockupEditorState,
} from "./mockup-editor-service";
import {
  deleteMockupForUser,
  exportMockupForUser,
  saveMockupEditorStateForUser,
} from "./mockup-editor-service";

type MockupEditorActionResult =
  | {
      ok: true;
      message: string;
      mockup: MockupEditorData;
    }
  | {
      ok: false;
      error: string;
    };

type MockupExportActionResult =
  | {
      ok: true;
      message: string;
      downloadUrl: string;
      dpi: number;
    }
  | {
      ok: false;
      error: string;
    };

type MockupDeleteActionResult =
  | {
      ok: true;
      message: string;
      redirectPath: string;
    }
  | {
      ok: false;
      error: string;
    };

type SaveMockupEditorActionInput = {
  mockupId: string;
  name: string;
  garmentColor: string;
  state: MockupEditorState;
};

type ExportMockupEditorActionInput = {
  mockupId: string;
  format: MockupExportFormat;
};

type DeleteMockupEditorActionInput = {
  mockupId: string;
};

function revalidateMockupPaths(mockupId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mockups");
  revalidatePath(`/dashboard/mockups/${mockupId}`);
}

export async function saveMockupEditorAction(
  input: SaveMockupEditorActionInput,
): Promise<MockupEditorActionResult> {
  const userId = await getSessionUserId();

  if (!userId) {
    return { ok: false, error: "Your session expired. Please sign in again." };
  }

  try {
    const updated = await saveMockupEditorStateForUser(userId, input);
    revalidateMockupPaths(updated.id);

    return {
      ok: true,
      message: "Mockup saved successfully.",
      mockup: updated,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return { ok: false, error: "Mockup was not found." };
      }

      if (error.message === "VALIDATION_NAME") {
        return { ok: false, error: "Mockup name must be at least 2 characters." };
      }
    }

    return { ok: false, error: "Unable to save this mockup right now." };
  }
}

export async function exportMockupEditorAction(
  input: ExportMockupEditorActionInput,
): Promise<MockupExportActionResult> {
  const userId = await getSessionUserId();

  if (!userId) {
    return { ok: false, error: "Your session expired. Please sign in again." };
  }

  try {
    const exported = await exportMockupForUser(userId, input.mockupId, input.format);
    revalidateMockupPaths(input.mockupId);

    return {
      ok: true,
      message: input.format === "PRINT_READY" ? "300 DPI export ready." : "PNG export ready.",
      downloadUrl: exported.downloadUrl,
      dpi: exported.dpi,
    };
  } catch {
    return { ok: false, error: "Unable to export this mockup right now." };
  }
}

export async function deleteMockupEditorAction(
  input: DeleteMockupEditorActionInput,
): Promise<MockupDeleteActionResult> {
  const userId = await getSessionUserId();

  if (!userId) {
    return { ok: false, error: "Your session expired. Please sign in again." };
  }

  try {
    await deleteMockupForUser(userId, input.mockupId);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/mockups");

    return {
      ok: true,
      message: "Mockup deleted.",
      redirectPath: "/dashboard/mockups",
    };
  } catch {
    return { ok: false, error: "Unable to delete this mockup right now." };
  }
}
