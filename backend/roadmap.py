import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ── Curated resource map — verified links only ──
RESOURCE_MAP = {
    "dsa": [
        {"name": "Neetcode 150 Roadmap", "url": "https://neetcode.io/roadmap", "type": "website", "why": "Best structured DSA practice for placements"},
        {"name": "Striver A2Z DSA Sheet", "url": "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2", "type": "website", "why": "Most comprehensive DSA sheet used by Indian students"},
        {"name": "Love Babbar DSA Sheet", "url": "https://youtu.be/WQoB2z67hvY", "type": "youtube", "why": "Popular structured DSA series for campus placements"},
    ],
    "system design": [
        {"name": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "type": "github", "why": "Most complete system design reference on the internet"},
        {"name": "Gaurav Sen System Design", "url": "https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX", "type": "youtube", "why": "Best YouTube series for system design interviews"},
        {"name": "Arpit Bhayani System Design", "url": "https://www.youtube.com/@AsliEngineering", "type": "youtube", "why": "Deep dives into real system design problems"},
    ],
    "machine learning": [
        {"name": "Fast.ai Practical Deep Learning", "url": "https://course.fast.ai", "type": "course", "why": "Best hands-on ML course for beginners to intermediate"},
        {"name": "Andrew Ng ML Specialization", "url": "https://www.youtube.com/playlist?list=PLkDaE6sCZn6FNC6YRfRQc_FbeQrF8BwGI", "type": "youtube", "why": "Gold standard ML fundamentals course"},
        {"name": "Krish Naik ML Playlist", "url": "https://www.youtube.com/playlist?list=PLZoTAELRMXVPBTrWtJkn3wWQxZkmTXGwe", "type": "youtube", "why": "India-focused ML tutorials with practical projects"},
    ],
    "os": [
        {"name": "Gate Smashers OS Playlist", "url": "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p", "type": "youtube", "why": "Best OS playlist for campus placement interviews"},
        {"name": "Neso Academy OS", "url": "https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O", "type": "youtube", "why": "Clear explanations of OS fundamentals"},
    ],
    "dbms": [
        {"name": "Gate Smashers DBMS", "url": "https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJnetworkError", "type": "youtube", "why": "Most popular DBMS series for placement prep"},
        {"name": "Sanchit Jain DBMS", "url": "https://www.youtube.com/playlist?list=PLmXKhU9FNesR1rSES7oLdJaNFgmuj0SYV", "type": "youtube", "why": "Concise DBMS coverage with practice questions"},
    ],
    "cn": [
        {"name": "Gate Smashers Computer Networks", "url": "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_", "type": "youtube", "why": "Best CN playlist for placements"},
        {"name": "Neso Academy CN", "url": "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgMCUAG0XRw78UA8qnv6jEx", "type": "youtube", "why": "Strong fundamentals coverage for interview prep"},
    ],
    "projects": [
        {"name": "roadmap.sh", "url": "https://roadmap.sh", "type": "website", "why": "Clear learning paths for every tech stack"},
        {"name": "Full Stack Open", "url": "https://fullstackopen.com", "type": "course", "why": "Best free full-stack course with real project work"},
    ],
    "competitive programming": [
        {"name": "Codeforces", "url": "https://codeforces.com", "type": "website", "why": "Best platform for competitive programming practice"},
        {"name": "Striver CP Sheet", "url": "https://takeuforward.org/interview-experience/strivers-cp-sheet", "type": "website", "why": "Structured CP problems for placement season"},
    ],
    "resume": [
        {"name": "Jake's Resume Template", "url": "https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs", "type": "website", "why": "Most widely used ATS-friendly resume template"},
        {"name": "Resumeworded", "url": "https://resumeworded.com", "type": "website", "why": "Free ATS score and resume feedback tool"},
    ],
    "aptitude": [
        {"name": "IndiaBix", "url": "https://www.indiabix.com", "type": "website", "why": "Best aptitude practice for service company drives"},
        {"name": "TCS NQT Portal", "url": "https://www.tcsion.com/hub/nqt", "type": "website", "why": "Official TCS NQT practice portal"},
    ],
    "interview prep": [
        {"name": "Pramp Mock Interviews", "url": "https://www.pramp.com", "type": "website", "why": "Free peer-to-peer mock technical interviews"},
        {"name": "LeetCode Discuss", "url": "https://leetcode.com/discuss/interview-experience", "type": "website", "why": "Real interview experiences from Indian students"},
    ],
    "git": [
        {"name": "GitHub Skills", "url": "https://skills.github.com", "type": "website", "why": "Hands-on GitHub learning paths"},
    ],
}

