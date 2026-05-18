import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export type TutorialStep = { title: string; body: string };

const TutorialOverlay = ({
  steps,
  step,
  onNext,
  onSkip,
}: {
  steps: TutorialStep[];
  step: number;
  onNext: () => void;
  onSkip: () => void;
}) => {
  const current = steps[step];
  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[900] flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md animate-fade-up rounded-2xl border border-primary/40 bg-card p-6 shadow-elevated">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Quick guide · {step + 1}/{steps.length}
          </span>
          <button type="button" onClick={onSkip} className="rounded-full p-1 text-muted-foreground hover:text-foreground" aria-label="Skip tutorial">
            <X className="h-4 w-4" />
          </button>
        </div>
        <h3 className="font-display text-lg font-bold">{current.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{current.body}</p>
        <div className="mt-5 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={onSkip}>Skip</Button>
          <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={onNext}>
            {step + 1 >= steps.length ? "Got it" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
