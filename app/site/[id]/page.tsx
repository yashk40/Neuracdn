"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Zap } from "lucide-react";
import { useParams } from "next/navigation";

export default function WebsiteView() {
    const params = useParams();
    const id = params.id as string;

    const [website, setWebsite] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchWebsite = async () => {
            try {
                const docRef = doc(db, "websites", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setWebsite(docSnap.data());
                } else {
                    setError("Website not found");
                }
            } catch (err) {
                console.error("Error fetching website:", err);
                setError("Failed to load website");
            } finally {
                setLoading(false);
            }
        };
        fetchWebsite();
    }, [id]);

    if (loading) return (
        <div className="h-screen w-screen flex items-center justify-center bg-zinc-50">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
    );

    if (error) return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-50 text-center">
            <Zap className="w-12 h-12 text-red-400 mb-4" />
            <h1 className="text-xl font-bold text-zinc-900">Error</h1>
            <p className="text-zinc-500">{error}</p>
        </div>
    );

    return (
        <div className="h-screen w-screen bg-white">
            <iframe
                srcDoc={website?.html}
                className="w-full h-full border-none"
                title={website?.prompt || "Website Preview"}
            />
        </div>
    );
}
