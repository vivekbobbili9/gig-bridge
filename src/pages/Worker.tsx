import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGigStore, datesBetween, type Gig } from "@/store/gigStore";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import SatelliteMap from "@/components/SatelliteMap";
import RouteMap from "@/components/RouteMap";
import { ArrowLeft, Bell, Calendar, CheckCircle2, Clock, Globe, IndianRupee, MapPin, Navigation, Package, ShieldCheck, ShieldAlert, Truck, User, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import { LANGS, type Lang, getStoredLang, setStoredLang, makeT, tr } from "@/i18n/worker";

type SortKey = "pay" | "hours" | "distance";

const Worker = () => {
  const { gigs, workerOnline, workerLocation, accepted, kyc, penalties, toggleOnline, acceptGig, cancelGig, workerNotices } = useGigStore();
  const [selected, setSelected] = useState<Gig | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("pay");
  const [lang, setLang] = useState<Lang>(getStoredLang());
  const [langOpen, setLangOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState<Gig | null>(null);
  const lastWorkerNoticeRef = useRef<string | null>(null);
  const t = useMemo(() => makeT(lang), [lang]);
  const changeLang = (l: Lang) => { setLang(l); setStoredLang(l); setLangOpen(false); };

  const acceptedGigIds = accepted.map((a) => a.gigId);
  const pendingPenalty = penalties.find((p) => !p.applied);

  const visibleGigs = useMemo(() => {
    if (!workerOnline) return [];
    const list = gigs.filter((g) => g.status === "open");
    return [...list].sort((a, b) => {
      if (sortKey === "pay") return b.payPerWorker - a.payPerWorker;
      if (sortKey === "distance") return a.distanceKm - b.distanceKm;
      return (a.loadingHours + a.unloadingHours) - (b.loadingHours + b.unloadingHours);
    });
  }, [gigs, workerOnline, sortKey]);

  const earnings = useMemo(() => accepted.reduce((sum, a) => {
    const g = gigs.find((x) => x.id === a.gigId);
    return sum + (g?.payPerWorker ?? 0) * a.dates.length;
  }, 0), [accepted, gigs]);

  const currentLang = LANGS.find((l) => l.code === lang)!;
  const kycVerified = kyc.status === "verified";

  useEffect(() => {
    if (workerNotices.length === 0) return;
    const newest = workerNotices[0];
    if (lastWorkerNoticeRef.current === newest.id) return;
    lastWorkerNoticeRef.current = newest.id;
    if (newest.type === "company_cancelled") toast.error(newest.message);
    else toast.info(newest.message);
  }, [workerNotices]);

  const handleAccept = (g: Gig, dates: string[]) => {
    if (!kycVerified) {
      toast.error(t("kyc_block"));
      return;
    }
    acceptGig(g.id, dates);
    toast.success(t("accepted_toast", { n: dates.length, s: dates.length > 1 ? "s" : "" }));
    if (pendingPenalty) {
      toast.info(t("penalty_note", { p: pendingPenalty.amount, c: tr(pendingPenalty.owedToCompany, lang) }));
    }
    setSelected(null);
  };

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background lg:my-6 lg:rounded-[2.5rem] lg:border-8 lg:border-border lg:shadow-elevated lg:overflow-hidden">
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon"><Link to="/"><ArrowLeft className="h-5 w-5" /></Link></Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-sm font-bold leading-tight">{t("hi_name")}</div>
              <div className="text-xs text-muted-foreground">{t("rating")}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setLangOpen(true)} className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1.5 text-xs font-semibold transition-base hover:border-primary hover:text-primary" aria-label={t("language")}>
              <Globe className="h-3.5 w-3.5" />{currentLang.native}
            </button>
            <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
          </div>
        </div>
        {/* KYC pill */}
        <div className="px-4 pb-3">
          <Link to="/worker/kyc" className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-base ${kycVerified ? "border-success/40 bg-success/10 text-success" : "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:border-amber-500"}`}>
            <span className="flex items-center gap-1.5">
              {kycVerified ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
              {kycVerified ? t("kyc_done") : kyc.status === "pending" ? t("kyc_pending") : t("kyc_none")}
            </span>
            {!kycVerified && <span className="text-[10px] uppercase tracking-wider opacity-80">→</span>}
          </Link>
        </div>
      </header>

      <section className="px-4 pt-4">
        <div className={`flex items-center justify-between rounded-2xl border p-4 transition-base ${workerOnline ? "border-primary/40 bg-primary/10 shadow-glow" : "border-border bg-muted/40"}`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`h-3 w-3 rounded-full ${workerOnline ? "bg-primary" : "bg-muted-foreground/40"}`} />
              {workerOnline && <div className="absolute inset-0 animate-pulse-ring rounded-full" />}
            </div>
            <div>
              <div className="font-display text-base font-bold">{workerOnline ? t("online") : t("offline")}</div>
              <div className="text-xs text-muted-foreground">{workerOnline ? t("gigs_near", { n: visibleGigs.length }) : t("turn_on")}</div>
            </div>
          </div>
          <Switch checked={workerOnline} onCheckedChange={toggleOnline} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Mini icon={Wallet} label={t("earnings")} value={`₹${earnings}`} tone="primary" />
          <Mini icon={CheckCircle2} label={t("accepted")} value={`${accepted.length}`} tone="accent" />
          <Mini icon={Navigation} label={t("distance")} value="12 km" tone="pink" />
        </div>
      </section>

      <section className="mt-5 px-4">
        <div className="relative h-72 overflow-hidden rounded-2xl border border-border shadow-elevated">
          <SatelliteMap gigs={visibleGigs} workerLocation={workerLocation} acceptedGigIds={acceptedGigIds} onSelect={(g) => setSelected(g)} zoom={11} />
          {!workerOnline && (
            <div className="absolute inset-0 z-[400] flex items-center justify-center bg-background/85 backdrop-blur-sm">
              <div className="text-center">
                <div className="font-display text-base font-bold">{t("offline")}</div>
                <div className="text-xs text-muted-foreground">{t("offline_overlay")}</div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 px-4 pb-24">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{t("available")}</h2>
          <span className="text-xs text-muted-foreground">{t("gigs_count", { n: visibleGigs.length })}</span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
          {([
            { k: "pay", label: t("sort_pay"), icon: IndianRupee },
            { k: "distance", label: t("sort_near"), icon: Navigation },
            { k: "hours", label: t("sort_short"), icon: Clock },
          ] as { k: SortKey; label: string; icon: any }[]).map((tab) => (
            <button key={tab.k} onClick={() => setSortKey(tab.k)} className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-base ${sortKey === tab.k ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <tab.icon className="h-3.5 w-3.5" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-3 space-y-3">
          {visibleGigs.map((g) => {
            const isAccepted = acceptedGigIds.includes(g.id);
            const totalDays = datesBetween(g.startDate, g.endDate).length;
            const totalHours = g.loadingHours + g.unloadingHours;
            return (
              <button key={g.id} onClick={() => setSelected(g)} className="group relative block w-full overflow-hidden rounded-2xl border border-border bg-card p-4 text-left transition-base hover:border-primary hover:shadow-elevated">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-primary opacity-10 blur-2xl" />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-accent">{tr(g.companyName, lang)}</div>
                    <div className="mt-0.5 truncate font-display text-base font-bold">{tr(g.title, lang)}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {tr(g.location, lang)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-extrabold text-primary">₹{g.payPerWorker}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("per_day")}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Pill icon={Navigation} tone="pink">{g.distanceKm} km</Pill>
                  <Pill icon={Clock} tone="accent">{t("hours_per_day", { h: totalHours })}</Pill>
                  <Pill icon={Calendar} tone="primary">{totalDays} {totalDays > 1 ? t("days") : t("day")}</Pill>
                  {isAccepted && <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 font-semibold text-success"><CheckCircle2 className="h-3 w-3" /> {t("accepted_tag")}</span>}
                </div>
              </button>
            );
          })}
          {workerOnline && visibleGigs.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{t("none_now")}</div>
          )}
        </div>
      </section>

      {selected && (
        <GigSheet
          gig={selected}
          lang={lang}
          existingDates={accepted.find((a) => a.gigId === selected.id)?.dates ?? []}
          onClose={() => setSelected(null)}
          onAccept={(dates) => handleAccept(selected, dates)}
          onCancelGig={() => setConfirmCancel(selected)}
          workerLocation={workerLocation}
          t={t}
        />
      )}

      {confirmCancel && (
        <CancelDialog gig={confirmCancel} lang={lang} t={t} onClose={() => setConfirmCancel(null)} onConfirm={() => {
          cancelGig(confirmCancel.id);
          toast.success(t("cancel_gig"));
          setConfirmCancel(null);
          setSelected(null);
        }} />
      )}

      {langOpen && (
        <div className="fixed inset-0 z-[600] flex items-end justify-center bg-background/70 backdrop-blur-sm" onClick={() => setLangOpen(false)}>
          <div className="w-full max-w-md animate-fade-up rounded-t-3xl border-t border-border bg-card p-6 shadow-elevated" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
            <div className="mb-3 flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /><h3 className="font-display text-lg font-bold">{t("language")}</h3></div>
            <div className="grid grid-cols-2 gap-2">
              {LANGS.map((l) => (
                <button key={l.code} onClick={() => changeLang(l.code)} className={`flex flex-col items-start rounded-xl border-2 p-3 text-left transition-base ${lang === l.code ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-muted/30 hover:border-primary/50"}`}>
                  <span className="font-display text-base font-extrabold">{l.native}</span>
                  <span className="text-xs text-muted-foreground">{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Mini = ({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "primary" | "accent" | "pink" }) => {
  const map = { primary: "text-primary", accent: "text-accent", pink: "text-fuchsia-400" } as const;
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${map[tone]}`}><Icon className="h-3 w-3" /> {label}</div>
      <div className="mt-0.5 font-display text-lg font-extrabold">{value}</div>
    </div>
  );
};

const Pill = ({ icon: Icon, children, tone = "muted" }: { icon: any; children: React.ReactNode; tone?: "muted" | "primary" | "accent" | "pink" }) => {
  const tones = { muted: "bg-muted text-foreground", primary: "bg-primary/15 text-primary", accent: "bg-accent/15 text-accent", pink: "bg-fuchsia-500/15 text-fuchsia-300" };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${tones[tone]}`}><Icon className="h-3 w-3" /> {children}</span>;
};

const GigSheet = ({ gig, lang, existingDates, onClose, onAccept, onCancelGig, workerLocation, t }: { gig: Gig; lang: Lang; existingDates: string[]; onClose: () => void; onAccept: (dates: string[]) => void; onCancelGig: () => void; workerLocation: { lat: number; lng: number }; t: ReturnType<typeof makeT> }) => {
  const allDates = datesBetween(gig.startDate, gig.endDate);
  const [picked, setPicked] = useState<string[]>(existingDates.length ? existingDates : allDates);
  const [showRoute, setShowRoute] = useState(false);
  const isAlreadyAccepted = existingDates.length > 0;

  const toggle = (d: string) => setPicked((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d].sort()));
  const fmt = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return { day: d.toLocaleDateString(undefined, { weekday: "short" }), date: d.getDate() };
  };
  const total = picked.length * gig.payPerWorker;

  return (
    <div className="fixed inset-0 z-[500] flex items-end justify-center bg-background/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md animate-fade-up rounded-t-3xl border-t border-border bg-card p-6 shadow-elevated max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">{tr(gig.companyName, lang)}</div>
            <div className="mt-0.5 font-display text-xl font-extrabold leading-tight">{tr(gig.title, lang)}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {tr(gig.location, lang)} · {gig.distanceKm} km</div>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-extrabold text-primary">₹{gig.payPerWorker}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("per_day")}</div>
          </div>
        </div>

        {/* Directions toggle */}
        <button onClick={() => setShowRoute((v) => !v)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 py-2.5 text-sm font-bold text-primary transition-base hover:bg-primary/20">
          <Navigation className="h-4 w-4" /> {showRoute ? "Hide route" : t("directions")}
        </button>

        {showRoute && (
          <div className="mt-3 h-64 overflow-hidden rounded-2xl border border-border">
            <RouteMap from={workerLocation} to={{ lat: gig.lat, lng: gig.lng }} destLabel={tr(gig.location, lang)} />
          </div>
        )}

        <div className="mt-5 grid grid-cols-4 gap-2">
          <Box icon={Package} label={t("loading")} value={`${gig.loadingHours}h`} />
          <Box icon={Truck} label={t("unloading")} value={`${gig.unloadingHours}h`} />
          <Box icon={Clock} label={t("start")} value={gig.dailyStartTime} />
          <Box icon={Clock} label={t("end")} value={gig.dailyEndTime} />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("pick_days")}</div>
            <button onClick={() => setPicked(picked.length === allDates.length ? [] : allDates)} className="text-xs font-semibold text-accent hover:underline">
              {picked.length === allDates.length ? t("clear") : t("all_days")}
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allDates.map((d) => {
              const on = picked.includes(d);
              const f = fmt(d);
              return (
                <button key={d} onClick={() => toggle(d)} className={`flex min-w-[58px] flex-col items-center rounded-xl border-2 px-3 py-2 transition-base ${on ? "border-primary bg-primary text-primary-foreground shadow-glow" : "border-border bg-muted/40 text-foreground"}`}>
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{f.day}</span>
                  <span className="font-display text-lg font-extrabold leading-none">{f.date}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-muted/50 p-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("your_total")}</div>
              <div className="font-display text-2xl font-extrabold text-primary">₹{total}</div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {picked.length} {picked.length !== 1 ? t("days") : t("day")} × ₹{gig.payPerWorker}
            </div>
          </div>
          {gig.notes && <p className="mt-3 text-sm text-foreground">{tr(gig.notes, lang)}</p>}
        </div>

        <div className="mt-5 flex items-center gap-3">
          {isAlreadyAccepted ? (
            <Button variant="ghost" onClick={onCancelGig} className="text-destructive hover:text-destructive">
              <X className="mr-1 h-4 w-4" /> {t("cancel_gig")}
            </Button>
          ) : (
            <Button variant="ghost" onClick={onClose}>{t("skip")}</Button>
          )}
          <Button disabled={picked.length === 0} onClick={() => onAccept(picked)} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {t("accept_n_days", { n: picked.length, s: picked.length !== 1 ? "s" : "" })}
          </Button>
        </div>
      </div>
    </div>
  );
};

const CancelDialog = ({ gig, lang, t, onClose, onConfirm }: { gig: Gig; lang: Lang; t: ReturnType<typeof makeT>; onClose: () => void; onConfirm: () => void }) => {
  const penalty = Math.round(gig.payPerWorker * 0.1);
  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-background/80 p-4 backdrop-blur" onClick={onClose}>
      <div className="w-full max-w-sm animate-fade-up rounded-2xl border border-destructive/40 bg-card p-6 shadow-elevated" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center gap-2 text-destructive">
          <ShieldAlert className="h-5 w-5" />
          <h3 className="font-display text-lg font-bold">{t("cancel_gig")}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{t("cancel_warn", { p: penalty, c: tr(gig.companyName, lang) })}</p>
        <div className="mt-5 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">{t("keep")}</Button>
          <Button onClick={onConfirm} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("cancel_confirm")}</Button>
        </div>
      </div>
    </div>
  );
};

const Box = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-muted/30 p-2 text-center">
    <Icon className="mx-auto h-4 w-4 text-accent" />
    <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="font-display text-xs font-extrabold">{value}</div>
  </div>
);

export default Worker;
