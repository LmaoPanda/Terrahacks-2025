"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function JourneyPage() {
  const [cards, setCards] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("journeyCards");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [injury, setInjury] = useState("");
  const router = useRouter();

  const addCard = () => {
    if (injury.trim() === "") return;
    const updated = [...cards, injury];
    setCards(updated);
    localStorage.setItem("journeyCards", JSON.stringify(updated));
    setInjury("");
  };

  const deleteCard = (index: number) => {
    const updated = cards.filter((_, i) => i !== index);
    setCards(updated);
    localStorage.setItem("journeyCards", JSON.stringify(updated));
  };

  const getCurrentDayIndex = (injury: string) => {
    const daysData = JSON.parse(localStorage.getItem("injuryDays") || "{}");
    const days = daysData[injury] || [];
    return days.length ? days.length - 1 : 0;
  };

  const goToAddDescription = (card: string) => {
    const dayIndex = getCurrentDayIndex(card);
    router.push(
      `/addDescription?injury=${encodeURIComponent(
        card
      )}&day=${dayIndex}`
    );
  };

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
            <div
              key={i}
              className="relative flex items-center p-4 rounded-xl border-2 bg-white/30 backdrop-blur-sm font-semibold"
            >
              <button
                onClick={() => goToAddDescription(card)}
                className="flex-1 text-left"
              >
                {card}
              </button>
              <button
                aria-label={`Delete ${card}`}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCard(i);
                }}
                className="ml-2 flex-shrink-0"
              >
                <Image
                  src="/trashBinIcon.png"
                  alt="Delete"
                  width={20}
                  height={20}
                  priority={false}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}