"use client";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdvicePage() {
  const [exercises, setExercises] = useState([
    {
      id: 1,
      title: "Exercise 1",
      description: "Description for exercise 1",
      completed: false,
    },
    {
      id: 2,
      title: "Exercise 2",
      description: "Description for exercise 2",
      completed: false,
    },
    {
      id: 3,
      title: "Exercise 3",
      description: "Description for exercise 3",
      completed: false,
    },
  ]);

  const toggleExercise = (id: number) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === id ? { ...ex, completed: !ex.completed } : ex
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-200 to-rose-400 text-white p-6">
      <h1 className="text-4xl font-bold mb-4">What You Shouldn't Do</h1>

      {/* Tips Section */}
      <div className="p-4 rounded-xl border-2 bg-white/30 backdrop-blur-sm mb-4">
        <h2 className="font-bold mb-2">Tips:</h2>
        <p>Here are some things you should avoid doing to ensure proper recovery.</p>
      </div>

      {/* Exercises Section */}
      <div className="p-4 rounded-xl border-2 bg-white/30 backdrop-blur-sm">
        <h2 className="font-bold mb-4">Recommended Exercises:</h2>
        <ul className="space-y-4">
          {exercises.map((exercise) => (
            <li key={exercise.id} className="flex items-start space-x-4">
              <Checkbox
                checked={exercise.completed}
                onCheckedChange={() => toggleExercise(exercise.id)}
              />
              <div>
                <h3 className="font-semibold text-lg">{exercise.title}</h3>
                <p className="text-sm text-gray-200">{exercise.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
