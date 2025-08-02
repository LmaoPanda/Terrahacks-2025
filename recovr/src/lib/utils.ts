import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const saveData = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getData = (key: string) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
