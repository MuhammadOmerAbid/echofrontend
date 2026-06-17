# Echo — Anonymous Student Voice Platform

> Per-campus anonymous feedback system with a full machine learning pipeline.
> FastAPI · Next.js 14 · SQLite · NLTK · scikit-learn · TextBlob

---

## What Echo Does

Students at a university submit anonymous suggestions by category and campus location — no account, no name, no student ID, ever. Each submission gets a UUID4 token as proof of submission, not proof of identity.

The admin sees ML-aggregated patterns: weekly volume trends, sentiment by category, campus location heatmaps, topic clusters from K-Means, priority-ranked issues, Z-score anomaly alerts, and a word cloud of the most-used terms. No individual submission is ever surfaced to the admin in a way that could be tied to a person.

Every institution runs its own local, private copy of Echo. Data never leaves the campus machine.

---

## Architecture

```
┌──────────────────────┐         ┌──────────────────────────────────┐
│   Next.js 14 (fr/)   │ ──────▶ │       FastAPI (br/)              │
│                      │         │                                  │
│  /           Landing │         │  POST /suggestions               │
│  /submit     Form    │ ◀────── │  GET  /admin/dashboard           │
│  /setup      Wizard  │         │  GET  /admin/insights            │
│  /admin/*    Panel   │         │  GET  /admin/analytics           │
│                      │         │  GET  /admin/trends              │
└──────────────────────┘         │  GET  /admin/submissions         │
                                  │  POST /admin/login               │
                                  │  POST /admin/locations           │
                                  │  DELETE /admin/locations/{id}    │
                                  └───────────────┬──────────────────┘
                                                  │
                                  ┌───────────────▼──────────────────┐
                                  │       Data Science (Python)      │
                                  │                                  │
                                  │  SQLite ──▶ Pandas DataFrames    │
                                  │  NLTK  ──▶ Text Cleaning         │
                                  │  TextBlob ▶ Sentiment Analysis   │
                                  │  TF-IDF ──▶ Keyword Extraction   │
                                  │  K-Means ─▶ Topic Clustering     │
                                  │  PCA ─────▶ 2D Visualization     │
                                  │  SciPy ───▶ Z-Score Anomalies    │
                                  │  LinReg ──▶ Volume Forecasting   │
                                  │  WordCloud ▶ Keyword Image       │
                                  └──────────────────────────────────┘
```

---

## Tech Stack


| Layer          | Technology                        | Role                           |
| -------------- | --------------------------------- | ------------------------------ |
| Frontend       | Next.js 14 App Router, TypeScript | Pages, routing, SSR            |
| Styling        | Tailwind CSS, Framer Motion       | Design system, animations      |
| Charts         | Recharts                          | Bar, line, pie, scatter charts |
| Backend        | FastAPI, Python 3.11+             | REST API, background tasks     |
| Database       | SQLite3 (WAL mode)                | Local storage, zero server     |
| Text Cleaning  | NLTK                              | Tokenization, stopword removal |
| Sentiment      | TextBlob                          | Polarity scoring               |
| Keywords       | scikit-learn TF-IDF               | Term importance extraction     |
| Clustering     | scikit-learn K-Means              | Topic grouping                 |
| Dimensionality | scikit-learn PCA                  | 2D scatter visualization       |
| Statistics     | SciPy, NumPy                      | Z-score, linear regression     |
| Word Cloud     | wordcloud + matplotlib            | Keyword image generation       |
| Auth           | bcrypt, python-jose JWT           | Admin password + session       |
| Sanitization   | bleach                            | XSS prevention on all input    |
| Icons          | lucide-react                      | Admin panel icons              |


---

## Project Structure

