import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGigStore, type Gig } from "@/store/gigStore";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, CheckCircle2, Clock, IndianRupee, MapPin, Navigation, Package, Truck, User, Wallet } from "lucide-react";
import { toast } from "sonner";

const Worker = () => {
  const { gigs, workerOnline, workerLocation, acceptedGigIds, toggleOnline, acceptGig } = useGigStore();
  const [selected, setSelected] = useState<Gig | null>(null);

  const visibleGigs = useMemo(() => (workerOnline ? gigs.filter((g) => g.status === "open") : []), [gigs, workerOnline]);

  const earnings = useMemo(() => {
    return acceptedGigIds.reduce((a, id) => {
      const g = gigs.find((x) => x.id === id);
      return a + (g?.payPerWorker ?? 0);
    }, 0);
  }, [acceptedGigIds, gigs]);

  return (
    <div className="min-h-screen bg-background">
      {/* Status bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon"><Link to="/"><ArrowLeft className="h-5 w-5" /></Link></Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-accent">
              <User className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <div className="font-display text-sm font-bold leading-tight">Hi, Ramesh</div>
              <div className="text-xs text-muted-foreground">⭐ 4.8 · 142 gigs</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
          </div>
        </div>
      </header>

      {/* Online toggle */}
      <section className="container pt-5">
        <div className={`flex items-center justify-between rounded-2xl border p-4 transition-base ${workerOnline ? "border-success/40 bg-success/5" : "border-border bg-muted/40"}`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`h-3 w-3 rounded-full ${workerOnline ? "bg-success" : "bg-muted-foreground/40"}`} />
              {workerOnline && <div className="absolute inset-0 animate-pulse-ring rounded-full" />}
            </div>
            <div>
              <div className="font-display text-base font-bold">{workerOnline ? "You're online" : "You're offline"}</div>
              <div className="text-xs text-muted-foreground">{workerOnline ? `${visibleGigs.length} gigs near you` : "Turn on to see gigs"}</div>
            </div>
          </div>
          <Switch checked={workerOnline} onCheckedChange={toggleOnline} />
        </div>

        {/* Earnings strip */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Mini icon={Wallet} label="Today" value={`₹${earnings}`} />
          <Mini icon={CheckCircle2} label="Accepted" value={`${acceptedGigIds.length}`} />
          <Mini icon={Truck} label="Distance" value="12 km" />
        </div>
      </section>

      {/* Map */}
      <section className="container mt-5">
        <div className="relative h-72 overflow-hidden rounded-2xl border border-border bg-gradient-surface shadow-sm">
          <div className="absolute inset-0 grid-bg opacity-60" />
          {/* fake roads */}
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0,55 Q35,40 60,60 T100,50" stroke="hsl(var(--border))" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M40,0 Q50,40 30,60 T55,100" stroke="hsl(var(--border))" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>

          {/* Worker pin */}
          <div className="absolute" style={{ left: `${workerLocation.x}%`, top: `${workerLocation.y}%`, transform: "translate(-50%,-50%)" }}>
            <div className="relative">
              <div className="absolute inset-0 animate-pulse-ring rounded-full" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary shadow-glow ring-4 ring-background">
                <Navigation className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          </div>

          {/* Gig pins */}
          {visibleGigs.map((g) => {
            const accepted = acceptedGigIds.includes(g.id);
            return (
              <button
                key={g.id}
                onClick={() => setSelected(g)}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-base hover:scale-110"
                style={{ left: `${g.x}%`, top: `${g.y}%` }}
              >
                <div className={`flex flex-col items-center`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-background shadow-md ${accepted ? "bg-success" : "bg-accent"}`}>
                    <Package className={`h-4 w-4 ${accepted ? "text-success-foreground" : "text-accent-foreground"}`} />
                  </div>
                  <div className="mt-1 rounded-full bg-card px-2 py-0.5 text-[10px] font-bold shadow-sm">₹{g.payPerWorker}</div>
                </div>
              </button>
            );
          })}

          {!workerOnline && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
              <div className="text-center">
                <div className="font-display text-base font-bold">You're offline</div>
                <div className="text-xs text-muted-foreground">Turn on to view gigs near you</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Gig list */}
      <section className="container mt-6 pb-24">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Available near you</h2>
          <span className="text-xs text-muted-foreground">{visibleGigs.length} gigs</span>
        </div>

        <div className="mt-3 space-y-3">
          {visibleGigs.map((g) => {
            const accepted = acceptedGigIds.includes(g.id);
            return (
              <button
                key={g.id}
                onClick={() => setSelected(g)}
                className="group block w-full rounded-2xl border border-border bg-card p-4 text-left transition-base hover:border-accent hover:shadow-elevated"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-accent">{g.companyName}</div>
                    <div className="mt-0.5 truncate font-display text-base font-bold">{g.title}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {g.location} · {g.distanceKm} km
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-extrabold">₹{g.payPerWorker}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">per worker</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Pill icon={Clock}>{g.loadingHours + g.unloadingHours}h total</Pill>
                  <Pill icon={Package}>L {g.loadingHours}h · U {g.unloadingHours}h</Pill>
                  <Pill icon={Clock}>{g.startTime}</Pill>
                  {accepted && <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 font-semibold text-success"><CheckCircle2 className="h-3 w-3" /> Accepted</span>}
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
          accepted={acceptedGigIds.includes(selected.id)}
          onClose={() => setSelected(null)}
          onAccept={() => { acceptGig(selected.id); toast.success("Gig accepted! Company has been notified."); setSelected(null); }}
        />
      )}
    </div>
  );
};

const Mini = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-card p-3">
    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      <Icon className="h-3 w-3" /> {label}
    </div>
    <div className="mt-0.5 font-display text-lg font-extrabold">{value}</div>
  </div>
);

const Pill = ({ icon: Icon, children }: { icon: any; children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 font-medium text-foreground">
    <Icon className="h-3 w-3 text-muted-foreground" /> {children}
  </span>
);

const GigSheet = ({ gig, accepted, onClose, onAccept }: { gig: Gig; accepted: boolean; onClose: () => void; onAccept: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/40" onClick={onClose}>
      <div className="w-full animate-fade-up rounded-t-3xl bg-card p-6 shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">{gig.companyName}</div>
            <div className="mt-0.5 font-display text-xl font-extrabold leading-tight">{gig.title}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {gig.location} · {gig.distanceKm} km</div>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-extrabold">₹{gig.payPerWorker}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">per worker</div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <Box icon={Package} label="Loading" value={`${gig.loadingHours}h`} />
          <Box icon={Truck} label="Unloading" value={`${gig.unloadingHours}h`} />
          <Box icon={Clock} label="Start" value={gig.startTime.split(",")[1]?.trim() ?? gig.startTime} />
        </div>

        <div className="mt-4 rounded-xl bg-muted/50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Slots</div>
          <div className="mt-1 flex items-end justify-between">
            <div className="font-display text-xl font-extrabold">{gig.workersAccepted} / {gig.workersNeeded}</div>
            <div className="text-xs text-muted-foreground">filled</div>
          </div>
          {gig.notes && <p className="mt-3 text-sm text-foreground">{gig.notes}</p>}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="flex flex-1 items-center gap-1 text-sm font-semibold text-success">
            <IndianRupee className="h-4 w-4" /> Direct payout · 0% commission
          </div>
          <Button variant="ghost" onClick={onClose}>Skip</Button>
          <Button disabled={accepted} onClick={onAccept} className="bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-60">
            {accepted ? "Accepted" : "Accept gig"}
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
