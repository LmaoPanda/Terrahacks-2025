"use client"
import { Suspense } from "react";
import AddDescriptionInner from "./innerDescription";

export default function AddDescriptionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddDescriptionInner />
    </Suspense>
  );
}