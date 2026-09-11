import { SimulationStep, AttendancePredictionResult } from "../types/campus";

/**
 * Rounds a number to two decimal places
 */
export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Computes the exact attendance percentage for given attended & total classes.
 */
export function calculateAttendancePercentage(attended: number, total: number): number {
  if (total <= 0) return 0;
  return roundToTwo((attended / total) * 100);
}

/**
 * Calculates attendance after missing N future classes.
 */
export function calculateAttendanceAfterMissing(
  attended: number,
  total: number,
  classesMissed: number
): number {
  const newTotal = total + classesMissed;
  if (newTotal <= 0) return 0;
  return roundToTwo((attended / newTotal) * 100);
}

/**
 * Calculates attendance after attending M future consecutive classes.
 */
export function calculateAttendanceAfterAttending(
  attended: number,
  total: number,
  classesAttended: number
): number {
  const newTotal = total + classesAttended;
  if (newTotal <= 0) return 0;
  return roundToTwo(((attended + classesAttended) / newTotal) * 100);
}

/**
 * Core attendance prediction simulation engine.
 * Computes:
 * - Current percentage
 * - Max missable classes while staying >= threshold
 * - Drop step and drop percentage
 * - Consecutive classes needed to recover if below threshold
 * - Detailed step-by-step What-If timeline array
 */
export function simulateAttendance(
  attended: number,
  total: number,
  threshold: number = 75
): AttendancePredictionResult {
  const safeAttended = Math.max(0, Math.floor(attended));
  const safeTotal = Math.max(safeAttended, Math.floor(total));
  const currentPct = calculateAttendancePercentage(safeAttended, safeTotal);
  const isCurrentlySafe = currentPct >= threshold;

  // Case 1: Student is currently AT or ABOVE threshold
  if (isCurrentlySafe) {
    let maxN = 0;
    // Iterate N = 1, 2, 3... until (attended / (total + N)) * 100 drops below threshold
    while (true) {
      const nextN = maxN + 1;
      const nextPct = roundToTwo((safeAttended / (safeTotal + nextN)) * 100);
      if (nextPct >= threshold) {
        maxN = nextN;
      } else {
        break;
      }
      // Safety limit to avoid infinite loops if threshold is 0
      if (maxN > 500) break;
    }

    const percentageAfterMaxMiss = calculateAttendanceAfterMissing(safeAttended, safeTotal, maxN);
    const dropPercentage = calculateAttendanceAfterMissing(safeAttended, safeTotal, maxN + 1);

    // Build What-If timeline
    // Show from Current (0) through maxN + 2 (so the drop point and 1 step after are clearly visible)
    const timeline: SimulationStep[] = [];
    const totalStepsToShow = Math.min(Math.max(maxN + 2, 4), 15);

    for (let i = 0; i <= totalStepsToShow; i++) {
      const pct = calculateAttendanceAfterMissing(safeAttended, safeTotal, i);
      const isSafe = pct >= threshold;
      const isDropPoint = i === maxN + 1;

      timeline.push({
        stepNumber: i,
        classesMissed: i,
        attended: safeAttended,
        total: safeTotal + i,
        percentage: pct,
        isSafe,
        isDropPoint,
        deltaFromThreshold: roundToTwo(pct - threshold),
      });
    }

    return {
      currentPercentage: currentPct,
      threshold,
      isCurrentlySafe: true,
      maxMissableClasses: maxN,
      nextMissPercentage: dropPercentage,
      requiredClassesToRecover: 0,
      timeline,
      percentageAfterMaxMiss,
      dropPercentage,
    };
  }

  // Case 2: Student is currently BELOW threshold
  // Calculate how many consecutive classes must be attended to recover
  let requiredM = 0;
  while (true) {
    requiredM++;
    const testPct = roundToTwo(((safeAttended + requiredM) / (safeTotal + requiredM)) * 100);
    if (testPct >= threshold) {
      break;
    }
    if (requiredM > 500) break;
  }

  // Build timeline for recovery
  const timeline: SimulationStep[] = [];
  const stepsToShow = Math.min(Math.max(requiredM + 1, 3), 10);

  for (let i = 0; i <= stepsToShow; i++) {
    const pct = calculateAttendanceAfterAttending(safeAttended, safeTotal, i);
    const isSafe = pct >= threshold;
    const isDropPoint = false;

    timeline.push({
      stepNumber: i,
      classesMissed: 0,
      attended: safeAttended + i,
      total: safeTotal + i,
      percentage: pct,
      isSafe,
      isDropPoint,
      deltaFromThreshold: roundToTwo(pct - threshold),
    });
  }

  return {
    currentPercentage: currentPct,
    threshold,
    isCurrentlySafe: false,
    maxMissableClasses: 0,
    nextMissPercentage: calculateAttendanceAfterMissing(safeAttended, safeTotal, 1),
    requiredClassesToRecover: requiredM,
    timeline,
    percentageAfterMaxMiss: currentPct,
    dropPercentage: null,
  };
}
