import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges CSS class names safely using clsx and tailwind-merge.
 * Handles conditional classes, arrays, objects, and resolves Tailwind CSS class conflicts.
 *
 * @param inputs - Any number of ClassValue items (strings, arrays, objects, booleans, undefined, null)
 * @returns A single merged className string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