```
ECHO/
├── br/                              # Backend (FastAPI + Python DS)
│   ├── main.py                      # App entry, CORS config, router registration
│   ├── requirements.txt
│   ├── .env                         # JWT_SECRET (gitignored)
│   │
│   ├── routers/
│   │   ├── setup.py                 # GET /setup/status, POST /setup/complete
│   │   ├── suggestions.py           # POST /suggestions, GET /suggestions/track
│   │   └── admin.py                 # All /admin/* endpoints
│   │
│   ├── core/
│   │   ├── database.py              # SQLite schema init + all CRUD functions
│   │   ├── security.py              # bcrypt hash/verify, JWT create/verify, bleach
│   │   ├── anonymizer.py            # uuid.uuid4() token generation
│   │   └── config.py                # Default categories and locations
│   │
│   ├── data_science/
│   │   ├── nlp.py                   # clean_text, get_sentiment, extract_keywords
│   │   ├── analytics.py             # get_dashboard_data, get_analytics_data,
│   │   │                            #   get_trends_data, get_top_priorities
│   │   ├── clustering.py            # run_clustering (K-Means + PCA + labels)
│   │   ├── charts.py                # generate_wordcloud (PNG bytes)
│   │   └── pipeline.py              # process_pending, run_clustering_pipeline,
│   │                                #   get_insights_data
│   │
│   └── data/
│       └── seed.py                  # 100 demo suggestions (COMSATS Lahore)
│
├── fr/                              # Frontend (Next.js 14)
│   ├── app/
│   │   ├── layout.tsx               # Root layout: Poppins + DM Sans fonts
│   │   ├── globals.css              # Base styles, light theme
│   │   ├── page.tsx                 # Landing page (hero, #about, #track sections)
│   │   ├── submit/page.tsx          # Student submission form
│   │   ├── setup/page.tsx           # First-run 3-step wizard
│   │   └── admin/
│   │       ├── layout.tsx           # Admin layout: white bg override
│   │       ├── login/page.tsx       # Admin login (JWT → localStorage)
│   │       ├── dashboard/page.tsx   # 4 metrics + 4 charts
│   │       ├── insights/page.tsx    # K-Means scatter, priorities, sentiment delta
│   │       ├── analytics/page.tsx   # Day-of-week, text stats, category evolution
│   │       ├── trends/page.tsx      # Linear regression forecast, momentum
│   │       ├── submissions/page.tsx # Full paginated submission table
│   │       └── settings/page.tsx    # Institution, password, locations CRUD
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Card.tsx             # White card with optional accent border
│   │   │   ├── MetricCard.tsx       # Stat metric display card
│   │   │   ├── Button.tsx           # Primary / outline button
│   │   │   ├── Badge.tsx            # Sentiment / category badge
│   │   │   ├── Input.tsx            # Text input with label
│   │   │   ├── Select.tsx           # Dropdown select
│   │   │   ├── Textarea.tsx         # Multiline text input
│   │   │   └── ErrorBox.tsx         # Inline error display
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx           # Landing + non-admin nav (sticky/transparent)
│   │   │   ├── AdminSidebar.tsx     # Floating fixed sidebar (position: fixed)
│   │   │   └── AdminPageSkeleton.tsx # Animated skeleton for admin loading states
│   │   │
│   │   ├── features/
│   │   │   ├── DashboardMockup.tsx  # Animated hero mockup on landing
│   │   │   ├── AnomalyBanner.tsx    # Z-score spike alert banner
│   │   │   ├── PriorityCard.tsx     # Top priority issue display
│   │   │   └── SentimentDelta.tsx   # Week-over-week sentiment table
│   │   │
│   │   └── charts/
│   │       ├── CategoryBar.tsx      # Recharts BarChart by category
│   │       ├── TrendLine.tsx        # Recharts LineChart with anomaly markers
│   │       ├── SentimentPie.tsx     # Recharts PieChart (positive/neutral/negative)
│   │       ├── LocationHeatmap.tsx  # 5×5 CSS grid with hover tooltip
│   │       ├── ClusterScatter.tsx   # PCA scatter (custom SVG or Recharts)
│   │       └── WordCloudImg.tsx     # PNG image fetched from /admin/wordcloud
│   │
│   └── lib/
│       ├── api.ts                   # All fetch calls + TypeScript interfaces
│       └── auth.ts                  # JWT localStorage helpers, isAuthenticated()
│
├── README.md
└── DATA_SCIENCE.md                  # Full data science documentation
```

---

## Setup

### Prerequisites

Install these before anything else:


| Tool    | Minimum version | Check command                                              | Download           |
| ------- | --------------- | ---------------------------------------------------------- | ------------------ |
| Python  | 3.11+           | `py --version` (Windows) / `python3 --version` (Mac/Linux) | python.org         |
| Node.js | 18+             | `node --version`                                           | nodejs.org         |
| npm     | 9+              | `npm --version`                                            | comes with Node.js |


---

### Step 1 — Clone / Download the project

```bash
# If you have git:
git clone <repo-url>
cd ECHO

# Or just extract the ZIP and open a terminal in the ECHO folder
```

---

### Step 2 — Backend setup

Open a terminal in the `ECHO/` folder:

```bash
cd br
```

#### 2a — Create a virtual environment (recommended)

```bash
# Windows
py -m venv venv
venv\Scripts\activate

# Mac / Linux
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` at the start of the prompt. Every time you open a new terminal for the backend, activate it again.

#### 2b — Install Python dependencies

```bash
pip install -r requirements.txt
```

This installs FastAPI, uvicorn, scikit-learn, NLTK, TextBlob, wordcloud, bcrypt, and all other backend libraries. Takes 1–3 minutes on first run.