ROLE_DEFAULT_RESOURCES = {
    "faang_sde": ["dsa", "system design", "interview prep"],
    "product_company": ["dsa", "projects", "interview prep"],
    "service_company": ["aptitude", "dsa", "resume"],
    "ml_data_role": ["machine learning", "dsa", "projects"],
    "core_engineering": ["resume", "aptitude", "interview prep"],
}

ROLE_ALIASES = {
    "dsa": ["dsa", "data structure", "leetcode", "algorithm", "coding practice", "competitive"],
    "system design": ["system design", "hld", "lld", "scalability", "architecture"],
    "machine learning": ["machine learning", "ml", "deep learning", "ai", "data science", "neural"],
    "os": ["operating system", "os ", "process", "thread", "memory management"],
    "dbms": ["dbms", "database", "sql", "query", "normalization"],
    "cn": ["computer network", "cn ", "networking", "tcp", "http", "osi"],
    "projects": ["project", "portfolio", "github", "build", "develop"],
    "competitive programming": ["competitive", "codeforces", "cp ", "rating"],
    "resume": ["resume", "cv ", "ats", "format"],
    "aptitude": ["aptitude", "quantitative", "logical", "verbal", "tcs", "service"],
    "interview prep": ["interview", "mock", "hr round", "behavioral"],
    "git": ["git", "github", "version control"],
}


def _match_resources(text: str, max_per_topic: int = 2) -> list:
    text_lower = text.lower()
    matched = []
    seen_urls = set()
    for key, resources in RESOURCE_MAP.items():
        aliases = ROLE_ALIASES.get(key, [key])
        if any(alias in text_lower for alias in aliases):
            for r in resources[:max_per_topic]:
                if r["url"] not in seen_urls:
                    matched.append(r)
                    seen_urls.add(r["url"])
    return matched[:6]


def _inject_resources(roadmap: dict, role: str) -> dict:
    # Per-week resources
    for week in roadmap.get("weeks", []):
        focus = week.get("focus", "")
        days_text = " ".join(
            " ".join(d.get("tasks", [])) for d in week.get("days", [])
        )
        tasks_text = " ".join(week.get("tasks", []) if isinstance(week.get("tasks"), list) else [])
        combined = f"{focus} {days_text} {tasks_text}"
        week["resources"] = _match_resources(combined, max_per_topic=1)

    # Top resources
    summary_text = roadmap.get("summary", "") + roadmap.get("biggest_bottleneck", "") + " ".join(
        w.get("focus", "") for w in roadmap.get("weeks", [])
    )
    top = _match_resources(summary_text, max_per_topic=2)
    seen = {r["url"] for r in top}
    for topic in ROLE_DEFAULT_RESOURCES.get(role, ["dsa", "interview prep"]):
        for r in RESOURCE_MAP.get(topic, [])[:1]:
            if r["url"] not in seen and len(top) < 5:
                top.append(r)
                seen.add(r["url"])
    roadmap["top_resources"] = top
    return roadmap


def _build_dynamic_explanation(extracted: dict, role: str, gaps: list) -> str:
    cgpa = extracted.get("cgpa")
    skills = extracted.get("technical_skills", [])
    projects = extracted.get("projects", [])
    internships = extracted.get("internship_count", 0)
    has_dsa = extracted.get("has_dsa_signals", False)

    positives, negatives = [], []

    try:
        cgpa_val = float(str(cgpa).split("/")[0]) if cgpa and "/" in str(cgpa) else float(cgpa or 0)
        if cgpa_val >= 8.0:
            positives.append(f"strong CGPA ({cgpa})")
    except Exception:
        pass

    if len(skills) >= 8:
        positives.append(f"broad skill coverage ({len(skills)} skills)")
    if internships:
        positives.append(f"{internships} internship(s)")
    if len(projects) >= 3:
        positives.append(f"solid project portfolio ({len(projects)} projects)")
    if has_dsa and role in ["faang_sde", "product_company"]:
        positives.append("DSA practice signals")

    if not has_dsa and role in ["faang_sde", "product_company"]:
        negatives.append("missing DSA proof")
    if not internships:
        negatives.append("no internship signal")
    if gaps:
        negatives.append(gaps[0].lower())

    pos_str = " and ".join(positives[:2]) if positives else "resume signals"
    neg_str = negatives[0] if negatives else "some role-specific gaps"
    return f"Score driven by {pos_str}, held back by {neg_str}."


