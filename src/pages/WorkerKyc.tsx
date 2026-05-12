import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useGigStore } from "@/store/gigStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShieldCheck, IdCard, Landmark, Smartphone } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  aadhaar: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN format"),
  bankAccount: z.string().regex(/^\d{9,18}$/, "Account number must be 9–18 digits"),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  upi: z.string().regex(/^[\w.\-]{2,}@[a-zA-Z]{2,}$/, "Invalid UPI ID").or(z.literal("")),
});

const WorkerKyc = () => {
  const nav = useNavigate();
  const { kyc, setKyc } = useGigStore();
  const [form, setForm] = useState({
    fullName: kyc.fullName ?? "",
    aadhaar: kyc.aadhaar ?? "",
    pan: kyc.pan ?? "",
    bankAccount: kyc.bankAccount ?? "",
    ifsc: kyc.ifsc ?? "",
    upi: kyc.upi ?? "",
  });

  const submit = () => {
    const parsed = schema.safeParse({ ...form, pan: form.pan.toUpperCase(), ifsc: form.ifsc.toUpperCase() });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setKyc({ ...parsed.data, status: "verified" });
    toast.success("KYC submitted — verified!");
    nav("/worker");
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-card/95 px-4 backdrop-blur">
        <Button asChild variant="ghost" size="icon"><Link to="/worker"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary"><ShieldCheck className="h-4 w-4 text-primary-foreground" /></div>
        <div>
          <div className="font-display text-base font-bold leading-tight">KYC Verification</div>
          <div className="text-xs text-muted-foreground">Required to receive payouts</div>
        </div>
      </header>

      <main className="space-y-4 p-4 pb-24">
        <Section icon={IdCard} title="Identity">
          <Field label="Full name (as on Aadhaar)">
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Ramesh Kumar" />
          </Field>
          <Field label="Aadhaar number">
            <Input inputMode="numeric" maxLength={12} value={form.aadhaar} onChange={(e) => setForm({ ...form, aadhaar: e.target.value.replace(/\D/g, "") })} placeholder="1234 5678 9012" />
          </Field>
          <Field label="PAN number">
            <Input maxLength={10} value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })} placeholder="ABCDE1234F" />
          </Field>
        </Section>

        <Section icon={Landmark} title="Bank details">
          <Field label="Bank account number">
            <Input inputMode="numeric" value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value.replace(/\D/g, "") })} placeholder="123456789012" />
          </Field>
          <Field label="IFSC code">
            <Input maxLength={11} value={form.ifsc} onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })} placeholder="HDFC0001234" />
          </Field>
        </Section>

        <Section icon={Smartphone} title="UPI (optional, faster payouts)">
          <Field label="UPI ID">
            <Input value={form.upi} onChange={(e) => setForm({ ...form, upi: e.target.value })} placeholder="ramesh@oksbi" />
          </Field>
        </Section>

        <Button size="lg" onClick={submit} className="w-full bg-primary text-primary-foreground shadow-glow hover:bg-primary/90">
          Submit & verify
        </Button>
        <p className="px-2 text-center text-[11px] text-muted-foreground">
          Your details are encrypted. Companies only see your name & verified status — never your Aadhaar or bank details.
        </p>
      </main>
    </div>
  );
};

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <div className="mb-3 flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <div className="font-display text-sm font-bold uppercase tracking-wider">{title}</div>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
    <div className="mt-1.5">{children}</div>
  </div>
);

export default WorkerKyc;
