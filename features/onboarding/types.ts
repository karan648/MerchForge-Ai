export type OnboardingUseCase = "PERSONAL" | "BUSINESS" | "AGENCY";

export type OnboardingExperience = "BEGINNER" | "ADVANCED";

export type OnboardingSession = {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  useCase: OnboardingUseCase | null;
  experienceLevel: OnboardingExperience | null;
  onboardingCompleted: boolean;
  brandKit: {
    id: string;
    name: string;
    logoUrl: string | null;
    primaryColor: string | null;
  } | null;
};

export type OnboardingActionResult =
  | { ok: true }
  | { ok: false; error: string };
