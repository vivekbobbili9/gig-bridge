import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Boxes, Building2, HardHat, ShieldCheck, Truck, Zap } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-md">
              <HardHat className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-extrabold tracking-tight">GroundForce</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="ghost" size="sm">
              <a href="#how">How it works</a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/worker">Worker app</Link>
            </Button>
            <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/company">Company portal</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="absolute inset-0 grid-bg opacity-10" />
        <div className="container relative grid gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up text-primary-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              <Zap className="h-3 w-3" /> No contractors. No commission cuts.
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Bulk manpower for <span className="text-accent">loading, unloading</span> & deliveries — on demand.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-primary-foreground/80">
              GroundForce connects companies directly with verified ground-ops workers. Post a gig in 60 seconds, fill 12 slots in minutes, and pay the worker — not a middleman.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground shadow-glow hover:bg-accent/90">
                <Link to="/company">
                  <Building2 className="mr-2 h-5 w-5" /> Post a gig
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/worker">
                  <HardHat className="mr-2 h-5 w-5" /> I'm a worker
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-primary-foreground/15 pt-6">
              {[
                { v: "0%", l: "Contractor cut" },
                { v: "<5 min", l: "Avg fill time" },
                { v: "12,400+", l: "Workers online" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-2xl font-extrabold text-accent">{s.v}</div>
                  <div className="text-xs text-primary-foreground/70">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden lg:block">
            <div className="absolute right-0 top-1/2 w-full max-w-lg -translate-y-1/2 rounded-3xl border border-primary-foreground/10 bg-card/95 p-6 shadow-elevated backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live gig</div>
                  <div className="font-display text-lg font-bold text-foreground">Container unloading — 40ft</div>
                </div>
                <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">Open</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { icon: Truck, label: "Workers", val: "8" },
                  { icon: Boxes, label: "Hours", val: "4h" },
                  { icon: ShieldCheck, label: "Pay", val: "₹950" },
                ].map((i) => (
                  <div key={i.label} className="rounded-xl border border-border bg-muted/40 p-3">
                    <i.icon className="h-4 w-4 text-accent" />
                    <div className="mt-2 text-xs text-muted-foreground">{i.label}</div>
                    <div className="font-display text-base font-bold text-foreground">{i.val}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-gradient-primary p-4 text-primary-foreground">
                <div className="text-xs opacity-80">Slots filled</div>
                <div className="mt-1 flex items-end justify-between">
                  <div className="font-display text-2xl font-extrabold">3 / 8</div>
                  <div className="text-xs opacity-80">Filling fast</div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-foreground/20">
                  <div className="h-full w-[37%] rounded-full bg-accent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-y border-border bg-muted/40">
        <div className="container grid gap-10 py-16 md:grid-cols-3">
          {[
            { t: "Contractor middlemen", d: "Workers receive only half the offered pay. Contractors take huge commissions." },
            { t: "Workforce poaching", d: "When a competitor offers higher pay, entire crews vanish overnight." },
            { t: "Miscommunication", d: "Tasks get lost in translation between company → contractor → worker." },
          ].map((p) => (
            <div key={p.t} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="font-display text-lg font-bold">{p.t}</div>
              <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How */}
      <section id="how" className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">How it works</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Two apps. One transparent marketplace.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Link to="/company" className="group rounded-2xl border border-border bg-card p-8 transition-base hover:-translate-y-1 hover:border-accent hover:shadow-elevated">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold">Company portal</h3>
            <p className="mt-2 text-muted-foreground">Raise a ticket: how many workers, what task, how long, and the pay you're offering. Watch slots fill in real-time.</p>
            <div className="mt-6 inline-flex items-center text-sm font-semibold text-accent group-hover:underline">Open portal →</div>
          </Link>
          <Link to="/worker" className="group rounded-2xl border border-border bg-card p-8 transition-base hover:-translate-y-1 hover:border-accent hover:shadow-elevated">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-accent">
              <HardHat className="h-6 w-6 text-accent-foreground" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold">Worker app</h3>
            <p className="mt-2 text-muted-foreground">Go online, see live gigs near you on the map, check pay & load — accept with one tap.</p>
            <div className="mt-6 inline-flex items-center text-sm font-semibold text-accent group-hover:underline">Open worker app →</div>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="container flex flex-col items-center justify-between gap-3 py-8 text-sm text-muted-foreground sm:flex-row">
          <div>© 2026 GroundForce. Direct hiring for ground operations.</div>
          <div>Prototype build</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
