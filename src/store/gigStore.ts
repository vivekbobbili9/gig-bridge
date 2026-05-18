import { create } from "zustand";

export type GigStatus = "open" | "assigned" | "in_progress" | "completed" | "cancelled";
export type TaskType = "loading" | "unloading" | "pickup" | "delivery" | "mixed";
export type KycStatus = "none" | "pending" | "verified";
export type NoticeType = "accepted" | "on_the_way" | "worker_cancelled" | "company_cancelled";

export interface Gig {
  id: string;
  companyName: string;
  companyPhone: string;
  companyLogo?: string;
  title: string;
  taskType: TaskType;
  loadingHours: number;
  unloadingHours: number;
  workersNeeded: number;
  workersAccepted: number;
  payPerWorker: number;
  location: string;
  lat: number;
  lng: number;
  distanceKm: number;
  startDate: string;
  endDate: string;
  dailyStartTime: string;
  dailyEndTime: string;
  notes?: string;
  status: GigStatus;
  createdAt: number;
  reclaimedFromPenalty?: number;
  bonusForNextWorker?: number;
  urgent?: boolean;
  urgentTip?: number;
  urgentAt?: number;
}

export interface AcceptedGig {
  gigId: string;
  dates: string[];
}

export interface WorkerPosition {
  workerId: string;
  workerName: string;
  lat: number;
  lng: number;
  etaMin: number;
  distanceKm: number;
  updatedAt: number;
}

export interface Penalty {
  id: string;
  workerId: string;
  amount: number;
  workerShare: number;
  companyShare: number;
  owedToGigId: string;
  owedToCompany: string;
  createdAt: number;
  applied: boolean;
}

export interface KycData {
  status: KycStatus;
  fullName?: string;
  aadhaar?: string;
  pan?: string;
  bankAccount?: string;
  ifsc?: string;
  upi?: string;
}

export interface AppNotice {
  id: string;
  type: NoticeType;
  gigId: string;
  gigTitle: string;
  message: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  gigId: string;
  sender: "worker" | "company";
  text: string;
  createdAt: number;
}

export interface PartyRating {
  id: string;
  gigId: string;
  by: "worker" | "company";
  workerId?: string;
  workerName?: string;
  score: number;
  complaint?: string;
  createdAt: number;
}

export interface CompanyProfile {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address?: string;
}

export interface FeedbackItem {
  id: string;
  submitter: "worker" | "company";
  workerId?: string;
  companyName?: string;
  type: "feedback" | "complaint";
  subject: string;
  message: string;
  gigId?: string;
  relatedCompanyName?: string;
  createdAt: number;
  status: "open" | "resolved";
}

interface GigStore {
  gigs: Gig[];
  company: CompanyProfile | null;
  workerOnline: boolean;
  workerLocation: { lat: number; lng: number };
  workerId: string;
  workerName: string;
  workerPhone: string;
  accepted: AcceptedGig[];
  positions: Record<string, WorkerPosition[]>;
  penalties: Penalty[];
  feedback: FeedbackItem[];
  kyc: KycData;
  companyNotices: AppNotice[];
  workerNotices: AppNotice[];
  chatsByGig: Record<string, ChatMessage[]>;
  ratings: PartyRating[];
  addGig: (g: Omit<Gig, "id" | "status" | "createdAt" | "workersAccepted" | "lat" | "lng" | "distanceKm" | "companyPhone">) => void;
  acceptGig: (id: string, dates: string[]) => boolean;
  cancelGig: (id: string) => void;
  cancelGigByCompany: (id: string) => void;
  completeGig: (id: string) => void;
  sendWorkerMessage: (gigId: string, text: string) => void;
  sendCompanyMessage: (gigId: string, text: string) => void;
  submitWorkerRating: (gigId: string, score: number, complaint?: string) => void;
  submitCompanyRating: (gigId: string, score: number, complaint?: string) => void;
  submitCompanyWorkerRating: (gigId: string, workerId: string, workerName: string, score: number, complaint?: string) => void;
  markGigUrgent: (gigId: string, tip: number) => void;
  toggleOnline: () => void;
  tickPositions: () => void;
  setKyc: (data: Partial<KycData> & { status: KycStatus }) => void;
  setCompany: (profile: CompanyProfile) => void;
  setWorkerPhone: (phone: string) => void;
  submitFeedback: (item: Omit<FeedbackItem, "id" | "createdAt" | "status">) => void;
  payWorkers: (gigId: string) => number;
}

