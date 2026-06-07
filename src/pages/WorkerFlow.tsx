import React, { useState, useRef, useEffect } from "react";
import { useOnboardingStore, OnboardingStep } from "@/store/onboardingStore";
import { LANGS, makeT, setStoredLang } from "@/i18n/worker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Pencil,
  Camera,
  MapPin,
  Phone as PhoneIcon,
  Search,
  FileText,
  CreditCard,
  User,
  Plus
} from "lucide-react";
import { toast } from "sonner";

const WorkerFlow = () => {
  const {
    step, setStep,
    language, setLanguage,
    phone, setPhone,
    firstName, lastName, address, setProfile,
    region, setRegion,
    kyc, setKycStatus,
    reset
  } = useOnboardingStore();

  const [activeKyc, setActiveKyc] = useState<string | null>(null);
  const [kycValue, setKycValue] = useState("");
  const [kycValue2, setKycValue2] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // OTP Refs
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const t = makeT(language);

  // Transition helper
  const next = (s: OnboardingStep) => setStep(s);

  // Profile completion check
  const isProfileComplete = (firstName || "").trim().length > 0 && (lastName || "").trim().length > 0 && (address || "").trim().length > 0;

  // Calculate Progress
  const totalSteps = 7; // Phone, Basic, Aadhar, PAN, DL, Bank, UPI
  let completed = 1; // Phone is verified during flow
  if (isProfileComplete) completed++;
  if (kyc.aadhar) completed++;
  if (kyc.pan) completed++;
  if (kyc.drivingLicense) completed++;
  if (kyc.bankAccount) completed++;
  if (kyc.upiId) completed++;
  const progressPercent = Math.round((completed / totalSteps) * 100);

  // --- UI WRAPPER ---
  const MobileWrapper = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className="min-h-screen bg-black flex justify-center overflow-hidden font-sans">
      <div className={`w-full max-w-md min-h-screen relative flex flex-col text-white ${className}`}>
        {children}
      </div>
    </div>
  );

  // --- OTP Logic ---
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 0 && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !((e.target as any).value) && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // --- RENDERING STEPS ---

  // 1. Splash
  if (step === "splash") {
    return (
      <MobileWrapper className="bg-forest items-center justify-center p-8">
        <div className="flex flex-col items-center flex-1 justify-center">
          <div className="w-24 h-24 bg-green-500/80 rounded-2xl flex items-center justify-center mb-8">
            <ShieldCheck size={48} className="text-white" />
          </div>
          <div className="flex gap-1.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-white/40" />
            <div className="w-2 h-2 rounded-full bg-white" />
            <div className="w-2 h-2 rounded-full bg-white/40" />
            <div className="w-2 h-2 rounded-full bg-white/40" />
          </div>
          <p className="text-xs font-bold text-white/50 tracking-widest uppercase mb-12">your trusted finance partner</p>
        </div>
        <button
          onClick={() => next("auth-choice")}
          className="w-48 h-12 bg-transparent border border-white/40 text-white rounded-xl flex items-center justify-center gap-2 mb-12 hover:bg-white/5 transition-all"
        >
          <span className="font-bold">Get Started</span>
          <ArrowRight size={18} />
        </button>
      </MobileWrapper>
    );
  }

  // 2. Auth Choice
  if (step === "auth-choice") {
    return (
      <MobileWrapper className="bg-[#121212] p-8">
        <div className="flex flex-col items-center flex-1 pt-12">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-8">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-white">Welcome</h1>
          <p className="text-slate-400 font-medium mb-12">Sign up for a new account or log in</p>

          <div className="w-full space-y-4 max-w-xs">
            <button
              onClick={() => next("language")}
              className="w-full h-14 bg-[#1A1C1E] border border-white/10 rounded-xl font-bold text-lg hover:bg-white/5 transition-all"
            >
              Create Account
            </button>
            <button
              onClick={() => toast.info("Login flow coming soon")}
              className="w-full h-14 bg-[#1A1C1E] border border-white/10 rounded-xl font-bold text-lg hover:bg-white/5 transition-all"
            >
              Log In
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 text-center mb-8 opacity-60">
          By continuing you agree to our Terms & Privacy Policy
        </p>
      </MobileWrapper>
    );
  }

  // 3. Language Selection
  if (step === "language") {
    return (
      <MobileWrapper className="bg-[#121212]">
        <header className="p-4 flex items-center gap-4 border-b border-white/5">
          <button onClick={() => next("auth-choice")} className="p-2 bg-[#1A1C1E] rounded-lg border border-white/5">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-bold">Select Language</h2>
        </header>

        <div className="p-6">
          <p className="text-slate-300 mb-8 font-medium">Choose your preferred language for the app.</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLanguage(l.code);
                  setStoredLang(l.code);
                }}
                className={`p-5 rounded-xl border-2 text-left transition-all relative ${
                  language === l.code ? "border-green-500 bg-green-500/5" : "border-white/5 bg-[#1A1C1E]"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                   <div className="bg-white/5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-slate-500">
                      {l.code === 'en' ? 'GB' : 'IN'}
                   </div>
                   {language === l.code && <Check size={14} className="text-green-500" strokeWidth={3} />}
                </div>
                <p className={`font-bold ${language === l.code ? 'text-green-500' : 'text-white'}`}>{l.native}</p>
                <p className="text-xs text-slate-500 font-medium">{l.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto p-6 bg-[#121212] border-t border-white/5">
          <button
            onClick={() => next("phone")}
            className="w-full h-14 bg-[#1A1C1E] border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/5"
          >
            Continue <ArrowRight size={18} />
          </button>
        </div>
      </MobileWrapper>
    );
  }

  // 4. Phone
  if (step === "phone") {
    return (
      <MobileWrapper className="bg-[#121212]">
        <header className="p-4 flex items-center gap-4 border-b border-white/5">
          <button onClick={() => next("language")} className="p-2 bg-[#1A1C1E] rounded-lg border border-white/5">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-bold">Phone Verification</h2>
        </header>

        <div className="p-6 pt-10">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 block">Mobile Number</label>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-4 bg-[#1A1C1E] border border-white/5 rounded-xl text-slate-300 font-bold text-sm">
              <span className="text-[9px] font-black text-slate-500">IN</span> +91
            </div>
            <input
              type="tel"
              placeholder="Enter 10-digit number"
              className="flex-1 h-14 bg-[#1A1C1E] border border-white/5 rounded-xl px-4 text-white font-bold placeholder:text-white/10 outline-none focus:border-green-500/50"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="mt-auto p-6 bg-[#121212] border-t border-white/5">
          <button
            onClick={() => next("otp")}
            disabled={phone.length < 10}
            className="w-full h-14 bg-[#1A1C1E] border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 disabled:opacity-20 transition-all"
          >
            Send OTP <ArrowRight size={18} className="opacity-60" />
          </button>
        </div>
      </MobileWrapper>
    );
  }

  // 5. OTP
  if (step === "otp") {
    return (
      <MobileWrapper className="bg-[#121212]">
        <header className="p-4 flex items-center gap-4 border-b border-white/5">
          <button onClick={() => next("phone")} className="p-2 bg-[#1A1C1E] rounded-lg border border-white/5">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-bold">OTP Verification</h2>
        </header>

        <div className="p-6 pt-10">
          <p className="text-slate-300 mb-8 text-center font-medium">We sent a 6-digit OTP to your number.</p>
          <div className="grid grid-cols-6 gap-2 mb-8">
            {[0,1,2,3,4,5].map(i => (
              <input
                key={i}
                ref={otpRefs[i]}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="otp-box"
                maxLength={1}
                autoFocus={i === 0}
              />
            ))}
          </div>
          <p className="text-xs text-center text-slate-500 font-bold">
            Didn't get a code? <button className="text-green-500 ml-1">Resend OTP</button>
          </p>
        </div>

        <div className="mt-auto p-6 bg-[#121212] border-t border-white/5">
          <button
            onClick={() => next("region")}
            className="w-full h-14 bg-[#1A1C1E] border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
          >
            Verify & Continue <ArrowRight size={18} />
          </button>
        </div>
      </MobileWrapper>
    );
  }

  // 6. Region
  if (step === "region") {
    const states = [
      { n: "Telangana", c: "Hyderabad", i: "🏢" },
      { n: "Andhra Pradesh", c: "Amaravati", i: "🌊" },
      { n: "Tamil Nadu", c: "Chennai", i: "🌴" },
      { n: "Kerala", c: "Thiruvananthapuram", i: "🌿" },
      { n: "Karnataka", c: "Bengaluru", i: "🏛️" },
      { n: "Maharashtra", c: "Mumbai", i: "🌾" }
    ];

    return (
      <MobileWrapper className="bg-[#121212]">
        <header className="p-4 flex items-center gap-4 border-b border-white/5">
          <button onClick={() => next("otp")} className="p-2 bg-[#1A1C1E] rounded-lg border border-white/5">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-bold">Select Region</h2>
        </header>

        <div className="p-6">
          <p className="text-slate-400 mb-8 font-medium">Select your home state for better service.</p>
          <div className="grid grid-cols-2 gap-4">
            {states.map(s => (
              <button
                key={s.n}
                onClick={() => setRegion(s.n)}
                className={`p-6 rounded-xl border-2 text-center transition-all ${
                  region === s.n ? "border-green-500 bg-green-500/5" : "border-white/5 bg-[#1A1C1E]"
                }`}
              >
                <div className="text-3xl mb-3">{s.i}</div>
                <p className="font-bold text-sm mb-1">{s.n}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{s.c}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto p-6 bg-[#121212] border-t border-white/5">
          <button
            onClick={() => next("profile")}
            disabled={!region}
            className="w-full h-14 bg-[#1A1C1E] border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 disabled:opacity-20 transition-all"
          >
            Continue <ArrowRight size={18} />
          </button>
        </div>
      </MobileWrapper>
    );
  }

  // 7. Profile Info
  if (step === "profile") {
    return (
      <MobileWrapper className="bg-[#121212]">
        <header className="p-4 flex items-center gap-4 border-b border-white/5">
          <button onClick={() => next("region")} className="p-2 bg-[#1A1C1E] rounded-lg border border-white/5">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-bold">Profile Information</h2>
        </header>

        <div className="p-6">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-full bg-[#1A1C1E] border-2 border-dashed border-green-500/30 flex items-center justify-center relative mb-3">
              <Camera size={24} className="text-green-500/50" />
              <div className="absolute -top-1 -right-1 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 text-[8px] font-black text-green-500 uppercase tracking-widest">Photo</div>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tap to upload profile photo</p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                <input
                  className="w-full h-14 rounded-xl bg-[#1A1C1E] border border-white/5 px-4 font-bold outline-none focus:border-green-500/40"
                  placeholder="First"
                  value={firstName}
                  onChange={(e) => setProfile({ firstName: e.target.value })}
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                <input
                  className="w-full h-14 rounded-xl bg-[#1A1C1E] border border-white/5 px-4 font-bold outline-none focus:border-green-500/40"
                  placeholder="Last"
                  value={lastName}
                  onChange={(e) => setProfile({ lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Address</label>
              <textarea
                className="w-full h-28 rounded-xl bg-[#1A1C1E] border border-white/5 p-4 font-bold outline-none focus:border-green-500/40 resize-none"
                placeholder="House no, Street, City, Pincode"
                value={address}
                onChange={(e) => setProfile({ address: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 bg-[#121212] border-t border-white/5">
          <button
            onClick={() => next("dashboard")}
            disabled={!isProfileComplete}
            className="w-full h-14 bg-[#1A1C1E] border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 disabled:opacity-20 transition-all"
          >
            Create Account <User size={18} className="opacity-60" />
          </button>
        </div>
      </MobileWrapper>
    );
  }

  // 8. Dashboard
  if (step === "dashboard") {
    const kycItems = [
      { key: "aadhar", label: "Aadhar Card", sub: "Government Identity", icon: ShieldCheck, placeholder: "1234 5678 9012" },
      { key: "pan", label: "PAN Card", sub: "Tax Identity", icon: FileText, placeholder: "ABCDE1234F" },
      { key: "drivingLicense", label: "Driving License", sub: "Optional Identity", icon: CreditCard, placeholder: "DL-1234567890" },
    ];

    const paymentItems = [
      { key: "bankAccount", label: "Bank Account", sub: "Account & IFSC details", icon: CreditCard, placeholder: "Account Number", subPlaceholder: "IFSC Code" },
      { key: "upiId", label: "UPI ID", sub: "Linked payment handle", icon: PhoneIcon, placeholder: "username@upi" },
    ];

    const currentItem = [...kycItems, ...paymentItems].find(i => i.key === activeKyc);

    return (
      <MobileWrapper className="bg-dashboard">
        {/* KYC Form Overlay */}
        {activeKyc && currentItem && (
          <div className="fixed inset-0 z-50 bg-[#121212] p-6 flex flex-col">
            <button onClick={() => { setActiveKyc(null); setKycValue(""); setKycValue2(""); }} className="self-start p-2 -ml-2 text-slate-400 mb-8">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-8">Enter {currentItem.label}</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{currentItem.label} Number</label>
                <input
                  className="w-full h-16 rounded-xl bg-[#1A1C1E] border border-white/5 px-6 font-bold outline-none focus:border-green-500/50"
                  placeholder={currentItem.placeholder}
                  value={kycValue}
                  onChange={(e) => setKycValue(e.target.value)}
                  autoFocus
                />
              </div>
              {'subPlaceholder' in currentItem && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{String((currentItem as any).subPlaceholder)}</label>
                  <input
                    className="w-full h-16 rounded-xl bg-[#1A1C1E] border border-white/5 px-6 font-bold outline-none focus:border-green-500/50"
                    placeholder={String((currentItem as any).subPlaceholder)}
                    value={kycValue2}
                    onChange={(e) => setKycValue2(e.target.value)}
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setKycStatus(activeKyc as any, true);
                setActiveKyc(null);
                setKycValue("");
                setKycValue2("");
                toast.success(`${currentItem.label} Saved!`);
              }}
              className="w-full h-14 bg-green-600 text-white font-bold rounded-xl mt-auto mb-8 shadow-lg shadow-green-600/20"
            >
              Verify & Save
            </button>
          </div>
        )}

        <div className="bg-[#0D3020] p-8 pb-10 rounded-b-[3rem] shadow-xl relative overflow-hidden">
           <div className="flex flex-col gap-1 relative z-10">
              <p className="text-xs font-bold text-green-400/80">Hello 👋</p>
              <h1 className="text-2xl font-black mb-6">{firstName || "User"}</h1>

              <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-black/30 rounded-full w-fit border border-white/5">
                 <ShieldCheck size={12} className="text-green-400" />
                 <span className="text-[10px] font-bold text-white/90">{progressPercent}% complete</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden w-full max-w-[200px] mb-1">
                 <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="flex justify-between w-full max-w-[200px]">
                 <span className="text-[8px] font-black text-white/40 uppercase">Profile Complete</span>
                 <span className="text-[8px] font-black text-white/40 uppercase">{progressPercent}%</span>
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-12">
          {/* PERSONAL DETAILS */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Personal Details</h3>

            {/* Phone Widget */}
            <div className="p-4 rounded-2xl bg-[#E8F5E9] flex items-center justify-between border border-green-500/10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                     <PhoneIcon size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Phone Number</p>
                    <p className="text-xs text-slate-500">+91 {phone}</p>
                  </div>
               </div>
               <div className="flex items-center gap-1.5 text-green-700 text-[10px] font-black uppercase tracking-widest bg-white/50 px-2 py-1 rounded-full">
                  <Check size={12} strokeWidth={4} /> Verified
               </div>
            </div>

            {/* Basic Info Widget */}
            <div className="p-4 rounded-2xl bg-[#1A1C1E] flex items-center justify-between border border-white/5 shadow-sm">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#2A2C2E] flex items-center justify-center border border-white/5">
                     <User size={24} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Basic Information</p>
                    <p className="text-xs text-slate-500">Name & Address</p>
                  </div>
               </div>
               {isProfileComplete ? (
                  <button onClick={() => next("profile")} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10">
                    <Pencil size={14} />
                  </button>
               ) : (
                  <button onClick={() => next("profile")} className="bg-[#4D3319] px-3 py-1.5 rounded-full text-[#FFB74D] text-[9px] font-black uppercase tracking-widest border border-[#FFB74D]/20">
                     Please Fill
                  </button>
               )}
            </div>
          </div>

          {/* KYC DOCUMENTS */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">KYC Documents</h3>

            {!isProfileComplete && (
               <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center gap-3">
                  <Lock size={16} className="text-slate-600" />
                  <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed tracking-wider">Complete your basic information above to unlock KYC document verification.</p>
               </div>
            )}

            <div className={`space-y-3 ${!isProfileComplete ? 'opacity-60' : ''}`}>
               {kycItems.map(item => {
                 const isDone = kyc[item.key as keyof typeof kyc];
                 const isLocked = !isProfileComplete;
                 return (
                   <button
                    key={item.key}
                    onClick={() => !isLocked && setActiveKyc(item.key)}
                    disabled={isLocked}
                    aria-disabled={isLocked}
                    className={`w-full p-4 rounded-2xl bg-[#1A1C1E] flex items-center justify-between border border-white/5 transition-all ${isLocked ? 'cursor-not-allowed' : 'active:scale-[0.98]'}`}
                   >
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#2A2C2E] flex items-center justify-center border border-white/5 relative">
                           <item.icon size={24} className={isDone ? "text-green-500" : "text-slate-500"} />
                           {isLocked && (
                             <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#4D3319] border border-[#FFB74D]/30 flex items-center justify-center">
                                <Lock size={10} className="text-[#FFB74D]" />
                             </div>
                           )}
                        </div>
                        <div className="text-left">
                           <p className="font-bold text-white text-sm">{item.label}</p>
                           <p className="text-[10px] text-slate-500 font-medium">{item.sub}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                        {isLocked ? (
                          <div className="flex items-center gap-1.5 bg-[#4D3319]/40 px-2 py-1 rounded-full text-[#FFB74D]/80 border border-[#FFB74D]/20">
                            <Lock size={10} /> Locked
                          </div>
                        ) : isDone ? (
                          <div className="flex items-center gap-1.5 text-green-500">
                            <Check size={16} strokeWidth={4} />
                            <Pencil size={12} className="text-slate-400" />
                          </div>
                        ) : (
                          <div className="bg-[#4D3319] px-3 py-1.5 rounded-full text-[#FFB74D] text-[9px] font-black uppercase tracking-widest border border-[#FFB74D]/20">
                            Please Fill
                          </div>
                        )}
                     </div>
                   </button>
                 );
               })}
            </div>
          </div>

          {/* PAYMENT DETAILS */}
          <div className="space-y-4 pb-8">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Payment Details</h3>
            <div className={`space-y-3 ${!isProfileComplete ? 'opacity-60' : ''}`}>
               {paymentItems.map(item => {
                 const isDone = kyc[item.key as keyof typeof kyc];
                 const isLocked = !isProfileComplete;
                 return (
                   <button
                    key={item.key}
                    onClick={() => !isLocked && setActiveKyc(item.key)}
                    disabled={isLocked}
                    aria-disabled={isLocked}
                    className={`w-full p-4 rounded-2xl bg-[#1A1C1E] flex items-center justify-between border border-white/5 transition-all ${isLocked ? 'cursor-not-allowed' : 'active:scale-[0.98]'}`}
                   >
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#2A2C2E] flex items-center justify-center border border-white/5 relative">
                           <item.icon size={24} className={isDone ? "text-green-500" : "text-slate-500"} />
                           {isLocked && (
                             <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#4D3319] border border-[#FFB74D]/30 flex items-center justify-center">
                                <Lock size={10} className="text-[#FFB74D]" />
                             </div>
                           )}
                        </div>
                        <div className="text-left">
                           <p className="font-bold text-white text-sm">{item.label}</p>
                           <p className="text-[10px] text-slate-500 font-medium">{item.sub}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                        {isLocked ? (
                          <div className="flex items-center gap-1.5 bg-[#4D3319]/40 px-2 py-1 rounded-full text-[#FFB74D]/80 border border-[#FFB74D]/20">
                            <Lock size={10} /> Locked
                          </div>
                        ) : isDone ? (
                          <div className="flex items-center gap-1.5 text-green-500">
                            <Check size={16} strokeWidth={4} />
                            <Pencil size={12} className="text-slate-400" />
                          </div>
                        ) : (
                          <div className="bg-[#4D3319] px-3 py-1.5 rounded-full text-[#FFB74D] text-[9px] font-black uppercase tracking-widest border border-[#FFB74D]/20">
                            Please Fill
                          </div>
                        )}
                     </div>
                   </button>
                 );
               })}
            </div>
          </div>

        </div>

        <button onClick={reset} className="p-4 text-slate-700 text-[10px] font-black uppercase tracking-widest hover:text-red-500/50 transition-colors mx-auto mb-4">
          Reset Progress
        </button>
      </MobileWrapper>
    );
  }

  return null;
};

export default WorkerFlow;
