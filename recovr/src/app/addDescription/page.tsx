"use client"
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";


export default function addDescription() {
    const searchParams = useSearchParams();
    const injury = searchParams.get("injury") || "My Injury";
    const day = searchParams.get("day");
    const router = useRouter();
    const [description, setDescription] = useState("");
    const [metrics, setMetrics] = useState({
        pain: 5,
        redness: 5,
        rangeOfMotion: 5,
        flexibility: 5,
    });

    const handleMetricChange = (key: keyof typeof metrics, value: number[]) => {
    setMetrics({ ...metrics, [key]: value[0] });
    };

    const [comments, setComments] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    const saveData = () => {
        const data = {
        injury,
        day,
        description,
        metrics,
        comments,
        image,
            };
        localStorage.setItem("addDescriptionData", JSON.stringify(data));
    };
    const handleContinue = () => {
        saveData();
        router.push("/advice")
    };
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

            <div className="p-4 rounded-xl border-2 bg-white/30 backdrop-blur-sm mb-4">
                <h2 className="font-bold mb-2">Additional Comments.</h2>
                <Textarea
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
                <Button className = "text-lg mr-2">Back</Button>
                <Button className = "text-lg mr-2">Log Data</Button>
                <Button className = "text-lg" onClick = {handleContinue}>Continue to Advice</Button>
            </div>
        </div>
    );
}