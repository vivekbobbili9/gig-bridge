import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, HardHat, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const WorkerLogin = () => {
  const nav = useNavigate();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      <div className="absolute inset-0 grid-bg opacity-15" />

      <header className="relative z-10 flex h-14 items-center px-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Link>
        </Button>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-10">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
            <HardHat className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mt-6 text-center font-display text-3xl font-extrabold leading-tight">
            Find work <span className="text-primary">near you</span>
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Login with your mobile number to start earning today
          </p>

          <div className="mt-7 rounded-3xl border border-border bg-card/85 p-6 shadow-elevated backdrop-blur-xl">
            {step === "phone" ? (
              <div className="space-y-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mobile number</label>
                <div className="flex items-center gap-2 rounded-xl border border-input bg-input px-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">+91</span>
                  <Input
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="98765 43210"
                    className="border-0 bg-transparent px-1 text-base focus-visible:ring-0"
                  />
                </div>
                <Button
                  size="lg"
                  className="w-full bg-primary text-primary-foreground shadow-glow hover:bg-primary/90"
                  onClick={() => {
                    if (phone.length !== 10) return toast.error("Enter a 10-digit number");
                    setStep("otp");
                    toast.success("OTP sent: 1234");
                  }}
                >
                  Send OTP
                </Button>
                <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 text-success" /> Verified workers only · Free to join
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Enter OTP sent to +91 {phone}
                </label>
                <Input
                  inputMode="numeric"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="1234"
                  className="text-center text-2xl font-extrabold tracking-[0.5em]"
                />
                <Button
                  size="lg"
                  className="w-full bg-primary text-primary-foreground shadow-glow hover:bg-primary/90"
                  onClick={() => {
                    if (otp.length !== 4) return toast.error("Enter 4-digit OTP");
                    toast.success("Welcome aboard!");
                    nav("/worker");
                  }}
                >
                  Verify & continue
                </Button>
                <button onClick={() => setStep("phone")} className="block w-full text-center text-xs font-semibold text-accent hover:underline">
                  Change number
                </button>
              </div>
            )}
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Are you a company? <Link to="/login/company" className="font-semibold text-primary hover:underline">Company portal</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default WorkerLogin;
