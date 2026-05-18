import { useState } from "react";
import { Link } from "react-router-dom";
import { useGigStore } from "@/store/gigStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MessageSquare, ShieldCheck, ShieldAlert, Star, User } from "lucide-react";
import { toast } from "sonner";

const WorkerProfile = () => {
  const { workerName, workerPhone, kyc, feedback, gigs, accepted, submitFeedback } = useGigStore();
  const [type, setType] = useState<"feedback" | "complaint">("feedback");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [gigId, setGigId] = useState("");

  const myGigs = gigs.filter((g) => accepted.some((a) => a.gigId === g.id));
  const kycVerified = kyc.status === "verified";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return toast.error("Please fill in subject and message");
    const gig = gigId ? gigs.find((g) => g.id === gigId) : undefined;
    submitFeedback({
      type,
      subject: subject.trim(),
      message: message.trim(),
      gigId: gig?.id,
      companyName: gig?.companyName,
    });
    toast.success(type === "complaint" ? "Complaint submitted — we'll follow up within 24h" : "Thanks for your feedback!");
    setSubject("");
    setMessage("");
    setGigId("");
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background lg:my-6 lg:rounded-[2.5rem] lg:border-8 lg:border-border lg:shadow-elevated lg:overflow-hidden">
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="flex h-16 items-center gap-3 px-4">
          <Button asChild variant="ghost" size="icon">
            <Link to="/worker"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-base font-bold">{workerName}</div>
            {workerPhone && <div className="text-xs text-muted-foreground">+91 {workerPhone}</div>}
          </div>
        </div>
      </header>

      <main className="space-y-6 px-4 py-6 pb-24">
        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rating</div>
              <div className="mt-1 flex items-center gap-1 font-display text-lg font-bold">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.8 · 142 gigs
              </div>
            </div>
            <Link
              to="/worker/kyc"
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                kycVerified ? "border-success/40 bg-success/10 text-success" : "border-amber-500/40 bg-amber-500/10 text-amber-300"
              }`}
            >
              {kycVerified ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
              {kycVerified ? "KYC verified" : "Complete KYC"}
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-bold">Feedback & complaints</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Share feedback or raise a complaint about a gig or company. Our team reviews every submission.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as "feedback" | "complaint")}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {myGigs.length > 0 && (
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Related gig (optional)</Label>
                <Select value={gigId || "none"} onValueChange={(v) => setGigId(v === "none" ? "" : v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a gig" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {myGigs.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary" className="mt-1.5" />
            </div>

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your experience or issue..."
                rows={4}
                className="mt-1.5 resize-none"
              />
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Submit {type === "complaint" ? "complaint" : "feedback"}
            </Button>
          </form>
        </section>

        {feedback.length > 0 && (
          <section>
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Your submissions</h3>
            <div className="space-y-2">
              {feedback.map((f) => (
                <div key={f.id} className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        f.type === "complaint" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
                      }`}
                    >
                      {f.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{new Date(f.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold">{f.subject}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{f.message}</div>
                  {f.companyName && <div className="mt-1 text-[10px] text-accent">{f.companyName}</div>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default WorkerProfile;
