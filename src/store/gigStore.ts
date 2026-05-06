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
  /** Mock map coordinates as percentages (0-100) on the stylized map canvas */
  x: number;
  y: number;
  distanceKm: number;
  startTime: string;
  notes?: string;
  status: GigStatus;
  createdAt: number;
}

interface GigStore {
  gigs: Gig[];
  workerOnline: boolean;
  workerLocation: { x: number; y: number };
  acceptedGigIds: string[];
  addGig: (g: Omit<Gig, "id" | "status" | "createdAt" | "workersAccepted" | "x" | "y" | "distanceKm">) => void;
  acceptGig: (id: string) => void;
  toggleOnline: () => void;
}

const seed: Gig[] = [
  {
    id: "g-1001",
    companyName: "BlueCart Logistics",
    title: "Container unloading — 40ft FCL",
    taskType: "unloading",
    loadingHours: 0,
    unloadingHours: 4,
    workersNeeded: 8,
    workersAccepted: 3,
    payPerWorker: 950,
    location: "Whitefield ICD, Bengaluru",
    x: 32,
    y: 44,
    distanceKm: 2.4,
    startTime: "Today, 4:00 PM",
    notes: "Cartons up to 25kg. Safety shoes provided.",
    status: "open",
    createdAt: Date.now() - 1000 * 60 * 22,
  },
  {
    id: "g-1002",
    companyName: "FreshKart Hub",
    title: "Cold-storage loading — vegetable crates",
    taskType: "loading",
    loadingHours: 3,
    unloadingHours: 0,
    workersNeeded: 6,
    workersAccepted: 1,
    payPerWorker: 720,
    location: "Yeshwanthpur Mandi",
    x: 58,
    y: 30,
    distanceKm: 5.1,
    startTime: "Tomorrow, 5:00 AM",
    notes: "Cold environment. Jackets provided.",
    status: "open",
    createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: "g-1003",
    companyName: "Urban Movers Co.",
    title: "House shifting — 3BHK pickup & delivery",
    taskType: "mixed",
    loadingHours: 2,
    unloadingHours: 2,
    workersNeeded: 4,
    workersAccepted: 0,
    payPerWorker: 1100,
    location: "HSR Layout → Indiranagar",
    x: 70,
    y: 62,
    distanceKm: 3.8,
    startTime: "Today, 6:30 PM",
    status: "open",
    createdAt: Date.now() - 1000 * 60 * 8,
  },
  {
    id: "g-1004",
    companyName: "QuickShip Warehouse",
    title: "Bulk pickup — e-commerce returns",
    taskType: "pickup",
    loadingHours: 1.5,
    unloadingHours: 0.5,
    workersNeeded: 12,
    workersAccepted: 7,
    payPerWorker: 600,
    location: "Bommasandra Industrial Area",
    x: 22,
    y: 70,
    distanceKm: 8.6,
    startTime: "Today, 9:00 PM",
    status: "open",
    createdAt: Date.now() - 1000 * 60 * 90,
  },
];

export const useGigStore = create<GigStore>((set) => ({
  gigs: seed,
  workerOnline: true,
  workerLocation: { x: 50, y: 50 },
  acceptedGigIds: [],
  addGig: (g) =>
    set((s) => {
      const newGig: Gig = {
        ...g,
        id: `g-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "open",
        workersAccepted: 0,
        createdAt: Date.now(),
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
        distanceKm: +(1 + Math.random() * 9).toFixed(1),
      };
      return { gigs: [newGig, ...s.gigs] };
    }),
  acceptGig: (id) =>
    set((s) => ({
      acceptedGigIds: s.acceptedGigIds.includes(id) ? s.acceptedGigIds : [...s.acceptedGigIds, id],
      gigs: s.gigs.map((g) =>
        g.id === id ? { ...g, workersAccepted: Math.min(g.workersNeeded, g.workersAccepted + 1) } : g
      ),
    })),
  toggleOnline: () => set((s) => ({ workerOnline: !s.workerOnline })),
}));
