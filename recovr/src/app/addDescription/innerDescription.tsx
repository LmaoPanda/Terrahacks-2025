"use client"
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AddDescription() {
  const searchParams = useSearchParams();
  const injury = searchParams?.get("injury") || "My Injury";
  const initialDay = Number(searchParams?.get("day")) || 1;
  const router = useRouter();

  // Load all images and track maximum day
  const [allImages, setAllImages] = useState<string[]>([]);
  const [dayIndex, setDayIndex] = useState(initialDay);
  const [maxDay, setMaxDay] = useState(initialDay);

  useEffect(() => {
    // Load images
    const daysData = JSON.parse(localStorage.getItem("injuryDays") || "{}");
    setAllImages(daysData[injury] || []);

    // Get the initial injury data to find the start date
    const adviceData = localStorage.getItem("adviceData");
    let startDate = new Date();

    if (adviceData) {
      const parsed = JSON.parse(adviceData);
      if (parsed.injury === injury && parsed.startDate) {
        startDate = new Date(parsed.startDate);
      }
    }

    // Calculate the maximum possible day based on the start date
    const today = new Date();
    const daysSinceStart = Math.max(1, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Update the dayIndex to match the current day if it is less than daysSinceStart
    if (dayIndex > daysSinceStart) {
      setDayIndex(daysSinceStart);
    }

    // Find the maximum day that has data, but don't exceed days since start
    let maxDayWithData = 1;
    for (let i = 1; i <= daysSinceStart; i++) {
      const key = `addDescriptionData_${injury}_${i}`;
      const savedData = localStorage.getItem(key);
      if (savedData) {
        maxDayWithData = i;
      }
    }

    setMaxDay(Math.max(maxDayWithData, daysSinceStart));
  }, [injury]);

  // Get historical metrics data for all days
  const getHistoricalData = () => {
    const data = [];
    for (let i = 1; i <= maxDay; i++) {
      const key = `addDescriptionData_${injury}_${i}`;
      const savedData = localStorage.getItem(key);
      if (savedData) {
        const dayData = JSON.parse(savedData);
        data.push({
          day: i,
          ...dayData.metrics
        });
      }
    }
    return data;
  };

  // Load data for current day
  const storageKey = `addDescriptionData_${injury}_${dayIndex}`;
  const saved = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
  const initial = saved ? JSON.parse(saved) : null;

  const [description, setDescription] = useState(initial?.description || "");
  const [geminiSummary, setGeminiSummary] = useState<string>("");
  const [loadingGemini, setLoadingGemini] = useState(false);
  const [geminiError, setGeminiError] = useState<string>("");
  const [metrics, setMetrics] = useState(
    initial?.metrics || {
      pain: 5,
      redness: 5,
      rangeOfMotion: 5,
      flexibility: 5,
    }
  );
  const [comments, setComments] = useState(initial?.comments || "");
  const [image, setImage] = useState<string | null>(initial?.image || (allImages[dayIndex] || null));

  // When dayIndex changes, load that day's data
  useEffect(() => {
    const key = `addDescriptionData_${injury}_${dayIndex}`;
    const savedDay = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    const initialDayData = savedDay ? JSON.parse(savedDay) : null;
    setDescription(initialDayData?.description || "");
    setMetrics(
      initialDayData?.metrics || {
        pain: 5,
        redness: 5,
        rangeOfMotion: 5,
        flexibility: 5,
      }
    );
    setComments(initialDayData?.comments || "");
    setImage(initialDayData?.image || (allImages[dayIndex] || null));
  }, [dayIndex, injury, allImages]);


  // Handler to fetch Gemini summary on button click
  const handleGetSummary = async () => {
    if (!description && !comments) {
      setGeminiSummary("");
      return;
    }
    setLoadingGemini(true);
    setGeminiError("");
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          injury,
          day: dayIndex,
          description,
          metrics,
          comments,
        }),
      });

      const data = await response.json();
      setGeminiSummary(data.summary);
      saveData(description, metrics, comments, image);
    } catch (err) {
      console.error("Gemini error:", err);
      setGeminiError("Could not generate summary. Please try again.");
    } finally {
      setLoadingGemini(false);
    }
  };

  const saveData = (
    desc = description,
    met = metrics,
    comm = comments,
    img = image
  ) => {
    const data = {
      injury,
      day: dayIndex,
      description: desc,
      metrics: met,
      comments: comm,
      image: img,
      timestamp: new Date().toISOString() // Add timestamp whenever data is saved
    };
    localStorage.setItem(`addDescriptionData_${injury}_${dayIndex}`, JSON.stringify(data));
  };

  const handleMetricChange = (key: keyof typeof metrics, value: number[]) => {
    const updated = { ...metrics, [key]: value[0] };
    setMetrics(updated);
    saveData(description, updated, comments, image);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = reader.result as string;
        setImage(img);
        saveData(description, metrics, comments, img);

        // Save image to injuryDays array for this injury
        const daysData = JSON.parse(localStorage.getItem("injuryDays") || "{}");
        if (!daysData[injury]) daysData[injury] = [];
        if (!daysData[injury][dayIndex]) {
          daysData[injury][dayIndex] = img;
          localStorage.setItem("injuryDays", JSON.stringify(daysData));
          setAllImages(daysData[injury]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = async () => {
    try {
      // First, save the current day's data
      saveData();

      // Check if this is the first report for this injury
      const existingData = localStorage.getItem("adviceData");
      let startDate = new Date().toISOString();
      
      if (existingData) {
        const parsed = JSON.parse(existingData);
        startDate = parsed.startDate || startDate;
      }

      // Create and save the advice data
      const adviceDataObject = {
        injury,
        day: dayIndex,
        metrics,
        comments,
        startDate,
        lastReportDate: new Date().toISOString()
      };

      // Save the current metrics and comments for tips generation
      localStorage.setItem(
        "adviceData",
        JSON.stringify(adviceDataObject)
      );

      // Save or update the day-specific data
      const dayKey = `addDescriptionData_${injury}_${dayIndex}`;
      const dayData = {
        description,
        metrics,
        comments,
        image,
        // Add timestamp to ensure the data is fresh
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(dayKey, JSON.stringify(dayData));

      // Verify that the data was saved successfully
      const verifyDayData = localStorage.getItem(dayKey);
      const verifyAdviceData = localStorage.getItem("adviceData");
      
      if (!verifyDayData || !verifyAdviceData) {
        throw new Error("Failed to save data");
      }

      // Navigate to advice page with the specific day as a query parameter
      router.push(`/advice?day=${dayIndex}&injury=${encodeURIComponent(injury)}`);
    } catch (error) {
      console.error("Error saving data:", error);
      // You could add an error notification here if needed
    }
  };

  const sendBack = () => {
    router.push("/browse");
  };


  // Arrow navigation handlers
  const handlePrevDay = () => {
    if (dayIndex > 1) {
      const newDayIndex = dayIndex - 1;
      setDayIndex(newDayIndex);

      // Load data for the new day
      const key = `addDescriptionData_${injury}_${newDayIndex}`;
      const savedDay = localStorage.getItem(key);
      const initialDayData = savedDay ? JSON.parse(savedDay) : null;

      setDescription(initialDayData?.description || "");
      setMetrics(
        initialDayData?.metrics || {
          pain: 5,
          redness: 5,
          rangeOfMotion: 5,
          flexibility: 5,
        }
      );
      setComments(initialDayData?.comments || "");
      setImage(initialDayData?.image || (allImages[newDayIndex] || null));
    }
  };

  const handleNextDay = () => {
    if (dayIndex < maxDay) {
      const newDayIndex = dayIndex + 1;
      setDayIndex(newDayIndex);

      // Load data for the new day
      const key = `addDescriptionData_${injury}_${newDayIndex}`;
      const savedDay = localStorage.getItem(key);
      const initialDayData = savedDay ? JSON.parse(savedDay) : null;

      setDescription(initialDayData?.description || "");
      setMetrics(
        initialDayData?.metrics || {
          pain: 5,
          redness: 5,
          rangeOfMotion: 5,
          flexibility: 5,
        }
      );
      setComments(initialDayData?.comments || "");
      setImage(initialDayData?.image || (allImages[newDayIndex] || null));
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 ">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-5xl font-bold">{injury}</h1>
        <div className="flex space-x-4">
          <Button 
            onClick={handlePrevDay} 
            disabled={dayIndex === 1}
            variant="ghost"
            className="hover:bg-transparent focus:bg-transparent"
          >
            <Image
              src="/rightArrow.png"
              alt="Left Arrow"
              width={40}
              height={40}
              style={{ opacity: dayIndex === 1 ? 0.5 : 1, transform: 'scaleX(-1)'}}
            />
          </Button>
          <Button 
            onClick={handleNextDay} 
            disabled={dayIndex > maxDay}
            variant="ghost"
            className="hover:bg-transparent focus:bg-transparent"
          >
            <Image
              src="/rightArrow.png"
              alt="Right Arrow"
              width={40}
              height={40}
              style={{ opacity: dayIndex > maxDay ? 0.5 : 1 }}
            />
          </Button>
        </div>
      </div>
      <div className="font-sans mb-4">
        <div>
          <h1 className="text-3xl">Day {dayIndex} ---------------------------</h1>
        </div>
      </div>

      <div className="p-4 rounded-xl border-2 bg-white/30 backdrop-blur-sm mb-4">
        <h2 className="font-bold mb-2">Description.</h2>
        {/* Show AI-generated summary or prompt to generate */}
        {loadingGemini ? (
          <span className="italic text-gray-500">Generating summary...</span>
        ) : geminiError ? (
          <span className="text-red-500">{geminiError}</span>
        ) : geminiSummary ? (
          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-blue-900 mb-2">
            <strong>
              <Image
                src="/lightbulb-icon.png"
                alt="Light Bulb"
                width={20}
                height={20}
                className="inline-block mr-1"
              />
              Quick Overview:
            </strong> {geminiSummary}
          </div>
        ) : (
          <span className="italic text-gray-500">No summary generated yet. Click "Get Summary" below.</span>
        )}
      </div>

      <div className="p-4 rounded-xl border-2 bg-white/30 backdrop-blur-sm mb-4">
        <h2 className="font-bold mb-4">Metric Logs.</h2>
        {[
          ["Pain", "pain"],
          ["Redness", "redness"],
          ["Range of Motion", "rangeOfMotion"],
          ["Flexibility", "flexibility"],
        ].map(([label, key]) => (
          <div key={key} className="mb-4">
            <div className="flex justify-between text-sm font-semibold mb-1">
              <span>{label}</span>
              <span>1–10</span>
            </div>
            <Slider
              value={[metrics[key as keyof typeof metrics]]}
              onValueChange={(value) =>
                handleMetricChange(key as keyof typeof metrics, value)
              }
              max={10}
              step={1}
              reverseGradient={key === "pain" || key === "redness"}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl border-2 bg-white/30 backdrop-blur-sm mb-4">
        <h2 className="font-bold mb-2">Additional Comments.</h2>
        <Textarea
          value={comments}
          onChange={(e) => {
            setComments(e.target.value);
            saveData(description, metrics, e.target.value, image);
          }}
          placeholder="Add any problems or notes (optional)..."
          className="w-full bg-transparent border-0 italic focus-visible:ring-0"
        />
      </div>

      <div className="p-4 rounded-xl border-2 bg-white/30 backdrop-blur-sm mb-4">
        <h2 className="font-bold mb-2">Metrics History.</h2>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={getHistoricalData()}
              margin={{ top: 5, right: 30, left: 50, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                label={{ 
                  value: 'Day of Recovery', 
                  position: 'bottom',
                  offset: 0
                }}
              />
              <YAxis 
                domain={[0, 10]} 
                label={{ 
                  value: 'Severity (1-10)', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: -15,
                  dx: 10,
                  dy: 50
                }}
              />
              <Tooltip />
              <Legend verticalAlign="top" height={36}/>
              <Line type="linear" dataKey="pain" stroke="#ef4444" name="Pain" />
              <Line type="linear" dataKey="redness" stroke="#f97316" name="Redness" />
              <Line type="linear" dataKey="rangeOfMotion" stroke="#3b82f6" name="Range of Motion" />
              <Line type="linear" dataKey="flexibility" stroke="#22c55e" name="Flexibility" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4 rounded-xl border-2 bg-white/30 backdrop-blur-sm mb-4">
        <h2 className="font-bold mb-2">Upload Image.</h2>
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-3"
        />
        {image && (
          <div className="rounded-lg overflow-hidden border bg-white/50">
            <img src={image} alt="Preview" className="w-full h-auto" />
          </div>
        )}
      </div>

      <div>
        <Button className="text-lg mr-2" onClick={sendBack}>
          Back
        </Button>
        <Button className="text-lg mr-2" onClick={() => saveData()}>
          Log Data
        </Button>
        <Button className="text-lg mr-2" onClick={handleContinue}>
          Continue to Advice
        </Button>
        <Button className="text-lg" onClick={handleGetSummary}>
          Get Summary
        </Button>
      </div>
    </div>
  );
}
