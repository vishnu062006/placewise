# Trajekt

<p align="center">
  <img src="public/opengraph-image.png" alt="Trajekt" width="900">
</p>

<p align="center">
  <strong>Know your shortlist chances before recruiters do.</strong>
</p>

<p align="center">
  AI-powered resume analysis and job description matching for software engineers.
</p>

<p align="center">
  <a href="https://trajekt.in">Live Product</a>
  ·
  <a href="https://trajekt.in">Try Trajekt</a>
</p>

---

## The Problem

Applying to software engineering roles can feel like throwing your resume into a black box.

You apply.

You wait.

You get rejected.

And you still don't know what was missing.

Most resume tools give you a generic score. That doesn't tell you whether **your resume is actually a good match for the role you're applying to**, or what you should do about the gaps.

### Trajekt takes a different approach.

Instead of asking:

> **"How good is my resume?"**

Trajekt asks:

> **"How well does my resume match this specific role, and what should I do next?"**

---

## What Trajekt Does

Upload your resume, provide a job description, and Trajekt breaks the gap down into something you can actually act on.

### 🎯 Resume × Job Matching

Analyze your resume against the requirements of a specific software engineering role.

### 🧠 Skill Gap Analysis

Identify important skills, technologies, experience, and requirements that are missing or underrepresented.

### 📊 Placement Readiness

Understand where your current profile stands relative to the role you're targeting.

### 🚀 Personalized Roadmap

Get a practical 4-week plan focused on the highest-impact improvements.

### 🔍 Actionable Feedback

Instead of simply telling you that something is wrong, Trajekt helps explain **what to improve and why it matters**.

---

## How It Works

```text
        YOUR RESUME
             │
             ▼
      ┌─────────────┐
      │   Trajekt   │
      │   Analysis  │
      └──────┬──────┘
             │
             ▼
      JOB DESCRIPTION
             │
             ▼
   ┌─────────────────────┐
   │ Resume × JD Match   │
   └──────────┬──────────┘
              │
       ┌──────┴───────┐
       ▼              ▼
   Skill Gaps     Match Score
       │              │
       └──────┬───────┘
              ▼
     Personalized Plan
              │
              ▼
       4-Week Roadmap
```

The idea is simple:

**Analyze → Understand → Improve → Apply**

---

## Built For

Trajekt is primarily built for:

* 🎓 Students preparing for campus placements
* 💻 Software engineering students
* 🧑‍💻 Early-career developers
* 🔎 Candidates applying for internships
* 🚀 Developers targeting competitive engineering roles

Whether you're applying for your first internship or preparing for your next software engineering role, Trajekt helps you understand what needs work before you hit **Apply**.

---

## Why Trajekt?

### Generic resume score

> "Your resume is 76/100."

Cool.

But what now?

### Trajekt

> "You're missing PostgreSQL and distributed systems experience mentioned in this role. Your projects demonstrate backend development, but your resume doesn't communicate that experience strongly enough. Here's what to improve first."

**The score is useful. The action is the point.**

---

## Product

### Resume Analysis

Understand how Trajekt interprets your education, experience, projects, skills, and technical background.

### Job Matching

Paste an actual job description and see how your profile lines up with its requirements.

### Skill Gaps

Separate missing skills from skills that are present but poorly represented.

### Improvement Roadmap

Turn the analysis into a focused plan instead of another list of recommendations.

---

## Tech Behind Trajekt

Trajekt is built using a modern full-stack architecture combining web technologies, AI, retrieval, and data processing.

| Layer          | Technology                      |
| -------------- | ------------------------------- |
| Frontend       | Next.js, React, TypeScript      |
| Styling        | Tailwind CSS                    |
| Motion         | Framer Motion                   |
| Backend        | FastAPI, Python                 |
| AI             | LLM-based analysis              |
| RAG            | ChromaDB, Sentence Transformers |
| Database       | PostgreSQL, Prisma              |
| Authentication | Auth.js, Google OAuth           |
| Deployment     | Vercel                          |
| Analytics      | Vercel Analytics                |
| Performance    | Vercel Speed Insights           |

---

## AI & RAG

Trajekt isn't designed around simply sending an entire resume to an LLM and asking for a number.

The analysis pipeline combines structured resume extraction, job-description requirements, semantic retrieval, and LLM reasoning to produce more targeted recommendations.

At a high level:

```text
Resume
  │
  ▼
Extraction
  │
  ▼
Structured Profile
  │
  ├──────────────┐
  │              │
  ▼              ▼
Skills        Experience
  │              │
  └──────┬───────┘
         ▼
Job Description
         │
         ▼
Requirement Extraction
         │
         ▼
Semantic Matching
         │
         ▼
Skill Gap Analysis
         │
         ▼
LLM Reasoning
         │
         ▼
Personalized Roadmap
```

---

## Product Roadmap

Trajekt is still evolving.

### Coming next

* Company compatibility analysis
* Better role-specific recommendations
* Internship discovery
* Peer benchmarking
* Shareable Trajekt scorecards
* More detailed preparation roadmaps
* Improved resume intelligence
* More role-specific analysis

The long-term goal is to move from **resume analysis** toward a more complete **career preparation engine for software engineers**.

---

## Try Trajekt

### Ready to see where you stand?

**[Visit Trajekt →](https://trajekt.in)**

Upload your resume, choose a role, and find out what stands between your current profile and the job you're targeting.

---

## Development

If you're working on the product locally:

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

### Production build

```bash
npm run build
npm run start
```

---

## Environment

Create a `.env` file with the required application credentials.

```env
DATABASE_URL=

AUTH_SECRET=

AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

NEXT_PUBLIC_API_URL=
```

Additional environment variables may be required for AI and backend services.

**Never commit production credentials or `.env` files.**

---

## SEO & Web Presence

Trajekt uses the Next.js App Router's metadata system with:

* Custom metadata
* Open Graph previews
* Twitter/X cards
* Canonical URLs
* `sitemap.xml`
* `robots.txt`
* Favicon and application icons
* Google Search Console

**Production:** [trajekt.in](https://trajekt.in)

---

## Built With Intent

Trajekt started from a simple frustration:

**Knowing that your resume could be better isn't enough. You need to know what to change.**

The product is built around turning that uncertainty into something concrete.

**Know the gap. Close the gap. Get closer to the role.**

---

<p align="center">
  <strong>Trajekt</strong>
  <br>
  Know your shortlist chances before recruiters do.
  <br><br>
  <a href="https://trajekt.in">trajekt.in</a>
</p>
