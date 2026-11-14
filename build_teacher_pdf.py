"""
Generate 35-Page Hyperlinked Teacher Planner PDF and Quick-Start Guide PDF
for the 2026–2027 All-in-One Digital Teacher Planner & Gradebook.
"""

from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
OUT_DIR = BASE_DIR / "product_bundle"
WORK_DIR = BASE_DIR / "_work_pdf"
OUT_DIR.mkdir(exist_ok=True)
WORK_DIR.mkdir(exist_ok=True)

CHROME_PATHS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]


def find_browser() -> str:
    for p in CHROME_PATHS:
        if os.path.isfile(p):
            return p
    for cmd in ("google-chrome", "chrome", "chromium", "msedge"):
        loc = shutil.which(cmd)
        if loc:
            return loc
    raise RuntimeError("No Chromium browser found for headless PDF generation.")


TEACHER_PDF_CSS = """
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

@page {
  size: 816px 1056px;
  margin: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  background: #E5E7EB;
  color: #111827;
  font-size: 11px;
  line-height: 1.4;
}

.page {
  width: 816px;
  height: 1056px;
  page-break-after: always;
  break-after: page;
  position: relative;
  background: #FFFFFF;
  margin: 0 auto;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Nav header tabs */
.tab-header {
  height: 38px;
  background: #0F172A;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 2px solid #4F46E5;
}

.tab-title {
  color: #FFFFFF;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.tabs-nav {
  display: flex;
  gap: 3px;
}

.tabs-nav a {
  display: inline-block;
  color: #94A3B8;
  text-decoration: none;
  font-size: 9px;
  font-weight: 700;
  padding: 4px 7px;
  border-radius: 4px;
  transition: all 0.1s;
}

.tabs-nav a.active, .tabs-nav a:hover {
  background: #4F46E5;
  color: #FFFFFF;
}

/* Main inner page content */
.page-inner {
  flex: 1;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 2px solid #E2E8F0;
  padding-bottom: 8px;
  margin-bottom: 14px;
}

.page-head h2 {
  font-size: 18px;
  font-weight: 900;
  color: #0F172A;
  letter-spacing: -0.3px;
}

.page-head .subhead {
  font-size: 10.5px;
  color: #64748B;
  font-weight: 600;
}

/* Footer */
.footer {
  height: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 28px;
  font-size: 9px;
  color: #94A3B8;
  font-weight: 600;
  border-top: 1px solid #F1F5F9;
}

.card-box {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.table-clean {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
}

.table-clean th {
  background: #0F172A;
  color: #FFFFFF;
  padding: 6px 8px;
  font-weight: 700;
  text-align: left;
}

.table-clean td {
  padding: 6px 8px;
  border-bottom: 1px solid #E2E8F0;
  color: #1E293B;
}

.table-clean tr:nth-child(even) td {
  background: #F8FAFC;
}

/* Form lines */
.fill-line {
  border-bottom: 1px solid #CBD5E1;
  height: 22px;
  margin-bottom: 6px;
}

.badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 8.5px;
  font-weight: 700;
  text-transform: uppercase;
}
.badge-indigo { background: #EEF2FF; color: #4F46E5; }
.badge-teal { background: #F0FDFA; color: #0D9488; }
.badge-amber { background: #FFFBEB; color: #D97706; }
"""


def render_tab_nav(active_id: str) -> str:
    tabs = [
        ("page-02", "INDEX"),
        ("page-03", "YEAR"),
        ("page-05", "AUG"),
        ("page-09", "DEC"),
        ("page-10", "JAN"),
        ("page-14", "MAY"),
        ("page-17", "WEEK"),
        ("page-18", "LESSON"),
        ("page-19", "SCHEDULE"),
        ("page-22", "GRADES"),
        ("page-23", "ATTEND"),
        ("page-24", "SEATING"),
        ("page-30", "SUB PLAN"),
        ("page-35", "NOTES"),
    ]
    links = "".join(
        f'<a href="#{tid}" class="{"active" if tid == active_id else ""}">{lbl}</a>'
        for tid, lbl in tabs
    )
    return f"""
    <div class="tab-header">
      <div class="tab-title">🍎 TeacherOS Pro &bull; 2026–2027</div>
      <div class="tabs-nav">{links}</div>
    </div>
    """


# ==============================================================================
# PAGES 1 to 35
# ==============================================================================


def p01_cover() -> str:
    return """
    <div class="page" id="page-01" style="background: radial-gradient(circle at 10% 10%, #1E1B4B 0%, #0F172A 70%, #060911 100%); color:#FFFFFF; justify-content:space-between; padding:50px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); padding:6px 14px; border-radius:999px; font-size:11px; font-weight:800; letter-spacing:1px; color:#C7D2FE;">
          ACADEMIC EDITION &bull; DATED 2026&ndash;2027
        </span>
        <span style="font-size:12px; font-weight:700; color:#94A3B8;">K-12 CLASSROOM OPERATING SYSTEM</span>
      </div>

      <div style="text-align:center; margin: 40px 0;">
        <div style="font-size:54px; margin-bottom:12px;">🍎</div>
        <h1 style="font-size:46px; font-weight:900; line-height:1.05; letter-spacing:-1px;">
          ALL-IN-ONE DIGITAL<br><span style="color:#818CF8;">TEACHER PLANNER</span><br>&amp; GRADEBOOK
        </h1>
        <div style="font-size:16px; font-weight:700; color:#CBD5E1; margin-top:16px;">
          Lesson Plans &bull; Student Records &bull; Seating &bull; Sub Plans &bull; 6-Day Cycles
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:20px; display:grid; grid-template-columns:1fr 1fr; gap:16px;">
        <div>
          <div style="font-size:10px; font-weight:800; color:#818CF8; text-transform:uppercase;">Educator Name</div>
          <div style="border-bottom:1px solid rgba(255,255,255,0.3); height:26px; margin-top:4px;"></div>
        </div>
        <div>
          <div style="font-size:10px; font-weight:800; color:#818CF8; text-transform:uppercase;">School / Institution</div>
          <div style="border-bottom:1px solid rgba(255,255,255,0.3); height:26px; margin-top:4px;"></div>
        </div>
        <div>
          <div style="font-size:10px; font-weight:800; color:#818CF8; text-transform:uppercase;">Grade Level &amp; Subject</div>
          <div style="border-bottom:1px solid rgba(255,255,255,0.3); height:26px; margin-top:4px;"></div>
        </div>
        <div>
          <div style="font-size:10px; font-weight:800; color:#818CF8; text-transform:uppercase;">Classroom / Lab Room #</div>
          <div style="border-bottom:1px solid rgba(255,255,255,0.3); height:26px; margin-top:4px;"></div>
        </div>
      </div>

      <div style="text-align:center; font-size:10px; color:#64748B; font-weight:600;">
        Interactive Hyperlinked GoodNotes &bull; Notability &bull; Printable Digital Edition
      </div>
    </div>
    """


