"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type UserAvatarProps = {
  fullName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
};

function getInitials(fullName?: string | null, email?: string | null): string {
  const normalizedName = fullName?.trim() ?? "";

  if (normalizedName.length > 0) {
    const parts = normalizedName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0]?.[0]?.toUpperCase() ?? "U";
    }

    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    return `${first}${second}`.toUpperCase();
  }

  const firstEmailChar = email?.trim()?.[0];
  if (firstEmailChar) {
    return firstEmailChar.toUpperCase();
  }

  return "U";
}

export function UserAvatar({
  fullName,
  email,
  avatarUrl,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const initials = useMemo(() => getInitials(fullName, email), [email, fullName]);
  const shouldRenderImage = Boolean(avatarUrl) && avatarUrl !== failedAvatarUrl;

  return (
    <div
      className={cn(
        "relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#895af6]/20",
        fallbackClassName,
        className,
      )}
    >
      {shouldRenderImage ? (
        <img
          src={avatarUrl ?? undefined}
          alt={fullName ? `${fullName} avatar` : "User avatar"}
          className="h-full w-full object-cover"
          onError={() => setFailedAvatarUrl(avatarUrl ?? null)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
