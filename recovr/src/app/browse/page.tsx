"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation"


export default function JourneyPage() {
    const [cards, setCards] = useState<string[]>([]);
    const [injury, setInjury] = useState("");
    const router = useRouter();
    const addCard = () => {
        if (injury.trim() === "") return;
        setCards([...cards, injury]);
        setInjury("");
    };

    const goToTimeline = (card:string) => {
        router.push(`/timeline?injury=${encodeURIComponent(card)}`)
    }
    
    useEffect(() => {
    const saved = localStorage.getItem("journeyCards");
    if (saved) setCards(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("journeyCards", JSON.stringify(cards));
    }, [cards]);
    return (
        <div className="font-sans items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold mb-4">Start your journey now.</h1>

            <div className="flex gap-2 mb-6">
            <Input
                placeholder="What is your injury..."
                value={injury}
                onChange={(e) => setInjury(e.target.value)}
                className="rounded-xl border-2 italic"
            />
            <Button onClick={addCard} className="rounded-xl px-3">
                <Plus className="w-5 h-5" />
            </Button>
            </div>

            <div className="flex flex-col gap-4">
            {cards.map((card, i) => (
                <button
                key={i}
                onClick = {() => goToTimeline(card)}
                className="p-4 rounded-xl border-2 bg-white/30 backdrop-blur-sm font-semibold"
                >
                {card}
                </button>
            ))}
            </div>
        </div>
        </div>
    );
}