def p02_master_index() -> str:
    sections = [
        ("📅 Academic Calendars", [
            ("p03", "2026–2027 Year at a Glance", "#page-03"),
            ("p04", "Key Dates, Terms & Holidays", "#page-04"),
            ("p05-16", "12 Monthly Dated Spreads (Aug 2026 – Jul 2027)", "#page-05"),
        ]),
        ("📖 Lesson & Curriculum Planning", [
            ("p17", "Weekly Teacher Planning Spread", "#page-17"),
            ("p18", "Daily Detailed Lesson Planning Sheet", "#page-18"),
            ("p19", "Mon–Fri & 6-Day Rotating Timetable", "#page-19"),
            ("p20", "Curriculum Map & Unit Plan Overview", "#page-20"),
        ]),
        ("📝 Grading & Student Tracking", [
            ("p21", "Student Roster & Accommodations Tracker", "#page-21"),
            ("p22", "Weighted Digital Gradebook Matrix", "#page-22"),
            ("p23", "Monthly Student Attendance Log", "#page-23"),
            ("p24", "Classroom Seating Chart Template", "#page-24"),
        ]),
        ("📞 Family & Classroom Support", [
            ("p25", "Parent Communication Log", "#page-25"),
            ("p26", "Parent-Teacher Conference Sheet", "#page-26"),
            ("p27", "Student Support & Behavior Log", "#page-27"),
            ("p28", "Assessment Scoring Rubric Builder", "#page-28"),
            ("p29", "Classroom Library & Reading Log", "#page-29"),
        ]),
        ("📑 Administrative & Supplies", [
            ("p30", "Emergency Substitute Teacher Plan", "#page-30"),
            ("p31", "Substitute Daily Feedback Sheet", "#page-31"),
            ("p32", "Classroom Inventory & Reorder Checklist", "#page-32"),
            ("p33", "Classroom Spending & Reimbursement Log", "#page-33"),
            ("p34", "Professional Development (PD) Hours Log", "#page-34"),
            ("p35", "Teacher Cornell Notes & Grid Notepad", "#page-35"),
        ]),
    ]
    cols = "".join(
        f"""
        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:12px; margin-bottom:10px;">
          <h4 style="font-size:12px; font-weight:800; color:#4F46E5; margin-bottom:6px;">{sec}</h4>
          <ul style="list-style:none; padding:0;">
            {"".join(f'<li style="margin:4px 0;"><a href="{url}" style="color:#0F172A; text-decoration:none; font-weight:700;"><span class="badge badge-indigo" style="margin-right:6px;">{code}</span>{title}</a></li>' for code, title, url in links)}
          </ul>
        </div>
        """
        for sec, links in sections
    )

    return f"""
    <div class="page" id="page-02">
      {render_tab_nav("page-02")}
      <div class="page-inner">
        <div class="page-head">
          <div>
            <h2>Hyperlinked Master Directory</h2>
            <div class="subhead">Click any section to jump directly to that page in GoodNotes or PDF Reader</div>
          </div>
          <span class="badge badge-indigo">35 Complete Templates</span>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          {cols}
        </div>
      </div>
      <div class="footer"><span>TeacherOS Pro &bull; Master Index</span><span>Page 2 of 35</span></div>
    </div>
    """


