import { useState } from "react";
import { Link } from "react-router-dom";
import { useGigStore } from "@/store/gigStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Building2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const CompanyFeedback = () => {
  const { company, feedback, gigs, submitFeedback } = useGigStore();
  const companyName = company?.name ?? "BlueCart Logistics";
  const [type, setType] = useState<"feedback" | "complaint">("feedback");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [gigId, setGigId] = useState("");

  const myGigs = gigs.filter((g) => g.companyName === companyName);
  const myFeedback = feedback.filter((f) => f.submitter === "company" && f.companyName === companyName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return toast.error("Please fill in subject and message");
    const gig = gigId ? myGigs.find((g) => g.id === gigId) : undefined;
    submitFeedback({
      submitter: "company",
      companyName,
      type,
      subject: subject.trim(),
      message: message.trim(),
      gigId: gig?.id,
    });
    toast.success(type === "complaint" ? "Complaint logged — support will follow up" : "Thanks for your feedback!");
    setSubject("");
    setMessage("");
    setGigId("");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/company"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-base font-bold">Feedback & complaints</div>
            <div className="text-xs text-muted-foreground">{companyName}</div>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl space-y-6 py-8">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-bold">Submit feedback</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Report platform issues, worker no-shows, or share suggestions. Our team reviews every ticket.
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
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="mt-1.5 resize-none" placeholder="Describe the issue or feedback..." />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Submit {type === "complaint" ? "complaint" : "feedback"}
            </Button>
          </form>
        </section>

        {myFeedback.length > 0 && (
          <section>
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Your submissions</h3>
            <div className="space-y-2">
              {myFeedback.map((f) => (
                <div key={f.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${f.type === "complaint" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`}>
                      {f.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{new Date(f.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold">{f.subject}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{f.message}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default CompanyFeedback;
