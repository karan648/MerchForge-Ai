import { MockupStatus } from "@prisma/client";

import { getPrismaClient } from "@/server/db/prisma";

export type MockupsOverview = {
  items: Array<{
    id: string;
    name: string;
    garmentType: string;
    garmentColor: string;
    status: "Draft" | "Ready" | "Exported";
    previewUrl: string;
    updatedAt: Date;
    isDemo: boolean;
  }>;
  isDemoData: boolean;
};

const FALLBACK_MOCKUPS: MockupsOverview["items"] = [
  {
    id: "mockup-demo-1",
    name: "Classic White Tee",
    garmentType: "T-Shirt",
    garmentColor: "White",
    status: "Ready",
    previewUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBO7OJElyXcwkpNMfSdBQ6xRc_N9lKfDPU2K3UO52S3JudJxDVdTTVwQXPXqV50EqeGhg-DudmIOzmsUn8McTq60IY6zBJ66KAEsbC-lAGMdv0Uoi9mWFOYts4Tu_1qw0eYvInkUwHoQVR6KQZnIi1tuA4O1EDtGH4Kbq1jjsPTPFmLO5_d47PlQIynK7ixDIehH9b8_KNu6kRWD-y0pu5ONAKMoxVa78gdM6gRFDUDodYxSEP-ovzf6VZRJIupTKq_qrtgSqYszmM2",
    updatedAt: new Date("2025-10-25T11:00:00.000Z"),
    isDemo: true,
  },
  {
    id: "mockup-demo-2",
    name: "Oversized Hoodie",
    garmentType: "Hoodie",
    garmentColor: "Black",
    status: "Draft",
    previewUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAhIHFxA6N4pPV8mEmu0h6nNcvi1HbghGYF0XXkx_AW7RQ4VQ5QK2MVYnzeFmmjBJIf_D0QfCT0CDFnOlbGGfVBhkVfIOdC3i4RcxoT69JdFcPM66r6YyoVHKN7xFoj_XyHwonRl_Cj2IuhS6A2PMNrfyCBqM9-rFq4y9xe8A-SA0nWFQ60fy7nXgPwRpyuCaTdkSCiuwWRBnJ2_TAhh_zENeUJWIiGQErIt9svBnKweLQEEncYdQKhOtOlazULJccpJVITlMdtR3o5",
    updatedAt: new Date("2025-10-24T17:00:00.000Z"),
    isDemo: true,
  },
];

function mapStatus(status: MockupStatus): "Draft" | "Ready" | "Exported" {
  if (status === MockupStatus.READY) {
    return "Ready";
  }

  if (status === MockupStatus.EXPORTED) {
    return "Exported";
  }

  return "Draft";
}

export async function getMockupsOverview(userId: string): Promise<MockupsOverview> {
  const prisma = getPrismaClient();

  const mockups = await prisma.mockup.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: {
      id: true,
      name: true,
      garmentType: true,
      garmentColor: true,
      status: true,
      previewUrl: true,
      updatedAt: true,
    },
  });

  const mapped = mockups
    .filter((mockup) => Boolean(mockup.previewUrl))
    .map((mockup) => ({
      id: mockup.id,
      name: mockup.name,
      garmentType: mockup.garmentType.replaceAll("_", " "),
      garmentColor: mockup.garmentColor ?? "Default",
      status: mapStatus(mockup.status),
      previewUrl: mockup.previewUrl as string,
      updatedAt: mockup.updatedAt,
      isDemo: false,
    }));

  return {
    items: mapped.length > 0 ? mapped : FALLBACK_MOCKUPS,
    isDemoData: mapped.length === 0,
  };
}
