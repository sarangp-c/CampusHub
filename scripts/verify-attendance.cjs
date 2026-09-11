// Direct test of the math logic in node
const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

function calculateAttendancePercentage(attended, total) {
  if (total <= 0) return 0;
  return roundToTwo((attended / total) * 100);
}

function calculateAttendanceAfterMissing(attended, total, classesMissed) {
  const newTotal = total + classesMissed;
  if (newTotal <= 0) return 0;
  return roundToTwo((attended / newTotal) * 100);
}

function simulateAttendance(attended, total, threshold = 75) {
  const safeAttended = Math.max(0, Math.floor(attended));
  const safeTotal = Math.max(safeAttended, Math.floor(total));
  const currentPct = calculateAttendancePercentage(safeAttended, safeTotal);
  const isCurrentlySafe = currentPct >= threshold;

  if (isCurrentlySafe) {
    let maxN = 0;
    while (true) {
      const nextN = maxN + 1;
      const nextPct = roundToTwo((safeAttended / (safeTotal + nextN)) * 100);
      if (nextPct >= threshold) {
        maxN = nextN;
      } else {
        break;
      }
      if (maxN > 500) break;
    }

    const percentageAfterMaxMiss = calculateAttendanceAfterMissing(safeAttended, safeTotal, maxN);
    const dropPercentage = calculateAttendanceAfterMissing(safeAttended, safeTotal, maxN + 1);

    const timeline = [];
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

  let requiredM = 0;
  while (true) {
    requiredM++;
    const testPct = roundToTwo(((safeAttended + requiredM) / (safeTotal + requiredM)) * 100);
    if (testPct >= threshold) {
      break;
    }
    if (requiredM > 500) break;
  }

  return {
    currentPercentage: currentPct,
    threshold,
    isCurrentlySafe: false,
    maxMissableClasses: 0,
    nextMissPercentage: calculateAttendanceAfterMissing(safeAttended, safeTotal, 1),
    requiredClassesToRecover: requiredM,
    timeline: [],
    percentageAfterMaxMiss: currentPct,
    dropPercentage: null,
  };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('=== CAMPUSHUB MATHEMATICAL VERIFICATION ===');

// Hero Subject (42/50)
const hero = simulateAttendance(42, 50, 75);
assert(hero.currentPercentage === 84, `42/50 current attendance is 84% (got ${hero.currentPercentage}%)`);
assert(hero.maxMissableClasses === 6, `42/50 allows missing exactly 6 classes (got ${hero.maxMissableClasses})`);
assert(hero.percentageAfterMaxMiss === 75, `Attendance after 6 misses is 75.00% (got ${hero.percentageAfterMaxMiss}%)`);
assert(hero.dropPercentage === 73.68, `Attendance on 7th miss drops to 73.68% (got ${hero.dropPercentage}%)`);

// Step-by-step spot checks from prompt:
// 42/50=84%, 42/51≈82.35%, 42/52≈80.77%
assert(hero.timeline[0].percentage === 84, 'Timeline step 0 is 84.00%');
assert(hero.timeline[1].percentage === 82.35, 'Timeline step 1 is 82.35%');
assert(hero.timeline[2].percentage === 80.77, 'Timeline step 2 is 80.77%');
assert(hero.timeline[6].percentage === 75.00, 'Timeline step 6 is 75.00%');
assert(hero.timeline[7].percentage === 73.68, 'Timeline step 7 is 73.68%');
assert(hero.timeline[7].isDropPoint === true, 'Timeline step 7 is correctly flagged as isDropPoint');

// Operating Systems (31/40)
const os = simulateAttendance(31, 40, 75);
assert(os.currentPercentage === 77.5, `31/40 current attendance is 77.5% (got ${os.currentPercentage}%)`);
assert(os.maxMissableClasses === 1, `31/40 allows missing 1 class (got ${os.maxMissableClasses})`);

// Deficit Subject (28/38 = 73.68%)
const db = simulateAttendance(28, 38, 75);
assert(db.currentPercentage === 73.68, `28/38 current attendance is 73.68% (got ${db.currentPercentage}%)`);
assert(db.isCurrentlySafe === false, '28/38 correctly identified as unsafe (< 75%)');
assert(db.maxMissableClasses === 0, '28/38 has 0 missable classes');
assert(db.requiredClassesToRecover === 2, `28/38 requires 2 consecutive classes to reach 75% (got ${db.requiredClassesToRecover})`);

// Borderline Subject (18/24 = 75.00%)
const se = simulateAttendance(18, 24, 75);
assert(se.currentPercentage === 75, `18/24 is exactly 75.00% (got ${se.currentPercentage}%)`);
assert(se.maxMissableClasses === 0, '18/24 allows 0 missable classes since any miss drops below 75%');
assert(se.nextMissPercentage === 72, `18/25 drops to 72% (got ${se.nextMissPercentage}%)`);

// High Attendance Subject (45/52 = 86.54%)
const cn = simulateAttendance(45, 52, 75);
assert(cn.currentPercentage === 86.54, `45/52 current attendance is 86.54% (got ${cn.currentPercentage}%)`);
assert(cn.maxMissableClasses === 8, `45/52 allows missing 8 classes (got ${cn.maxMissableClasses})`);
assert(cn.percentageAfterMaxMiss === 75, `45/60 is 75.00% (got ${cn.percentageAfterMaxMiss}%)`);

console.log('\n🌟 ALL 14 AUTOMATED VERIFICATION ASSERTIONS PASSED!\n');