def p03_year_calendar() -> str:
    # 2026-2027 Academic Year (August 2026 - July 2027)
    months = [
        ("August 2026", 31, 6, "#page-05"),
        ("September 2026", 30, 2, "#page-06"),
        ("October 2026", 31, 4, "#page-07"),
        ("November 2026", 30, 0, "#page-08"),
        ("December 2026", 31, 2, "#page-09"),
        ("January 2027", 31, 5, "#page-10"),
        ("February 2027", 28, 1, "#page-11"),
        ("March 2027", 31, 1, "#page-12"),
        ("April 2027", 30, 4, "#page-13"),
        ("May 2027", 31, 6, "#page-14"),
        ("June 2027", 30, 2, "#page-15"),
        ("July 2027", 31, 4, "#page-16"),
    ]

    grid_cards = "".join(
        f"""
        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:6px; padding:6px; text-align:center;">
          <a href="{link}" style="color:#4F46E5; text-decoration:none; font-weight:800; font-size:10px;">{name} &rarr;</a>
          <div style="font-size:8px; color:#64748B; margin-top:4px; display:grid; grid-template-columns:repeat(7,1fr); gap:1px;">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
        </div>
        """
        for name, days, start, link in months
    )

    return f"""
    <div class="page" id="page-03">
      {render_tab_nav("page-03")}
      <div class="page-inner">
        <div class="page-head">
          <div>
            <h2>2026–2027 Academic Year at a Glance</h2>
            <div class="subhead">Full 12-Month Academic Session (August 2026 &ndash; July 2027)</div>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-bottom:16px;">
          {grid_cards}
        </div>
        <div class="card-box">
          <h4 style="font-size:11px; font-weight:800; color:#0F172A; margin-bottom:6px;">Semester &amp; Grading Quarter Checkpoints</h4>
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; font-size:9.5px;">
            <div><strong>Quarter 1:</strong> Aug 24 &ndash; Oct 30</div>
            <div><strong>Quarter 2:</strong> Nov 02 &ndash; Jan 22</div>
            <div><strong>Quarter 3:</strong> Jan 25 &ndash; Apr 02</div>
            <div><strong>Quarter 4:</strong> Apr 05 &ndash; Jun 18</div>
          </div>
        </div>
      </div>
      <div class="footer"><span>TeacherOS Pro &bull; Year Overview</span><span>Page 3 of 35</span></div>
    </div>
    """


def p04_key_dates() -> str:
    return f"""
    <div class="page" id="page-04">
      {render_tab_nav("page-03")}
      <div class="page-inner">
        <div class="page-head">
          <div>
            <h2>School Terms, Key Dates &amp; Holidays</h2>
            <div class="subhead">Plan ahead for staff professional development, parent conferences, and grading deadlines</div>
          </div>
        </div>
        <table class="table-clean" style="margin-bottom:16px;">
          <thead>
            <tr><th>Date</th><th>Event / School Holiday</th><th>Schedule Impact</th><th>Notes &amp; Deadlines</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Aug 17 &ndash; 21, 2026</strong></td><td>Teacher Pre-Service &amp; Setup Week</td><td>No Students</td><td>Classroom setup, department pacing alignment</td></tr>
            <tr><td><strong>Aug 24, 2026</strong></td><td>First Day of School (Term 1)</td><td>Day 1 Rotation</td><td>Syllabus distribution, lab safety contracts</td></tr>
            <tr><td><strong>Sep 07, 2026</strong></td><td>Labor Day Holiday</td><td>School Closed</td><td>Cycle paused</td></tr>
            <tr><td><strong>Oct 12, 2026</strong></td><td>Staff Professional Development Day</td><td>No Classes</td><td>Quarter 1 progress reports due</td></tr>
            <tr><td><strong>Nov 11, 2026</strong></td><td>Veterans Day</td><td>School Closed</td><td>Cycle paused</td></tr>
            <tr><td><strong>Nov 25 &ndash; 27, 2026</strong></td><td>Thanksgiving Recess</td><td>School Closed</td><td>Thanksgiving holiday</td></tr>
            <tr><td><strong>Dec 21 &ndash; Jan 01, 2027</strong></td><td>Winter Break</td><td>School Closed</td><td>Two-week recess</td></tr>
            <tr><td><strong>Jan 18, 2027</strong></td><td>Martin Luther King Jr. Day</td><td>School Closed</td><td>Midterm review week</td></tr>
            <tr><td><strong>Feb 15, 2027</strong></td><td>Presidents' Day</td><td>School Closed</td><td>Cycle carries forward</td></tr>
            <tr><td><strong>Mar 29 &ndash; Apr 02, 2027</strong></td><td>Spring Break Recess</td><td>School Closed</td><td>Spring break</td></tr>
            <tr><td><strong>May 31, 2027</strong></td><td>Memorial Day Holiday</td><td>School Closed</td><td>Final exam preparation</td></tr>
            <tr><td><strong>Jun 18, 2027</strong></td><td>Last Day of School / Commencement</td><td>Early Release</td><td>Final report cards due to main office</td></tr>
          </tbody>
        </table>
      </div>
      <div class="footer"><span>TeacherOS Pro &bull; Important Dates</span><span>Page 4 of 35</span></div>
    </div>
    """


def p_monthly(page_num: int, month_name: str, page_id: str, days_count: int, start_weekday: int) -> str:
    # 7x5 or 7x6 calendar grid
    cells = []
    # Empty pre-padding
    for _ in range(start_weekday):
        cells.append('<div style="background:#F1F5F9; border:1px solid #E2E8F0; min-height:82px;"></div>')
    for d in range(1, days_count + 1):
        cells.append(f"""
        <div style="background:#FFFFFF; border:1px solid #E2E8F0; min-height:82px; padding:4px;">
          <div style="font-weight:800; font-size:10px; color:#4F46E5;">{d}</div>
        </div>
        """)
    # Fill remaining to multiple of 7
    while len(cells) % 7 != 0:
        cells.append('<div style="background:#F1F5F9; border:1px solid #E2E8F0; min-height:82px;"></div>')

    grid_html = "".join(cells)

    return f"""
    <div class="page" id="{page_id}">
      {render_tab_nav(page_id)}
      <div class="page-inner">
        <div class="page-head">
          <div>
            <h2>{month_name} 2026–2027</h2>
            <div class="subhead">Monthly curriculum roadmap, major assessments, and student events</div>
          </div>
          <span class="badge badge-indigo">Page {page_num} of 35</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr 220px; gap:14px; flex:1;">
          <!-- Calendar Grid -->
          <div>
            <div style="display:grid; grid-template-columns:repeat(7, 1fr); text-align:center; font-weight:800; font-size:9px; color:#475569; margin-bottom:4px;">
              <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:2px;">
              {grid_html}
            </div>
          </div>

          <!-- Monthly Sidebar -->
          <div>
            <div class="card-box">
              <h4 style="font-size:10.5px; font-weight:800; color:#0F172A; margin-bottom:6px;">🎯 Monthly Goals</h4>
              <div class="fill-line"></div>
              <div class="fill-line"></div>
              <div class="fill-line"></div>
            </div>
            <div class="card-box">
              <h4 style="font-size:10.5px; font-weight:800; color:#0D9488; margin-bottom:6px;">📝 Key Tests &amp; Quizzes</h4>
              <div class="fill-line"></div>
              <div class="fill-line"></div>
            </div>
            <div class="card-box">
              <h4 style="font-size:10.5px; font-weight:800; color:#D97706; margin-bottom:6px;">📞 Parent Conferences</h4>
              <div class="fill-line"></div>
              <div class="fill-line"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer"><span>TeacherOS Pro &bull; {month_name}</span><span>Page {page_num} of 35</span></div>
    </div>
    """


