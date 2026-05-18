import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building2, CheckCircle2, Phone, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useGigStore } from "@/store/gigStore";

const CompanyLogin = () => {
  const nav = useNavigate();
  const setCompany = useGigStore((s) => s.setCompany);
  const [mode, setMode] = useState<"signin" | "trial">("trial");
  const [form, setForm] = useState({
    company: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) return toast.error("Enter your work email");

    if (mode === "trial") {
      if (!form.company.trim()) return toast.error("Enter company name");
      if (!form.contactName.trim()) return toast.error("Enter contact person name");
      if (form.phone.replace(/\D/g, "").length !== 10) return toast.error("Enter a valid 10-digit phone number");
      if (!form.password || form.password.length < 6) return toast.error("Password must be at least 6 characters");

      setCompany({
        name: form.company.trim(),
        contactName: form.contactName.trim(),
        email: form.email.trim(),
        phone: `+91 ${form.phone.replace(/\D/g, "")}`,
        address: form.address.trim() || undefined,
      });
      toast.success("Free trial started — 14 days, no card needed");
    } else {
      toast.success("Welcome back");
    }
    nav("/company");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      <div className="absolute inset-0 grid-bg opacity-20" />

      <header className="relative z-10 container flex h-16 items-center">
        <Button asChild variant="ghost" size="sm">
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
        </Button>
      </header>

      <main className="relative z-10 container grid items-center gap-12 py-10 lg:grid-cols-2 lg:py-16">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> 14-day free trial
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Hire ground-ops crews <span className="text-primary">without contractors</span>.
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            Post unlimited gigs during your trial. No credit card. Cancel anytime.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Unlimited tickets for 14 days",
              "Real-time slot fill tracking",
              "Direct worker payouts — 0% middleman cut",
              "Verified worker pool, ratings & history",
            ].map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-fade-up rounded-3xl border border-border bg-card/80 p-8 shadow-elevated backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-xl font-bold">Company portal</div>
              <div className="text-xs text-muted-foreground">For businesses hiring ground crews</div>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            <button
              onClick={() => setMode("trial")}
              className={`rounded-lg py-2 text-sm font-semibold transition-base ${mode === "trial" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
            >Start free trial</button>
            <button
              onClick={() => setMode("signin")}
              className={`rounded-lg py-2 text-sm font-semibold transition-base ${mode === "signin" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
            >Sign in</button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "trial" && (
              <>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company name</Label>
                  <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="BlueCart Logistics" className="mt-1.5" required />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact person</Label>
                  <Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="Priya Sharma" className="mt-1.5" required />
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company phone</Label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-md border border-input bg-background px-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">+91</span>
                    <Input
                      inputMode="numeric"
                      maxLength={10}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                      placeholder="98765 43210"
                      className="border-0 bg-transparent px-1 focus-visible:ring-0"
                      required
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">Workers can call this number for gig coordination</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business address (optional)</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Whitefield, Bengaluru" className="mt-1.5" />
                </div>
              </>
            )}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Work email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ops@yourcompany.com" className="mt-1.5" required />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="mt-1.5" required />
            </div>
            <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground shadow-glow hover:bg-primary/90">
              {mode === "trial" ? "Start 14-day free trial" : "Sign in"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Are you a worker? <Link to="/login/worker" className="font-semibold text-accent hover:underline">Open worker app</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CompanyLogin;
