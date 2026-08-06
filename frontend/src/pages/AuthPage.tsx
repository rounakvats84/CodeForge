import { useState } from "react";
import axios from "axios";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null); 
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const endpoint = isLogin ? "/auth/login" : "/auth/register";
            const res = await axios.post(
                `http://localhost:3000${endpoint}`,
                isLogin ? { email: formData.email, password: formData.password } : formData,
                { withCredentials: true }
            );

            if (res.data.success) {
                window.location.href = "/"; 
            }
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setError(err.response.data.errors[0].message);
            } else {
                setError(err.response?.data?.message || "An error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col pt-[12vh] items-center bg-[#09090b] text-zinc-100 font-sans">
            
            {/* Logo Assembly */}
            <div className="flex flex-col items-center mb-6">
                <div className="w-10 h-10 bg-zinc-100 rounded-md flex items-center justify-center text-[#09090b] font-bold text-xl mb-3 shadow-sm">
                    CF
                </div>
                <h1 className="text-xl font-bold tracking-wide">CodeForge</h1>
            </div>

            {/* Reduced width from max-w-md (448px) to max-w-[400px] */}
            <div className="w-full max-w-[400px] p-8 bg-[#121214] border border-white/[0.04] rounded-2xl shadow-xl">
                
                {/* Reduced margin-bottom to pull the inputs closer */}
                <h2 className="text-2xl font-bold tracking-tight mb-5 text-center">
                    {isLogin ? "Welcome back" : "Create an account"}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-300">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required={!isLogin}
                                minLength={3}
                                maxLength={20}
                                pattern="[a-zA-Z]+"
                                title="Letters only, no spaces or special characters"
                                className="w-full px-4 py-2 bg-[#1e1e20] border border-white/[0.04] rounded-lg text-sm text-zinc-100 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                placeholder="johndoe"
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-300">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-[#1e1e20] border border-white/[0.04] rounded-lg text-sm text-zinc-100 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-zinc-300">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                                className="w-full px-4 py-2 pr-10 bg-[#1e1e20] border border-white/[0.04] rounded-lg text-sm text-zinc-100 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                        {!isLogin && (
                            <p className="text-[11px] text-zinc-500 mt-1">
                                Must be 8+ characters with a letter, number, and special character.
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 mt-2 bg-emerald-600/90 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
                    >
                        {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                        }}
                        className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
} 