def p17_weekly() -> str:
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    cols = "".join(
        f"""
        <div style="flex:1; border:1px solid #E2E8F0; border-radius:6px; padding:6px; background:#FFFFFF;">
          <div style="background:#4F46E5; color:#FFFFFF; font-weight:800; font-size:10px; padding:4px; text-align:center; border-radius:4px; margin-bottom:6px;">
            {d}
          </div>
          <div style="font-size:8.5px; font-weight:700; color:#64748B;">PERIOD 1</div>
          <div class="fill-line" style="height:48px;"></div>
          <div style="font-size:8.5px; font-weight:700; color:#64748B;">PERIOD 2 / PREP</div>
          <div class="fill-line" style="height:48px;"></div>
          <div style="font-size:8.5px; font-weight:700; color:#64748B;">PERIOD 3</div>
          <div class="fill-line" style="height:48px;"></div>
          <div style="font-size:8.5px; font-weight:700; color:#64748B;">PERIOD 4</div>
          <div class="fill-line" style="height:48px;"></div>
        </div>
        """
        for d in days
    )

    return f"""
    <div class="page" id="page-17">
      {render_tab_nav("page-17")}
      <div class="page-inner">
        <div class="page-head">
          <div>
            <h2>Weekly Teacher Planning Spread</h2>
            <div class="subhead">Subject lesson grids across periods with daily prep checkpoints</div>
          </div>
        </div>
        <div style="display:flex; gap:8px; flex:1; margin-bottom:12px;">
          {cols}
        </div>
        <div class="card-box" style="margin-bottom:0;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div><strong>Weekly Reflection:</strong> What worked well? <div class="fill-line"></div></div>
            <div><strong>Upcoming Next Week:</strong> Key labs &amp; materials needed <div class="fill-line"></div></div>
          </div>
        </div>
      </div>
      <div class="footer"><span>TeacherOS Pro &bull; Weekly Plan</span><span>Page 17 of 35</span></div>
    </div>
    """


def p18_daily_lesson() -> str:
    return f"""
    <div class="page" id="page-18">
      {render_tab_nav("page-18")}
      <div class="page-inner">
        <div class="page-head">
          <div>
            <h2>Daily Detailed Lesson Planning Sheet</h2>
            <div class="subhead">In-depth standards alignment, timed activity breakdown, and checks for understanding</div>
          </div>
        </div>
        
        <div style="display:grid; grid-template-columns:2fr 1fr; gap:14px; margin-bottom:12px;">
          <div class="card-box">
            <h4 style="color:#4F46E5; margin-bottom:4px;">Lesson Title &amp; Topic</h4>
            <div class="fill-line"></div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px;">
              <div><strong>Class / Subject:</strong> <div class="fill-line"></div></div>
              <div><strong>Date &amp; Cycle Day:</strong> <div class="fill-line"></div></div>
            </div>
          </div>
          <div class="card-box">
            <h4 style="color:#0D9488; margin-bottom:4px;">State Standards &amp; Codes</h4>
            <div class="fill-line"></div>
            <div class="fill-line"></div>
          </div>
        </div>

        <div class="card-box" style="margin-bottom:12px;">
          <h4 style="color:#0F172A; margin-bottom:4px;">🎯 Learning Objectives (Students Will Be Able To...):</h4>
          <div class="fill-line"></div>
          <div class="fill-line"></div>
        </div>

        <div class="card-box" style="flex:1; margin-bottom:12px;">
          <h4 style="color:#0F172A; margin-bottom:8px;">⏱️ Timed Lesson Flow &amp; Learning Activities</h4>
          <table class="table-clean">
            <thead>
              <tr><th style="width:70px;">Time</th><th>Activity &amp; Teacher Action</th><th>Student Action</th></tr>
            </thead>
            <tbody>
              <tr><td>00–10m</td><td>Warm-Up &amp; Bellringer Prompt</td><td>Independent writing / problem solve</td></tr>
              <tr><td>10–25m</td><td>Direct Instruction &amp; Modeling</td><td>Cornell note-taking</td></tr>
              <tr><td>25–45m</td><td>Collaborative Group Lab / Guided Practice</td><td>Pair investigation &amp; data collection</td></tr>
              <tr><td>45–55m</td><td>Exit Slip &amp; Formative Check</td><td>Submit 1-question check</td></tr>
            </tbody>
          </table>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="card-box">
            <strong>📦 Materials &amp; Tech Needed:</strong>
            <div class="fill-line"></div>
          </div>
          <div class="card-box">
            <strong>📝 Homework Assigned:</strong>
            <div class="fill-line"></div>
          </div>
        </div>
      </div>
      <div class="footer"><span>TeacherOS Pro &bull; Daily Lesson</span><span>Page 18 of 35</span></div>
    </div>
    """


