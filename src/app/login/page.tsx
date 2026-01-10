"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, AlertTriangle, Fingerprint, Eye, EyeOff, Terminal, Briefcase, Truck, Ghost, Check, Loader2, Calendar, Smartphone, Mail, Globe, Lock } from "lucide-react";
import { useUser, UserProfile } from "@/lib/UserContext";
import { useSonic, ImpactStyle } from "@/lib/SonicContext";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

const circles = [
    { id: "Netrunner", name: "Netrunner", icon: Terminal, color: "text-cyan-400", desc: "Tech & Data enthusiasts." },
    { id: "Corp", name: "Corporate", icon: Briefcase, color: "text-blue-400", desc: "Professional establishment." },
    { id: "Drifter", name: "Drifter", icon: Truck, color: "text-amber-400", desc: "Digital nomads." },
    { id: "Ghost", name: "Ghost Circle", icon: Ghost, color: "text-zinc-400", desc: "Privacy focused." },
];

function LoginForm() {
  const { login, signup, firebaseUser, loading } = useUser();
  const { playClick, playHaptic } = useSonic();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [verificationSent, setVerificationSent] = useState(false);
  
  // Registration State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCircle, setSelectedCircle] = useState<UserProfile['faction']>("Drifter");

  // OTP State
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
      let timer: NodeJS.Timeout;
      if (resendCountdown > 0) {
          timer = setInterval(() => {
              setResendCountdown((prev) => prev - 1);
          }, 1000);
      }
      return () => clearInterval(timer);
  }, [resendCountdown]);

  useEffect(() => {
      return () => {
          if (recaptchaVerifierRef.current) {
              recaptchaVerifierRef.current.clear();
              recaptchaVerifierRef.current = null;
          }
      };
  }, []);

  const setupRecaptcha = () => {
      if (!recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
              'size': 'normal',
              'theme': 'dark',
              'callback': () => {}
          });
      }
  };

  const requestOtp = async () => {
      if (!phone || phone.length < 10) {
          setError("Please enter a valid phone number.");
          return;
      }
      setIsSendingOtp(true);
      setError(null);
      try {
          setupRecaptcha();
          if (!recaptchaVerifierRef.current) throw new Error("Recaptcha failed to initialize.");
          
          const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`; 
          // Note: In a real app, you might want strict formatting. Assuming user enters country code or we default.
          // For now, let's assume user enters e.g. +1... or we might need to prepend if missing.
          // Let's rely on user entering full e164 or just try as is if it has +. 
          
          const appVerifier = recaptchaVerifierRef.current;
          const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
          setConfirmationResult(confirmation);
          setResendCountdown(30);
          playClick(800, 0.1, 'triangle');
      } catch (err: any) {
          console.error("OTP Error:", err);
          setError(err.message || "Failed to send OTP. Try again.");
          if (recaptchaVerifierRef.current) {
             recaptchaVerifierRef.current.clear();
             recaptchaVerifierRef.current = null;
          }
      } finally {
          setIsSendingOtp(false);
      }
  };

  const verifyOtp = async () => {
      if (!otp || !confirmationResult) return;
      setIsVerifyingOtp(true);
      try {
          // This signs the user in with phone auth
          await confirmationResult.confirm(otp);
          
          // Verify success!
          setIsPhoneVerified(true);
          setConfirmationResult(null); // Clear OTP UI
          playHaptic(ImpactStyle.Heavy);
          playClick(1000, 0.2, 'sine');
          
          // IMPORTANT: The user is now signed in as the Phone User. 
          // We must sign them out so they can proceed to create their main account.
          await auth.signOut();
          
      } catch (err: any) {
          console.error("OTP Verification Error:", err);
          setError("Invalid OTP. Please check code.");
      } finally {
          setIsVerifyingOtp(false);
      }
  };

  useEffect(() => {
    // Prevent redirect during registration flow (specifically phone auth step)
    if (mode === 'register') return;

    if (firebaseUser && !loading) {
      const redirectPath = searchParams.get('redirect');
      router.push(redirectPath || "/home");
    }
  }, [firebaseUser, loading, router, searchParams, mode]);

  const validateAge = (dateString: string) => {
      const today = new Date();
      const birthDate = new Date(dateString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }
      return age >= 16;
  };

  const validateEmail = (email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAction = async () => {
    setIsAuthenticating(true);
    setError(null);
    playClick(600, 0.1, 'sine');
    playHaptic(ImpactStyle.Medium);

    try {
      if (mode === 'login') {
          if (!email || !password) throw new Error("Please enter your credentials.");
          await new Promise(resolve => setTimeout(resolve, 1000));
          await login(email, password);
      } else {
          if (!fullName || !handle || !email || !password || !dob || !phone) throw new Error("All fields are required.");
          if (!validateEmail(email)) throw new Error("Please enter a valid email address.");
          if (!validateAge(dob)) throw new Error("You must be 16 or older to join.");
          if (password.length < 6) throw new Error("Password must be at least 6 characters.");
          if (handle.length < 3) throw new Error("Username is too short.");
          if (!isPhoneVerified) throw new Error("Please verify your phone number to continue.");

          await new Promise(resolve => setTimeout(resolve, 2000));

          const { collection, query, where, getDocs } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");
          const q = query(collection(db, "users"), where("handle", "==", handle.toUpperCase()));
          const snap = await getDocs(q);
          if (!snap.empty) throw new Error("This username is already taken.");

          await signup({
              email,
              password,
              handle: handle.toUpperCase(),
              fullName,
              dob,
              phoneNumber: phone,
              faction: selectedCircle
          });
          setVerificationSent(true);
          setIsAuthenticating(false);
          return;
      }
    } catch (err: any) {
      console.error(err);
      let msg = "Connection timed out. Please try again.";
      if (err.code === 'auth/invalid-credential') msg = "Invalid email or password.";
      if (err.code === 'auth/email-already-in-use') msg = "This email is already registered.";
      if (err.message) msg = err.message;
      
      setError(msg);
      setIsAuthenticating(false);
      playClick(150, 0.3, 'sawtooth');
      playHaptic(ImpactStyle.Heavy);
    }
  };

  return (
    <div className="min-h-screen w-full bg-primary-bg flex flex-col items-center justify-center p-6 relative overflow-y-auto font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md my-12 relative z-10">
        
        <div className="flex flex-col items-center mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-brand-orange shadow-[0_0_8px_#EB7955]" />
            <span className="text-sm font-redressed tracking-[0.2em] text-brand-orange/80 whitespace-nowrap">
                A <span className="font-blackjack text-3xl mx-1">KM18</span> Production
            </span>
            <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-brand-orange shadow-[0_0_8px_#EB7955]" />
          </motion.div>
          <div className="w-16 h-16 bg-accent-1/10 rounded-2xl flex items-center justify-center mb-4 border border-accent-1/30 shadow-[0_0_20px_rgba(0,212,229,0.1)]">
            <Shield className="w-8 h-8 text-accent-1" />
          </div>
          <h1 className="text-4xl font-black text-primary-text tracking-tighter uppercase italic">ABHED</h1>
          <span className="text-[10px] font-bold tracking-[0.4em] text-accent-1 uppercase opacity-70">Neural Security</span>
        </div>

        <div className="bg-secondary-bg/40 backdrop-blur-2xl border border-border-color rounded-[2.5rem] p-8 shadow-2xl">
            
            {verificationSent ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                        <Mail className="w-10 h-10 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-black text-primary-text mb-2 uppercase italic tracking-wider">Verification Sent</h3>
                    <p className="text-secondary-text text-xs mb-8 leading-relaxed font-mono">
                        Secure link dispatched to <span className="text-accent-1 font-bold">{email}</span>.
                        <br/>Initialize verification sequence to proceed.
                    </p>
                    <button onClick={() => { setVerificationSent(false); setMode('login'); }} className="bg-accent-1 hover:bg-white text-black font-black py-4 px-8 rounded-xl uppercase tracking-widest text-xs transition-all shadow-lg shadow-accent-1/20">
                        Return to Sign In
                    </button>
                </motion.div>
            ) : (
                <>
            <div className="flex p-1 bg-black/40 rounded-2xl mb-8 border border-white/5">
                <button onClick={() => setMode('login')} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'login' ? 'bg-accent-1 text-black shadow-lg' : 'text-secondary-text'}`}>Sign In</button>
                <button onClick={() => setMode('register')} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'register' ? 'bg-accent-1 text-black shadow-lg' : 'text-secondary-text'}`}>Join Now</button>
            </div>

            <div className="space-y-4">
                <AnimatePresence mode="wait">
                    {mode === 'register' ? (
                        <motion.div key="reg" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            <InputGroup label="Full Name" icon={User} value={fullName} onChange={setFullName} placeholder="Real Name" />
                            <InputGroup label="Username" icon={Terminal} value={handle} onChange={setHandle} placeholder="Unique Username" />
                            <InputGroup label="Email Address" icon={Mail} value={email} onChange={setEmail} placeholder="personal@email.com" />
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-secondary-text ml-4">Phone Verification {isPhoneVerified && <span className="text-green-400 ml-2">(VERIFIED)</span>}</label>
                                <div className="relative flex gap-2">
                                    <div className="relative flex-1">
                                        <input 
                                            type="tel" 
                                            value={phone} 
                                            onChange={(e) => setPhone(e.target.value)} 
                                            disabled={isPhoneVerified || !!confirmationResult}
                                            placeholder="+1 000 000 0000" 
                                            className={`w-full bg-black/40 border ${isPhoneVerified ? 'border-green-500/50 text-green-400' : 'border-border-color'} rounded-2xl px-5 py-4 pl-12 text-primary-text placeholder:text-secondary-text/30 focus:border-accent-1 outline-none transition-all disabled:opacity-50`} 
                                        />
                                        <Smartphone className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 ${isPhoneVerified ? 'text-green-400' : 'text-secondary-text'}`} />
                                    </div>
                                    {!isPhoneVerified && (
                                        <button 
                                            onClick={requestOtp} 
                                            disabled={isSendingOtp || resendCountdown > 0 || !phone}
                                            className="px-4 bg-accent-1/10 border border-accent-1/50 text-accent-1 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-accent-1 hover:text-black transition-all disabled:opacity-30 disabled:pointer-events-none whitespace-nowrap min-w-[80px]"
                                        >
                                            {isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                                confirmationResult 
                                                    ? (resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code')
                                                    : 'Verify'
                                            )}
                                        </button>
                                    )}
                                </div>
                                <div id="recaptcha-container" className="flex justify-center my-2"></div>
                                
                                <AnimatePresence>
                                    {confirmationResult && !isPhoneVerified && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-2">
                                            <div className="relative flex gap-2">
                                                <div className="relative flex-1">
                                                    <input 
                                                        type="text" 
                                                        value={otp} 
                                                        onChange={(e) => setOtp(e.target.value)} 
                                                        placeholder="Enter OTP Code" 
                                                        className="w-full bg-black/40 border border-border-color rounded-2xl px-5 py-4 pl-12 text-primary-text placeholder:text-secondary-text/30 focus:border-accent-1 outline-none transition-all" 
                                                    />
                                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
                                                </div>
                                                <button 
                                                    onClick={verifyOtp} 
                                                    disabled={isVerifyingOtp || !otp}
                                                    className="px-4 bg-green-500/10 border border-green-500/50 text-green-400 rounded-2xl text-[10px] font-black uppercase tracking-wider hover:bg-green-500 hover:text-black transition-all disabled:opacity-30 disabled:pointer-events-none"
                                                >
                                                    {isVerifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <InputGroup label="Birth Date" icon={Calendar} value={dob} onChange={setDob} placeholder="YYYY-MM-DD" type="date" />
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-secondary-text ml-4">Join a Circle</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {circles.map((f) => (
                                        <button key={f.id} onClick={() => setSelectedCircle(f.id as any)} className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${selectedCircle === f.id ? 'bg-accent-1/10 border-accent-1 text-accent-1' : 'bg-black/20 border-white/5 text-secondary-text hover:border-white/10'}`}>
                                            <f.icon className="w-4 h-4" />
                                            <span className="text-[9px] font-bold uppercase">{f.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4 py-4">
                            <InputGroup label="Access Key" icon={Globe} value={email} onChange={setEmail} placeholder="Email, Handle, or Phone Number" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-2">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-secondary-text ml-4">Secure Password</label>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-black/40 border border-border-color rounded-2xl px-5 py-4 text-primary-text placeholder:text-secondary-text/30 focus:border-accent-1 outline-none transition-all" />
                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-accent-1">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <button onClick={handleAction} disabled={isAuthenticating} className="w-full bg-accent-1 hover:bg-accent-1/90 text-black font-black py-5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 mt-6 flex items-center justify-center gap-3 shadow-xl shadow-accent-1/10">
                    {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                    <span className="uppercase text-xs tracking-widest font-bold">{isAuthenticating ? 'Connecting...' : (mode === 'login' ? 'Sign In' : 'Create Account')}</span>
                </button>
            </div>
            </>
            )}
        </div>

        {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-[10px] font-bold uppercase mx-auto">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
            </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function InputGroup({ label, icon: Icon, value, onChange, placeholder, type = "text" }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-widest text-secondary-text ml-4">{label}</label>
            <div className="relative">
                <input 
                    type={type} 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)} 
                    placeholder={placeholder} 
                    className="w-full h-14 bg-black/40 border border-border-color rounded-2xl px-5 pl-12 text-primary-text placeholder:text-secondary-text/30 focus:border-accent-1 outline-none transition-all appearance-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100" 
                />
                <Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text pointer-events-none" />
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-primary-bg"><Loader2 className="w-10 h-10 animate-spin text-accent-1" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