#### 2c — Create the environment file

```bash
# Windows
echo JWT_SECRET=change-this-to-any-long-random-string > .env

# Mac / Linux
echo "JWT_SECRET=change-this-to-any-long-random-string" > .env
```

#### 2d — Start the backend server

```bash
# Windows
py -m uvicorn main:app --reload

# Mac / Linux
uvicorn main:app --reload
```

You should see:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

NLTK datasets (punkt, stopwords, averaged_perceptron_tagger) download automatically on first startup — this may take 10–20 seconds.

Leave this terminal open. API runs at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

---

### Step 3 — Frontend setup

Open a **second terminal** in the `ECHO/` folder:

```bash
cd fr
```

#### 3a — Install Node.js dependencies

```bash
npm install
```

This installs Next.js, React, Tailwind CSS, Recharts, Framer Motion, and all other frontend packages. Takes 1–3 minutes on first run. Creates a `node_modules/` folder (~300 MB).

#### 3b — Start the frontend dev server

```bash
npm run dev
```

You should see:

```
▲ Next.js 14.x.x
- Local: http://localhost:3000
✓ Ready in Xs
```

Leave this terminal open. App runs at `http://localhost:3000`.

> **If you see 404 errors for static chunks** (e.g. after code changes), delete the `.next` folder and restart:
>
> ```bash
> # Windows (PowerShell)
> Remove-Item -Recurse -Force .next
> npm run dev
>
> # Mac / Linux
> rm -rf .next && npm run dev
> ```

---

### Step 4 — Load data and log in

At this point `http://localhost:3000` is live but the database is empty. Choose one:

#### Option A — Demo data (recommended for first run)

Loads 100 realistic submissions for COMSATS University Islamabad, Lahore Campus so all charts are populated immediately.

Open a **third terminal** in `ECHO/`:

```bash
cd br

# Windows (with venv active)
py data/seed.py

# Mac / Linux (with venv active)
python data/seed.py
```

Output:

```
Seeded 107 suggestions across 4 categories.
Institution : COMSATS University Islamabad, Lahore Campus
Admin login : comsats2026
```

Go to `http://localhost:3000/admin/login` and enter password: `**comsats2026**`

#### Option B — Fresh setup for your own campus

Go to `http://localhost:3000/setup` and follow the 3-step wizard:


| Step            | What to fill in                                |
| --------------- | ---------------------------------------------- |
| 1 — Institution | Your university name and city                  |
| 2 — Locations   | Add your actual campus locations               |
| 3 — Password    | Set your own admin password (min 6 characters) |


After finishing, go to `http://localhost:3000/admin/login` and log in.

---

### Quick-start summary (every time after first setup)

Once everything is installed, starting Echo again is just two commands in two terminals:

**Terminal 1 — Backend:**

```bash
cd br
venv\Scripts\activate        # Windows  (skip if venv not used)
source venv/bin/activate     # Mac/Linux (skip if venv not used)
py -m uvicorn main:app --reload      # Windows
# uvicorn main:app --reload          # Mac/Linux
```

**Terminal 2 — Frontend:**

```bash
npm install
cd fr
npm run dev
```

Open `http://localhost:3000`.

---

## Admin Panel Pages


| Page        | URL                  | What It Shows                                                                                                           |
| ----------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Dashboard   | `/admin/dashboard`   | 4 metric cards, category bar chart, weekly trend line, sentiment pie, campus heatmap, word cloud                        |
| ML Insights | `/admin/insights`    | K-Means cluster scatter (PCA 2D), top 3 priority issues, sentiment delta vs last week, anomaly alert                    |
| Analytics   | `/admin/analytics`   | Day-of-week patterns, text length distribution, category evolution over 8 weeks, sentiment band chart, location ranking |
| Trends      | `/admin/trends`      | Linear regression forecast (4 weeks ahead), momentum indicator, week-over-week change, per-category momentum            |
| Submissions | `/admin/submissions` | Paginated full table with filters by category, location, sentiment                                                      |
| Settings    | `/admin/settings`    | Institution info, password change, category list, campus locations CRUD (add/delete)                                    |


---

## Student Flow

1. Open `http://localhost:3000` (or the campus machine IP if on a local network)
2. Click **Submit Anonymously** — goes to `/submit`
3. Select a **category** (Facilities / Academic / Campus Life / Open)
4. Select a **campus location** from the dropdown (configured by admin)
5. Type the suggestion (max 1000 characters)
6. Submit — receive a UUID token as receipt
7. Optionally paste the token at `/#track` to check the processing status

**Rate limit:** 3 submissions per hour per browser session.

---

## Data Science Pipeline