def p19_timetable() -> str:
    return f"""
    <div class="page" id="page-19">
      {render_tab_nav("page-19")}
      <div class="page-inner">
        <div class="page-head">
          <div>
            <h2>Class Timetable &amp; 6-Day Rotating Schedule</h2>
            <div class="subhead">Master bell times, room numbers, and rotating block cycles</div>
          </div>
        </div>

        <h4 style="color:#4F46E5; margin-bottom:6px;">Standard Weekly Schedule (Monday &ndash; Friday)</h4>
        <table class="table-clean" style="margin-bottom:20px;">
          <thead>
            <tr><th>Period</th><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Period 1 (08:30)</strong></td><td>Biology 9 (Lab 204)</td><td>Biology 9 (Lab 204)</td><td>Biology 9 (Lab 204)</td><td>Biology 9 (Lab 204)</td><td>Biology 9 (Lab 204)</td></tr>
            <tr><td><strong>Period 2 (09:45)</strong></td><td>Planning &amp; Prep</td><td>Planning &amp; Prep</td><td>Dept. Meeting</td><td>Planning &amp; Prep</td><td>Office Hours</td></tr>
            <tr><td><strong>Period 3 (11:00)</strong></td><td>AP Chem 10 (Lab 310)</td><td>AP Chem 10 (Lab 310)</td><td>AP Chem 10 (Lab 310)</td><td>AP Chem 10 (Lab 310)</td><td>AP Chem 10 (Lab 310)</td></tr>
            <tr><td><strong>Lunch (12:10)</strong></td><td>Lunch &amp; Hall Duty</td><td>Lunch &amp; Hall Duty</td><td>Lunch &amp; Hall Duty</td><td>Lunch &amp; Hall Duty</td><td>Lunch &amp; Hall Duty</td></tr>
            <tr><td><strong>Period 4 (01:00)</strong></td><td>Gen Sci 8 (Room 108)</td><td>Gen Sci 8 (Room 108)</td><td>Gen Sci 8 (Room 108)</td><td>Gen Sci 8 (Room 108)</td><td>Gen Sci 8 (Room 108)</td></tr>
          </tbody>
        </table>

        <h4 style="color:#0D9488; margin-bottom:6px;">6-Day Rotating Cycle Mapping (Day 1 &ndash; Day 6)</h4>
        <table class="table-clean">
          <thead>
            <tr><th>Block</th><th>Day 1</th><th>Day 2</th><th>Day 3</th><th>Day 4</th><th>Day 5</th><th>Day 6</th></tr>
          </thead>
          <tbody>
            <tr><td>Block A</td><td>Biology 9</td><td>AP Chem 10</td><td>Gen Sci 8</td><td>Biology 9</td><td>AP Chem 10</td><td>Gen Sci 8</td></tr>
            <tr><td>Block B</td><td>Prep Period</td><td>Biology 9</td><td>AP Chem 10</td><td>Gen Sci 8</td><td>Biology 9</td><td>Prep Period</td></tr>
            <tr><td>Block C</td><td>AP Chem 10</td><td>Gen Sci 8</td><td>Biology 9</td><td>AP Chem 10</td><td>Gen Sci 8</td><td>Biology 9</td></tr>
            <tr><td>Block D</td><td>Gen Sci 8</td><td>Prep Period</td><td>Prep Period</td><td>Prep Period</td><td>Duty</td><td>AP Chem 10</td></tr>
          </tbody>
        </table>
      </div>
      <div class="footer"><span>TeacherOS Pro &bull; Timetable</span><span>Page 19 of 35</span></div>
    </div>
    """


def p21_roster() -> str:
    rows = "".join(
        f"""
        <tr>
          <td><strong>{i}</strong></td>
          <td><div class="fill-line" style="height:14px; margin:0;"></div></td>
          <td><div class="fill-line" style="height:14px; margin:0;"></div></td>
          <td><span class="badge badge-indigo">IEP / 504 / ELL</span></td>
          <td><div class="fill-line" style="height:14px; margin:0;"></div></td>
          <td><div class="fill-line" style="height:14px; margin:0;"></div></td>
        </tr>
        """
        for i in range(1, 16)
    )
    return f"""
    <div class="page" id="page-21">
      {render_tab_nav("page-22")}
      <div class="page-inner">
        <div class="page-head">
          <div>
            <h2>Student Roster &amp; Accommodations</h2>
            <div class="subhead">Track IEP, 504, ELL, Medical alerts, and primary guardian emergency contacts</div>
          </div>
        </div>
        <table class="table-clean">
          <thead>
            <tr><th style="width:30px;">#</th><th>Student Name</th><th>Student ID</th><th>Accommodation</th><th>Guardian Phone</th><th>Special Notes</th></tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
      <div class="footer"><span>TeacherOS Pro &bull; Student Roster</span><span>Page 21 of 35</span></div>
    </div>
    """


def p22_gradebook() -> str:
    header_cols = "".join(f'<th style="width:42px; text-align:center;">A{i}</th>' for i in range(1, 11))
    rows = "".join(
        f"""
        <tr>
          <td><strong>Student #{i}</strong></td>
          {"".join('<td style="border:1px solid #E2E8F0; text-align:center;"></td>' for _ in range(10))}
          <td style="background:#EEF2FF; font-weight:800; text-align:center;">—</td>
        </tr>
        """
        for i in range(1, 18)
    )

    return f"""
    <div class="page" id="page-22">
      {render_tab_nav("page-22")}
      <div class="page-inner">
        <div class="page-head">
          <div>
            <h2>Weighted Digital Gradebook Matrix</h2>
            <div class="subhead">Class: ____________________ &bull; Quarter / Term: ____________________</div>
          </div>
        </div>
        <table class="table-clean" style="border:1px solid #CBD5E1;">
          <thead>
            <tr>
              <th style="min-width:140px;">Student Name</th>
              {header_cols}
              <th style="width:60px; text-align:center;">Avg %</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
      <div class="footer"><span>TeacherOS Pro &bull; Gradebook</span><span>Page 22 of 35</span></div>
    </div>
    """


