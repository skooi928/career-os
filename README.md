# Career OS

> **Your career, one platform.** Built for Talentbank 2026.

Career OS is a full-stack career development platform that connects **job seekers**, **employers**, **mentors**, and **admins** in a single ecosystem. Instead of juggling separate tools for resumes, job boards, learning, and hiring, Career OS brings everything together — powered by AI at every step.

---

## What's inside Career OS

### Dashboard
Your home base after login.

- Personalised welcome and career summary
- Quick stats: applications, saved jobs, offers (candidates) or posted jobs (employers)
- **Analyze Career Path** — one-click trigger for AI career analysis
- Recent activity feed and personal quick-task list
- Recommended jobs carousel matched to your profile
- Enrolled course progress at a glance
- Inline views for application history, saved jobs, and posted jobs (employers can review applicants and update status: Pending, Scheduled Interview, Accepted, Rejected)

---

### Living Portfolio & Resume Builder
Turn a PDF resume into a structured, always-updated profile.

### The problem
- Resumes are static PDFs that go out of date quickly
- Job seekers lack personalised guidance on skills and career direction
- Employers struggle to match candidates, benchmark pay, and understand employee sentiment
- Upskilling, hiring, and portfolio building live in disconnected silos

### Our solution
Career OS unifies the career journey:

1. **Upload once, stay current** — AI extracts and structures resume data into a living portfolio
2. **Learn and prove skills** — courses, digital badges, and verified credentials unlock real industry projects
3. **Prepare to get hired** — mock interviews, career trajectory maps, and job marketplace in one place
4. **Empower organisations** — hiring pipelines, anonymous employee surveys with AI insights, and salary benchmarking

---

### Job Marketplace
Full job search and hiring workflow.

**For candidates**
- Browse and search jobs by keyword, employment type, and location
- View job details: company, salary range (RM), skills required, deadlines
- Save/bookmark jobs
- Apply with resume upload and custom questionnaire answers
- Track application status from the dashboard

**For employers**
- **Post a Job** — create listings with role requirements, salary range, location, and application questions
- Manage posted jobs and edit listings
- Review applicants with resume links and questionnaire responses
- Move candidates through hiring stages (pending → interview → accept/reject)

---

### Mock Interview
AI-powered interview practice tailored to your goals.

- Configure target role, industry, department, and seniority level
- Choose **Text** or **Audio** mode (speech-to-text for spoken answers)
- Timed questions generated for your profile
- Per-answer AI evaluation with scores for **Skill**, **Communication**, and **Role Fit**
- Detailed feedback: strengths, weaknesses, and improved sample answers
- Practice again or return to dashboard when done

---

### Career Analytics (Insights)
Visualise where you've been and where you could go.

- Interactive **Career Trajectory** roadmap
- Education history and work experience plotted on a timeline
- AI **predicted career paths** with likelihood scores
- Run analysis from the dashboard or explore predictions on the insights page
- Prompts to complete your profile when data is missing

---

### Upskilling & Badges
Learn from verified organisations and prove your skills.

- **Browse courses** from industry organisations and universities
- Filter by category, difficulty (Beginner / Intermediate / Advanced), and search
- Enrol in courses and track progress
- **My Learning** — view enrolled courses and completion percentage
- **My Badges** — digital badges earned from completed courses
- **Skill Verification** — request verification of skills you've acquired
- Course detail pages with organisation info and enrolment actions

---

### Industry Projects
Real-world project opportunities from employers.

- Browse open industry projects with descriptions and deadlines
- See **required badges** (mandatory gate) and **recommended skills** (nice-to-have)
- Eligibility check — see if you meet badge requirements before applying
- Apply directly from the project card when eligible

---

### Community Forum
Share updates and connect with other users.

- Create posts: **General**, **Achievement**, **Project**, **Learning**, or **Hiring**
- Attach media to posts
- Option to **include post in CV** for portfolio building
- Like, comment, reply, edit, and reshare posts
- Filter feed by post type
- Infinite scroll feed with post detail pages

---

### Employee Surveys
Workplace feedback tools for organisations and staff.

**For employees (Employer / Mentor roles)**
- Take anonymous workplace satisfaction surveys
- Privacy-first: responses are not linked to your identity
- Step-through questionnaire with progress tracking

**For organisation admins**
- Create surveys with auto-populated evidence-based questions (23 questions across 11 well-being categories)
- View **aggregated analytics** — scores by category, response counts
- **AI Insights** — Gemini-generated summaries and recommendations from survey data
- Manage active and completed surveys

---

### Fair Pay
AI salary benchmarking for hiring and compensation decisions.

- Analyse salary by job title, location, and employment type
- Min / average / max salary range (MYR)
- Market competitiveness score and percentile vs similar professionals
- Benefits value estimate and total compensation breakdown
- AI explanation of why the range looks the way it does
- Profile vs market comparison summary
- Skills and certifications that could increase salary
- History of past analyses

---

### Organisations
Tools for companies, universities, and training providers.

- **Browse organisations** — public profiles for verified orgs
- **Org Dashboard** — overview for employer admins
- **Manage Courses** — create and manage upskilling courses
- **Course Recognition** — recognise external or university courses
- **Manage Projects** — post industry projects for candidates
- **Employee Surveys** — create and analyse workplace surveys (see above)
- **University Review** — review university-linked courses and credentials
- **Manage Members** — organisation membership management
- **Verifications** — review candidate skill verification requests

**For platform admins**
- Review and approve new organisation registrations
- Admin organisation management panel

---

### Account & Settings

- Email/password sign-up and sign-in (candidates)
- **Microsoft Azure sign-in** for employers and mentors
- Email verification gate for profile and settings access
- **Linked accounts** — bind personal and work accounts to share profile/resume data across roles
- Role selection at signup (candidate / employer / mentor)
- Light and dark theme toggle (persists across sessions)
- Real-time **notifications** for platform activity

---

## User roles at a glance

| Role | Main features |
|------|----------------|
| **Candidate** | Portfolio, jobs, applications, mock interview, upskilling, projects, forum, career insights |
| **Employer** | Post jobs, review applicants, org dashboard, courses, projects, surveys, fair pay, recognitions |
| **Mentor** | Surveys, fair pay, forum, upskilling (shared employer-style access where configured) |
| **Admin** | Organisation approval, platform administration |

---

## Tech stack

| Layer | Stack |
|-------|-------|
| Frontend | Angular 21, Tailwind CSS, SSR |
| Backend | Spring Boot 4, Java 17, PostgreSQL (Supabase) |
| AI | FastAPI, Google Gemini, Groq |
| Auth | Supabase Auth, JWT, Microsoft Azure OAuth |

---

## Project structure

```
career-os/
├── README.md              ← you are here
└── career-os/             ← application source
    ├── src/               ← Angular frontend
    ├── backend/           ← Spring Boot API
    └── ai-service/        ← Python AI microservice
```

---

## Run locally

```bash
# 1. Frontend
cd career-os
npm install && npm start        # http://localhost:4200

# 2. Backend (new terminal)
cd career-os/backend
./mvnw spring-boot:run          # http://localhost:8080

# 3. AI service (new terminal)
cd career-os/ai-service
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd app && uvicorn main:app --reload --port 8000   # http://localhost:8000
```

Set `DB_PASSWORD`, `JWT_SECRET`, `GEMINI_API_KEY`, and `GROQ_API_KEY` before running the backend and AI service. See `backend/src/main/resources/application.yaml` and create `ai-service/.env` for AI keys.

---

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Railway |
| AI service | Docker (see `ai-service/app/Dockerfile`) |

---

Built for **Talentbank 2026**.
