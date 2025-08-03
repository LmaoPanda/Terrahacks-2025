"use client";
import { useEffect, useState } from "react";
import { formatDistance, formatRelative } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const [injuryParam, setInjuryParam] = useState<string | null>(null);
  const [dayParam, setDayParam] = useState<string | null>(null);
  
  const [data, setData] = useState<InjuryData | null>(null);
  const [advice, setAdvice] = useState<string>("Loading advice...");
  const [exercises, setExercises] = useState<string[]>([]);
  const [dateSummary, setDateSummary] = useState<string>("");

  // Initialize URL parameters after mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchParams(params);
    setInjuryParam(params.get('injury'));
    setDayParam(params.get('day'));
  }, []);

  const handleBack = () => {
    router.push(`/addDescription?injury=${encodeURIComponent(injuryParam || '')}&day=${dayParam || 1}`);
  };

  useEffect(() => {
    if (!injuryParam || !dayParam) return;

    // Get the specific day's data from localStorage
    const key = `addDescriptionData_${injuryParam}_${dayParam}`;
    const stored = localStorage.getItem(key);
    console.log("Stored data for day:", stored);
    
    if (!stored) {
      setAdvice("No data found for this day.");
      setExercises([]);
      return;
    }

    try {
      const dayData = JSON.parse(stored);
      const today = new Date();
      
      // Get the initial injury data to get the start date and other info
      const adviceData = JSON.parse(localStorage.getItem("adviceData") || "{}");
      const startDate = new Date(adviceData.startDate || new Date());
      
      // Get the report date from the day's data or fallback to adviceData
      const reportDate = new Date(dayData.timestamp || adviceData.lastReportDate || new Date());
      
      // Create the data object with the specific day's information
      const updatedData = {
        injury: injuryParam,
        startDate: startDate.toISOString(),
        day: parseInt(dayParam),
        metrics: dayData.metrics,
        comments: dayData.comments,
        reportDate: reportDate.toISOString()
      };
      
      setData(updatedData);
      
      // Set date summary using the report date
      setDateSummary(
        `${formatRelative(reportDate, today)} (Day ${dayParam})`
      );

      const { injury, metrics, comments } = updatedData;
      const currentDay = parseInt(dayParam);
      console.log("Extracted data:", { injury, day: currentDay, metrics, comments });

      // Call Gemini API with the specific day
      fetch("/api/getTips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          injury,
          day: currentDay,
          metrics,
          comments,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((res) => {
          if (res.error) {
            throw new Error(res.error);
          }
          setAdvice(res.tips);
          setExercises(res.exercises || []);
        })
        .catch((err) => {
          console.error("Error fetching tips:", err);
          setAdvice("Failed to load tips. Please try refreshing the page or go back and try again.");
          setExercises([
            "Basic Movement: Start with gentle movements within your comfort zone",
            "Rest: Ensure you're giving your injury adequate rest between activities"
          ]);
        });
    } catch (err) {
      console.error("Error processing data:", err);
      setAdvice("Error processing injury data. Please try again.");
      setExercises([]);
    }
  }, [injuryParam, dayParam]);

  if (!injuryParam || !dayParam) {
    return (
      <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-gradient-to-b from-rose-200 to-rose-400 text-white">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Recovery Advice</h1>
          <p className="text-lg text-gray-200">Missing injury or day parameter.</p>
          <Button className="mt-4 text-lg" onClick={handleBack}>
            Back to Description
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-gradient-to-b from-rose-200 to-rose-400 text-white">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Recovery Advice</h1>
          <p className="text-lg text-gray-200">Loading your injury data...</p>
          <Button className="mt-4 text-lg" onClick={handleBack}>
            Back to Description
          </Button>
        </div>
        <div className="p-6 rounded-xl border-2 bg-white/30 backdrop-blur-sm mb-8">
          <h2 className="font-bold mb-4 text-xl">Tips:</h2>
          <div className="animate-pulse">
            <div className="h-4 bg-white/20 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
          </div>
        </div>
        <div className="p-6 rounded-xl border-2 bg-white/30 backdrop-blur-sm">
          <h2 className="font-bold mb-4 text-xl">Recommended Exercises:</h2>
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse flex gap-4 items-start">
                <div className="mt-2 h-4 w-4 rounded bg-white/20"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/20 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b p-8 pb-20 gap-16 sm:p-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Day {data.day} of Recovery
          </h1>
          <p className="text-lg text-gray-200">Injury reported {dateSummary}</p>
        </div>
        <Button className="text-lg" onClick={handleBack}>
          Back
        </Button>
      </div>

      {/* Advice Section */}
      <div className="p-6 rounded-xl border-2 bg-white/30 backdrop-blur-sm mb-8">
        <h2 className="font-bold mb-4 text-xl">Tips:</h2>
        <p className="leading-relaxed">{advice}</p>
      </div>

      {/* Exercises Section */}
      <div className="p-6 rounded-xl border-2 bg-white/30 backdrop-blur-sm">
        <h2 className="font-bold mb-4 text-xl">Recommended Exercises:</h2>
        <div className="space-y-6">
          {exercises.map((ex, i) => {
            // Split the exercise into name and description (assuming format: "Exercise Name: Description")
            const [name, ...descParts] = ex.split(': ');
            const description = descParts.join(': '); // Rejoin in case description contains colons
            
            return (
              <div key={i} className="flex gap-4 items-start">
                <Input
                  type="checkbox"
                  className="mt-2 h-4 w-4 rounded border-gray-300"
                  onChange={(e) => {
                    // You can add functionality here to save the checked state if needed
                    console.log(`Exercise ${i + 1} ${e.target.checked ? 'completed' : 'uncompleted'}`);
                  }}
                />
                <div>
                  <h3 className="font-semibold text-lg mb-1">{name}</h3>
                  <p className="leading-relaxed text-gray-100">{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}