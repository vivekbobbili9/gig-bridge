import { create } from "zustand";

export type GigStatus = "open" | "assigned" | "in_progress" | "completed";
export type TaskType = "loading" | "unloading" | "pickup" | "delivery" | "mixed";
export type KycStatus = "none" | "pending" | "verified";

export interface Gig {
  id: string;
  companyName: string;
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
  updatedAt: number;
}

export interface Penalty {
  id: string;
  workerId: string;
  amount: number;
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

interface GigStore {
  gigs: Gig[];
  workerOnline: boolean;
  workerLocation: { lat: number; lng: number };
  workerId: string;
  workerName: string;
  accepted: AcceptedGig[];
  positions: Record<string, WorkerPosition[]>;
  penalties: Penalty[];
  kyc: KycData;
  addGig: (g: Omit<Gig, "id" | "status" | "createdAt" | "workersAccepted" | "lat" | "lng" | "distanceKm">) => void;
  acceptGig: (id: string, dates: string[]) => void;
  cancelGig: (id: string) => void;
  toggleOnline: () => void;
  tickPositions: () => void;
  setKyc: (data: Partial<KycData> & { status: KycStatus }) => void;
  payWorkers: (gigId: string) => number;
}

const CENTER = { lat: 12.9716, lng: 77.5946 };

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

const seed: Gig[] = [
  {
    id: "g-1001", companyName: "BlueCart Logistics",
    title: "Container unloading — 40ft FCL", taskType: "unloading",
    loadingHours: 0, unloadingHours: 4, workersNeeded: 8, workersAccepted: 3, payPerWorker: 950,
    location: "Whitefield ICD, Bengaluru", lat: 12.9698, lng: 77.7500, distanceKm: 2.4,
    startDate: iso(today), endDate: iso(addDays(today, 6)),
    dailyStartTime: "4:00 PM", dailyEndTime: "8:00 PM",
    notes: "Cartons up to 25kg. Safety shoes provided.",
    status: "open", createdAt: Date.now() - 1000 * 60 * 22,
  },
  {
    id: "g-1002", companyName: "FreshKart Hub",
    title: "Cold-storage loading — vegetable crates", taskType: "loading",
    loadingHours: 3, unloadingHours: 0, workersNeeded: 6, workersAccepted: 1, payPerWorker: 720,
    location: "Yeshwanthpur Mandi", lat: 13.0280, lng: 77.5540, distanceKm: 5.1,
    startDate: iso(addDays(today, 1)), endDate: iso(addDays(today, 5)),
    dailyStartTime: "5:00 AM", dailyEndTime: "8:00 AM",
    notes: "Cold environment. Jackets provided.",
    status: "open", createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: "g-1003", companyName: "Urban Movers Co.",
    title: "House shifting — 3BHK pickup & delivery", taskType: "mixed",
    loadingHours: 2, unloadingHours: 2, workersNeeded: 4, workersAccepted: 0, payPerWorker: 1100,
    location: "HSR Layout → Indiranagar", lat: 12.9120, lng: 77.6446, distanceKm: 3.8,
    startDate: iso(today), endDate: iso(today),
    dailyStartTime: "6:30 PM", dailyEndTime: "10:30 PM",
    status: "open", createdAt: Date.now() - 1000 * 60 * 8,
  },
  {
    id: "g-1004", companyName: "QuickShip Warehouse",
    title: "Bulk pickup — e-commerce returns", taskType: "pickup",
    loadingHours: 1.5, unloadingHours: 0.5, workersNeeded: 12, workersAccepted: 7, payPerWorker: 600,
    location: "Bommasandra Industrial Area", lat: 12.8120, lng: 77.6980, distanceKm: 8.6,
    startDate: iso(today), endDate: iso(addDays(today, 3)),
    dailyStartTime: "9:00 PM", dailyEndTime: "11:00 PM",
    status: "open", createdAt: Date.now() - 1000 * 60 * 90,
  },
];

// Seed a few mock workers around Bengaluru for company live tracking
const seedPositions: Record<string, WorkerPosition[]> = {
  "g-1001": [
    { workerId: "w-r1", workerName: "Ramesh K.", lat: 12.9750, lng: 77.7100, etaMin: 14, updatedAt: Date.now() },
    { workerId: "w-s2", workerName: "Suresh M.", lat: 12.9620, lng: 77.7250, etaMin: 9, updatedAt: Date.now() },
    { workerId: "w-a3", workerName: "Arun P.", lat: 12.9810, lng: 77.6980, etaMin: 22, updatedAt: Date.now() },
  ],
  "g-1004": [
    { workerId: "w-v1", workerName: "Vikram T.", lat: 12.8500, lng: 77.6700, etaMin: 11, updatedAt: Date.now() },
  ],
};

export const useGigStore = create<GigStore>((set, get) => ({
  gigs: seed,
  workerOnline: true,
  workerLocation: CENTER,
  workerId: "w-me",
  workerName: "Ramesh",
  accepted: [],
  positions: seedPositions,
  penalties: [],
  kyc: { status: "none" },
  addGig: (g) =>
    set((s) => {
      const newGig: Gig = {
        ...g,
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
  acceptGig: (id, dates) =>
    set((s) => {
      const exists = s.accepted.find((a) => a.gigId === id);
      const accepted = exists
        ? s.accepted.map((a) => (a.gigId === id ? { ...a, dates } : a))
        : [...s.accepted, { gigId: id, dates }];

      // Apply pending penalty: deduct from this gig's pay & credit owed company
      const pending = s.penalties.find((p) => !p.applied && p.workerId === s.workerId);
      let penalties = s.penalties;
      let gigs = s.gigs;
      if (pending && !exists) {
        penalties = s.penalties.map((p) => p.id === pending.id ? { ...p, applied: true } : p);
        gigs = s.gigs.map((g) => g.id === pending.owedToGigId
          ? { ...g, reclaimedFromPenalty: (g.reclaimedFromPenalty ?? 0) + pending.amount }
          : g);
      }

      // Seed worker position for live tracking
      const myGig = s.gigs.find((g) => g.id === id);
      const positions = { ...s.positions };
      if (myGig && !exists) {
        const list = positions[id] ?? [];
        if (!list.find((p) => p.workerId === s.workerId)) {
          // Start ~3-6km away from gig
          const startLat = myGig.lat + (Math.random() - 0.5) * 0.05;
          const startLng = myGig.lng + (Math.random() - 0.5) * 0.05;
          positions[id] = [...list, {
            workerId: s.workerId, workerName: s.workerName,
            lat: startLat, lng: startLng,
            etaMin: 12 + Math.floor(Math.random() * 8),
            updatedAt: Date.now(),
          }];
        }
      }

      return {
        accepted, penalties, gigs: gigs.map((g) =>
          g.id === id && !exists ? { ...g, workersAccepted: Math.min(g.workersNeeded, g.workersAccepted + 1) } : g
        ), positions,
      };
    }),
  cancelGig: (id) =>
    set((s) => {
      const wasAccepted = s.accepted.find((a) => a.gigId === id);
      if (!wasAccepted) return s;
      const gig = s.gigs.find((g) => g.id === id);
      const remainingDays = wasAccepted.dates.length;
      const penaltyAmt = gig ? Math.round(gig.payPerWorker * remainingDays * 0.1) : 0;

      const penalties = gig && penaltyAmt > 0
        ? [...s.penalties, {
            id: `p-${Date.now()}`, workerId: s.workerId, amount: penaltyAmt,
            owedToGigId: id, owedToCompany: gig.companyName,
            createdAt: Date.now(), applied: false,
          }]
        : s.penalties;

      const positions = { ...s.positions };
      if (positions[id]) positions[id] = positions[id].filter((p) => p.workerId !== s.workerId);

      return {
        accepted: s.accepted.filter((a) => a.gigId !== id),
        gigs: s.gigs.map((g) => g.id === id ? { ...g, workersAccepted: Math.max(0, g.workersAccepted - 1) } : g),
        penalties, positions,
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
          const dLat = gig.lat - p.lat;
          const dLng = gig.lng - p.lng;
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);
          if (dist < 0.0008) return { ...p, etaMin: 0, updatedAt: Date.now() };
          const step = 0.04; // 4% closer per tick
          return {
            ...p,
            lat: p.lat + dLat * step,
            lng: p.lng + dLng * step,
            etaMin: Math.max(0, Math.round(p.etaMin * (1 - step))),
            updatedAt: Date.now(),
          };
        });
      }
      return { positions };
    }),
  setKyc: (data) => set((s) => ({ kyc: { ...s.kyc, ...data } })),
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
