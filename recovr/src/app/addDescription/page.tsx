"use client"
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

export default function addDescription() {
    const searchParams = useSearchParams();
    const injury = searchParams.get("injury") || "My Injury";
    const day = searchParams.get("day");
    const router = useRouter();
        
    return (
        <div className = "min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <div className = "mb-2">
                <h1 className="text-5xl font-bold">{injury}</h1>
            </div>
            <div className="font-sans mb-4">
                <div>
                    <h1 className = "text-3xl">{day} ---------------------------</h1>
                </div>
            </div>
            <div className="p-4 rounded-xl border-2 bg-white/30 backdrop-blur-sm mb-4">
                <h2 className="font-bold mb-2">Description.</h2>
                <p>Summary Here</p>
            </div>

            <div className="p-4 rounded-xl border-2 bg-white/30 backdrop-blur-sm mb-4">
                <h2 className="font-bold mb-4">Metric Logs.</h2>
                {["Pain", "Redness", "Range of Motion", "Flexibility"].map((metric) => (
                <div key={metric} className="mb-4">
                    <div className="flex justify-between text-sm font-semibold mb-1">
                    <span>{metric}</span>
                    <span>1–10</span>
                    </div>
                    <Slider defaultValue={[5]} max={10} step={1} className="w-full" />
                </div>
                ))}
            </div>

            {/* Additional Comments Box */}
            <div className="p-4 rounded-xl border-2 bg-white/30 backdrop-blur-sm">
                <h2 className="font-bold mb-2">Additional Comments.</h2>
                <Textarea
                placeholder="Add any problems or notes (optional)..."
                className="w-full bg-transparent border-0 italic focus-visible:ring-0"
                />
            </div>
        </div>
    );
}