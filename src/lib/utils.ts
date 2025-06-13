import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cx(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const focusRing = [
  "focus:outline-none",
  "focus:ring-2",
  "focus:ring-blue-500",
  "focus:ring-offset-2",
  "dark:focus:ring-offset-gray-950",
];
