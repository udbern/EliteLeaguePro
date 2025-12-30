import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format date for display in fixtures
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatFixtureDate = (date) => {
  if (!date || isNaN(Date.parse(date))) {
    return '';
  }
  
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Format time for display in fixtures
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted time string
 */
export const formatFixtureTime = (date) => {
  if (!date || isNaN(Date.parse(date))) {
    return '';
  }
  
  return new Date(date).toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
