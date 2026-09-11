# 🎓 CampusHub — Student Navigation & Productivity Platform

> **Everything you need to navigate college life.**  
> A competition-ready, unified campus platform consolidating real-time attendance forecasting, automated event discovery, smart facility telemetry, and an anti-fraud equipment lending library into one responsive experience.

---

## 🌟 Key Features

### 1. 📊 Hero Attendance Predictor & Recovery Engine
* **Precise Threshold Math**: Real-time iterative calculations verifying the mandatory 75% attendance criterion with 0% hardcoded values.
* **"What-If" Drop-Point Timeline**: Simulates future missed classes one-by-one to reveal the exact breaking point where attendance falls below 75%.
* **Deficit Recovery Calculator**: Computes the exact number of consecutive classes a student must attend to safely recover back to ≥ 75%.
* **1-Click Subject Presets**: Pre-fills real semester courses (CS301–CS305) with 1 click.

### 2. 📡 Campus Events (External Portal Sync)
* **Automated External Sync**: Simulates a live data ingestion pipeline connected to the central university notice board (`https://portal.university.edu/api/v2/events`).
* **Live Ingestion Feedback**: Dynamic toast stream updates and green *"Synced from Portal"* verification badges.
* **Organizer Contact Cards**: Direct coordinator outreach modal with coordinator names, direct phone dials, and email links.
* **Categorized Discovery**: Filters across Workshops, Clubs, Cultural, Sports, and Academic events with instant search.

### 3. ⏱️ QueueLess (Campus Facility Telemetry)
* **Live Wait-Time Monitoring**: Real-time occupancy, queue estimates, and peak-hour alerts across 6 campus hubs (Canteen, Library, Stationery Desk, Gym, Admin Office, Lab).
* **Simulated Sensor Telemetry**: Interactive refresh simulating IoT door counters and Wi-Fi controller visitor deltas (`▲ +5` / `▼ -3`).
* **Schedule Presets**: Jump directly to *Lunch Rush (1:15 PM)*, *Study Hours (4:30 PM)*, or *Evening Gym (7:30 PM)*.

### 4. 📦 BorrowBox (Equipment Lending Desk)
* **Temporary Resource Lending**: Community catalog of campus equipment (calculators, adapters, sports gear, lab kits) with strict lending windows.
* **Anti-Fraud Physical Handover Verification**: Requires a photo capture of the physical item at the handover counter along with a condition checklist and digital timestamp watermark.
* **Visual Handover Gallery**: Expandable proof thumbnails on borrowed cards with full lightbox modal inspection.
* **Full Return Flow**: "Return to Counter" action restores stock to the catalog and archives verification proof.
* **Desk Contact Transparency**: In-charge coordinator contact information on equipment listings.

---

## 🛠️ Tech Stack

* **Frontend Framework**: React 19, TypeScript
* **Styling**: Tailwind CSS v4, Lucide React Icons
* **Build Tool**: Vite v8
* **State Management**: Client-side Reactive Store + Browser `localStorage`
* **Architecture**: Zero-backend dependency — 100% portable for hackathons and live evaluations.

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* `npm`

### Installation & Run
```bash
# 1. Clone the repository
git clone <YOUR_REPO_URL>
cd "Ai assist learning"

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Run production build & verify
npm run build
npm run lint
```

### Run Mathematical Test Suite
```bash
# Validates the attendance predictor logic across 14 rigorous edge cases
node scripts/verify-attendance.cjs
```

---

## 📁 Repository Structure

```text
├── public/                 # Static SVGs and icons
├── scripts/
│   └── verify-attendance.cjs # Attendance math test suite
├── src/
│   ├── assets/             # Brand graphics and images
│   ├── components/         # Shared UI (Navbar, Footer, AttendanceGauge)
│   ├── data/               # Mock datasets
│   ├── pages/              # Application pages
│   │   ├── HomePage.tsx
│   │   ├── AttendancePage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── QueueLessPage.tsx
│   │   └── BorrowBoxPage.tsx
│   ├── types/              # TypeScript interface definitions
│   ├── utils/              # Calculation & storage utility layers
│   ├── App.tsx             # Root hash router & layout
│   ├── index.css           # Tailwind CSS configuration
│   └── main.tsx            # Application entry point
├── eslint.config.js        # Linter rules
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.js          # Vite bundler configuration
```

---

## 👨‍💻 Author
Developed for campus productivity and hackathon pitch demonstrations.
