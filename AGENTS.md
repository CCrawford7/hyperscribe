# AGENTS.md
> Unified agent role definitions for all AI-assisted, modular, and developer responsibilities across this workspace.  
> Each "agent" is an isolated role or system responsible for a distinct capability or logic domain.

---

## 🔧 SYSTEM AGENTS (Reusable Across Projects)

### 🤖 Codex/ChatGPT (`Nova`)
**Type:** AI Agent  
**Role:** Code generation, refactoring, UI logic design, DevOps guidance  
**Projects:** All  
**Inputs:** Feature specs, UI prompts, architecture discussions  
**Outputs:** Code modules, dev docs, testing strategies, automation guides

### 🧠 PromptEngine
**Type:** Human+AI hybrid process  
**Role:** Designs smart prompts and reusable code generation templates  
**Projects:** p33pshow, Netpulse, MobileMedic  
**Outputs:** Codex-ready templates, creative/functional prompt engineering, style guides

### 🗂️ DevManager
**Type:** System role  
**Role:** Handles project organization, changelog tracking, versioning, ZIP exports  
**Outputs:** Clean file structure, semantic versioning, release folders

---

## 🧩 MODULE AGENTS (Per Project)

---

### 📄 Quick Notepad

#### RadialMenu
**Role:** UI agent for middle-click command wheel  
**Functions:** Copy, Cut, Download, Color Picker

#### FontManager
**Role:** Typography control agent  
**Functions:** Font size, style, Google Font import

#### ThemeSelector
**Role:** Theme preset agent  
**Functions:** Offers branded palettes (Default Bright/Dark, Monokai, Nord, Dracula) and applies matching styles

#### DownloadHelper
**Role:** File export agent  
**Functions:** Save note as `.txt`, default name `quicknote.txt`

---

### 📊 Netpulse

#### DataCollector
**Role:** Input tracker agent  
**Functions:** Monitor browser events, tab activity, scroll depth, etc.

#### AnalyticsCore
**Role:** Insight agent  
**Functions:** Aggregates data, renders trends, flags anomalies

#### Visualizer
**Role:** UI renderer  
**Functions:** Generates visual dashboards (charts, bars, timelines)

---

### 💊 MobileMedic

#### SymptomChecker
**Role:** Diagnostic agent  
**Functions:** Matches user input to known symptom clusters

#### TroubleshootSim
**Role:** Training sim AI  
**Functions:** Mimics real device issues, logs outcomes, gives user feedback

#### ReportGen
**Role:** Report builder agent  
**Functions:** Generates printable/shareable PDFs of diagnostic sessions

---

### 📸 p33pshow

#### SearchAggregator
**Role:** Indexer and crawler  
**Functions:** Fetches adult content metadata from 3rd-party sources

#### SessionManager
**Role:** Access + privacy controller  
**Functions:** Handles local-only session data, encrypted preferences

#### Monetizer
**Role:** Ad and affiliate agent  
**Functions:** Injects dynamic ad blocks or affiliate embeds for revenue

---

## 🔮 FUTURE AGENTS (shared roadmap)

| Agent | Role | Target Projects |
|-------|------|-----------------|
| CloudSyncAgent | Handles syncing with remote services like Firebase or Drive | Quick Notepad, MobileMedic |
| HistoryAgent | Tracks changes and session saves | Quick Notepad, Netpulse |
| AuthAgent | Manages user login and license validation | MobileMedic, p33pshow |
| AdsAgent | Injects or manages ad views for revenue | All freemium tools |
| TimerAgent | Controls daily usage limits | Quick Notepad |

---

## 📁 STRUCTURE

Each project folder includes:
- `/modules/`: AI-assisted or logic-based agents
- `/assets/`: Visuals, icons, splash images
- `AGENTS.md`: This file
- `DEV_GUIDE.md`: Per-project human-facing logic and config walkthrough

---

## 🧪 VERSION
AGENTS.md v1.0  
Maintainer: Christopher Crawford (xtfr2)  
Codex Assistant: Nova (ChatGPT, GPT-4)