ROADMAP_PROMPT = """You are a senior placement mentor, hiring manager, and software engineer who has guided students into Google, Microsoft, Amazon, Atlassian, Flipkart, Razorpay, and top Indian product companies.

Generate a highly personalized placement roadmap for this student.

STUDENT PROFILE:
- Target Role: {role_label}
- Placement Score: {score}/100 ({band_label})
- Technical Skills: {skills}
- Projects: {projects}
- CGPA: {cgpa}
- Internships: {internships}
- Top Skill Gaps: {gaps}
- Strengths: {strengths}

INSTRUCTIONS:
1. Identify the SINGLE biggest bottleneck preventing placement.
2. Estimate current placement probability (%), probability after roadmap (%), and weeks to readiness.
3. Compare against top placed candidates — what do they have that this student doesn't?
4. Generate a 4-week roadmap with DAILY tasks (Monday–Sunday) for each week.
5. Tasks must be measurable with numbers.
   BAD: "Practice DSA"
   GOOD: "Solve 3 LeetCode Medium array problems, write time complexity for each"
6. Tailor to the target role:
   - FAANG/SDE: DSA heavy, CS fundamentals, system design, mock interviews
   - Product: DSA + projects with impact metrics + system design basics
   - Service: Aptitude + basic DSA + resume polish + communication
   - ML/Data: ML theory + model deployment + Kaggle + Python
   - Core: Domain fundamentals + resume + aptitude
7. Reference real resources: Neetcode 150, Striver A2Z, Love Babbar, Abdul Bari, Gate Smashers, IndiaBix, Pramp.
8. If CGPA < 7.5: name specific companies that still shortlist and how to compensate.
9. If no internship: name exact platforms — Internshala, Unstop, LinkedIn, cold email to startups.
10. Be brutally honest but constructive.

Return ONLY valid JSON, no markdown, no backticks:

{{
  "summary": "2-3 sentence honest assessment of where they stand",
  "placement_probability": {{
    "current": 45,
    "after_roadmap": 78,
    "estimated_readiness_weeks": 6
  }},
  "biggest_bottleneck": "single most critical weakness in one sentence",
  "resume_benchmark": {{
    "what_top_candidates_have": [
      "3+ deployed projects with live URLs and impact metrics",
      "LeetCode rating 1600+ or 300+ problems solved",
      "at least 1 internship or open source contribution"
    ],
    "missing_from_resume": [
      "specific thing missing 1",
      "specific thing missing 2",
      "specific thing missing 3"
    ]
  }},
  "weeks": [
    {{
      "week": 1,
      "focus": "3-4 word theme",
      "days": [
        {{"day": "Monday", "tasks": ["specific task with numbers", "specific task 2"]}},
        {{"day": "Tuesday", "tasks": ["specific task", "specific task"]}},
        {{"day": "Wednesday", "tasks": ["specific task", "specific task"]}},
        {{"day": "Thursday", "tasks": ["specific task", "specific task"]}},
        {{"day": "Friday", "tasks": ["specific task", "specific task"]}},
        {{"day": "Saturday", "tasks": ["specific task", "specific task", "specific task"]}},
        {{"day": "Sunday", "tasks": ["review week progress", "plan next week", "update GitHub"]}}
      ],
      "goal": "measurable outcome by end of this week"
    }},
    {{
      "week": 2,
      "focus": "...",
      "days": [
        {{"day": "Monday", "tasks": ["...", "..."]}},
        {{"day": "Tuesday", "tasks": ["...", "..."]}},
        {{"day": "Wednesday", "tasks": ["...", "..."]}},
        {{"day": "Thursday", "tasks": ["...", "..."]}},
        {{"day": "Friday", "tasks": ["...", "..."]}},
        {{"day": "Saturday", "tasks": ["...", "...", "..."]}},
        {{"day": "Sunday", "tasks": ["...", "..."]}}
      ],
      "goal": "..."
    }},
    {{
      "week": 3,
      "focus": "...",
      "days": [
        {{"day": "Monday", "tasks": ["...", "..."]}},
        {{"day": "Tuesday", "tasks": ["...", "..."]}},
        {{"day": "Wednesday", "tasks": ["...", "..."]}},
        {{"day": "Thursday", "tasks": ["...", "..."]}},
        {{"day": "Friday", "tasks": ["...", "..."]}},
        {{"day": "Saturday", "tasks": ["...", "...", "..."]}},
        {{"day": "Sunday", "tasks": ["...", "..."]}}
      ],
      "goal": "..."
    }},
    {{
      "week": 4,
      "focus": "...",
      "days": [
        {{"day": "Monday", "tasks": ["...", "..."]}},
        {{"day": "Tuesday", "tasks": ["...", "..."]}},
        {{"day": "Wednesday", "tasks": ["...", "..."]}},
        {{"day": "Thursday", "tasks": ["...", "..."]}},
        {{"day": "Friday", "tasks": ["...", "..."]}},
        {{"day": "Saturday", "tasks": ["...", "...", "..."]}},
        {{"day": "Sunday", "tasks": ["...", "..."]}}
      ],
      "goal": "..."
    }}
  ],
  "resume_fixes": [
    "specific fix with before/after example",
    "specific fix 2",
    "specific fix 3"
  ],
  "honest_verdict": "one brutally honest sentence about what makes or breaks their placement"
}}"""


