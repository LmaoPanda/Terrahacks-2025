"use client"
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation"


export default function TimelinePage() {
    const searchParams = useSearchParams();
    const injury = searchParams.get("injury") || "My Injury";
    const router = useRouter();
    const [days, setDays] = useState<string[]>(["Day 1", "Day 2"]);
        
    const addDay = () => {
        const nextDay = `Day ${days.length + 1}`;
        setDays([...days, nextDay]);
    };
    const goToAddDetails = (dayIndex:string) => {
        router.push(`/addDescription?injury=${encodeURIComponent(injury)}&day=${dayIndex}`)
    }
    return (
        <div className="font-sans items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        
        <div className="relative mb-6">
            <h1 className="text-center text-2xl font-bold">{injury} Timeline</h1>
        </div>

        {/* Timeline Days */}
        <div className="flex flex-col gap-4">
            {days.map((day, i) => (
            <div
                key={i}
                onClick = {() => goToAddDetails(day)}
                className="p-4 rounded-xl border-2 bg-white/30 backdrop-blur-sm font-semibold"
            >
                {day}
            </div>
            ))}
        </div>
        </div>
    );
}