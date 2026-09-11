import { FacilityQueue, QueueStatus } from "../types/campus";
import { mockFacilities } from "../data/mockData";

const STORAGE_KEY = "campushub_facilities_v1";

export interface TelemetryDelta {
  facilityId: string;
  occupancyChange: number; // e.g. +5 or -3
}

export function getStoredFacilities(): FacilityQueue[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading facilities from localStorage", e);
  }
  return [...mockFacilities];
}

export function saveStoredFacilities(facilities: FacilityQueue[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(facilities));
    window.dispatchEvent(new Event("campushub_queues_updated"));
  } catch (e) {
    console.error("Error saving facilities to localStorage", e);
  }
}

/**
 * Simulates a realistic real-time telemetry ping across all facilities
 * Generates realistic fluctuations in occupancy and recalculates wait times & status
 */
export function simulateLiveTelemetryRefresh(currentList: FacilityQueue[]): {
  updatedFacilities: FacilityQueue[];
  deltas: Record<string, number>;
} {
  const deltas: Record<string, number> = {};

  const updatedFacilities: FacilityQueue[] = currentList.map((fac) => {
    // Generate a natural variance between -6 and +8 people
    const delta = Math.floor(Math.random() * 15) - 6;
    deltas[fac.id] = delta;

    let newOccupancy = Math.max(5, Math.min(fac.capacity, fac.currentOccupancy + delta));
    const occupancyRatio = newOccupancy / fac.capacity;

    let newStatus: QueueStatus = "Low";
    let newWait = "2 - 4 mins";

    if (occupancyRatio > 0.85) {
      newStatus = "Very Busy";
      newWait = "20 - 30 mins";
    } else if (occupancyRatio > 0.65) {
      newStatus = "Busy";
      newWait = "14 - 20 mins";
    } else if (occupancyRatio > 0.40) {
      newStatus = "Medium";
      newWait = "8 - 12 mins";
    } else {
      newStatus = "Low";
      newWait = "< 5 mins";
    }

    // Dynamic operational notes
    let newNote = fac.note;
    if (fac.id === "fac-1") {
      // Canteen note
      newNote = newStatus === "Very Busy" || newStatus === "Busy"
        ? "Counter 3 (Express Meals) online; Counter 1 (Beverages) currently backed up."
        : "All 4 food counters free flowing; plenty of seating available.";
    } else if (fac.id === "fac-3") {
      // Print shop
      newNote = newOccupancy > 25
        ? "All 3 high-speed laser printers running at capacity."
        : "1 color & 1 monochrome printer immediately available.";
    } else if (fac.id === "fac-4") {
      // Admin section
      const tokenNum = 44 + Math.floor(Math.random() * 12);
      newNote = `Token system active. Currently serving Token #${tokenNum} at Counter 2.`;
    }

    return {
      ...fac,
      currentOccupancy: newOccupancy,
      status: newStatus,
      waitTime: newWait,
      note: newNote,
    };
  });

  saveStoredFacilities(updatedFacilities);
  return { updatedFacilities, deltas };
}

/**
 * Time-of-day simulation presets for competition demos
 */
export function applyTimeOfDayPreset(preset: "rush" | "study" | "evening"): FacilityQueue[] {
  let updated: FacilityQueue[] = [];

  if (preset === "rush") {
    // 1:15 PM Lunch Rush: Canteen & Print shop very crowded, Library low
    updated = mockFacilities.map((f) => {
      if (f.id === "fac-1") return { ...f, currentOccupancy: 114, status: "Very Busy", waitTime: "25 - 35 mins", note: "Peak lunch rush. Counter 1 & 2 queues exceed 20 students." };
      if (f.id === "fac-3") return { ...f, currentOccupancy: 38, status: "Very Busy", waitTime: "15 - 20 mins", note: "Heavy queue for submission printouts and binding." };
      if (f.id === "fac-4") return { ...f, currentOccupancy: 28, status: "Medium", waitTime: "10 - 15 mins" };
      return { ...f, currentOccupancy: Math.floor(f.capacity * 0.25), status: "Low", waitTime: "2 - 4 mins" };
    });
  } else if (preset === "study") {
    // 4:30 PM Study Hours: Library busy, Canteen medium, Gym starting up
    updated = mockFacilities.map((f) => {
      if (f.id === "fac-2") return { ...f, currentOccupancy: 132, status: "Very Busy", waitTime: "5 - 8 mins", note: "Reading room 90% full. Circulation desks active." };
      if (f.id === "fac-1") return { ...f, currentOccupancy: 55, status: "Medium", waitTime: "6 - 10 mins", note: "Evening tea and snacks rush starting." };
      if (f.id === "fac-5") return { ...f, currentOccupancy: 58, status: "Medium", waitTime: "5 - 10 mins", note: "Badminton courts filled; gym equipment free." };
      return { ...f, currentOccupancy: Math.floor(f.capacity * 0.3), status: "Low", waitTime: "< 4 mins" };
    });
  } else {
    // 7:30 PM Evening: Gym busy, Library clearing, Canteen moderate
    updated = mockFacilities.map((f) => {
      if (f.id === "fac-5") return { ...f, currentOccupancy: 74, status: "Very Busy", waitTime: "10 - 15 mins", note: "Evening sports session at peak capacity." };
      if (f.id === "fac-1") return { ...f, currentOccupancy: 42, status: "Low", waitTime: "3 - 5 mins", note: "Dinner counters open; fast service." };
      if (f.id === "fac-2") return { ...f, currentOccupancy: 45, status: "Low", waitTime: "< 2 mins", note: "Circulation closing at 8:00 PM. Night reading hall open." };
      return { ...f, currentOccupancy: Math.floor(f.capacity * 0.15), status: "Low", waitTime: "< 2 mins" };
    });
  }

  saveStoredFacilities(updated);
  return updated;
}
