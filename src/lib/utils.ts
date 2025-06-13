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

export const focusInput = [
  "focus:outline-none",
  "focus:ring-2",
  "focus:ring-blue-500",
  "focus:ring-offset-2",
  "dark:focus:ring-offset-gray-950",
];

export const hasErrorInput = [
  "border-red-500",
  "focus:border-red-500",
  "focus:ring-red-500",
  "dark:border-red-500",
  "dark:focus:border-red-500",
  "dark:focus:ring-red-500",
];
