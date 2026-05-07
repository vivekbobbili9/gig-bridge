import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGigStore, type Gig } from "@/store/gigStore";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import SatelliteMap from "@/components/SatelliteMap";
import { ArrowLeft, Bell, CheckCircle2, Clock, IndianRupee, MapPin, Package, Truck, User, Wallet } from "lucide-react";
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
    <div className="mx-auto min-h-screen max-w-md bg-background sm:max-w-md">
      {/* Status bar */}
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

      {/* Online toggle */}
      <section className="px-4 pt-5">
        <div className={`flex items-center justify-between rounded-2xl border p-4 transition-base ${workerOnline ? "border-primary/40 bg-primary/5" : "border-border bg-muted/40"}`}>
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

        {/* Earnings strip */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Mini icon={Wallet} label="Today" value={`₹${earnings}`} />
          <Mini icon={CheckCircle2} label="Accepted" value={`${acceptedGigIds.length}`} />
          <Mini icon={Truck} label="Distance" value="12 km" />
        </div>
      </section>

      {/* Satellite Map */}
      <section className="px-4 mt-5">
        <div className="relative h-80 overflow-hidden rounded-2xl border border-border shadow-elevated">
          <SatelliteMap
            gigs={visibleGigs}
            workerLocation={workerLocation}
            acceptedGigIds={acceptedGigIds}
            onSelect={(g) => setSelected(g)}
            zoom={11}
          />
          {!workerOnline && (
            <div className="absolute inset-0 z-[400] flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="font-display text-base font-bold">You're offline</div>
                <div className="text-xs text-muted-foreground">Turn on to view gigs near you</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Gig list */}
      <section className="px-4 mt-6 pb-24">
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
                className="group block w-full rounded-2xl border border-border bg-card p-4 text-left transition-base hover:border-primary hover:shadow-elevated"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-primary">{g.companyName}</div>
                    <div className="mt-0.5 truncate font-display text-base font-bold">{g.title}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {g.location} · {g.distanceKm} km
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-extrabold text-primary">₹{g.payPerWorker}</div>
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
    <div className="fixed inset-0 z-[500] flex items-end justify-center bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md animate-fade-up rounded-t-3xl border-t border-border bg-card p-6 shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">{gig.companyName}</div>
            <div className="mt-0.5 font-display text-xl font-extrabold leading-tight">{gig.title}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {gig.location} · {gig.distanceKm} km</div>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-extrabold text-primary">₹{gig.payPerWorker}</div>
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
          <Button disabled={accepted} onClick={onAccept} className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {accepted ? "Accepted" : "Accept gig"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Box = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
    <Icon className="mx-auto h-4 w-4 text-primary" />
    <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="font-display text-base font-extrabold">{value}</div>
  </div>
);

export default Worker;
