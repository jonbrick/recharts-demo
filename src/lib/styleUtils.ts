import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Single cx function for all className merging needs
export function cx(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Focus styles for form inputs
export const focusInput = [
  // base
  "focus:outline-none",
  "focus:ring-2",
  // ring color - using Tremor's blue-200 for consistency
  "focus:ring-blue-200 dark:focus:ring-blue-700/30",
  // border color
  "focus:border-blue-500 dark:focus:border-blue-700",
  // offset
  "focus:ring-offset-2",
  "dark:focus:ring-offset-gray-950",
];

// Focus ring for buttons and other interactive elements
export const focusRing = [
  // Using Tremor's outline approach for better accessibility
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-blue-500 dark:outline-blue-500",
];

// Error state for inputs
export const hasErrorInput = [
  // ring
  "ring-2",
  // border color
  "border-red-500 dark:border-red-700",
  // ring color - using Tremor's subtle ring
  "ring-red-200 dark:ring-red-700/30",
  // Maintain focus states even in error
  "focus:border-red-500 dark:focus:border-red-500",
  "focus:ring-red-500 dark:focus:ring-red-500",
];