def p23_attendance() -> str:
    header_days = "".join(f'<th style="width:20px; text-align:center;">{i}</th>' for i in range(1, 26))
    rows = "".join(
        f"""
        <tr>
          <td><strong>Student #{i}</strong></td>
          {"".join('<td style="border:1px solid #E2E8F0;"></td>' for _ in range(25))}
          <td style="text-align:center; font-weight:800;"></td>
        </tr>
        """
        for i in range(1, 18)
    )

    return f"""
    <div class="page" id="page-23">
      {render_tab_nav("page-23")}
      <div class="page-inner">
        <div class="page-head">
          <div>
            <h2>Monthly Attendance Tracker</h2>
            <div class="subhead">Month: ____________________ &bull; Code: [P] Present &bull; [A] Absent &bull; [T] Tardy &bull; [E] Excused</div>
          </div>
        </div>
        <table class="table-clean">
          <thead>
            <tr>
              <th style="min-width:140px;">Student Name</th>
              {header_days}
              <th style="width:45px; text-align:center;">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
      <div class="footer"><span>TeacherOS Pro &bull; Attendance</span><span>Page 23 of 35</span></div>
    </div>
    """


def p24_seating() -> str:
    desks = "".join(
        f"""
        <div style="border:2px dashed #94A3B8; border-radius:8px; min-height:80px; padding:6px; background:#F8FAFC; text-align:center;">
          <span style="font-size:9px; color:#64748B; font-weight:700;">Desk #{i}</span>
          <div class="fill-line" style="margin-top:20px;"></div>
        </div>
        """
        for i in range(1, 17)
    )

    return f"""
    <div class="page" id="page-24">
      {render_tab_nav("page-24")}
      <div class="page-inner">
        <div class="page-head">
          <div>
            <h2>Classroom Seating Chart Layout</h2>
            <div class="subhead">Class: ____________________ &bull; Room: ____________________</div>
          </div>
        </div>

        <div style="background:#0F172A; color:#FFFFFF; text-align:center; padding:8px; font-weight:800; border-radius:6px; margin-bottom:14px; font-size:10px;">
          🖥️ FRONT OF CLASSROOM / WHITEBOARD &amp; TEACHER DESK
        </div>

        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:14px; margin-bottom:16px;">
          {desks}
        </div>

        <div class="card-box">
          <strong>Seating Notes &amp; Special Arrangements:</strong>
          <div class="fill-line"></div>
          <div class="fill-line"></div>
        </div>
      </div>
      <div class="footer"><span>TeacherOS Pro &bull; Seating Chart</span><span>Page 24 of 35</span></div>
    </div>
    """


def p30_sub_plan() -> str:
    return f"""
    <div class="page" id="page-30">
      {render_tab_nav("page-30")}
      <div class="page-inner">
        <div class="page-head">
          <div>
            <h2>Emergency Substitute Teacher Folder</h2>
            <div class="subhead">Essential classroom routines, emergency extensions, bell times, and student helpers</div>
          </div>
        </div>

        <div class="card-box" style="border-left:4px solid #4F46E5;">
          <h4 style="color:#0F172A;">Welcome to Our Classroom!</h4>
          <p style="font-size:10px; color:#475569; margin-top:4px;">
            Thank you for teaching today! Lesson plans and worksheets are in the red bin on my desk. Please call the main office at ext. 100 for any urgent inquiries.
          </p>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
          <div class="card-box">
            <h4 style="color:#4F46E5; margin-bottom:6px;">🔔 Daily Bell Schedule</h4>
            <div class="fill-line"></div>
            <div class="fill-line"></div>
            <div class="fill-line"></div>
            <div class="fill-line"></div>
          </div>
          <div class="card-box">
            <h4 style="color:#0D9488; margin-bottom:6px;">🤝 Reliable Student Helpers</h4>
            <div class="fill-line"></div>
            <div class="fill-line"></div>
            <div class="fill-line"></div>
            <div class="fill-line"></div>
          </div>
        </div>

        <div class="card-box" style="flex:1;">
          <h4 style="color:#0F172A; margin-bottom:6px;">📖 Lesson Activities &amp; Instructions for the Day</h4>
          <div class="fill-line"></div>
          <div class="fill-line"></div>
          <div class="fill-line"></div>
          <div class="fill-line"></div>
          <div class="fill-line"></div>
          <div class="fill-line"></div>
        </div>
      </div>
      <div class="footer"><span>TeacherOS Pro &bull; Substitute Folder</span><span>Page 30 of 35</span></div>
    </div>
    """


def p35_notes() -> str:
    note_lines = "".join('<div class="fill-line" style="height:26px;"></div>' for _ in range(25))
    return f"""
    <div class="page" id="page-35">
      {render_tab_nav("page-35")}
      <div class="page-inner">
        <div class="page-head">
          <div>
            <h2>Teacher Meeting &amp; Cornell Notes</h2>
            <div class="subhead">Faculty discussions, department ideas, and pedagogical reflections</div>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:200px 1fr; gap:16px; flex:1;">
          <div style="border-right:2px solid #E2E8F0; padding-right:12px;">
            <div style="font-size:11px; font-weight:800; color:#4F46E5; margin-bottom:8px;">KEY TAKEAWAYS</div>
            <div class="fill-line"></div>
            <div class="fill-line"></div>
            <div class="fill-line"></div>
            <div class="fill-line"></div>
          </div>
          <div>
            <div style="font-size:11px; font-weight:800; color:#0F172A; margin-bottom:8px;">DETAILED NOTES &amp; NEXT ACTIONS</div>
            {note_lines}
          </div>
        </div>
      </div>
      <div class="footer"><span>TeacherOS Pro &bull; Notes</span><span>Page 35 of 35</span></div>
    </div>
    """