const CENTER = { lat: 12.9716, lng: 77.5946 };
const TRAVEL_SPEED_KMPH = 24;
const POSITION_TICK_SECONDS = 3;
const DEFAULT_COMPANY_PHONE = "+91 80 4567 8900";
export const STALE_GIG_MS = 2 * 60 * 60 * 1000;

export const isGigStale = (gig: Gig) =>
  gig.status === "open"
  && gig.workersAccepted < gig.workersNeeded
  && Date.now() - gig.createdAt >= STALE_GIG_MS;

export const canMarkGigUrgent = (gig: Gig, companyNotices: AppNotice[]) => {
  if (gig.status !== "open" && gig.status !== "assigned") return false;
  if (gig.workersAccepted >= gig.workersNeeded) return false;
  if (isGigStale(gig)) return true;
  return companyNotices.some((n) => n.gigId === gig.id && n.type === "worker_cancelled");
};

export const workerPayPerDay = (gig: Gig) => gig.payPerWorker + (gig.urgentTip ?? 0) + (gig.bonusForNextWorker ?? 0);

export const PENALTY_TOTAL_PCT = 0.05;
export const PENALTY_WORKER_PCT = 0.03;
export const PENALTY_COMPANY_PCT = 0.02;

export const calcPenalty = (payPerWorker: number, remainingDays: number) => {
  const base = payPerWorker * remainingDays;
  return {
    total: Math.round(base * PENALTY_TOTAL_PCT),
    workerShare: Math.round(base * PENALTY_WORKER_PCT),
    companyShare: Math.round(base * PENALTY_COMPANY_PCT),
  };
};

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

const seed: Gig[] = [
  {
    id: "g-1001", companyName: "BlueCart Logistics", companyPhone: "+91 80 4567 8901",
    title: "Container unloading — 40ft FCL", taskType: "unloading",
    loadingHours: 0, unloadingHours: 4, workersNeeded: 8, workersAccepted: 3, payPerWorker: 950,
    location: "Whitefield ICD, Bengaluru", lat: 12.9698, lng: 77.7500, distanceKm: 2.4,
    startDate: iso(today), endDate: iso(addDays(today, 6)),
    dailyStartTime: "4:00 PM", dailyEndTime: "8:00 PM",
    notes: "Cartons up to 25kg. Safety shoes provided.",
    status: "open", createdAt: Date.now() - 1000 * 60 * 22,
  },
  {
    id: "g-1002", companyName: "FreshKart Hub", companyPhone: "+91 80 4567 8902",
    title: "Cold-storage loading — vegetable crates", taskType: "loading",
    loadingHours: 3, unloadingHours: 0, workersNeeded: 6, workersAccepted: 1, payPerWorker: 720,
    location: "Yeshwanthpur Mandi", lat: 13.0280, lng: 77.5540, distanceKm: 5.1,
    startDate: iso(addDays(today, 1)), endDate: iso(addDays(today, 5)),
    dailyStartTime: "5:00 AM", dailyEndTime: "8:00 AM",
    notes: "Cold environment. Jackets provided.",
    status: "open", createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: "g-1003", companyName: "Urban Movers Co.", companyPhone: "+91 80 4567 8903",
    title: "House shifting — 3BHK pickup & delivery", taskType: "mixed",
    loadingHours: 2, unloadingHours: 2, workersNeeded: 4, workersAccepted: 0, payPerWorker: 1100,
    location: "HSR Layout → Indiranagar", lat: 12.9120, lng: 77.6446, distanceKm: 3.8,
    startDate: iso(today), endDate: iso(today),
    dailyStartTime: "6:30 PM", dailyEndTime: "10:30 PM",
    status: "open", createdAt: Date.now() - 1000 * 60 * 8,
  },
  {
    id: "g-1004", companyName: "QuickShip Warehouse", companyPhone: "+91 80 4567 8904",
    title: "Bulk pickup — e-commerce returns", taskType: "pickup",
    loadingHours: 1.5, unloadingHours: 0.5, workersNeeded: 12, workersAccepted: 7, payPerWorker: 600,
    location: "Bommasandra Industrial Area", lat: 12.8120, lng: 77.6980, distanceKm: 8.6,
    startDate: iso(today), endDate: iso(addDays(today, 3)),
    dailyStartTime: "9:00 PM", dailyEndTime: "11:00 PM",
    status: "open", createdAt: Date.now() - STALE_GIG_MS - 1000 * 60 * 30,
  },
];

