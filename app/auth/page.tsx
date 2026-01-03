"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Using lucide-react which is already in package.json
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const { googleSignIn, emailSignUp, emailSignIn } = useAuth();
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            setError("");
            await googleSignIn();
            router.push("/dashboard");
        } catch (err) {
            setError("Failed to sign in with Google.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!isLogin && password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            setLoading(true);
            if (isLogin) {
                await emailSignIn(email, password);
                router.push("/dashboard");
            } else {
                await emailSignUp(email, password);
                setMessage("Account created! Check your email for verification.");
                // Optional: Switch to login or stay here
                setIsLogin(true);
            }
        } catch (err: any) {
            // Improve error message handling based on Firebase error codes
            setError("Failed to authenticate: " + err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-poppins selection:bg-black selection:text-white">
            {/* Left side: Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl font-black tracking-[0.2em] text-white">NEURA</h1>
                </div>

                <div className="relative z-10">
                    <blockquote className="space-y-4">
                        <p className="text-5xl font-medium leading-tight tracking-tight text-white italic">
                            "The next generation of content delivery, simplified."
                        </p>
                        <footer className="text-zinc-400 text-lg font-light tracking-wide">
                            &mdash; Powered by advanced AI strategies.
                        </footer>
                    </blockquote>
                </div>

                {/* Subtle abstract background element */}
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] border border-zinc-800 rounded-full opacity-20 pointer-events-none" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] border border-zinc-800 rounded-full opacity-10 pointer-events-none" />
            </div>

            {/* Right side: Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16">
                <div className="w-full max-w-sm space-y-10">
                    <div className="space-y-3">
                        <h2 className="text-3xl font-semibold tracking-tight text-black">
                            {isLogin ? "Sign in to Neura CDN" : "Create your account"}
                        </h2>
                        <p className="text-zinc-500 text-sm">
                            {isLogin
                                ? "Enter your details to access your workspace"
                                : "Start your journey with the smartest CDN"}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <Button
                            variant="outline"
                            className="w-full border-zinc-200 bg-white text-black hover:bg-zinc-50 h-11 font-medium text-sm transition-all duration-200 rounded-lg flex items-center justify-center gap-3"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                            ) : (
                                <svg className="h-4 w-4" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="currentColor"
                                    />
                                </svg>
                            )}
                            {isLogin ? "Continue with Google" : "Sign up with Google"}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-100" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-semibold text-zinc-400">
                                <span className="bg-white px-3">or</span>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-zinc-50 p-3 rounded-lg border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
                            </div>
                        )}

                        {message && (
                            <div className="bg-zinc-50 p-3 rounded-lg border border-black flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                                <CheckCircle className="h-4 w-4 text-black mt-0.5 shrink-0" />
                                <p className="text-xs text-black font-medium leading-relaxed">{message}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Email</label>
                                <Input
                                    style={{
                                        color: "black",
                                    }}
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-11 border-zinc-200 focus:border-black transition-all rounded-lg placeholder:text-zinc-300 text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Password</label>
                                    {/* {isLogin && (
                                        <button type="button" className="text-[11px] font-semibold text-zinc-400 hover:text-black transition-colors">
                                            Forgot password?
                                        </button>
                                    )} */}
                                </div>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    style={{
                                        color: "black",
                                    }}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11 border-zinc-200 focus:border-black transition-all rounded-lg placeholder:text-zinc-300 text-sm"
                                />
                            </div>
                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Confirm Password</label>
                                    <Input
                                        style={{
                                            color: "black",
                                        }}
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="h-11 border-zinc-200 focus:border-black transition-all rounded-lg placeholder:text-zinc-300 text-sm"
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-black text-white hover:bg-zinc-800 h-11 font-semibold text-sm rounded-lg mt-6 shadow-sm transition-all active:scale-[0.98]"
                                disabled={loading}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLogin ? "Sign In" : "Get Started"}
                            </Button>
                        </form>

                        <div className="text-center pt-2">
                            <p className="text-sm text-zinc-500">
                                {isLogin ? "New to Neura? " : "Already have an account? "}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="font-semibold text-black hover:underline underline-offset-4 decoration-1"
                                >
                                    {isLogin ? "Create account" : "Sign in instead"}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
