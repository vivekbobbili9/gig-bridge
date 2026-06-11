import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building2, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useGigStore } from "@/store/gigStore";

const CompanyLogin = () => {
  const nav = useNavigate();
  const setCompany = useGigStore((s) => s.setCompany);
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim()) return toast.error("Enter your business email");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setCompany({ name: "", contactName: "", email: form.email.trim(), phone: "" });
    toast.success("Welcome back");
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
            <Sparkles className="h-3 w-3" /> Company Portal
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Hire ground-ops crews <span className="text-primary">without contractors</span>.
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            Post unlimited gigs, track workers in real-time, and manage payouts — all in one place.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Unlimited gig tickets",
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
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-xl font-bold">Company sign in</div>
              <div className="text-xs text-muted-foreground">For businesses hiring ground crews</div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="ops@yourcompany.com"
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="mt-1.5"
                required
              />
            </div>
            <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground shadow-glow hover:bg-primary/90">
              Sign in
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup/company" className="font-semibold text-accent hover:underline">Create one</Link>
            </p>
            <p className="text-center text-xs text-muted-foreground">
              Are you a worker?{" "}
              <Link to="/login/worker" className="font-semibold text-accent hover:underline">Open worker app</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CompanyLogin;