def generate_roadmap(
    extracted: dict,
    role: str,
    role_label: str,
    score: float,
    band_label: str,
    gaps: list,
    strengths: list
) -> dict:
    projects = extracted.get("projects", [])
    project_summary = "; ".join(
        [f"{p.get('name', 'unnamed')} ({', '.join(p.get('tech_used', []))})" for p in projects[:3]]
    ) or "none listed"

    prompt = ROADMAP_PROMPT.format(
        role_label=role_label,
        score=score,
        band_label=band_label,
        skills=", ".join(extracted.get("technical_skills", [])[:15]) or "none detected",
        projects=project_summary,
        cgpa=extracted.get("cgpa") or "not found",
        internships=extracted.get("internship_count", 0),
        gaps="; ".join(gaps[:6]) or "none identified",
        strengths="; ".join(strengths[:5]) or "none identified"
    )

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=5000,
        )
        raw = response.choices[0].message.content.strip()
        raw = re.sub(r"```json|```", "", raw).strip()
        roadmap = json.loads(raw)
    except Exception as e:
        print("ROADMAP ERROR:", str(e))
        roadmap = _fallback_roadmap(role_label, gaps)

    roadmap = _inject_resources(roadmap, role)
    roadmap["score_explanation"] = _build_dynamic_explanation(extracted, role, gaps)
    return roadmap


