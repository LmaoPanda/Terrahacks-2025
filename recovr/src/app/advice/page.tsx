"use client";
import { useEffect, useState } from "react";
import { formatDistance, formatRelative } from "date-fns";

interface InjuryData {
  injury: string;
  startDate: string;
  day: number;
  metrics: {
    pain: number;
    redness: number;
    rangeOfMotion: number;
    flexibility: number;
  };
  comments?: string;
}

export default function AdvicePage() {
  const [data, setData] = useState<InjuryData | null>(null);
  const [advice, setAdvice] = useState<string>("Loading advice...");
  const [exercises, setExercises] = useState<string[]>([]);
  const [dateSummary, setDateSummary] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("adviceData");
    console.log("Stored data:", stored);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log("Parsed data:", parsed);

      // Calculate days since injury
      const startDate = new Date(parsed.startDate);
      const today = new Date();
      const daysSinceStart = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Update the data with calculated day
      const updatedData = {
        ...parsed,
        day: daysSinceStart
      };
      
      setData(updatedData);
      
      // Set date summary
      const lastReportDate = parsed.lastReportDate ? new Date(parsed.lastReportDate) : today;
      setDateSummary(
        `${formatRelative(startDate, today)} (Last updated ${formatDistance(lastReportDate, today, { addSuffix: true })})`
      );

      const { injury, metrics, comments } = updatedData;
      console.log("Extracted data:", { injury, day: daysSinceStart, metrics, comments });

      // Call Gemini API with updated day count
      fetch("/api/getTips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          injury,
          day: daysSinceStart,
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Recovery Advice</h1>
          <p className="text-lg text-gray-200">Loading your injury data...</p>
        </div>
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Day {data.day} of Recovery
        </h1>
        <p className="text-lg text-gray-200">Injury reported {dateSummary}</p>
      </div>

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