"use client";
import { useEffect, useState } from "react";

export default function AdvicePage() {
  const [data, setData] = useState<any>(null);
  const [advice, setAdvice] = useState<string>("Loading advice...");
  const [exercises, setExercises] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("adviceData");
    if (stored) {
      const parsed = JSON.parse(stored);
      setData(parsed);

      // ✅ Call Gemini API here with parsed data
      fetch("/api/get-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      })
        .then((res) => res.json())
        .then((res) => {
          setAdvice(res.advice);
          setExercises(res.exercises);
        });
    }
  }, []);

  if (!data) return <div className="p-6">No data found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b p-6">
      <h1 className="text-4xl font-bold mb-4">
        Personalized Advice for {data.day}
      </h1>

      {/* Advice Section */}
      <div className="p-4 rounded-xl border-2 bg-white/30 backdrop-blur-sm mb-4">
        <h2 className="font-bold mb-2">Tips:</h2>
        <p>{advice}</p>
      </div>

      {/* Exercises Section */}
      <div className="p-4 rounded-xl border-2 bg-white/30 backdrop-blur-sm">
        <h2 className="font-bold mb-2">Recommended Exercises:</h2>
        <ul className="list-disc pl-4">
          {exercises.map((ex, i) => (
            <li key={i}>{ex}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}