```
[1] INGEST
    Student submits → Pydantic validates → bleach sanitizes → rate-limit check
    → uuid.uuid4() token → INSERT suggestions (processed=0)

[2] NLP (runs in FastAPI BackgroundTask after each insert)
    NLTK clean_text: lowercase → strip punctuation → tokenize → remove stopwords
    TextBlob: polarity score (-1 to +1) → positive / neutral / negative label
    TF-IDF: extract top 5 keywords per submission
    Recency + sentiment → priority_score
    UPDATE suggestions SET processed=1

[3] AGGREGATION (on each admin dashboard request)
    Pandas: group by category, location, week_num
    SciPy Z-score: flag weeks with volume > 2σ above rolling mean
    Sentiment delta: this_week_avg − last_week_avg per category

[4] CLUSTERING (on each insights page request, cached 10 min)
    TF-IDF matrix across all cleaned text
    K-Means (k=6): assign each suggestion to a topic cluster
    PCA (2 components): reduce for scatter visualization
    Centroid top-3 TF-IDF terms → auto-label each cluster
    UPDATE suggestions SET cluster_id

[5] FORECASTING (on trends page)
    SciPy linear regression on weekly submission counts
    Slope → momentum classification (growing / stable / declining)
    Extrapolate 4 weeks ahead for forecast chart

[6] VISUALIZATION
    Recharts: bar, line, pie, scatter
    Custom CSS 5×5 grid: campus heatmap with hover tooltip
    Python wordcloud: PNG served from /admin/wordcloud endpoint
```

---

## Security Design


| Concern              | How Echo handles it                                                                                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Student identity     | UUID4 token only. No name, email, IP, device fingerprint, or student ID is ever collected or stored. The token is cryptographically random — unlinkable to any person, even by the database owner.         |
| Admin authentication | Password is bcrypt-hashed with a random salt and stored in SQLite. A JWT (1 hour TTL) is issued on login and stored in `localStorage`. All `/admin/*` routes verify the token via `Depends(verify_token)`. |
| Input sanitization   | Every submission text passes through `bleach.clean()` before storage. Pydantic enforces types and length limits at the API boundary.                                                                       |
| SQL injection        | All database queries use parameterized placeholders (`?`). No f-string or concatenated SQL anywhere.                                                                                                       |
| Rate limiting        | The `rate_limit` table records session IDs (random browser-generated strings) and timestamps. More than 3 submissions within 60 minutes returns HTTP 429.                                                  |
| CORS                 | `allow_origins` is set to `http://localhost:3000` only. Change to the campus machine IP for local network deployment.                                                                                      |
| Secrets              | `JWT_SECRET` lives in `.env` which is gitignored. The DB file (`data/echo.db`) is also gitignored.                                                                                                         |


---

## Locations Management

Admins can add and remove campus locations at any time from **Settings → Campus Locations**:

- **Name** — what students see in the submission dropdown
- **Building** — optional sub-label (e.g., "Block A")
- **Grid X, Grid Y** — position on the 5×5 campus heatmap (1–5 each axis)

Removing a location does not delete existing submissions that used it — it only stops it from appearing in future submission forms.

---

## Color Palette


| Token   | Hex       | Role                              |
| ------- | --------- | --------------------------------- |
| `ink`   | `#111210` | Primary text color                |
| `ink2`  | `#1e1f1b` | Secondary text / dark accents     |
| `paper` | `#f7f5ef` | Page backgrounds (student-facing) |
| `warm`  | `#ede9e0` | Section backgrounds, admin layout |
| `sage`  | `#e8580a` | Primary accent, buttons           |
| `sage2` | `#f97316` | Hover states, highlights          |
| `leaf`  | `#fff1e6` | Pale tint, borders                |
| `stone` | `#8c897f` | Muted / secondary text            |
| `cream` | `#faf9f5` | Card backgrounds                  |


Typography: **Poppins** (headings via `--font-display`) · **DM Sans** (body via `--font-sans`) · **DM Serif Display** (logo italic only via `--font-serif`).

---

## Environment Variables

`br/.env`:

```
JWT_SECRET=your-secret-here-minimum-32-characters
```

Change this before any deployment. Never commit `.env` to git.

---

## Running on a Campus Network

To let all students on the same Wi-Fi access Echo:

1. Run both services on one dedicated machine
2. In `br/main.py`, change CORS origin from `http://localhost:3000` to `http://<machine-ip>:3000`
3. In `fr/.env.local`, set `NEXT_PUBLIC_API_URL=http://<machine-ip>:8000`
4. Students open `http://<machine-ip>:3000` in any browser

---

## Project Status

Echo is complete. It is a local, single-campus deployment — no Docker, no cloud, no multi-tenant setup. Run it on any machine with Python and Node.js.