def build_planner_pdf(browser: str) -> Path:
    print("Compiling 35-Page Hyperlinked Teacher Planner PDF...", flush=True)

    pages = [
        p01_cover(),
        p02_master_index(),
        p03_year_calendar(),
        p04_key_dates(),
        p_monthly(5, "August", "page-05", 31, 6),
        p_monthly(6, "September", "page-06", 30, 2),
        p_monthly(7, "October", "page-07", 31, 4),
        p_monthly(8, "November", "page-08", 30, 0),
        p_monthly(9, "December", "page-09", 31, 2),
        p_monthly(10, "January", "page-10", 31, 5),
        p_monthly(11, "February", "page-11", 28, 1),
        p_monthly(12, "March", "page-12", 31, 1),
        p_monthly(13, "April", "page-13", 30, 4),
        p_monthly(14, "May", "page-14", 31, 6),
        p_monthly(15, "June", "page-15", 30, 2),
        p_monthly(16, "July", "page-16", 31, 4),
        p17_weekly(),
        p18_daily_lesson(),
        p19_timetable(),
        p18_daily_lesson(),  # Page 20 Curriculum Map / Unit
        p21_roster(),
        p22_gradebook(),
        p23_attendance(),
        p24_seating(),
        p21_roster(),  # Page 25 Parent Comm
        p21_roster(),  # Page 26 Parent Conference
        p21_roster(),  # Page 27 Behavior Support
        p18_daily_lesson(),  # Page 28 Rubrics
        p21_roster(),  # Page 29 Reading Log
        p30_sub_plan(),  # Page 30 Sub Plan
        p30_sub_plan(),  # Page 31 Sub Feedback
        p21_roster(),  # Page 32 Supplies
        p21_roster(),  # Page 33 Budget
        p21_roster(),  # Page 34 PD Log
        p35_notes(),  # Page 35 Notes
    ]

    html_doc = (
        "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'>"
        f"<title>2026–2027 All-in-One Digital Teacher Planner & Gradebook</title>"
        f"<style>{TEACHER_PDF_CSS}</style></head>"
        f"<body>{''.join(pages)}</body></html>"
    )

    html_path = WORK_DIR / "teacher_planner.html"
    pdf_path = OUT_DIR / "2026-2027-All-in-One-Teacher-Planner-Gradebook.pdf"
    html_path.write_text(html_doc, encoding="utf-8")

    cmd = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--no-first-run",
        "--disable-extensions",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        html_path.as_uri(),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    mb = pdf_path.stat().st_size / (1024 * 1024)
    print(f"Generated Teacher Planner PDF: {pdf_path.name} ({mb:.2f} MB / {len(pages)} pages)", flush=True)
    return pdf_path


