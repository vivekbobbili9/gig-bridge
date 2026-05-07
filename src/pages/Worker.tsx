import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGigStore, datesBetween, type Gig } from "@/store/gigStore";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import SatelliteMap from "@/components/SatelliteMap";
import { ArrowLeft, Bell, Calendar, CheckCircle2, Clock, IndianRupee, MapPin, Navigation, Package, Truck, User, Wallet } from "lucide-react";
import { toast } from "sonner";

type SortKey = "pay" | "hours" | "distance";

const Worker = () => {
  const { gigs, workerOnline, workerLocation, accepted, toggleOnline, acceptGig } = useGigStore();
  const [selected, setSelected] = useState<Gig | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("pay");

  const acceptedGigIds = accepted.map((a) => a.gigId);

  const visibleGigs = useMemo(() => {
    if (!workerOnline) return [];
    const list = gigs.filter((g) => g.status === "open");
    const sorted = [...list].sort((a, b) => {
      if (sortKey === "pay") return b.payPerWorker - a.payPerWorker;
      if (sortKey === "distance") return a.distanceKm - b.distanceKm;
      return (a.loadingHours + a.unloadingHours) - (b.loadingHours + b.unloadingHours);
    });
    return sorted;
  }, [gigs, workerOnline, sortKey]);

  const earnings = useMemo(() => {
    return accepted.reduce((sum, a) => {
      const g = gigs.find((x) => x.id === a.gigId);
      return sum + (g?.payPerWorker ?? 0) * a.dates.length;
    }, 0);
  }, [accepted, gigs]);

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon"><Link to="/"><ArrowLeft className="h-5 w-5" /></Link></Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-sm font-bold leading-tight">Hi, Ramesh</div>
              <div className="text-xs text-muted-foreground">⭐ 4.8 · 142 gigs</div>
            </div>
          </div>
          <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
        </div>
      </header>

      <section className="px-4 pt-5">
        <div className={`flex items-center justify-between rounded-2xl border p-4 transition-base ${workerOnline ? "border-primary/40 bg-primary/10 shadow-glow" : "border-border bg-muted/40"}`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`h-3 w-3 rounded-full ${workerOnline ? "bg-primary" : "bg-muted-foreground/40"}`} />
              {workerOnline && <div className="absolute inset-0 animate-pulse-ring rounded-full" />}
            </div>
            <div>
              <div className="font-display text-base font-bold">{workerOnline ? "You're online" : "You're offline"}</div>
              <div className="text-xs text-muted-foreground">{workerOnline ? `${visibleGigs.length} gigs near you` : "Turn on to see gigs"}</div>
            </div>
          </div>
          <Switch checked={workerOnline} onCheckedChange={toggleOnline} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Mini icon={Wallet} label="Earnings" value={`₹${earnings}`} tone="primary" />
          <Mini icon={CheckCircle2} label="Accepted" value={`${accepted.length}`} tone="accent" />
          <Mini icon={Navigation} label="Distance" value="12 km" tone="pink" />
        </div>
      </section>

      <section className="px-4 mt-5">
        <div className="relative h-72 overflow-hidden rounded-2xl border border-border shadow-elevated">
          <SatelliteMap
            gigs={visibleGigs}
            workerLocation={workerLocation}
            acceptedGigIds={acceptedGigIds}
            onSelect={(g) => setSelected(g)}
            zoom={11}
          />
          {!workerOnline && (
            <div className="absolute inset-0 z-[400] flex items-center justify-center bg-background/85 backdrop-blur-sm">
              <div className="text-center">
                <div className="font-display text-base font-bold">You're offline</div>
                <div className="text-xs text-muted-foreground">Turn on to view gigs near you</div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="px-4 mt-6 pb-24">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Available near you</h2>
          <span className="text-xs text-muted-foreground">{visibleGigs.length} gigs</span>
        </div>

        {/* Sort tabs */}
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
          {([
            { k: "pay", label: "Highest pay", icon: IndianRupee },
            { k: "distance", label: "Nearest", icon: Navigation },
            { k: "hours", label: "Shortest", icon: Clock },
          ] as { k: SortKey; label: string; icon: any }[]).map((t) => (
            <button
              key={t.k}
              onClick={() => setSortKey(t.k)}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-base ${sortKey === t.k ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>

        <div className="mt-3 space-y-3">
          {visibleGigs.map((g) => {
            const isAccepted = acceptedGigIds.includes(g.id);
            const totalDays = datesBetween(g.startDate, g.endDate).length;
            const totalHours = g.loadingHours + g.unloadingHours;
            return (
              <button
                key={g.id}
                onClick={() => setSelected(g)}
                className="group relative block w-full overflow-hidden rounded-2xl border border-border bg-card p-4 text-left transition-base hover:border-primary hover:shadow-elevated"
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-primary opacity-10 blur-2xl" />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-accent">{g.companyName}</div>
                    <div className="mt-0.5 truncate font-display text-base font-bold">{g.title}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {g.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-extrabold text-primary">₹{g.payPerWorker}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">per day</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Pill icon={Navigation} tone="pink">{g.distanceKm} km</Pill>
                  <Pill icon={Clock} tone="accent">{totalHours}h/day</Pill>
                  <Pill icon={Calendar} tone="primary">{totalDays} day{totalDays > 1 ? "s" : ""}</Pill>
                  {isAccepted && <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 font-semibold text-success"><CheckCircle2 className="h-3 w-3" /> Accepted</span>}
                </div>
              </button>
            );
          })}
          {workerOnline && visibleGigs.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No gigs nearby right now. Hold tight.</div>
          )}
        </div>
      </section>

      {selected && (
        <GigSheet
          gig={selected}
          existingDates={accepted.find((a) => a.gigId === selected.id)?.dates ?? []}
          onClose={() => setSelected(null)}
          onAccept={(dates) => { acceptGig(selected.id, dates); toast.success(`Accepted ${dates.length} day${dates.length > 1 ? "s" : ""}!`); setSelected(null); }}
        />
      )}
    </div>
  );
};

const Mini = ({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "primary" | "accent" | "pink" }) => {
  const map = { primary: "text-primary", accent: "text-accent", pink: "text-fuchsia-400" } as const;
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${map[tone]}`}>
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-0.5 font-display text-lg font-extrabold">{value}</div>
    </div>
  );
};

const Pill = ({ icon: Icon, children, tone = "muted" }: { icon: any; children: React.ReactNode; tone?: "muted" | "primary" | "accent" | "pink" }) => {
  const tones = {
    muted: "bg-muted text-foreground",
    primary: "bg-primary/15 text-primary",
    accent: "bg-accent/15 text-accent",
    pink: "bg-fuchsia-500/15 text-fuchsia-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${tones[tone]}`}>
      <Icon className="h-3 w-3" /> {children}
    </span>
  );
};

const GigSheet = ({ gig, existingDates, onClose, onAccept }: { gig: Gig; existingDates: string[]; onClose: () => void; onAccept: (dates: string[]) => void }) => {
  const allDates = datesBetween(gig.startDate, gig.endDate);
  const [picked, setPicked] = useState<string[]>(existingDates.length ? existingDates : allDates);

  const toggle = (d: string) =>
    setPicked((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d].sort()));

  const fmt = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return { day: d.toLocaleDateString(undefined, { weekday: "short" }), date: d.getDate() };
  };

  const total = picked.length * gig.payPerWorker;

  return (
    <div className="fixed inset-0 z-[500] flex items-end justify-center bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md animate-fade-up rounded-t-3xl border-t border-border bg-card p-6 shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">{gig.companyName}</div>
            <div className="mt-0.5 font-display text-xl font-extrabold leading-tight">{gig.title}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {gig.location} · {gig.distanceKm} km</div>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-extrabold text-primary">₹{gig.payPerWorker}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">per day</div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <Box icon={Package} label="Loading" value={`${gig.loadingHours}h`} />
          <Box icon={Truck} label="Unloading" value={`${gig.unloadingHours}h`} />
          <Box icon={Clock} label="Start" value={gig.dailyStartTime} />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pick days you can work</div>
            <button onClick={() => setPicked(picked.length === allDates.length ? [] : allDates)} className="text-xs font-semibold text-accent hover:underline">
              {picked.length === allDates.length ? "Clear" : "All days"}
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allDates.map((d) => {
              const on = picked.includes(d);
              const f = fmt(d);
              return (
                <button
                  key={d}
                  onClick={() => toggle(d)}
                  className={`flex min-w-[58px] flex-col items-center rounded-xl border-2 px-3 py-2 transition-base ${on ? "border-primary bg-primary text-primary-foreground shadow-glow" : "border-border bg-muted/40 text-foreground"}`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{f.day}</span>
                  <span className="font-display text-lg font-extrabold leading-none">{f.date}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-muted/50 p-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your total</div>
              <div className="font-display text-2xl font-extrabold text-primary">₹{total}</div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {picked.length} day{picked.length !== 1 ? "s" : ""} × ₹{gig.payPerWorker}
            </div>
          </div>
          {gig.notes && <p className="mt-3 text-sm text-foreground">{gig.notes}</p>}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button variant="ghost" onClick={onClose}>Skip</Button>
          <Button disabled={picked.length === 0} onClick={() => onAccept(picked)} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            Accept {picked.length} day{picked.length !== 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Box = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
    <Icon className="mx-auto h-4 w-4 text-accent" />
    <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="font-display text-base font-extrabold">{value}</div>
  </div>
);

export default Worker;
