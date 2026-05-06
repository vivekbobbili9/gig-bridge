import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGigStore, type TaskType } from "@/store/gigStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Building2, CheckCircle2, Clock, IndianRupee, MapPin, Plus, Users } from "lucide-react";
import { toast } from "sonner";

const taskOptions: { value: TaskType; label: string }[] = [
  { value: "loading", label: "Loading" },
  { value: "unloading", label: "Unloading" },
  { value: "pickup", label: "Pickup" },
  { value: "delivery", label: "Delivery" },
  { value: "mixed", label: "Mixed (loading + unloading)" },
];

const Company = () => {
  const { gigs, addGig } = useGigStore();
  const [open, setOpen] = useState(false);

  const myGigs = useMemo(() => gigs.slice(0, 8), [gigs]);

  const totals = useMemo(() => {
    const active = gigs.filter((g) => g.status !== "completed").length;
    const filled = gigs.reduce((a, g) => a + g.workersAccepted, 0);
    const needed = gigs.reduce((a, g) => a + g.workersNeeded, 0);
    return { active, filled, needed };
  }, [gigs]);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
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
        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Active gigs", value: totals.active, icon: Building2 },
            { label: "Workers needed", value: totals.needed, icon: Users },
            { label: "Workers filled", value: totals.filled, icon: CheckCircle2 },
          ].map((k) => (
            <Card key={k.label} className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                <k.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{k.label}</div>
                <div className="font-display text-2xl font-extrabold">{k.value}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Gigs list */}
        <div className="mt-8 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Live tickets</h2>
          <span className="text-xs text-muted-foreground">Updated just now</span>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {myGigs.map((g) => {
            const pct = Math.round((g.workersAccepted / g.workersNeeded) * 100);
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
                  <Stat icon={Clock} label="Load·Unload" value={`${g.loadingHours}h · ${g.unloadingHours}h`} />
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
              </Card>
            );
          })}
        </div>
      </main>

      {open && <NewTicketDialog onClose={() => setOpen(false)} onCreate={(g) => { addGig(g); toast.success("Ticket published — workers are being notified"); setOpen(false); }} />}
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
  const [form, setForm] = useState({
    companyName: "BlueCart Logistics",
    title: "",
    taskType: "unloading" as TaskType,
    loadingHours: 0,
    unloadingHours: 2,
    workersNeeded: 4,
    payPerWorker: 800,
    location: "",
    startTime: "Today, 6:00 PM",
    notes: "",
  });

  const submit = () => {
    if (!form.title || !form.location) { toast.error("Fill in task title and location"); return; }
    onCreate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="w-full max-w-2xl animate-fade-up rounded-t-2xl bg-card p-6 shadow-elevated sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-xl font-bold">Raise a manpower ticket</div>
            <p className="text-sm text-muted-foreground">Workers in the area will be notified instantly.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Task title" full>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. 40ft container unloading" />
          </Field>
          <Field label="Task type">
            <Select value={form.taskType} onValueChange={(v: TaskType) => setForm({ ...form, taskType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {taskOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Workers needed">
            <Input type="number" min={1} value={form.workersNeeded} onChange={(e) => setForm({ ...form, workersNeeded: +e.target.value })} />
          </Field>
          <Field label="Loading hours">
            <Input type="number" min={0} step={0.5} value={form.loadingHours} onChange={(e) => setForm({ ...form, loadingHours: +e.target.value })} />
          </Field>
          <Field label="Unloading hours">
            <Input type="number" min={0} step={0.5} value={form.unloadingHours} onChange={(e) => setForm({ ...form, unloadingHours: +e.target.value })} />
          </Field>
          <Field label="Pay per worker (₹)">
            <Input type="number" min={0} value={form.payPerWorker} onChange={(e) => setForm({ ...form, payPerWorker: +e.target.value })} />
          </Field>
          <Field label="Start time">
            <Input value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          </Field>
          <Field label="Location" full>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Whitefield ICD, Bengaluru" />
          </Field>
          <Field label="Notes (optional)" full>
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special instructions, safety gear, etc." />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} className="bg-accent text-accent-foreground hover:bg-accent/90">Publish ticket</Button>
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

export default Company;
