import { DesignStatus } from "@prisma/client";

import { getPrismaClient } from "@/server/db/prisma";

type GalleryStatus = "Live" | "Draft" | "Archived";

export type DesignsOverview = {
  designs: Array<{
    id: string;
    title: string;
    prompt: string;
    imageUrl: string;
    status: GalleryStatus;
    createdAt: Date;
  }>;
  isDemoData: boolean;
};

const FALLBACK_DESIGNS: DesignsOverview["designs"] = [
  {
    id: "design-demo-1",
    title: "Minimalist Peak T-Shirt",
    prompt: "Minimalist mountain line art, premium print style",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBHWG0wdCj5G73wCyvDWcZeIK-dXbSIv9xfmovnxoUJipPFaDIr3Qn1bLS6GJqN6Mh1XrGfx2dETZLF2ypYYFwh1aUo_DcYtjeqndWnqmR_S99E9BVxKBlCHOGrBeQLab9qoo7VG99oRC-NMKRHxD0CdlgV2_f6j0WzstL77w5TnH2DY6xHtHDKIF_1j2wSxeaMUxPekOuROV6CvWerX3hgsimkNCluqO-yWozXTfu3POl2Vjs9Jip9XRea_LivRW7kecyJByHwTBwv",
    status: "Live",
    createdAt: new Date("2025-10-24T10:00:00.000Z"),
  },
  {
    id: "design-demo-2",
    title: "Neon Cyberpunk Hoodie",
    prompt: "Cyberpunk helmet with neon glow and reflections",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBO_IAbq8HMp5Tq-s9XlAVVN4k0PuD5Q_fp1uKtFb0P6-cBh9Z1M0WCmYYgE0haxqtp4os5xcOV8lPqgVD6zlcy78FaF2-Mm9IyDEKysm90vFdVSuw1ykQcd7AiOncjbStyBybOhezuz2DToVp0hG4HD15A5YDR_D9Zr-y9bP6HjgonHvONDww5mK1Hf9jou4tl7wbXfuOseafYP2BGBGlD-MJQRp3K3FJ9u_BnJyAkKsJOZxSWh-5rRx4RCz3D_qwW7FdjFfsU4aPW",
    status: "Draft",
    createdAt: new Date("2025-10-23T09:00:00.000Z"),
  },
  {
    id: "design-demo-3",
    title: "Botanical Sketch Tee",
    prompt: "Botanical sketch lines with soft green accents",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDm6t8pw5AyDD_9i1Qif47Er_X9o-lYCOpwbWWolefF9wskSW7_-mlEbfv_REeuThccsfa3oYipg-pk1OCyJHt8GZW4LOPPHZf7UP0zCYY9rUJlAW7b2oKWA0uTui7_EuxMMMz1NPn8LKHhvXIa2fZeFIr9fFsIS0wT3Zvx90qsmkpu76NqVbdtUM0MHeDEwHrJ2IAdM-BNjTZjhiVQlluRC3Vfy6jrGoX_DsvKALjN-s-SMT7_muxJ8fP8FTTUFuUFJOTOp78nPu_I",
    status: "Live",
    createdAt: new Date("2025-10-21T14:00:00.000Z"),
  },
];

function mapStatus(status: DesignStatus): GalleryStatus {
  if (status === DesignStatus.PUBLISHED) {
    return "Live";
  }

  if (status === DesignStatus.ARCHIVED || status === DesignStatus.FAILED) {
    return "Archived";
  }

  return "Draft";
}

export async function getDesignsOverview(userId: string): Promise<DesignsOverview> {
  const prisma = getPrismaClient();
  const designs = await prisma.design.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: {
      id: true,
      title: true,
      prompt: true,
      status: true,
      thumbnailUrl: true,
      primaryImageUrl: true,
      createdAt: true,
    },
  });

  const mapped = designs
    .map((design) => {
      const imageUrl = design.thumbnailUrl ?? design.primaryImageUrl;
      if (!imageUrl) {
        return null;
      }

      return {
        id: design.id,
        title: design.title,
        prompt: design.prompt,
        imageUrl,
        status: mapStatus(design.status),
        createdAt: design.createdAt,
      };
    })
    .filter((design): design is NonNullable<typeof design> => design !== null);

  return {
    designs: mapped.length > 0 ? mapped : FALLBACK_DESIGNS,
    isDemoData: mapped.length === 0,
  };
}

