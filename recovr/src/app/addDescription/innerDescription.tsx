"use client"
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function AddDescription() {
  const searchParams = useSearchParams();
  const injury = searchParams.get("injury") || "My Injury";
  const initialDay = Number(searchParams.get("day")) || 0;
  const router = useRouter();

  // Load all images (days) for this injury
  const [allImages, setAllImages] = useState<string[]>([]);
  const [dayIndex, setDayIndex] = useState(initialDay);

  useEffect(() => {
    const daysData = JSON.parse(localStorage.getItem("injuryDays") || "{}");
    setAllImages(daysData[injury] || []);
  }, [injury]);

  // Load data for current day
  const storageKey = `addDescriptionData_${injury}_${dayIndex}`;
  const saved = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
  const initial = saved ? JSON.parse(saved) : null;

  const [description, setDescription] = useState(initial?.description || "");
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

  const saveData = (
    desc = description,
    met = metrics,
    comm = comments,
    img = image
  ) => {
    const data = { injury, day: dayIndex, description: desc, metrics: met, comments: comm, image: img };
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

  const handleContinue = () => {
    saveData();
    router.push("/advice");
  };

  // Arrow navigation handlers
  const handlePrevDay = () => {
    if (dayIndex > 0) setDayIndex(dayIndex - 1);
  };
  const handleNextDay = () => {
    if (dayIndex < allImages.length - 1) setDayIndex(dayIndex + 1);
  };

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 ">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-5xl font-bold">{injury}</h1>
        <div className="flex space-x-4">
          <button onClick={handlePrevDay} disabled={dayIndex === 0}>
            <Image
              src="/heartLogo.png"
              alt="Left Arrow"
              width={40}
              height={40}
              style={{ opacity: dayIndex === 0 ? 0.5 : 1 }}
            />
          </button>
          <button onClick={handleNextDay} disabled={dayIndex >= allImages.length - 1}>
            <Image
              src="/heartLogo.png"
              alt="Right Arrow"
              width={40}
              height={40}
              style={{ opacity: dayIndex >= allImages.length - 1 ? 0.5 : 1 }}
            />
          </button>
        </div>
      </div>
      <div className="font-sans mb-4">
        <div>
          <h1 className="text-3xl">Day {dayIndex + 1} ---------------------------</h1>
        </div>
      </div>

      <div className="p-4 rounded-xl border-2 bg-white/30 backdrop-blur-sm mb-4">
        <h2 className="font-bold mb-2">Description.</h2>
        <Textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            saveData(e.target.value, metrics, comments, image);
          }}
          placeholder="Describe your injury..."
          className="w-full bg-transparent border-0 italic focus-visible:ring-0"
        />
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
              defaultValue={[metrics[key as keyof typeof metrics]]}
              onValueChange={(value) =>
                handleMetricChange(key as keyof typeof metrics, value)
              }
              max={10}
              step={1}
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
        <h2 className="font-bold mb-2">Upload Image.</h2>
        <input
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
        <Button className="text-lg mr-2">Back</Button>
        <Button className="text-lg mr-2" onClick={() => saveData()}>
          Log Data
        </Button>
        <Button className="text-lg" onClick={handleContinue}>
          Continue to Advice
        </Button>
      </div>
    </div>
  );
}
