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
            router.push("/");
        } catch (err) {
            setError("Failed to sign in with Google.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
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
                router.push("/");
            } else {
                await emailSignUp(email, password);
                setMessage("Account created! Check your email for verification.");
                // Optional: Switch to login or stay here
                setIsLogin(true);
            }
        } catch (err) {
            // Improve error message handling based on Firebase error codes
            setError("Failed to authenticate: " + err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-gray-900 p-8 shadow-2xl border border-gray-800">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        {isLogin ? "Welcome back" : "Create an account"}
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        {isLogin
                            ? "Enter your credentials to access your account"
                            : "Sign up to get started with Neura CDN"}
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-900/50 p-4 border border-red-800 flex items-center gap-2 text-red-200 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                {message && (
                    <div className="rounded-md bg-green-900/50 p-4 border border-green-800 flex items-center gap-2 text-green-200 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        {message}
                    </div>
                )}

                <div className="space-y-4">
                    <Button
                        variant="outline"
                        className="w-full bg-white text-black hover:bg-gray-100"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
                        {isLogin ? "Sign in with Google" : "Sign up with Google"}
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-gray-900 px-2 text-gray-400">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            />
                        </div>
                        {!isLogin && (
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                                />
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLogin ? "Sign In" : "Create Account"}
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-gray-400">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                        </span>
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-medium text-blue-400 hover:text-blue-300 underline underline-offset-4"
                        >
                            {isLogin ? "Sign up" : "Sign in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
