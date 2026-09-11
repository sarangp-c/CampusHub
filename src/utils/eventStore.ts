import { CampusEvent } from "../types/campus";
import { mockEvents } from "../data/mockData";

const STORAGE_KEY = "campushub_events_v1";

// Pool of external events that can be dynamically ingested
export const externalPortalMockPool: CampusEvent[] = [
  {
    id: "ext-101",
    title: "National Quantum Computing & Cryptography Summit",
    category: "Academic",
    date: "Sep 22, 10:00 AM",
    time: "10:00 AM - 1:00 PM",
    venue: "Main Auditorium (Silver Jubilee Block)",
    description: "Keynote presentation by visiting scientists from C-DAC and IISc Bangalore on post-quantum lattice cryptography.",
    organizer: "University Academic Affairs Council",
    isFeatured: true,
    badgeText: "Synced from Portal",
  },
  {
    id: "ext-102",
    title: "Inter-Hostel Premier League (IHPL) Football Finals",
    category: "Sports",
    date: "Sep 24, 4:30 PM",
    time: "4:30 PM - 6:30 PM",
    venue: "University Central Football Ground",
    description: "Grand finals match between Block Alpha and Block Gamma with commentary and floodlight kickoff.",
    organizer: "Hostel Student Affairs Committee",
    badgeText: "Synced from Portal",
  },
  {
    id: "ext-103",
    title: "Campus Photography & Drone Videography Workshop",
    category: "Clubs",
    date: "Sep 26, 3:00 PM",
    time: "3:00 PM - 5:30 PM",
    venue: "Design Studio & Campus Lawns",
    description: "Hands-on camera framing, golden hour exposure settings, and FAA/DGCA drone flight regulations demo.",
    organizer: "Iris Shutterbugs Photography Club",
    badgeText: "Synced from Portal",
  },
];

export function getStoredEvents(): CampusEvent[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading events from localStorage", e);
  }
  return [...mockEvents];
}

export function saveStoredEvents(events: CampusEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    // Dispatch custom window event so other components update reactively
    window.dispatchEvent(new Event("campushub_events_updated"));
  } catch (e) {
    console.error("Error saving events to localStorage", e);
  }
}

export function resetStoredEvents(): CampusEvent[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("campushub_events_updated"));
  } catch (e) {
    console.error("Error resetting events", e);
  }
  return [...mockEvents];
}
