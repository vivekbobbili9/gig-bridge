import { create } from "zustand";

export type GigStatus = "open" | "assigned" | "in_progress" | "completed";
export type TaskType = "loading" | "unloading" | "pickup" | "delivery" | "mixed";

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
  /** Date range: ISO yyyy-mm-dd start & end (inclusive). Single day = same value. */
  startDate: string;
  endDate: string;
  /** Daily start time, e.g. "6:00 PM" */
  dailyStartTime: string;
  notes?: string;
  status: GigStatus;
  createdAt: number;
}

export interface AcceptedGig {
  gigId: string;
  /** Which dates the worker committed to (subset of gig date range) */
  dates: string[];
}

interface GigStore {
  gigs: Gig[];
  workerOnline: boolean;
  workerLocation: { lat: number; lng: number };
  accepted: AcceptedGig[];
  addGig: (g: Omit<Gig, "id" | "status" | "createdAt" | "workersAccepted" | "lat" | "lng" | "distanceKm">) => void;
  acceptGig: (id: string, dates: string[]) => void;
  toggleOnline: () => void;
}

const CENTER = { lat: 12.9716, lng: 77.5946 };

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

const seed: Gig[] = [
  {
    id: "g-1001",
    companyName: "BlueCart Logistics",
    title: "Container unloading — 40ft FCL",
    taskType: "unloading",
    loadingHours: 0, unloadingHours: 4,
    workersNeeded: 8, workersAccepted: 3,
    payPerWorker: 950,
    location: "Whitefield ICD, Bengaluru",
    lat: 12.9698, lng: 77.7500, distanceKm: 2.4,
    startDate: iso(today), endDate: iso(addDays(today, 6)),
    dailyStartTime: "4:00 PM",
    notes: "Cartons up to 25kg. Safety shoes provided.",
    status: "open", createdAt: Date.now() - 1000 * 60 * 22,
  },
  {
    id: "g-1002",
    companyName: "FreshKart Hub",
    title: "Cold-storage loading — vegetable crates",
    taskType: "loading",
    loadingHours: 3, unloadingHours: 0,
    workersNeeded: 6, workersAccepted: 1,
    payPerWorker: 720,
    location: "Yeshwanthpur Mandi",
    lat: 13.0280, lng: 77.5540, distanceKm: 5.1,
    startDate: iso(addDays(today, 1)), endDate: iso(addDays(today, 5)),
    dailyStartTime: "5:00 AM",
    notes: "Cold environment. Jackets provided.",
    status: "open", createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: "g-1003",
    companyName: "Urban Movers Co.",
    title: "House shifting — 3BHK pickup & delivery",
    taskType: "mixed",
    loadingHours: 2, unloadingHours: 2,
    workersNeeded: 4, workersAccepted: 0,
    payPerWorker: 1100,
    location: "HSR Layout → Indiranagar",
    lat: 12.9120, lng: 77.6446, distanceKm: 3.8,
    startDate: iso(today), endDate: iso(today),
    dailyStartTime: "6:30 PM",
    status: "open", createdAt: Date.now() - 1000 * 60 * 8,
  },
  {
    id: "g-1004",
    companyName: "QuickShip Warehouse",
    title: "Bulk pickup — e-commerce returns",
    taskType: "pickup",
    loadingHours: 1.5, unloadingHours: 0.5,
    workersNeeded: 12, workersAccepted: 7,
    payPerWorker: 600,
    location: "Bommasandra Industrial Area",
    lat: 12.8120, lng: 77.6980, distanceKm: 8.6,
    startDate: iso(today), endDate: iso(addDays(today, 3)),
    dailyStartTime: "9:00 PM",
    status: "open", createdAt: Date.now() - 1000 * 60 * 90,
  },
];

export const useGigStore = create<GigStore>((set) => ({
  gigs: seed,
  workerOnline: true,
  workerLocation: CENTER,
  accepted: [],
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
      return {
        accepted,
        gigs: s.gigs.map((g) =>
          g.id === id && !exists ? { ...g, workersAccepted: Math.min(g.workersNeeded, g.workersAccepted + 1) } : g
        ),
      };
    }),
  toggleOnline: () => set((s) => ({ workerOnline: !s.workerOnline })),
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