def _fallback_roadmap(role_label: str, gaps: list) -> dict:
    return {
        "summary": f"Targeting {role_label}. Close identified gaps systematically — 4 weeks of focused work can meaningfully move your score.",
        "placement_probability": {"current": 40, "after_roadmap": 70, "estimated_readiness_weeks": 6},
        "biggest_bottleneck": gaps[0] if gaps else "Insufficient role-specific signals on resume",
        "resume_benchmark": {
            "what_top_candidates_have": [
                "3+ deployed projects with live URLs",
                "LeetCode 300+ problems or 1600+ rating",
                "At least 1 internship or open source contribution"
            ],
            "missing_from_resume": gaps[:3] if gaps else ["Role-specific project depth", "Quantified impact metrics", "DSA proof"]
        },
        "weeks": [
            {
                "week": 1, "focus": "Audit and plan",
                "days": [
                    {"day": "Monday", "tasks": ["Map exact role requirements", "List 5 companies you're targeting and their cutoffs"]},
                    {"day": "Tuesday", "tasks": ["Set up study schedule", "Join relevant Discord/Telegram groups for placement prep"]},
                    {"day": "Wednesday", "tasks": [f"Address gap: {gaps[0]}" if gaps else "Start DSA on Neetcode", "Solve 5 LeetCode Easy problems"]},
                    {"day": "Thursday", "tasks": ["Solve 5 more LeetCode Easy problems", "Review solutions and note patterns"]},
                    {"day": "Friday", "tasks": ["Update resume with latest projects", "Get resume reviewed on r/developersIndia"]},
                    {"day": "Saturday", "tasks": ["Solve 10 LeetCode Easy — arrays and strings", "Push all code to GitHub", "Write README for all projects"]},
                    {"day": "Sunday", "tasks": ["Review week progress", "Plan week 2", "Update GitHub activity"]}
                ],
                "goal": "Clear plan in place, 25 LeetCode Easy solved, resume updated"
            },
            {
                "week": 2, "focus": "Build fundamentals",
                "days": [
                    {"day": "Monday", "tasks": ["Start LeetCode Medium — arrays (3 problems)", "Study time complexity of each solution"]},
                    {"day": "Tuesday", "tasks": ["3 LeetCode Medium — strings", "Read OS basics: processes and threads"]},
                    {"day": "Wednesday", "tasks": ["3 LeetCode Medium — linked lists", "Study DBMS: normalization and joins"]},
                    {"day": "Thursday", "tasks": ["3 LeetCode Medium — trees", "Watch Gate Smashers CN playlist — 2 videos"]},
                    {"day": "Friday", "tasks": ["3 LeetCode Medium — stack/queue", "Start a new project targeting your gaps"]},
                    {"day": "Saturday", "tasks": ["5 LeetCode problems — mixed review", "Work on project for 3 hours", "Push to GitHub"]},
                    {"day": "Sunday", "tasks": ["Review all Medium problems solved", "Note down patterns for each topic", "Plan week 3"]}
                ],
                "goal": "25 Medium problems solved, project 40% done, CS fundamentals covered"
            },
            {
                "week": 3, "focus": "Resume and projects",
                "days": [
                    {"day": "Monday", "tasks": ["Complete and deploy the project", "Add live URL to resume"]},
                    {"day": "Tuesday", "tasks": ["Add quantified impact to every project bullet", "Change passive to active verbs on resume"]},
                    {"day": "Wednesday", "tasks": ["3 LeetCode Medium — graphs", "Study system design basics: load balancing, caching"]},
                    {"day": "Thursday", "tasks": ["3 LeetCode Medium — DP basics", "Get resume reviewed by 2 peers or on resumeworded.com"]},
                    {"day": "Friday", "tasks": ["Mock HR interview — record yourself", "Prepare STAR format answers for 5 common questions"]},
                    {"day": "Saturday", "tasks": ["5 LeetCode problems", "Cold email 5 startups on LinkedIn for internship", "Update LinkedIn profile"]},
                    {"day": "Sunday", "tasks": ["Final resume review", "Apply to 5 companies", "Plan week 4"]}
                ],
                "goal": "Resume polished, project live, 5 applications sent"
            },
            {
                "week": 4, "focus": "Interview ready",
                "days": [
                    {"day": "Monday", "tasks": ["Do 1 mock interview on Pramp", "Revise top 50 LeetCode patterns"]},
                    {"day": "Tuesday", "tasks": ["3 LeetCode Hard — attempt, don't skip", "Revise OS: scheduling, deadlocks"]},
                    {"day": "Wednesday", "tasks": ["1 more Pramp mock interview", "Revise DBMS: transactions, ACID"]},
                    {"day": "Thursday", "tasks": ["System design mock — design URL shortener", "Revise CN: TCP vs UDP, HTTP vs HTTPS"]},
                    {"day": "Friday", "tasks": ["Apply to 10 more companies", "Follow up on previous applications"]},
                    {"day": "Saturday", "tasks": ["Full mock interview — DSA + system design + HR", "Review and note all mistakes"]},
                    {"day": "Sunday", "tasks": ["Rest and review", "Final LinkedIn and resume check", "Set goals for next month"]}
                ],
                "goal": "3+ mock interviews done, 15 applications sent, interview-ready"
            }
        ],
        "resume_fixes": [
            "Add quantified impact: change 'Built a todo app' to 'Built a task manager serving 200 users, React + Node.js, deployed on Vercel'",
            "Add GitHub link prominently at the top of resume",
            "Keep to 1 page — remove anything older than 2 years or irrelevant"
        ],
        "honest_verdict": f"Fix {gaps[0].lower() if gaps else 'your project depth'} first — everything else is secondary until that's addressed."
    }