const seedPositions: Record<string, WorkerPosition[]> = {
  "g-1001": [
    { workerId: "w-r1", workerName: "Ramesh K.", lat: 12.9750, lng: 77.7100, etaMin: 14, distanceKm: 5.4, updatedAt: Date.now() },
    { workerId: "w-s2", workerName: "Suresh M.", lat: 12.9620, lng: 77.7250, etaMin: 9, distanceKm: 3.9, updatedAt: Date.now() },
    { workerId: "w-a3", workerName: "Arun P.", lat: 12.9810, lng: 77.6980, etaMin: 22, distanceKm: 6.6, updatedAt: Date.now() },
  ],
  "g-1004": [
    { workerId: "w-v1", workerName: "Vikram T.", lat: 12.8500, lng: 77.6700, etaMin: 11, distanceKm: 2.1, updatedAt: Date.now() },
  ],
};

export const useGigStore = create<GigStore>((set, get) => ({
  gigs: seed,
  company: null,
  workerOnline: true,
  workerLocation: CENTER,
  workerId: "w-me",
  workerName: "Ramesh",
  workerPhone: "",
  accepted: [],
  positions: seedPositions,
  penalties: [],
  feedback: [],
  kyc: { status: "none" },
  companyNotices: [],
  workerNotices: [],
  chatsByGig: {},
  ratings: [],
  addGig: (g) =>
    set((s) => {
      const phone = s.company?.phone ?? DEFAULT_COMPANY_PHONE;
      const companyName = s.company?.name ?? g.companyName;
      const newGig: Gig = {
        ...g,
        companyName,
        companyPhone: phone,
        id: `g-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "open",
        workersAccepted: 0,
        createdAt: Date.now(),
        lat: CENTER.lat + (Math.random() - 0.5) * 0.12,
        lng: CENTER.lng + (Math.random() - 0.5) * 0.12,
        distanceKm: +(1 + Math.random() * 9).toFixed(1),
      };
      return { gigs: [newGig, ...s.gigs] };
    }),
  acceptGig: (id, dates) => {
    const s = get();
    const hasOther = s.accepted.some((a) => a.gigId !== id);
    if (hasOther) return false;

    set((state) => {
      const exists = state.accepted.find((a) => a.gigId === id);
      const accepted = exists
        ? state.accepted.map((a) => (a.gigId === id ? { ...a, dates } : a))
        : [...state.accepted, { gigId: id, dates }];

      const pending = state.penalties.find((p) => !p.applied && p.workerId === state.workerId);
      let penalties = state.penalties;
      let gigs = state.gigs;
      if (pending && !exists) {
        penalties = state.penalties.map((p) => p.id === pending.id ? { ...p, applied: true } : p);
        gigs = state.gigs.map((g) => {
          if (g.id === pending.owedToGigId) {
            return {
              ...g,
              reclaimedFromPenalty: (g.reclaimedFromPenalty ?? 0) + pending.companyShare,
              bonusForNextWorker: (g.bonusForNextWorker ?? 0) + pending.workerShare,
            };
          }
          if (g.id === id) {
            return { ...g, bonusForNextWorker: (g.bonusForNextWorker ?? 0) + pending.workerShare };
          }
          return g;
        });
      }

      const myGig = state.gigs.find((g) => g.id === id);
      const positions = { ...state.positions };
      const companyNotices = [...state.companyNotices];
      if (myGig && !exists) {
        const list = positions[id] ?? [];
        if (!list.find((p) => p.workerId === state.workerId)) {
          const startLat = myGig.lat + (Math.random() - 0.5) * 0.05;
          const startLng = myGig.lng + (Math.random() - 0.5) * 0.05;
          const distanceKm = haversineKm({ lat: startLat, lng: startLng }, { lat: myGig.lat, lng: myGig.lng });
          positions[id] = [...list, {
            workerId: state.workerId, workerName: state.workerName,
            lat: startLat, lng: startLng,
            distanceKm: +distanceKm.toFixed(1),
            etaMin: etaMinutesFromDistance(distanceKm),
            updatedAt: Date.now(),
          }];
          companyNotices.unshift(makeNotice("on_the_way", myGig, `${state.workerName} is on the way for ${myGig.title}.`));
        }
        companyNotices.unshift(makeNotice("accepted", myGig, `${state.workerName} accepted ${myGig.title} (${dates.length} day${dates.length !== 1 ? "s" : ""}).`));
      }

      return {
        accepted, penalties, gigs: gigs.map((g) =>
          g.id === id && !exists ? { ...g, workersAccepted: Math.min(g.workersNeeded, g.workersAccepted + 1), status: "assigned" as GigStatus } : g
        ), positions, companyNotices,
      };
    });
    return true;
  },
  cancelGig: (id) =>
    set((s) => {
      const wasAccepted = s.accepted.find((a) => a.gigId === id);
      if (!wasAccepted) return s;
      const gig = s.gigs.find((g) => g.id === id);
      const remainingDays = wasAccepted.dates.length;
      const { total, workerShare, companyShare } = gig
        ? calcPenalty(gig.payPerWorker, remainingDays)
        : { total: 0, workerShare: 0, companyShare: 0 };

      const penalties = gig && total > 0
        ? [...s.penalties, {
            id: `p-${Date.now()}`, workerId: s.workerId, amount: total,
            workerShare, companyShare,
            owedToGigId: id, owedToCompany: gig.companyName,
            createdAt: Date.now(), applied: false,
          }]
        : s.penalties;

      const positions = { ...s.positions };
      if (positions[id]) positions[id] = positions[id].filter((p) => p.workerId !== s.workerId);
      const companyNotices = gig
        ? [makeNotice("worker_cancelled", gig, `${s.workerName} cancelled ${gig.title}.`), ...s.companyNotices]
        : s.companyNotices;

      return {
        accepted: s.accepted.filter((a) => a.gigId !== id),
        gigs: s.gigs.map((g) => g.id === id
          ? { ...g, workersAccepted: Math.max(0, g.workersAccepted - 1), status: "open" as GigStatus, bonusForNextWorker: (g.bonusForNextWorker ?? 0) + workerShare }
          : g),
        penalties, positions, companyNotices,
      };
    }),
  cancelGigByCompany: (id) =>
    set((s) => {
      const gig = s.gigs.find((g) => g.id === id);
      if (!gig || gig.status === "cancelled") return s;
      const hadWorkerAccepted = s.accepted.some((a) => a.gigId === id);
      const companyNotices = [
        makeNotice("company_cancelled", gig, `You cancelled ${gig.title}.`),
        ...s.companyNotices,
      ];
      const workerNotices = hadWorkerAccepted
        ? [makeNotice("company_cancelled", gig, `${gig.companyName} cancelled ${gig.title}.`), ...s.workerNotices]
        : s.workerNotices;
      return {
        gigs: s.gigs.map((g) => g.id === id ? { ...g, status: "cancelled", workersAccepted: 0 } : g),
        accepted: s.accepted.filter((a) => a.gigId !== id),
        positions: { ...s.positions, [id]: [] },
        companyNotices,
        workerNotices,
      };
    }),
  completeGig: (id) =>
    set((s) => {
      const gig = s.gigs.find((g) => g.id === id);
      if (!gig || gig.status === "completed" || gig.status === "cancelled") return s;
      const positions = { ...s.positions };
      if (positions[id]) positions[id] = positions[id].filter((p) => p.workerId !== s.workerId);
      const workerNotices = s.accepted.some((a) => a.gigId === id)
        ? [makeNotice("company_cancelled", gig, `${gig.title} is marked complete. Please rate the business.`), ...s.workerNotices]
        : s.workerNotices;
      const companyNotices = [makeNotice("accepted", gig, `${gig.title} marked complete. Please rate workers.`), ...s.companyNotices];
      return {
        accepted: s.accepted.filter((a) => a.gigId !== id),
        gigs: s.gigs.map((g) => g.id === id ? { ...g, status: "completed" } : g),
        positions: { ...positions, [id]: positions[id]?.filter((p) => p.workerId !== s.workerId) ?? [] },
        workerNotices,
        companyNotices,
      };
    }),
  sendWorkerMessage: (gigId, text) =>
    set((s) => {
      const msg = text.trim();
      if (!msg) return s;
      const gig = s.gigs.find((g) => g.id === gigId);
      const chats = s.chatsByGig[gigId] ?? [];
      const chatsByGig = { ...s.chatsByGig, [gigId]: [...chats, makeChat(gigId, "worker", msg)] };
      const companyNotices = gig
        ? [makeNotice("accepted", gig, `New message from worker on ${gig.title}.`), ...s.companyNotices]
        : s.companyNotices;
      return { chatsByGig, companyNotices };
    }),
  sendCompanyMessage: (gigId, text) =>
    set((s) => {
      const msg = text.trim();
      if (!msg) return s;
      const gig = s.gigs.find((g) => g.id === gigId);
      const chats = s.chatsByGig[gigId] ?? [];
      const chatsByGig = { ...s.chatsByGig, [gigId]: [...chats, makeChat(gigId, "company", msg)] };
      const workerNotices = gig
        ? [makeNotice("accepted", gig, `New message from ${gig.companyName}.`), ...s.workerNotices]
        : s.workerNotices;
      return { chatsByGig, workerNotices };
    }),
  submitWorkerRating: (gigId, score, complaint) =>
    set((s) => {
      if (score < 1 || score > 5) return s;
      if (s.ratings.some((r) => r.gigId === gigId && r.by === "worker")) return s;
      return { ratings: [...s.ratings, makeRating(gigId, "worker", score, complaint)] };
    }),
  submitCompanyRating: (gigId, score, complaint) =>
    set((s) => {
      if (score < 1 || score > 5) return s;
      if (s.ratings.some((r) => r.gigId === gigId && r.by === "company" && !r.workerId)) return s;
      return { ratings: [...s.ratings, makeRating(gigId, "company", score, complaint)] };
    }),
  submitCompanyWorkerRating: (gigId, workerId, workerName, score, complaint) =>
    set((s) => {
      if (score < 1 || score > 5) return s;
      if (s.ratings.some((r) => r.gigId === gigId && r.by === "company" && r.workerId === workerId)) return s;
      return {
        ratings: [...s.ratings, {
          ...makeRating(gigId, "company", score, complaint),
          workerId,
          workerName,
        }],
      };
    }),
  markGigUrgent: (gigId, tip) =>
    set((s) => {
      const gig = s.gigs.find((g) => g.id === gigId);
      if (!gig || !canMarkGigUrgent(gig, s.companyNotices)) return s;
      const workerNotices = [
        makeNotice("accepted", gig, `${gig.companyName} marked ${gig.title} URGENT — +₹${tip} tip per worker.`),
        ...s.workerNotices,
      ];
      return {
        gigs: s.gigs.map((g) => g.id === gigId
          ? { ...g, urgent: true, urgentTip: Math.max(0, tip), urgentAt: Date.now() }
          : g),
        workerNotices,
      };
    }),
  toggleOnline: () => set((s) => ({ workerOnline: !s.workerOnline })),
  tickPositions: () =>
    set((s) => {
      const positions: Record<string, WorkerPosition[]> = {};
      for (const gigId in s.positions) {
        const gig = s.gigs.find((g) => g.id === gigId);
        if (!gig) { positions[gigId] = s.positions[gigId]; continue; }
        positions[gigId] = s.positions[gigId].map((p) => {
          const remainingKm = haversineKm({ lat: p.lat, lng: p.lng }, { lat: gig.lat, lng: gig.lng });
          if (remainingKm < 0.05) {
            return { ...p, lat: gig.lat, lng: gig.lng, distanceKm: 0, etaMin: 0, updatedAt: Date.now() };
          }

          const stepKm = (TRAVEL_SPEED_KMPH * POSITION_TICK_SECONDS) / 3600;
          const ratio = Math.min(1, stepKm / remainingKm);
          return {
            ...p,
            lat: p.lat + (gig.lat - p.lat) * ratio,
            lng: p.lng + (gig.lng - p.lng) * ratio,
            distanceKm: +Math.max(0, remainingKm - stepKm).toFixed(1),
            etaMin: etaMinutesFromDistance(Math.max(0, remainingKm - stepKm)),
            updatedAt: Date.now(),
          };
        });
      }
      return { positions };
    }),
  setKyc: (data) => set((s) => ({ kyc: { ...s.kyc, ...data } })),
  setCompany: (profile) => set({ company: profile }),
  setWorkerPhone: (phone) => set({ workerPhone: phone }),
  submitFeedback: (item) =>
    set((s) => ({
      feedback: [{
        ...item,
        id: `fb-${Date.now()}`,
        workerId: item.submitter === "worker" ? s.workerId : item.workerId,
        companyName: item.submitter === "company" ? (s.company?.name ?? item.companyName) : item.companyName,
        createdAt: Date.now(),
        status: "open",
      }, ...s.feedback],
    })),
  payWorkers: (gigId) => {
    const s = get();
    const positions = s.positions[gigId] ?? [];
    return positions.length;
  },
}));

export const datesBetween = (startISO: string, endISO: string): string[] => {
  const out: string[] = [];
  const s = new Date(startISO + "T00:00:00");
  const e = new Date(endISO + "T00:00:00");
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
};

export const phoneTel = (phone: string) => phone.replace(/[^\d+]/g, "");

const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2
    + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

const etaMinutesFromDistance = (distanceKm: number) =>
  distanceKm <= 0 ? 0 : Math.max(1, Math.round((distanceKm / TRAVEL_SPEED_KMPH) * 60));

const makeNotice = (type: NoticeType, gig: Gig, message: string): AppNotice => ({
  id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  gigId: gig.id,
  gigTitle: gig.title,
  message,
  createdAt: Date.now(),
});

const makeChat = (gigId: string, sender: "worker" | "company", text: string): ChatMessage => ({
  id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  gigId,
  sender,
  text,
  createdAt: Date.now(),
});

const makeRating = (gigId: string, by: "worker" | "company", score: number, complaint?: string): PartyRating => ({
  id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  gigId,
  by,
  score,
  complaint: complaint?.trim() || undefined,
  createdAt: Date.now(),
});
