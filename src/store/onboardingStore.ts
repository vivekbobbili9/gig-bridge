import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Lang } from "@/i18n/worker";

export type OnboardingStep =
  | "splash"
  | "auth-choice"
  | "language"
  | "phone"
  | "otp"
  | "region"
  | "profile"
  | "dashboard";

interface OnboardingState {
  step: OnboardingStep;
  language: Lang;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  profilePic: string | null;
  region: string;
  kyc: {
    aadhar: boolean;
    pan: boolean;
    drivingLicense: boolean;
    bankAccount: boolean;
    upiId: boolean;
  };
  setStep: (step: OnboardingStep) => void;
  setLanguage: (lang: Lang) => void;
  setPhone: (phone: string) => void;
  setProfile: (info: Partial<{ firstName: string; lastName: string; address: string; profilePic: string }>) => void;
  setRegion: (region: string) => void;
  setKycStatus: (key: keyof OnboardingState["kyc"], status: boolean) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: "splash",
      language: "en",
      phone: "",
      firstName: "",
      lastName: "",
      address: "",
      profilePic: null,
      region: "",
      kyc: {
        aadhar: false,
        pan: false,
        drivingLicense: false,
        bankAccount: false,
        upiId: false,
      },
      setStep: (step) => set({ step }),
      setLanguage: (language) => set({ language }),
      setPhone: (phone) => set({ phone }),
      setProfile: (info) => set((state) => ({ ...state, ...info })),
      setRegion: (region) => set({ region }),
      setKycStatus: (key, status) =>
        set((state) => ({
          kyc: { ...state.kyc, [key]: status },
        })),
      reset: () => set({
        step: "splash",
        language: "en",
        phone: "",
        firstName: "",
        lastName: "",
        address: "",
        profilePic: null,
        region: "",
        kyc: {
          aadhar: false,
          pan: false,
          drivingLicense: false,
          bankAccount: false,
          upiId: false,
        },
      }),
    }),
    {
      name: "onboarding-storage",
    }
  )
);
