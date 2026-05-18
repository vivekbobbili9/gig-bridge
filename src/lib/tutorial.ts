export type TutorialId = "worker" | "company" | "worker_login" | "company_login";

const KEY = "gf_tutorial_done";

export const isTutorialDone = (id: TutorialId) => {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(`${KEY}_${id}`) === "1";
};

export const markTutorialDone = (id: TutorialId) => {
  if (typeof window !== "undefined") window.localStorage.setItem(`${KEY}_${id}`, "1");
};
