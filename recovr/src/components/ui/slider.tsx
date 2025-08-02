"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => {
        // Calculate the thumb's color based on its value between min and max
        const val = _values[index];
        const percent = (val - min) / (max - min);
        // Interpolate: ff6f6f (left), white (center), 89E774 (right)
        function hexToRgb(hex: string): [number, number, number] {
          hex = hex.replace('#', '');
          const bigint = parseInt(hex, 16);
          return [
            (bigint >> 16) & 255,
            (bigint >> 8) & 255,
            bigint & 255
          ];
        }
        function lerp(a: number, b: number, t: number): number {
          return a + (b - a) * t;
        }
        const left = hexToRgb('ff6f6f');
        const center = [255, 255, 255];
        const right = hexToRgb('89E774');
        let rgb: [number, number, number];
        if (percent <= 0.5) {
          // Interpolate from left to center
          const t = percent / 0.5;
          rgb = [
            Math.round(lerp(left[0], center[0], t)),
            Math.round(lerp(left[1], center[1], t)),
            Math.round(lerp(left[2], center[2], t))
          ];
        } else {
          // Interpolate from center to right
          const t = (percent - 0.5) / 0.5;
          rgb = [
            Math.round(lerp(center[0], right[0], t)),
            Math.round(lerp(center[1], right[1], t)),
            Math.round(lerp(center[2], right[2], t))
          ];
        }
        const color = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        return (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className={cn(
              "border-primary ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
            )}
            style={{ background: color }}
          />
        );
      })}
    </SliderPrimitive.Root>
  )
}

export { Slider }
