import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building2, Phone, Upload } from "lucide-react";
import { toast } from "sonner";
import { useGigStore } from "@/store/gigStore";

const Section = ({ title }: { title: string }) => (
  <div className="pt-2">
    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
    <hr className="mt-1 border-border" />
  </div>
);

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    <div className="mt-1.5">{children}</div>
  </div>
);

const FileField = ({ label, value, onChange }: { label: string; value: File | null; onChange: (f: File | null) => void }) => (
  <Field label={label}>
    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 transition-colors">
      <Upload className="h-4 w-4 shrink-0" />
      <span className="truncate">{value ? value.name : "Choose file…"}</span>
      <input type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
    </label>
  </Field>
);

const CompanySignup = () => {
  const nav = useNavigate();
  const setCompany = useGigStore((s) => s.setCompany);

  const [form, setForm] = useState({
    companyName: "", businessEmail: "", phone: "", website: "",
    gstin: "", pan: "", cin: "", licenseNumber: "",
    fullName: "", designation: "", workEmail: "",
    password: "", confirmPassword: "",
  });

  const [docs, setDocs] = useState<{ gst: File | null; incorporation: File | null; license: File | null }>({
    gst: null, incorporation: null, license: null,
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName.trim()) return toast.error("Company name is required");
    if (!form.businessEmail.trim()) return toast.error("Business email is required");
    if (form.phone.replace(/\D/g, "").length !== 10) return toast.error("Enter a valid 10-digit phone number");
    if (!form.gstin.trim()) return toast.error("GSTIN is required");
    if (!form.pan.trim()) return toast.error("PAN number is required");
    if (!form.fullName.trim()) return toast.error("Authorized person full name is required");
    if (!form.designation.trim()) return toast.error("Designation is required");
    if (!form.workEmail.trim()) return toast.error("Work email is required");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match");

    setCompany({
      name: form.companyName.trim(),
      contactName: form.fullName.trim(),
      email: form.businessEmail.trim(),
      phone: `+91 ${form.phone.replace(/\D/g, "")}`,
    });
    toast.success("Account created! Welcome to GigBridge.");
    nav("/company");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      <div className="absolute inset-0 grid-bg opacity-20" />

      <header className="relative z-10 container flex h-16 items-center">
        <Button asChild variant="ghost" size="sm">
          <Link to="/login/company"><ArrowLeft className="mr-2 h-4 w-4" /> Back to login</Link>
        </Button>
      </header>

      <main className="relative z-10 container flex justify-center py-10 pb-16">
        <div className="w-full max-w-lg animate-fade-up rounded-3xl border border-border bg-card/80 p-8 shadow-elevated backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-xl font-bold">Create company account</div>
              <div className="text-xs text-muted-foreground">For businesses hiring ground crews</div>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Section title="Company Information" />
            <Field label="Company Name" required>
              <Input value={form.companyName} onChange={set("companyName")} placeholder="BlueCart Logistics" required />
            </Field>
            <Field label="Business Email" required>
              <Input type="email" value={form.businessEmail} onChange={set("businessEmail")} placeholder="ops@yourcompany.com" required />
            </Field>
            <Field label="Phone Number" required>
              <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">+91</span>
                <Input
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))}
                  placeholder="98765 43210"
                  className="border-0 bg-transparent px-1 focus-visible:ring-0"
                  required
                />
              </div>
            </Field>
            <Field label="Website">
              <Input value={form.website} onChange={set("website")} placeholder="https://yourcompany.com" />
            </Field>

            <Section title="Business Verification" />
            <Field label="GSTIN" required>
              <Input value={form.gstin} onChange={set("gstin")} placeholder="22AAAAA0000A1Z5" maxLength={15} required />
            </Field>
            <Field label="PAN Number" required>
              <Input value={form.pan} onChange={set("pan")} placeholder="ABCDE1234F" maxLength={10} required />
            </Field>
            <Field label="CIN Number">
              <Input value={form.cin} onChange={set("cin")} placeholder="U12345MH2020PTC123456" />
            </Field>
            <Field label="Business License Number">
              <Input value={form.licenseNumber} onChange={set("licenseNumber")} placeholder="BL-2024-XXXXX" />
            </Field>

            <Section title="Authorized Person" />
            <Field label="Full Name" required>
              <Input value={form.fullName} onChange={set("fullName")} placeholder="Priya Sharma" required />
            </Field>
            <Field label="Designation" required>
              <Input value={form.designation} onChange={set("designation")} placeholder="Operations Manager" required />
            </Field>
            <Field label="Work Email" required>
              <Input type="email" value={form.workEmail} onChange={set("workEmail")} placeholder="priya@yourcompany.com" required />
            </Field>

            <Section title="Documents" />
            <FileField label="Upload GST Certificate" value={docs.gst} onChange={(f) => setDocs((d) => ({ ...d, gst: f }))} />
            <FileField label="Upload Incorporation Certificate" value={docs.incorporation} onChange={(f) => setDocs((d) => ({ ...d, incorporation: f }))} />
            <FileField label="Upload Business License" value={docs.license} onChange={(f) => setDocs((d) => ({ ...d, license: f }))} />

            <Section title="Set Password" />
            <Field label="Password" required>
              <Input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required />
            </Field>
            <Field label="Confirm Password" required>
              <Input type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="••••••••" required />
            </Field>

            <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground shadow-glow hover:bg-primary/90">
              Create account
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login/company" className="font-semibold text-accent hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CompanySignup;
