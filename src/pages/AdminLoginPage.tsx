import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const { login, isLoading, loginError, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await login(email, password);
    if (success) {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 font-sans relative overflow-hidden">
      {/* ============ Subtle Background Pattern ============ */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #333 1px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* ============ Decorative Blobs ============ */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-400/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      {/* ============ Login Card ============ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-[460px] z-10"
      >
        {/* Top accent gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-rose-500 to-primary rounded-t-[32px]" />

        <div className="bg-white border border-zinc-100 rounded-b-[32px] shadow-xl shadow-zinc-200/50 overflow-hidden">
          <div className="p-10 sm:p-12">
            {/* ===== Brand Header ===== */}
            <div className="flex flex-col items-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-primary to-rose-500 text-white shadow-xl shadow-primary/30 mb-5"
              >
                <ShieldCheck className="w-8 h-8" />
              </motion.div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                Triptay
                <span className="bg-gradient-to-r from-primary to-rose-500 bg-clip-text text-transparent">
                  {" "}Hub
                </span>
              </h1>
              <p className="text-[10px] text-zinc-400 font-bold tracking-normal mt-1.5 uppercase">
                Operations Control Console — Administrators Only
              </p>
            </div>

            {/* ===== Error Alert ===== */}
            {loginError && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 flex-shrink-0 mt-0.5">
                  <span className="text-red-500 text-xs font-black">!</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-red-600">Authentication Failed</p>
                  <p className="text-xs text-red-500/80 mt-0.5">{loginError}</p>
                </div>
              </motion.div>
            )}

            {/* ===== Login Form ===== */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-normal mb-2">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@triptay.com"
                    required
                    autoFocus
                    className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-900 text-sm font-semibold placeholder:text-zinc-400 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-normal mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-11 pr-12 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-900 text-sm font-semibold placeholder:text-zinc-400 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.99 }}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-rose-500 text-white font-black text-sm rounded-2xl tracking-wide uppercase shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Access Control Panel
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* ===== Footer ===== */}
            <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-normal">
                  Triptay Enterprise Console v3.0
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}