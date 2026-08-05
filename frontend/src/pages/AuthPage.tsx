import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AuthPageProps {
  checkAuth: () => Promise<void>;
}

export default function AuthPage({ checkAuth }: AuthPageProps) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await axios.post("http://localhost:3000/auth/login", { email, password });
      } else {
        await axios.post("http://localhost:3000/auth/register", { username, email, password });
      }
      await checkAuth();
      navigate("/problems");
    } catch (err: any) {
      // ✅ This will print the exact API error to your browser's console (F12)
      console.error("🔴 Auth API Error:", err.response || err);
      
      setError(
        err.response?.data?.message || 
        (isLogin ? "Invalid credentials. Please try again." : "Registration failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      
      {/* Subtle radial background glow behind the card */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0,transparent_40%)] pointer-events-none" />

      <div className="w-full max-w-[380px] flex flex-col items-center space-y-4 z-10">
        
        {/* Logo */}
        <div className="flex flex-col items-center text-center space-y-3 mb-2">
          <div className="h-10 w-10 bg-zinc-100 rounded-[10px] flex items-center justify-center shadow-sm">
            <span className="text-zinc-950 font-bold text-xl tracking-tighter">CF</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">CodeForge</h1>
        </div>

        {error && (
          <div className="w-full p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {/* 
          CARD STYLING UPDATE:
          - Ultra-thin border: border-white/[0.03]
          - Inner top highlight: inset_0_1px_0_rgba(255,255,255,0.05)
          - Deep outer shadow: 0_20px_40px_-15px_rgba(0,0,0,0.8)
        */}
        <Card className="w-full relative bg-[#121214] border border-white/[0.03] text-zinc-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
          
          {/* Shader Effect: Fades inward from top to bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

          {/* Everything below needs relative z-10 so it sits above the background gradient */}
          <div className="relative z-10">
            <CardHeader className="space-y-1 pt-8 pb-4 px-8">
              <CardTitle className="text-lg text-center font-medium tracking-wide">
                {isLogin ? "Sign In" : "Create Account"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-xs text-zinc-400 font-medium">Username</Label>
                    <Input 
                      id="username" 
                      placeholder="Enter your Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required={!isLogin} 
                      className="bg-[#18181B] border-[rgba(255,255,255,0.05)] text-xs h-10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all duration-200 rounded-lg"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs text-zinc-400 font-medium">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="Enter your Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="bg-[#18181B] border-[rgba(255,255,255,0.05)] text-xs h-10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all duration-200 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs text-zinc-400 font-medium">Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="Enter your Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    className="bg-[#18181B] border-[rgba(255,255,255,0.05)] text-xs h-10 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all duration-200 rounded-lg"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-zinc-200 text-zinc-900 hover:bg-zinc-100 font-semibold h-10 text-xs mt-4 shadow-sm transition-colors duration-200 rounded-lg" 
                  disabled={loading}
                >
                  {loading ? "Processing..." : (isLogin ? "Sign In" : "Sign Up")}
                </Button>
              </form>

              <div className="mt-6 text-center text-xs text-zinc-500">
                {isLogin ? (
                  <p>
                    Don't have an account?{" "}
                    <button 
                      type="button" 
                      onClick={() => { setIsLogin(false); setError(null); }}
                      className="text-zinc-400 hover:text-zinc-200 transition-colors duration-200 focus:outline-none"
                    >
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p>
                    Have an account?{" "}
                    <button 
                      type="button" 
                      onClick={() => { setIsLogin(true); setError(null); }}
                      className="text-zinc-400 hover:text-zinc-200 transition-colors duration-200 focus:outline-none"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}