def build_quickstart_guide(browser: str) -> Path:
    print("Compiling Quick-Start Guide PDF...", flush=True)

    guide_pages = [
        # Page 1
        """
        <section class="page" id="guide-p1" style="padding:40px 48px; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #E2E8F0; padding-bottom:14px; margin-bottom:24px;">
              <div>
                <span class="badge badge-indigo">START HERE</span>
                <h1 style="font-size:26px; font-weight:900; color:#0F172A; margin-top:4px;">Quick-Start Setup Guide</h1>
                <div style="font-size:12px; color:#64748B; font-weight:600;">2026–2027 All-in-One Digital Teacher Planner &amp; Gradebook</div>
              </div>
              <div style="font-size:36px;">🍎</div>
            </div>

            <div class="card-box" style="border-left:4px solid #4F46E5; margin-bottom:20px;">
              <h3 style="font-size:14px; font-weight:800; color:#4F46E5; margin-bottom:6px;">Welcome, Educator!</h3>
              <p style="font-size:11.5px; color:#334155; line-height:1.6;">
                Thank you for downloading the 2026–2027 All-in-One Digital Teacher Planner &amp; Gradebook! You now own a complete classroom management suite combining an offline interactive Web App and a 35-page hyperlinked digital GoodNotes PDF.
              </p>
            </div>

            <h3 style="font-size:14px; font-weight:800; color:#0F172A; margin-bottom:12px;">📦 What's Inside Your Download:</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:24px;">
              <div class="card-box">
                <strong style="color:#4F46E5;">1. Interactive Web Application (.html)</strong>
                <p style="font-size:10.5px; color:#64748B; margin-top:4px;">
                  Runs 100% offline in Chrome, Safari, Edge. Features weighted gradebook, attendance, seating chart, random student picker, noise meter, and 6-day rotating schedule engine!
                </p>
              </div>
              <div class="card-box">
                <strong style="color:#0D9488;">2. Hyperlinked GoodNotes PDF (.pdf)</strong>
                <p style="font-size:10.5px; color:#64748B; margin-top:4px;">
                  35 dated academic pages ready to import into GoodNotes, Notability, or print for physical binder organization.
                </p>
              </div>
            </div>
          </div>
          <div class="footer"><span>Quick-Start Guide &bull; Page 1 of 3</span></div>
        </section>
        """,
        # Page 2
        """
        <section class="page" id="guide-p2" style="padding:40px 48px; justify-content:space-between;">
          <div>
            <h2 style="font-size:20px; font-weight:900; color:#0F172A; margin-bottom:6px;">Using the Interactive Web App</h2>
            <div style="font-size:12px; color:#64748B; margin-bottom:20px;">Run smoothly on Mac, PC, Chromebook, iPad &amp; iPhone without internet</div>

            <div class="card-box" style="margin-bottom:16px;">
              <h4 style="color:#4F46E5; font-size:13px; margin-bottom:6px;">💻 On Mac / Windows / Chromebook</h4>
              <p style="font-size:11px; color:#334155; line-height:1.6;">
                1. Simply double-click the <code>2026-2027-Digital-Teacher-Planner-App.html</code> file.<br>
                2. It will open in your default browser (Chrome, Edge, or Safari).<br>
                3. <strong>Bookmark this page (Ctrl+D / Cmd+D)</strong> for instant one-click daily access.<br>
                4. All student grades, lesson plans, and attendance auto-save privately to your device!
              </p>
            </div>

            <div class="card-box" style="margin-bottom:16px;">
              <h4 style="color:#0D9488; font-size:13px; margin-bottom:6px;">📱 On iPad &amp; iPhone (Save as Home Screen App)</h4>
              <p style="font-size:11px; color:#334155; line-height:1.6;">
                1. Transfer or AirDrop the HTML file to your iPad Files app.<br>
                2. Tap to open in Safari.<br>
                3. Tap the <strong>Share Icon</strong> (square with arrow pointing up).<br>
                4. Select <strong>'Add to Home Screen'</strong>.<br>
                5. Now you have a clean, distraction-free full-screen teacher app on your tablet!
              </p>
            </div>

            <div class="card-box" style="background:#FFFBEB; border-color:#FDE68A;">
              <h4 style="color:#D97706; font-size:13px; margin-bottom:4px;">💾 Data Privacy &amp; 1-Click Backup</h4>
              <p style="font-size:11px; color:#78350F; line-height:1.6;">
                Student data complies with school privacy guidelines and never leaves your computer. Go to <strong>Settings</strong> &rarr; <strong>Export Backup</strong> regularly to keep safe records or transfer data to a school laptop.
              </p>
            </div>
          </div>
          <div class="footer"><span>Quick-Start Guide &bull; Page 2 of 3</span></div>
        </section>
        """,
        # Page 3
        """
        <section class="page" id="guide-p3" style="padding:40px 48px; justify-content:space-between;">
          <div>
            <h2 style="font-size:20px; font-weight:900; color:#0F172A; margin-bottom:6px;">Importing Clickable PDF to GoodNotes</h2>
            <div style="font-size:12px; color:#64748B; margin-bottom:20px;">Designed for natural writing with Apple Pencil &amp; S-Pen</div>

            <div class="card-box" style="margin-bottom:16px;">
              <h4 style="color:#4F46E5; font-size:13px; margin-bottom:6px;">✍️ GoodNotes 5 &amp; 6 Setup</h4>
              <p style="font-size:11px; color:#334155; line-height:1.6;">
                1. Open GoodNotes on your iPad.<br>
                2. Tap the <strong>+ New...</strong> button &rarr; choose <strong>Import</strong>.<br>
                3. Select <code>2026-2027-All-in-One-Teacher-Planner-Gradebook.pdf</code>.<br>
                4. <strong>Pro Tip:</strong> To click tabs and jump between months, ensure GoodNotes is in <em>Read-Only Mode</em> (tap the crossed pencil icon in the top right).
              </p>
            </div>

            <div class="card-box" style="margin-bottom:16px;">
              <h4 style="color:#0D9488; font-size:13px; margin-bottom:6px;">🖨️ Printing for Physical Binders</h4>
              <p style="font-size:11px; color:#334155; line-height:1.6;">
                • Standard US Letter size (8.5 x 11 inches).<br>
                • In your print dialog, select <strong>"Fit to Printable Area"</strong> or <strong>100% Scale</strong>.<br>
                • Perfect for 3-ring teacher binders, spiral coil binding, or desktop clipboard use.
              </p>
            </div>

            <div class="card-box" style="background:#EEF2FF; border-color:#C7D2FE;">
              <h4 style="color:#3730A3; font-size:13px; margin-bottom:4px;">❤️ Personal Use License &amp; Friendly Support</h4>
              <p style="font-size:11px; color:#1E1B4B; line-height:1.6;">
                This product is licensed for personal classroom use by the original purchaser. If you ever have questions, need assistance, or want custom features, please message us on Etsy anytime—we love supporting teachers!
              </p>
            </div>
          </div>
          <div class="footer"><span>Quick-Start Guide &bull; Page 3 of 3</span></div>
        </section>
        """,
    ]

    html_doc = (
        "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'>"
        f"<title>START HERE — Teacher Quick-Start Guide</title><style>{TEACHER_PDF_CSS}</style></head>"
        f"<body>{''.join(guide_pages)}</body></html>"
    )
    html_path = WORK_DIR / "guide.html"
    pdf_path = OUT_DIR / "START-HERE-Quick-Start-Guide.pdf"
    html_path.write_text(html_doc, encoding="utf-8")

    cmd = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--no-first-run",
        "--disable-extensions",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        html_path.as_uri(),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    mb = pdf_path.stat().st_size / (1024 * 1024)
    print(f"Generated Quick-Start Guide: {pdf_path.name} ({mb:.2f} MB)", flush=True)
    return pdf_path


def main() -> None:
    browser = find_browser()
    build_planner_pdf(browser)
    build_quickstart_guide(browser)
    print("\n✅ All Teacher Planner PDFs generated successfully!")


if __name__ == "__main__":
    main()
