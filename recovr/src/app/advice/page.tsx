"use client";
import { useEffect, useState } from "react";

export default function AdvicePage() {
  const [data, setData] = useState<any>(null);
  const [advice, setAdvice] = useState<string>("Loading advice...");
  const [exercises, setExercises] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("adviceData");
    console.log("Stored data:", stored);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log("Parsed data:", parsed);
      setData(parsed);

      const { injury, day, metrics, comments } = parsed;
      console.log("Extracted data:", { injury, day, metrics, comments });

      // ✅ Call Gemini API here with detailed data for tips
      fetch("/api/getTips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          injury,
          day,
          metrics,
          comments,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          console.log("API Response:", res);
          if (res.error) {
            throw new Error(res.error);
          }
          console.log("Setting advice:", res.tips);
          console.log("Setting exercises:", res.exercises);
          setAdvice(res.tips || "No tips available at the moment.");
          setExercises(res.exercises || []);
        })
        .catch((err) => {
          console.error("Error fetching tips:", err);
          setAdvice("Failed to load tips. Please try again later.");
        });
    }
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-gradient-to-b from-rose-200 to-rose-400 text-white">
        <h1 className="text-5xl font-bold mb-8">Personalized Advice</h1>
        <div className="p-6 rounded-xl border-2 bg-white/30 backdrop-blur-sm mb-8">
          <h2 className="font-bold mb-4 text-xl">Tips:</h2>
          <p className="leading-relaxed">
            Here are some general tips to help with your recovery. Replace this
            content with personalized advice later.
          </p>
        </div>
        <div className="p-6 rounded-xl border-2 bg-white/30 backdrop-blur-sm">
          <h2 className="font-bold mb-4 text-xl">Recommended Exercises:</h2>
          <ul className="list-disc pl-6 space-y-4">
            <li className="leading-relaxed">Exercise 1: Description for exercise 1</li>
            <li className="leading-relaxed">Exercise 2: Description for exercise 2</li>
            <li className="leading-relaxed">Exercise 3: Description for exercise 3</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b p-8 pb-20 gap-16 sm:p-20">
      <h1 className="text-4xl font-bold mb-8">
        Personalized Advice for Day {data.day}.
      </h1>

      {/* Advice Section */}
      <div className="p-6 rounded-xl border-2 bg-white/30 backdrop-blur-sm mb-8">
        <h2 className="font-bold mb-4 text-xl">Tips:</h2>
        <p className="leading-relaxed">{advice}</p>
      </div>

      {/* Exercises Section */}
      <div className="p-6 rounded-xl border-2 bg-white/30 backdrop-blur-sm">
        <h2 className="font-bold mb-4 text-xl">Recommended Exercises:</h2>
        <ul className="list-disc pl-6 space-y-4">
          {exercises.map((ex, i) => (
            <li key={i} className="leading-relaxed">{ex}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}