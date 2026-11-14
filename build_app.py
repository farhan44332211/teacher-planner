"""
Build standalone single-file 2026-2027 All-in-One Digital Teacher Planner & Gradebook Web App.
Inlines styles.css, data.js, and app.js into a production-ready offline HTML file.
"""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
APP_SRC = BASE_DIR / "app_src"
BUNDLE_DIR = BASE_DIR / "product_bundle"
BUNDLE_DIR.mkdir(exist_ok=True)

HTML_SHELL = """<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>2026–2027 All-in-One Digital Teacher Planner &amp; Gradebook</title>
  <meta name="description" content="Offline interactive digital teacher planner, gradebook, attendance tracker, seating chart, and lesson organizer." />
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

  <style>
/* __INLINE_STYLES__ */
  </style>
</head>
<body>
  <div class="app-container" id="appContainer">
    <!-- Sidebar Navigation -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon-wrapper">🍎</div>
        <div class="brand-text-col">
          <h1>TeacherOS Pro</h1>
          <span class="brand-badge">2026–2027 Edition</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">Core Hubs</div>
        <a class="nav-item active" data-view="dashboard">
          <span class="nav-icon">📊</span>
          <span>Dashboard</span>
        </a>
        <a class="nav-item" data-view="timetable">
          <span class="nav-icon">🗓️</span>
          <span>Timetable &amp; Cycles</span>
          <span class="badge-pill">6-Day</span>
        </a>
        <a class="nav-item" data-view="lesson_planner">
          <span class="nav-icon">📖</span>
          <span>Lesson Planner</span>
        </a>

        <div class="nav-section-label">Classroom Management</div>
        <a class="nav-item" data-view="gradebook">
          <span class="nav-icon">📝</span>
          <span>Gradebook</span>
          <span class="badge-pill">Formula</span>
        </a>
        <a class="nav-item" data-view="attendance">
          <span class="nav-icon">📍</span>
          <span>Attendance</span>
        </a>
        <a class="nav-item" data-view="seating_chart">
          <span class="nav-icon">🪑</span>
          <span>Seating Chart</span>
          <span class="badge-pill">Shuffle</span>
        </a>
        <a class="nav-item" data-view="student_roster">
          <span class="nav-icon">🎓</span>
          <span>Student Roster</span>
        </a>

        <div class="nav-section-label">Educator Toolkit</div>
        <a class="nav-item" data-view="toolkit">
          <span class="nav-icon">🧰</span>
          <span>Live In-Class Toolkit</span>
          <span class="badge-pill">Live</span>
        </a>
        <a class="nav-item" data-view="sub_plans">
          <span class="nav-icon">📑</span>
          <span>Emergency Sub Plans</span>
        </a>
        <a class="nav-item" data-view="budget_supplies">
          <span class="nav-icon">📦</span>
          <span>Supplies &amp; Budget</span>
        </a>

        <div class="nav-section-label">System</div>
        <a class="nav-item" data-view="settings">
          <span class="nav-icon">⚙️</span>
          <span>Settings &amp; Backup</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="term-tag">
          <span class="term-indicator"></span>
          <span>Fall 2026 Session</span>
        </div>
        <span style="font-size:11px; color:#64748B; font-weight:700;">100% Offline</span>
      </div>
    </aside>

    <!-- Main Application Wrapper -->
    <main class="main-wrapper">
      <header class="top-header">
        <div class="header-left">
          <button class="menu-toggle-btn" id="menuToggleBtn" aria-label="Toggle Menu">☰</button>
          <div class="page-title-wrap">
            <h2 id="pageTitle">Teacher Dashboard</h2>
            <div class="page-subtitle" id="pageSubtitle">Academic Overview</div>
          </div>
        </div>

        <div class="header-center">
          <div class="cycle-indicator-pill" id="cycleIndicator">
            🔄 Rotating: Day 1 of 6
          </div>
        </div>

        <div class="header-right">
          <button class="btn-icon" id="themeToggleBtn" title="Toggle Dark/Light Mode">🌙</button>
        </div>
      </header>

      <section class="content-area" id="contentArea">
        <!-- Rendered dynamically by app.js -->
      </section>
    </main>
  </div>

  <!-- Reusable Modal Dialog -->
  <div class="modal-overlay" id="modalOverlay">
    <div class="modal-dialog">
      <div class="modal-header">
        <h3 id="modalTitle">Modal Title</h3>
        <button class="btn-icon" style="width:32px; height:32px; border:none;" onclick="window.app.closeModal()">&times;</button>
      </div>
      <div class="modal-body" id="modalBody"></div>
      <div class="modal-footer" id="modalFooter"></div>
    </div>
  </div>

  <!-- Toast Notification Container -->
  <div class="toast-container" id="toastContainer"></div>

  <script>
/* __INLINE_DATA__ */
  </script>
  <script>
/* __INLINE_APP__ */
  </script>
</body>
</html>
"""


def build():
    print("Compiling 2026-2027 All-in-One Digital Teacher Planner App...")
    css_content = (APP_SRC / "styles.css").read_text(encoding="utf-8")
    data_content = (APP_SRC / "data.js").read_text(encoding="utf-8")
    app_content = (APP_SRC / "app.js").read_text(encoding="utf-8")

    full_html = HTML_SHELL.replace("/* __INLINE_STYLES__ */", css_content)
    full_html = full_html.replace("/* __INLINE_DATA__ */", data_content)
    full_html = full_html.replace("/* __INLINE_APP__ */", app_content)

    # Output to root index.html
    root_index = BASE_DIR / "index.html"
    root_index.write_text(full_html, encoding="utf-8")
    print(f"✓ Wrote root: {root_index} ({root_index.stat().st_size / 1024:.1f} KB)")

    # Output to product_bundle
    bundle_file = BUNDLE_DIR / "2026-2027-Digital-Teacher-Planner-App.html"
    bundle_file.write_text(full_html, encoding="utf-8")
    print(f"✓ Wrote bundle: {bundle_file} ({bundle_file.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    build()
