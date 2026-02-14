"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, AlertCircle, Github, Brain } from "lucide-react";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const { googleSignIn, githubSignIn, emailSignUp, emailSignIn, user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Redirect if already logged in
    React.useEffect(() => {
        if (!authLoading && user) {
            router.replace("/dashboard");
        }
    }, [user, authLoading, router]);

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            setError("");
            await googleSignIn();
            router.replace("/dashboard");
        } catch (err) {
            setError("Failed to sign in with Google.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGithubSignIn = async () => {
        try {
            setLoading(true);
            setError("");
            await githubSignIn();
            router.replace("/dashboard");
        } catch (err) {
            setError("Failed to sign in with GitHub.");
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
                router.replace("/dashboard");
            } else {
                await emailSignUp(email, password, username);
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
            <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12 relative overflow-hidden text-white">
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">NEURA</h1>
                </div>

                <div className="relative z-10 max-w-lg">
                    <blockquote className="space-y-6">
                        <p className="text-4xl font-medium leading-[1.1] tracking-tight">
                            "The next generation of content delivery, simplified."
                        </p>
                        <footer className="text-white/40 text-sm font-mono flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-white">N</span>
                            </div>
                            Powered by advanced AI strategies.
                        </footer>
                    </blockquote>
                </div>

                {/* Subtle abstract background element */}
                <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] border border-white/5 rounded-full opacity-20 pointer-events-none dashed-border" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
            </div>

            {/* Right side: Auth Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-8 lg:p-24 relative bg-white text-black">
                <div className="lg:hidden absolute top-8 left-8 z-10 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">NEURA</h1>
                </div>

                <div className="w-full max-w-sm space-y-8 relative z-10">
                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">
                            {isLogin ? "Welcome back" : "Create an account"}
                        </h2>
                        <p className="text-zinc-500 text-sm">
                            {isLogin
                                ? "Enter your credentials to access your workspace."
                                : "Start building with the most advanced CDN today."}
                        </p>
                    </div>

                    <div className="space-y-4">

                        {error && (
                            <div className="bg-red-50 p-3 rounded-md border border-red-200 flex items-start gap-3 text-red-900">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {message && (
                            <div className="bg-green-50 p-3 rounded-md border border-green-200 flex items-start gap-3 text-green-900">
                                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <p className="text-sm font-medium">{message}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</label>
                                <Input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-11 bg-white border-zinc-200 focus:border-black focus:ring-black text-black placeholder:text-zinc-400 rounded-md transition-all text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Password</label>
                                </div>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-11 bg-white border-zinc-200 focus:border-black focus:ring-black text-black placeholder:text-zinc-400 rounded-md transition-all text-sm"
                                />
                            </div>
                            {!isLogin && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Username</label>
                                        <Input
                                            type="text"
                                            placeholder="Your name"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            className="h-11 bg-white border-zinc-200 focus:border-black focus:ring-black text-black placeholder:text-zinc-400 rounded-md transition-all text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Confirm Password</label>
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="h-11 bg-white border-zinc-200 focus:border-black focus:ring-black text-black placeholder:text-zinc-400 rounded-md transition-all text-sm"
                                        />
                                    </div>
                                </>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-black text-white hover:bg-zinc-900 h-11 font-medium text-sm rounded-md shadow-lg shadow-black/5 transition-all active:scale-[0.99]"
                                disabled={loading}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLogin ? "Sign In" : "Create Account"}
                            </Button>
                        </form>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-zinc-100" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest font-medium text-zinc-400">
                                <span className="bg-white px-3">or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                className="w-full bg-white hover:bg-zinc-50 text-black h-11 font-medium text-sm transition-all border border-zinc-200 rounded-md flex items-center justify-center gap-2"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                ) : (
                                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                )}
                                Google
                            </button>

                            <button
                                className="w-full bg-[#24292F] hover:bg-[#2F363D] text-white h-11 font-medium text-sm transition-all border border-transparent rounded-md flex items-center justify-center gap-2"
                                onClick={handleGithubSignIn}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                ) : (
                                    <Github className="h-4 w-4" />
                                )}
                                GitHub
                            </button>
                        </div>

                        <div className="text-center pt-4">
                            <p className="text-sm text-zinc-500">
                                {isLogin ? "New to Neura? " : "Already have an account? "}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="font-medium text-black hover:underline underline-offset-4 decoration-1"
                                >
                                    {isLogin ? "Create account" : "Sign in"}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
