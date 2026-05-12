import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGigStore, type TaskType, type Gig } from "@/store/gigStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SatelliteMap from "@/components/SatelliteMap";
import { AlertTriangle, ArrowLeft, Building2, CheckCircle2, Clock, IndianRupee, MapPin, MessageSquare, Plus, Radio, ShieldCheck, Star, Users, Wallet, XCircle } from "lucide-react";
import { toast } from "sonner";
import { fetchDrivingRoute } from "@/lib/routing";

const taskOptions: { value: TaskType; label: string }[] = [
  { value: "loading", label: "Loading" },
  { value: "unloading", label: "Unloading" },
  { value: "pickup", label: "Pickup" },
  { value: "delivery", label: "Delivery" },
  { value: "mixed", label: "Mixed (loading + unloading)" },
];

const Company = () => {
  const { gigs, positions, addGig, tickPositions, payWorkers, cancelGigByCompany, companyNotices, completeGig, chatsByGig, sendCompanyMessage, ratings, submitCompanyRating } = useGigStore();
  const [open, setOpen] = useState(false);
  const [tracking, setTracking] = useState<Gig | null>(null);
  const [cancelGig, setCancelGig] = useState<Gig | null>(null);
  const [chatGig, setChatGig] = useState<Gig | null>(null);
  const [rateGig, setRateGig] = useState<Gig | null>(null);
  const lastNoticeRef = useRef<string | null>(null);

  // Live tick worker positions every 3s
  useEffect(() => {
    const id = setInterval(() => tickPositions(), 3000);
    return () => clearInterval(id);
  }, [tickPositions]);

  const myGigs = useMemo(() => gigs.slice(0, 8), [gigs]);
  const totals = useMemo(() => {
    const active = gigs.filter((g) => g.status !== "completed" && g.status !== "cancelled").length;
    const filled = gigs.reduce((a, g) => a + g.workersAccepted, 0);
    const needed = gigs.reduce((a, g) => a + g.workersNeeded, 0);
    return { active, filled, needed };
  }, [gigs]);
  const recentNotices = useMemo(() => companyNotices.slice(0, 4), [companyNotices]);

  useEffect(() => {
    if (companyNotices.length === 0) return;
    const newest = companyNotices[0];
    if (lastNoticeRef.current === newest.id) return;
    lastNoticeRef.current = newest.id;
    toast.info(newest.message);
  }, [companyNotices]);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon"><Link to="/"><ArrowLeft className="h-5 w-5" /></Link></Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary"><Building2 className="h-4 w-4 text-primary-foreground" /></div>
            <div>
              <div className="font-display text-base font-bold leading-tight">BlueCart Logistics</div>
              <div className="text-xs text-muted-foreground">Company portal</div>
            </div>
          </div>
          <Button onClick={() => setOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" /> Raise a ticket
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Active gigs", value: totals.active, icon: Building2 },
            { label: "Workers needed", value: totals.needed, icon: Users },
            { label: "Workers filled", value: totals.filled, icon: CheckCircle2 },
          ].map((k) => (
            <Card key={k.label} className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary"><k.icon className="h-5 w-5 text-primary-foreground" /></div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{k.label}</div>
                <div className="font-display text-2xl font-extrabold">{k.value}</div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Live tickets</h2>
          <span className="text-xs text-muted-foreground">Updated just now</span>
        </div>

        <Card className="mt-4 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle className="h-4 w-4 text-primary" /> Company alerts</div>
          {recentNotices.length === 0 ? (
            <div className="mt-2 text-xs text-muted-foreground">No new updates yet.</div>
          ) : (
            <div className="mt-3 space-y-2">
              {recentNotices.map((n) => (
                <div key={n.id} className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
                  <div className="font-semibold">{n.gigTitle}</div>
                  <div className="text-muted-foreground">{n.message}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {myGigs.map((g) => {
            const pct = Math.round((g.workersAccepted / g.workersNeeded) * 100);
            const livePositions = positions[g.id] ?? [];
            const closestEta = livePositions.length ? Math.min(...livePositions.map((p) => p.etaMin)) : null;
            const closestDistance = livePositions.length ? Math.min(...livePositions.map((p) => p.distanceKm)) : null;
            const workerRated = ratings.some((r) => r.gigId === g.id && r.by === "company");
            const workerRatings = ratings.filter((r) => r.by === "worker" && r.gigId === g.id);
            const workerAvg = workerRatings.length ? (workerRatings.reduce((a, r) => a + r.score, 0) / workerRatings.length).toFixed(1) : null;
            return (
              <Card key={g.id} className="overflow-hidden p-5 transition-base hover:shadow-elevated">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.companyName} · #{g.id.slice(-4)}</div>
                    <div className="mt-1 font-display text-lg font-bold leading-tight">{g.title}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold capitalize text-success">{g.status}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat icon={Users} label="Workers" value={`${g.workersAccepted}/${g.workersNeeded}`} />
                  <Stat icon={Clock} label="Hours" value={`${g.dailyStartTime}–${g.dailyEndTime}`} />
                  <Stat icon={IndianRupee} label="Per worker" value={`₹${g.payPerWorker}`} />
                  <Stat icon={MapPin} label="Location" value={g.location} />
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Slots filled</span>
                    <span className="font-semibold text-foreground">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-accent transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* Live tracking strip */}
                {livePositions.length > 0 && (
                  <button onClick={() => setTracking(g)} className="mt-4 flex w-full items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5 text-left transition-base hover:border-primary hover:bg-primary/10">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                      </span>
                      <span className="text-xs font-semibold text-foreground">{livePositions.length} worker{livePositions.length !== 1 ? "s" : ""} en route</span>
                    </div>
                    <span className="text-xs font-bold text-primary">{closestEta} min · {closestDistance?.toFixed(1)} km →</span>
                  </button>
                )}

                {/* Penalty reclaim */}
                {g.reclaimedFromPenalty && g.reclaimedFromPenalty > 0 && (
                  <div className="mt-3 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs font-semibold text-success">
                    +₹{g.reclaimedFromPenalty} reclaimed from cancelled worker
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setTracking(g)}>
                    <Radio className="mr-1.5 h-3.5 w-3.5" /> Live track
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setChatGig(g)}>
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Chat
                  </Button>
                  <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => {
                    const n = payWorkers(g.id);
                    if (n === 0) toast.error("No workers to pay yet");
                    else toast.success(`Payout queued for ${n} verified worker${n !== 1 ? "s" : ""} · ₹${g.payPerWorker * n}`);
                  }}>
                    <Wallet className="mr-1.5 h-3.5 w-3.5" /> Pay workers
                  </Button>
                  {g.status !== "completed" && g.status !== "cancelled" && (
                    <Button size="sm" variant="secondary" onClick={() => {
                      completeGig(g.id);
                      toast.success("Gig marked complete.");
                    }}>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Finish
                    </Button>
                  )}
                  {g.status !== "cancelled" && (
                    <Button size="sm" variant="destructive" onClick={() => setCancelGig(g)}>
                      <XCircle className="mr-1.5 h-3.5 w-3.5" /> Cancel
                    </Button>
                  )}
                </div>
                {g.status === "completed" && (
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-muted/40 p-2 text-xs">
                    <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-400" /> Worker rating {workerAvg ? `${workerAvg}/5` : "pending"}</span>
                    {!workerRated && <Button size="sm" variant="outline" onClick={() => setRateGig(g)}>Rate now</Button>}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </main>

      {open && <NewTicketDialog onClose={() => setOpen(false)} onCreate={(g) => { addGig(g); toast.success("Ticket published — workers are being notified"); setOpen(false); }} />}
      {tracking && <TrackingDialog gig={tracking} onClose={() => setTracking(null)} />}
      {chatGig && <ChatDialog
        title={`Chat · ${chatGig.title}`}
        messages={chatsByGig[chatGig.id] ?? []}
        me="company"
        onSend={(text) => sendCompanyMessage(chatGig.id, text)}
        onClose={() => setChatGig(null)}
      />}
      {cancelGig && <CompanyCancelDialog gig={cancelGig} onClose={() => setCancelGig(null)} onConfirm={() => {
        cancelGigByCompany(cancelGig.id);
        toast.success("Gig cancelled and workers notified.");
        setTracking((prev) => (prev?.id === cancelGig.id ? null : prev));
        setCancelGig(null);
      }} />}
      {rateGig && <RatingDialog
        title={`Rate workers · ${rateGig.title}`}
        onClose={() => setRateGig(null)}
        onSubmit={(score, complaint) => {
          submitCompanyRating(rateGig.id, score, complaint);
          toast.success("Anonymous rating submitted.");
          setRateGig(null);
        }}
      />}
    </div>
  );
};

const TrackingDialog = ({ gig, onClose }: { gig: Gig; onClose: () => void }) => {
  const positions = useGigStore((s) => s.positions[gig.id] ?? []);
  const [routeLines, setRouteLines] = useState<[number, number][][]>([]);

  useEffect(() => {
    let cancelled = false;

    if (positions.length === 0) {
      setRouteLines([]);
      return;
    }

    const loadRoutes = async () => {
      const routes = await Promise.all(positions.map(async (p) => {
        try {
          const summary = await fetchDrivingRoute({ lat: p.lat, lng: p.lng }, { lat: gig.lat, lng: gig.lng });
          return summary.points;
        } catch {
          return [[p.lat, p.lng], [gig.lat, gig.lng]] as [number, number][];
        }
      }));
      if (!cancelled) setRouteLines(routes);
    };

    void loadRoutes();
    return () => { cancelled = true; };
  }, [positions, gig.lat, gig.lng]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="w-full max-w-3xl animate-fade-up rounded-t-2xl bg-card p-6 shadow-elevated sm:rounded-2xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <div className="font-display text-xl font-bold">Live worker tracking</div>
            <p className="text-sm text-muted-foreground">{gig.title} · {gig.location}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        <div className="mt-5 h-80 overflow-hidden rounded-2xl border border-border">
          <SatelliteMap
            gigs={[gig]}
            workerLocation={positions[0] ? { lat: positions[0].lat, lng: positions[0].lng } : { lat: gig.lat, lng: gig.lng }}
            acceptedGigIds={[gig.id]}
            zoom={13}
            showWorkerPulse={false}
            workerMarkers={positions.map((p) => ({
              id: p.workerId,
              name: p.workerName,
              lat: p.lat,
              lng: p.lng,
              etaMin: p.etaMin,
              distanceKm: p.distanceKm,
            }))}
            destination={{ lat: gig.lat, lng: gig.lng, label: gig.location }}
            routeLines={routeLines}
          />
        </div>

        <div className="mt-5 space-y-2">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Workers on the way</h3>
          {positions.length === 0 && <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No workers en route yet.</div>}
          {positions.map((p) => (
            <div key={p.workerId} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary">
                  <span className="text-xs font-bold text-primary-foreground">{p.workerName.split(" ").map((s) => s[0]).join("").slice(0, 2)}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold">{p.workerName}</div>
                  <div className="flex items-center gap-1 text-[11px] text-success"><ShieldCheck className="h-3 w-3" /> KYC verified</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-lg font-extrabold text-primary">{p.etaMin === 0 ? "Arrived" : `${p.etaMin} min`}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.distanceKm.toFixed(1)} km away</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-muted/40 p-3">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div>
    <div className="mt-1 truncate font-semibold text-foreground">{value}</div>
  </div>
);

const NewTicketDialog = ({ onClose, onCreate }: { onClose: () => void; onCreate: (g: any) => void }) => {
  const todayISO = new Date().toISOString().slice(0, 10);
  const weekISO = new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10);
  const [form, setForm] = useState({
    companyName: "BlueCart Logistics",
    title: "",
    taskType: "unloading" as TaskType,
    loadingHours: 0, unloadingHours: 2,
    workersNeeded: 4, payPerWorker: 800,
    location: "",
    startDate: todayISO, endDate: weekISO,
    dailyStartTime: "6:00 PM", dailyEndTime: "10:00 PM",
    notes: "",
  });

  const submit = () => {
    if (!form.title || !form.location) { toast.error("Fill in task title and location"); return; }
    if (form.endDate < form.startDate) { toast.error("End date must be after start date"); return; }
    onCreate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="w-full max-w-2xl animate-fade-up rounded-t-2xl bg-card p-6 shadow-elevated sm:rounded-2xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div>
          <div className="font-display text-xl font-bold">Raise a manpower ticket</div>
          <p className="text-sm text-muted-foreground">Post for a single day or up to a week — workers pick the days they can work.</p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Task title" full><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. 40ft container unloading" /></Field>
          <Field label="Task type">
            <Select value={form.taskType} onValueChange={(v: TaskType) => setForm({ ...form, taskType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{taskOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Workers needed"><Input type="number" min={1} value={form.workersNeeded} onChange={(e) => setForm({ ...form, workersNeeded: +e.target.value })} /></Field>
          <Field label="Pay per worker / day (₹)"><Input type="number" min={0} value={form.payPerWorker} onChange={(e) => setForm({ ...form, payPerWorker: +e.target.value })} /></Field>
          <Field label="Loading hours / day"><Input type="number" min={0} step={0.5} value={form.loadingHours} onChange={(e) => setForm({ ...form, loadingHours: +e.target.value })} /></Field>
          <Field label="Unloading hours / day"><Input type="number" min={0} step={0.5} value={form.unloadingHours} onChange={(e) => setForm({ ...form, unloadingHours: +e.target.value })} /></Field>
          <Field label="Start date"><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
          <Field label="End date"><Input type="date" value={form.endDate} min={form.startDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
          <Field label="Daily start time"><Input value={form.dailyStartTime} onChange={(e) => setForm({ ...form, dailyStartTime: e.target.value })} placeholder="e.g. 6:00 PM" /></Field>
          <Field label="Daily end time"><Input value={form.dailyEndTime} onChange={(e) => setForm({ ...form, dailyEndTime: e.target.value })} placeholder="e.g. 10:00 PM" /></Field>
          <Field label="Location" full><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Whitefield ICD, Bengaluru" /></Field>
          <Field label="Notes (optional)" full><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special instructions, safety gear, etc." /></Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} className="bg-primary text-primary-foreground hover:bg-primary/90">Publish ticket</Button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) => (
  <div className={full ? "sm:col-span-2" : ""}>
    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
    <div className="mt-1.5">{children}</div>
  </div>
);

const CompanyCancelDialog = ({ gig, onClose, onConfirm }: { gig: Gig; onClose: () => void; onConfirm: () => void }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/60 p-4" onClick={onClose}>
    <div className="w-full max-w-md rounded-2xl border border-destructive/40 bg-card p-5 shadow-elevated" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-2 text-destructive">
        <XCircle className="h-5 w-5" />
        <h3 className="font-display text-lg font-bold">Cancel this gig?</h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        This will remove all en-route workers from <span className="font-semibold text-foreground">{gig.title}</span> and notify them immediately.
      </p>
      <div className="mt-5 flex gap-3">
        <Button variant="ghost" className="flex-1" onClick={onClose}>Keep gig</Button>
        <Button variant="destructive" className="flex-1" onClick={onConfirm}>Cancel gig</Button>
      </div>
    </div>
  </div>
);

const ChatDialog = ({ title, messages, me, onSend, onClose }: {
  title: string;
  messages: { id: string; sender: "worker" | "company"; text: string }[];
  me: "worker" | "company";
  onSend: (text: string) => void;
  onClose: () => void;
}) => {
  const [text, setText] = useState("");
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/60 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-4 shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><h3 className="font-display text-lg font-bold">{title}</h3><Button size="sm" variant="ghost" onClick={onClose}>Close</Button></div>
        <div className="h-72 space-y-2 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3">
          {messages.length === 0 && <div className="text-xs text-muted-foreground">No messages yet.</div>}
          {messages.map((m) => (
            <div key={m.id} className={`max-w-[80%] rounded-lg px-3 py-2 text-xs ${m.sender === me ? "ml-auto bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
          <Button onClick={() => { onSend(text); setText(""); }}>Send</Button>
        </div>
      </div>
    </div>
  );
};

const RatingDialog = ({ title, onSubmit, onClose }: {
  title: string;
  onSubmit: (score: number, complaint?: string) => void;
  onClose: () => void;
}) => {
  const [score, setScore] = useState(5);
  const [complaint, setComplaint] = useState("");
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-foreground/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg font-bold">{title}</h3>
        <div className="mt-3">
          <Label>Rating (anonymous)</Label>
          <Select value={String(score)} onValueChange={(v) => setScore(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{[5, 4, 3, 2, 1].map((n) => <SelectItem key={n} value={String(n)}>{n} / 5</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="mt-3">
          <Label>Complaint (optional)</Label>
          <Textarea rows={3} value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="Add issue details if any..." />
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={() => onSubmit(score, complaint)}>Submit</Button>
        </div>
      </div>
    </div>
  );
};

export default Company;
