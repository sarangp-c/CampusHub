export type EventCategory = "All" | "Workshops" | "Clubs" | "Cultural" | "Sports" | "Academic";

export type QueueStatus = "Low" | "Medium" | "Busy" | "Very Busy";

export type ItemCategory = "All" | "Electronics" | "Lab Gear" | "Sports" | "Calculators" | "Media & AV";

export interface SubjectAttendance {
  id: string;
  code: string;
  name: string;
  attended: number;
  total: number;
  faculty: string;
  room: string;
}

export interface SimulationStep {
  stepNumber: number;
  classesMissed: number;
  attended: number;
  total: number;
  percentage: number;
  isSafe: boolean;
  isDropPoint: boolean;
  deltaFromThreshold: number;
}

export interface AttendancePredictionResult {
  currentPercentage: number;
  threshold: number;
  isCurrentlySafe: boolean;
  maxMissableClasses: number;
  nextMissPercentage: number | null;
  requiredClassesToRecover: number;
  timeline: SimulationStep[];
  percentageAfterMaxMiss: number;
  dropPercentage: number | null;
}

export interface CampusEvent {
  id: string;
  title: string;
  category: "Workshops" | "Clubs" | "Cultural" | "Sports" | "Academic";
  date: string;
  time: string;
  venue: string;
  description: string;
  organizer: string;
  isFeatured?: boolean;
  badgeText?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface FacilityQueue {
  id: string;
  name: string;
  category: string;
  status: QueueStatus;
  waitTime: string;
  currentOccupancy: number;
  capacity: number;
  peakHours: string;
  note: string;
  icon: string;
}

export interface BorrowItem {
  id: string;
  name: string;
  category: "Electronics" | "Lab Gear" | "Sports" | "Calculators" | "Media & AV";
  availability: "Available" | "Currently Borrowed";
  totalQuantity: number;
  availableQuantity: number;
  location: string;
  description: string;
  specs?: string;
  maxDuration: string;
  borrowedByMe?: boolean;
  dueDate?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  proofPhotoUrl?: string;
  borrowedAt?: string;
  borrowerName?: string;
  borrowerId?: string;
  conditionNotes?: string;
}
