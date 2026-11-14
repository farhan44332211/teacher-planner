"""
Generate 5 High-Resolution 3000x3000px Etsy Listing Mockups
for the 2026–2027 All-in-One Digital Teacher Planner & Gradebook.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

import build_teacher_pdf
from build_teacher_pdf import (
    TEACHER_PDF_CSS,
    p01_cover,
    p02_master_index,
    p03_year_calendar,
    p_monthly,
    p17_weekly,
    p18_daily_lesson,
    p19_timetable,
    p21_roster,
    p22_gradebook,
    p23_attendance,
    p24_seating,
    p30_sub_plan,
    p35_notes,
)

APP_HTML_PATH = BASE_DIR / "product_bundle" / "2026-2027-Digital-Teacher-Planner-App.html"
LIFESTYLE_BASE_PATH = Path(
    r"C:\Users\DELL\.gemini\antigravity\brain\287652e9-34e5-4cd0-9e43-f5681fc3d786\teacher_desk_ipad_mockup_1794656796195.jpg"
)

OUT_DIR = BASE_DIR / "etsy_media"
WORK_DIR = OUT_DIR / "_work"
SCREENS_DIR = WORK_DIR / "screens"

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"


def _ensure_dirs() -> None:
    OUT_DIR.mkdir(exist_ok=True)
    WORK_DIR.mkdir(exist_ok=True)
    SCREENS_DIR.mkdir(exist_ok=True)


def _run_chrome_screenshot(
    url: str,
    out_path: Path,
    width: int,
    height: int,
    scale: int = 1,
    budget_ms: int = 0,
) -> None:
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--no-first-run",
        "--disable-extensions",
        "--disable-background-networking",
        "--hide-scrollbars",
        f"--force-device-scale-factor={scale}",
        f"--window-size={width},{height}",
    ]
    if budget_ms > 0:
        cmd.append(f"--virtual-time-budget={budget_ms}")
    cmd.extend([f"--screenshot={out_path}", url])
    subprocess.run(cmd, check=True, timeout=90, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def capture_real_screens() -> dict[str, Path]:
    """Capture authentic app views and companion PDF pages."""
    app_src = APP_HTML_PATH.read_text(encoding="utf-8")
    screens: dict[str, Path] = {}

    app_specs = [
        ("app_dashboard", "dashboard", False, 1340, 880, 2),
        ("app_timetable", "timetable", False, 1340, 880, 2),
        ("app_gradebook", "gradebook", False, 1340, 880, 2),
        ("app_attendance", "attendance", False, 1340, 880, 2),
        ("app_seating", "seating_chart", False, 1340, 880, 2),
        ("app_toolkit", "toolkit", False, 1340, 880, 2),
        ("app_sub_plans", "sub_plans", False, 1340, 880, 2),
        ("app_dark_dashboard", "dashboard", True, 1340, 880, 2),
        ("app_ipad_portrait", "dashboard", False, 1000, 1260, 2),
        ("app_mobile", "dashboard", False, 450, 920, 2),
    ]

    for key, view, dark, w, h, sc in app_specs:
        out_png = SCREENS_DIR / f"{key}.png"
        if not out_png.exists():
            inject = (
                "<script>"
                "window.addEventListener('DOMContentLoaded',()=>{"
                f"if({str(dark).lower()}){{document.documentElement.setAttribute('data-theme','dark');}}"
                f"const b=document.querySelector('.nav-item[data-view=\"{view}\"]'); if(b) b.click();"
                "});"
                "</script></body>"
            )
            html_file = WORK_DIR / f"_cap_{key}.html"
            html_file.write_text(app_src.replace("</body>", inject), encoding="utf-8")
            _run_chrome_screenshot(html_file.as_uri(), out_png, w, h, scale=sc, budget_ms=1400)
        screens[key] = out_png

    # PDF Pages
    pdf_specs = {
        "pdf_p01": p01_cover(),
        "pdf_p02": p02_master_index(),
        "pdf_p05": p_monthly(5, "August", "page-05", 31, 6),
        "pdf_p17": p17_weekly(),
        "pdf_p18": p18_daily_lesson(),
        "pdf_p19": p19_timetable(),
        "pdf_p22": p22_gradebook(),
        "pdf_p24": p24_seating(),
        "pdf_p30": p30_sub_plan(),
    }

    for key, page_html in pdf_specs.items():
        out_png = SCREENS_DIR / f"{key}.png"
        if not out_png.exists():
            doc = (
                "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'>"
                f"<style>{TEACHER_PDF_CSS} .page{{page-break-after:auto; break-after:auto;}}</style>"
                f"</head><body>{page_html}</body></html>"
            )
            html_file = WORK_DIR / f"_cap_{key}.html"
            html_file.write_text(doc, encoding="utf-8")
            _run_chrome_screenshot(html_file.as_uri(), out_png, 816, 1056, scale=2, budget_ms=900)
        screens[key] = out_png

    print(f"Captured {len(screens)} authentic teacher product screens.", flush=True)
    return screens


ETSY_CSS = """
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

body {
  background: #090D16;
  color: #F8FAFC;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Montserrat', Roboto, Arial, sans-serif;
}

.canvas {
  width: 3000px;
  height: 3000px;
  position: relative;
  overflow: hidden;
  background: #090D16;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 16px 36px;
  border-radius: 999px;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.device-frame {
  background: #111827;
  border-radius: 46px;
  padding: 26px;
  border: 4px solid #1E293B;
  box-shadow: 0 45px 95px rgba(0, 0, 0, 0.65), 0 10px 30px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.device-frame img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 26px;
  object-fit: cover;
  object-position: top left;
}

.paper-sheet {
  background: #FFFFFF;
  border-radius: 24px;
  border: 3px solid #E2E8F0;
  box-shadow: 0 35px 80px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.paper-sheet img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
"""


def _render_html_to_3000(html_body: str, out_png: Path, extra_css: str = "") -> None:
    if out_png.exists():
        print(f"Skipping already existing {out_png.name}", flush=True)
        return
    doc = (
        "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'>"
        f"<style>{ETSY_CSS}\n{extra_css}</style></head><body>{html_body}</body></html>"
    )
    html_file = WORK_DIR / f"_render_{out_png.stem}.html"
    tmp_png = WORK_DIR / f"_tmp_{out_png.stem}.png"
    html_file.write_text(doc, encoding="utf-8")
    _run_chrome_screenshot(html_file.as_uri(), tmp_png, 3000, 3000, scale=1, budget_ms=1200)
    with Image.open(tmp_png) as im:
        im.convert("RGB").save(out_png, "PNG", optimize=True)
    tmp_png.unlink(missing_ok=True)
    print(f"Generated {out_png.name} (3000x3000 RGB)", flush=True)


# ==============================================================================
# SLIDE 1: MAIN HERO PRODUCT THUMBNAIL
# ==============================================================================
def build_image_1_hero(u: dict[str, str]) -> Path:
    out_png = OUT_DIR / "01_main_product_thumbnail.png"
    css = """
    .c1 {
      background:
        radial-gradient(circle at 15% 15%, rgba(79, 70, 229, 0.24) 0%, transparent 50%),
        radial-gradient(circle at 85% 85%, rgba(13, 148, 136, 0.20) 0%, transparent 50%),
        linear-gradient(160deg, #090D16 0%, #0F172A 60%, #090D16 100%);
      padding: 110px 120px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .c1-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .c1-badge-main {
      background: #4F46E5;
      color: #FFFFFF;
      box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
    }
    .c1-badge-dated {
      background: #10B981;
      color: #064E3B;
      font-weight: 900;
    }
    .c1-hero-text {
      text-align: center;
      margin-top: 18px;
    }
    .c1-hero-text h1 {
      font-size: 148px;
      line-height: 0.94;
      font-weight: 900;
      letter-spacing: -3px;
      color: #F8FAFC;
    }
    .c1-hero-text h1 span {
      background: linear-gradient(135deg, #818CF8, #38BDF8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .c1-sub {
      margin-top: 24px;
      font-size: 46px;
      font-weight: 700;
      color: #94A3B8;
      letter-spacing: -0.5px;
    }
    .c1-sub strong {
      color: #38BDF8;
    }

    .c1-stage {
      position: relative;
      height: 1540px;
      margin: 20px 0;
    }
    .c1-ipad-main {
      position: absolute;
      left: 100px;
      top: 50px;
      width: 1860px;
      height: 1240px;
      z-index: 10;
      transform: rotate(-3deg);
    }
    .c1-phone-left {
      position: absolute;
      left: 60px;
      bottom: 60px;
      width: 580px;
      height: 1160px;
      z-index: 20;
      border-radius: 54px;
      padding: 22px;
      background: #020617;
      border: 4px solid #334155;
      box-shadow: 0 45px 90px rgba(0, 0, 0, 0.7);
      transform: rotate(5deg);
    }
    .c1-phone-left img {
      width: 100%;
      height: 100%;
      border-radius: 36px;
      object-fit: cover;
      display: block;
    }
    .c1-pdf-sheet {
      position: absolute;
      right: 120px;
      top: 180px;
      width: 1050px;
      height: 1360px;
      z-index: 5;
      transform: rotate(7deg);
    }
    .c1-chip {
      position: absolute;
      background: rgba(15, 23, 42, 0.92);
      border: 2px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(12px);
      padding: 20px 36px;
      border-radius: 999px;
      font-size: 32px;
      font-weight: 800;
      color: #FFFFFF;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      gap: 14px;
      z-index: 30;
    }
    .c1-chip strong { color: #10B981; }

    .c1-foot {
      display: flex;
      justify-content: space-between;
      gap: 24px;
    }
    .c1-foot-item {
      flex: 1;
      background: rgba(30, 41, 59, 0.6);
      border: 2px solid rgba(255, 255, 255, 0.08);
      border-radius: 28px;
      padding: 30px 24px;
      text-align: center;
    }
    .c1-foot-item .fi-icon { font-size: 46px; margin-bottom: 8px; }
    .c1-foot-item .fi-title { font-size: 30px; font-weight: 800; color: #F8FAFC; }
    .c1-foot-item .fi-sub { font-size: 22px; font-weight: 600; color: #94A3B8; margin-top: 4px; }
    """

    body = f"""
    <div class="canvas c1">
      <div class="c1-top">
        <div class="pill c1-badge-main">🍎 2026&ndash;2027 Pro Educator Edition</div>
        <div class="pill c1-badge-dated">AUG 2026 &ndash; JUL 2027 DATED</div>
      </div>

      <div class="c1-hero-text">
        <h1>TEACHER PLANNER &amp; <span>GRADEBOOK</span></h1>
        <div class="c1-sub">
          Interactive Offline Web App &bull; <strong>35-Page Clickable GoodNotes iPad PDF</strong> &bull; 6-Day Rotating Cycles
        </div>
      </div>

      <div class="c1-stage">
        <!-- Main Desktop/Laptop Web App View -->
        <div class="device-frame c1-ipad-main">
          <img src="{u['app_dashboard']}" />
        </div>

        <!-- Phone Mobile View -->
        <div class="c1-phone-left">
          <img src="{u['app_mobile']}" />
        </div>

        <!-- Printable / GoodNotes PDF Sheet -->
        <div class="paper-sheet c1-pdf-sheet">
          <img src="{u['pdf_p22']}" />
        </div>

        <!-- Floating Chips -->
        <div class="c1-chip" style="left:880px; top:60px;">
          <span>⚖️</span> Weighted Gradebook: <strong>Auto Formulas</strong>
        </div>
        <div class="c1-chip" style="left:1480px; top:120px;">
          <span>🔄</span> 6-Day Rotating: <strong>Day 1 &ndash; Day 6 Cycles</strong>
        </div>
        <div class="c1-chip" style="left:80px; top:1380px;">
          <span>🎲</span> <strong>Random Student Picker &amp; Timers</strong>
        </div>
        <div class="c1-chip" style="right:120px; top:1380px;">
          <span>🔒</span> <strong>100% Offline &bull; No Subscriptions</strong>
        </div>
      </div>

      <div class="c1-foot">
        <div class="c1-foot-item">
          <div class="fi-icon">💻</div>
          <div class="fi-title">Works on Any Device</div>
          <div class="fi-sub">Mac, PC, Chromebook &amp; iPad</div>
        </div>
        <div class="c1-foot-item">
          <div class="fi-icon">✍️</div>
          <div class="fi-title">GoodNotes &amp; Notability</div>
          <div class="fi-sub">35 Hyperlinked Pages</div>
        </div>
        <div class="c1-foot-item">
          <div class="fi-icon">📑</div>
          <div class="fi-title">Emergency Sub Plans</div>
          <div class="fi-sub">1-Click printable folder</div>
        </div>
        <div class="c1-foot-item">
          <div class="fi-icon">⚡</div>
          <div class="fi-title">Instant Digital Download</div>
          <div class="fi-sub">Zero recurring monthly fees</div>
        </div>
      </div>
    </div>
    """
    _render_html_to_3000(body, out_png, css)
    return out_png


# ==============================================================================
# SLIDE 2: WHAT'S INCLUDED
# ==============================================================================
def build_image_2_whats_included(u: dict[str, str]) -> Path:
    out_png = OUT_DIR / "02_whats_included.png"
    css = """
    .c2 {
      background:
        radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.22) 0%, transparent 45%),
        radial-gradient(circle at 90% 80%, rgba(13, 148, 136, 0.18) 0%, transparent 45%),
        linear-gradient(160deg, #090D16 0%, #0F172A 100%);
      padding: 110px 120px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .c2-head { text-align: center; }
    .c2-head h2 {
      font-size: 110px;
      font-weight: 900;
      line-height: 1.02;
      color: #F8FAFC;
      letter-spacing: -2px;
      margin-top: 14px;
    }
    .c2-head h2 span { color: #818CF8; }
    .c2-head p {
      font-size: 40px;
      font-weight: 600;
      color: #94A3B8;
      margin-top: 12px;
    }

    .c2-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 50px;
      margin: 35px 0;
      height: 1850px;
    }

    .c2-col-left {
      display: flex;
      flex-direction: column;
      gap: 40px;
    }

    .c2-card {
      background: rgba(17, 24, 39, 0.8);
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-radius: 40px;
      padding: 50px;
      box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
      position: relative;
      overflow: hidden;
    }

    .c2-card-badge {
      display: inline-block;
      padding: 10px 24px;
      border-radius: 999px;
      font-size: 24px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16px;
    }

    .c2-card-title {
      font-size: 52px;
      font-weight: 900;
      color: #F8FAFC;
      margin-bottom: 14px;
    }

    .c2-card-desc {
      font-size: 28px;
      color: #94A3B8;
      line-height: 1.45;
      margin-bottom: 24px;
    }

    .c2-card-preview {
      border-radius: 24px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5);
    }
    .c2-card-preview img {
      width: 100%;
      display: block;
      object-fit: cover;
    }

    .c2-bot-ribbon {
      background: linear-gradient(90deg, #4F46E5, #0D9488);
      border-radius: 30px;
      padding: 28px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #FFFFFF;
      font-size: 32px;
      font-weight: 800;
      box-shadow: 0 15px 40px rgba(79, 70, 229, 0.35);
    }
    """

    body = f"""
    <div class="canvas c2">
      <div class="c2-head">
        <div class="pill" style="background:#4F46E5; color:#FFF;">Complete Educator Digital Suite</div>
        <h2>WHAT'S INCLUDED IN <span>YOUR DOWNLOAD</span></h2>
        <p>Instant digital files ready to open immediately upon purchase</p>
      </div>

      <div class="c2-grid">
        <!-- Item 1: The Offline Interactive Web App -->
        <div class="c2-card" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <span class="c2-card-badge" style="background:#4F46E5; color:#FFF;">ITEM 1 &bull; HERO APPLICATION</span>
            <div class="c2-card-title">Interactive Offline Web App</div>
            <div class="c2-card-desc">
              Runs offline in your browser. Includes 11 hubs: Weighted gradebook with formula transparency, rotating Day 1&ndash;Day 6 cycles, attendance with cross-class copy, seating chart shuffle, student accommodations (IEP/504), random name picker, and emergency sub plans!
            </div>
          </div>
          <div class="c2-card-preview" style="height:1020px;">
            <img src="{u['app_dashboard']}" style="height:100%;" />
          </div>
        </div>

        <!-- Right Column: PDF + Guide -->
        <div class="c2-col-left">
          <!-- Item 2: Clickable GoodNotes PDF -->
          <div class="c2-card" style="flex:1; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <span class="c2-card-badge" style="background:#0D9488; color:#FFFFFF;">ITEM 2 &bull; 35 PAGES</span>
              <div class="c2-card-title" style="font-size:44px;">35-Page Hyperlinked GoodNotes PDF</div>
              <div class="c2-card-desc" style="font-size:25px;">
                Hyperlinked side tabs to jump between Year, Months (Aug 2026 &ndash; Jul 2027), Weekly Spreads, Daily Lesson Flows, Gradebook Matrices, Seating, and Meeting Notes.
              </div>
            </div>
            <div class="c2-card-preview" style="height:480px;">
              <img src="{u['pdf_p17']}" />
            </div>
          </div>

          <!-- Item 3: Quick Start Guide -->
          <div class="c2-card" style="padding:40px 48px;">
            <span class="c2-card-badge" style="background:#D97706; color:#FFFFFF;">ITEM 3 &bull; EASY SETUP</span>
            <div class="c2-card-title" style="font-size:40px; margin-bottom:12px;">Quick-Start Step-by-Step PDF Guide</div>
            <div class="c2-card-desc" style="font-size:24px; margin-bottom:0;">
              2-minute tutorial to run the Web App locally, save it as a home screen app on iPad &amp; iPhone, import the PDF into GoodNotes, and export 1-click JSON backups.
            </div>
          </div>
        </div>
      </div>

      <div class="c2-bot-ribbon">
        <span>⚡ INSTANT ACCESS VIA ETSY DOWNLOAD</span>
        <span>•</span>
        <span>NO RECURRING APP FEES</span>
        <span>•</span>
        <span>LIFETIME EDUCATOR ACCESS</span>
      </div>
    </div>
    """
    _render_html_to_3000(body, out_png, css)
    return out_png


# ==============================================================================
# SLIDE 3: KEY FEATURES
# ==============================================================================
def build_image_3_key_features(u: dict[str, str]) -> Path:
    out_png = OUT_DIR / "03_key_features.png"
    css = """
    .c3 {
      background:
        radial-gradient(circle at 15% 15%, rgba(13, 148, 136, 0.20) 0%, transparent 45%),
        radial-gradient(circle at 85% 85%, rgba(79, 70, 229, 0.22) 0%, transparent 45%),
        linear-gradient(160deg, #090D16 0%, #0F172A 100%);
      padding: 110px 120px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .c3-head { text-align: center; }
    .c3-head h2 {
      font-size: 114px;
      font-weight: 900;
      color: #F8FAFC;
      letter-spacing: -2px;
      margin-top: 14px;
    }
    .c3-head h2 span { color: #38BDF8; }
    .c3-head p {
      font-size: 40px;
      font-weight: 600;
      color: #94A3B8;
      margin-top: 10px;
    }

    .c3-features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px;
      margin: 35px 0;
      height: 1820px;
    }

    .c3-feat-card {
      background: rgba(17, 24, 39, 0.85);
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-radius: 36px;
      padding: 44px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
    }
    .c3-feat-icon { font-size: 64px; margin-bottom: 12px; }
    .c3-feat-title {
      font-size: 42px;
      font-weight: 900;
      color: #F8FAFC;
      line-height: 1.1;
      margin-bottom: 12px;
    }
    .c3-feat-desc {
      font-size: 24px;
      color: #94A3B8;
      line-height: 1.45;
      margin-bottom: 24px;
    }
    .c3-feat-img {
      border-radius: 20px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 15px 35px rgba(0,0,0,0.4);
      height: 640px;
    }
    .c3-feat-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .c3-bottom {
      display: flex;
      justify-content: center;
      gap: 30px;
    }
    .c3-bottom-pill {
      background: rgba(30, 41, 59, 0.8);
      border: 2px solid rgba(255, 255, 255, 0.12);
      padding: 16px 36px;
      border-radius: 999px;
      font-size: 28px;
      font-weight: 800;
      color: #E2E8F0;
    }
    """

    body = f"""
    <div class="canvas c3">
      <div class="c3-head">
        <div class="pill" style="background:#0D9488; color:#FFF;">Engineered for Classroom Excellence</div>
        <h2>POWERFUL HUBS TO <span>ELEVATE YOUR TEACHING</span></h2>
        <p>Built-in tools designed to eliminate educator paperwork and daily administrative burnout</p>
      </div>

      <div class="c3-features">
        <!-- Feature 1: Weighted Gradebook -->
        <div class="c3-feat-card">
          <div>
            <div class="c3-feat-icon">⚖️</div>
            <div class="c3-feat-title">Weighted Gradebook &amp; Formulas</div>
            <div class="c3-feat-desc">
              Category weights (Labs 35%, Quizzes 20%, Tests 30%). Click any student's average to see the exact formula and calculation breakdown!
            </div>
          </div>
          <div class="c3-feat-img">
            <img src="{u['app_gradebook']}" />
          </div>
        </div>

        <!-- Feature 2: 6-Day Rotating Cycles & Bumping -->
        <div class="c3-feat-card">
          <div>
            <div class="c3-feat-icon">🔄</div>
            <div class="c3-feat-title">Rotating Day Cycles &amp; Bumping</div>
            <div class="c3-feat-desc">
              Supports 2 to 10-day cycles (Day 1&ndash;Day 6) and Week A/B. Snow day or assembly? Bump lesson plans forward by 1 day with 1 click!
            </div>
          </div>
          <div class="c3-feat-img">
            <img src="{u['app_timetable']}" />
          </div>
        </div>

        <!-- Feature 3: Attendance -->
        <div class="c3-feat-card">
          <div>
            <div class="c3-feat-icon">📍</div>
            <div class="c3-feat-title">Attendance &amp; Cross-Class Copy</div>
            <div class="c3-feat-desc">
              Track Present, Absent, Tardy, and Excused. Mark all present in 1 click, or copy attendance to your other scheduled classes instantly.
            </div>
          </div>
          <div class="c3-feat-img">
            <img src="{u['app_attendance']}" />
          </div>
        </div>

        <!-- Feature 4: Seating Chart Shuffle -->
        <div class="c3-feat-card">
          <div>
            <div class="c3-feat-icon">🪑</div>
            <div class="c3-feat-title">Seating Chart &amp; Randomizer</div>
            <div class="c3-feat-desc">
              Visual desk layout. 1-click 'Shuffle &amp; Randomize' for fresh group collaboration, arrange A&ndash;Z, and view IEP/504 seating tags.
            </div>
          </div>
          <div class="c3-feat-img">
            <img src="{u['app_seating']}" />
          </div>
        </div>

        <!-- Feature 5: In-Class Toolkit -->
        <div class="c3-feat-card">
          <div>
            <div class="c3-feat-icon">🎲</div>
            <div class="c3-feat-title">Live In-Class Teacher Toolkit</div>
            <div class="c3-feat-desc">
              Random student name picker wheel, smart grouping generator (pairs/trios), visual classroom sound meter, focus timers, and house points!
            </div>
          </div>
          <div class="c3-feat-img">
            <img src="{u['app_toolkit']}" />
          </div>
        </div>

        <!-- Feature 6: Emergency Sub Plans -->
        <div class="c3-feat-card">
          <div>
            <div class="c3-feat-icon">📑</div>
            <div class="c3-feat-title">Emergency Substitute Folder</div>
            <div class="c3-feat-desc">
              Unexpected sick day? 1-click generate a clean print-ready Sub Folder with bell times, classroom rules, student helpers, and lesson instructions.
            </div>
          </div>
          <div class="c3-feat-img">
            <img src="{u['app_sub_plans']}" />
          </div>
        </div>
      </div>

      <div class="c3-bottom">
        <div class="c3-bottom-pill">🌙 Dark &amp; Light Mode Included</div>
        <div class="c3-bottom-pill">🔒 100% Offline &bull; Student Privacy Protected</div>
        <div class="c3-bottom-pill">💾 1-Click JSON Device Backup</div>
      </div>
    </div>
    """
    _render_html_to_3000(body, out_png, css)
    return out_png


# ==============================================================================
# SLIDE 4: PHOTOREALISTIC CLASSROOM LIFESTYLE DESK MOCKUP
# ==============================================================================
def build_image_4_lifestyle_mockup(screens: dict[str, Path]) -> Path:
    out_png = OUT_DIR / "04_realistic_lifestyle_mockup.png"
    if out_png.exists():
        print(f"Skipping already existing {out_png.name}", flush=True)
        return out_png

    # Load base desk photo (1200x896)
    base = Image.open(LIFESTYLE_BASE_PATH).convert("RGB")
    w, h = base.size
    crop_x = (w - h) // 2
    base_cropped = base.crop((crop_x, 0, crop_x + h, h)).resize((3000, 3000), Image.Resampling.LANCZOS)
    base_bgr = cv2.cvtColor(np.array(base_cropped), cv2.COLOR_RGB2BGR)

    scale = 3000.0 / float(h)

    # Detected iPad Screen Corners in teacher_desk_ipad_mockup_1794656796195.jpg:
    # TL: [426, 313], TR: [775, 309], BR: [810, 691], BL: [398, 696]
    tl = np.array([(426 - crop_x) * scale, 313 * scale], dtype=np.float32)
    tr = np.array([(775 - crop_x) * scale, 309 * scale], dtype=np.float32)
    br = np.array([(810 - crop_x) * scale, 691 * scale], dtype=np.float32)
    bl = np.array([(398 - crop_x) * scale, 696 * scale], dtype=np.float32)
    dst_pts = np.array([tl, tr, br, bl], dtype=np.float32)

    screen_path = screens["app_ipad_portrait"]
    app_pil = Image.open(screen_path).convert("RGBA")
    aw, ah = app_pil.size
    mask_pil = Image.new("L", (aw, ah), 0)
    mdraw = ImageDraw.Draw(mask_pil)
    mdraw.rounded_rectangle([0, 0, aw - 1, ah - 1], radius=44, fill=255)
    mask_pil = mask_pil.filter(ImageFilter.GaussianBlur(1.8))

    app_np = np.array(app_pil).astype(np.float32)
    yy, xx = np.mgrid[0:ah, 0:aw]
    glare = np.clip(1.0 - (xx / aw * 0.5 + yy / ah * 0.6), 0.0, 1.0) ** 2.2
    app_np[:, :, :3] = np.clip(app_np[:, :, :3] * 0.95 + glare[:, :, None] * 20.0, 0, 255)
    app_bgr = cv2.cvtColor(app_np[:, :, :3].astype(np.uint8), cv2.COLOR_RGB2BGR)

    src_pts = np.array([[0, 0], [aw - 1, 0], [aw - 1, ah - 1], [0, ah - 1]], dtype=np.float32)
    M = cv2.getPerspectiveTransform(src_pts, dst_pts)

    warped_app = cv2.warpPerspective(app_bgr, M, (3000, 3000), flags=cv2.INTER_LANCZOS4)
    warped_mask = cv2.warpPerspective(np.array(mask_pil), M, (3000, 3000), flags=cv2.INTER_LINEAR)
    alpha = (warped_mask.astype(np.float32) / 255.0)[:, :, None]

    composited = (base_bgr.astype(np.float32) * (1.0 - alpha) + warped_app.astype(np.float32) * alpha).astype(np.uint8)

    comp_pil = Image.fromarray(cv2.cvtColor(composited, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(comp_pil)

    # Floating aesthetic pill badge in top-left
    pill_box = [100, 100, 1260, 210]
    draw.rounded_rectangle(pill_box, radius=55, fill=(15, 23, 42, 230), outline=(255, 255, 255, 40), width=4)
    try:
        font_pill = ImageFont.truetype("arialbd.ttf", 36)
    except Exception:
        font_pill = ImageFont.load_default()
    draw.text((140, 134), "🍎 REALISTIC CLASSROOM IPAD DESK SETUP", fill=(255, 255, 255), font=font_pill)

    comp_pil.save(out_png, "PNG", optimize=True)
    print(f"Generated {out_png.name} (3000x3000 RGB photorealistic mockup)", flush=True)
    return out_png


# ==============================================================================
# SLIDE 5: HOW IT WORKS & COMPATIBILITY
# ==============================================================================
def build_image_5_how_it_works(u: dict[str, str]) -> Path:
    out_png = OUT_DIR / "05_how_it_works.png"
    css = """
    .c5 {
      background:
        radial-gradient(circle at 15% 15%, rgba(13, 148, 136, 0.20) 0%, transparent 45%),
        radial-gradient(circle at 85% 85%, rgba(79, 70, 229, 0.22) 0%, transparent 45%),
        linear-gradient(160deg, #090D16 0%, #0F172A 100%);
      padding: 110px 120px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .c5-head { text-align: center; }
    .c5-head h2 {
      font-size: 112px;
      font-weight: 900;
      color: #F8FAFC;
      letter-spacing: -2px;
      margin-top: 14px;
    }
    .c5-head h2 span { color: #38BDF8; }
    .c5-head p {
      font-size: 40px;
      font-weight: 600;
      color: #94A3B8;
      margin-top: 10px;
    }

    .c5-steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 40px;
      margin: 30px 0;
    }
    .c5-step-card {
      background: rgba(17, 24, 39, 0.85);
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-radius: 40px;
      padding: 50px 44px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 980px;
    }
    .c5-step-num {
      width: 80px;
      height: 80px;
      border-radius: 24px;
      background: #4F46E5;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 42px;
      font-weight: 900;
      margin-bottom: 24px;
      box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
    }
    .c5-step-title {
      font-size: 46px;
      font-weight: 900;
      color: #F8FAFC;
      line-height: 1.1;
      margin-bottom: 16px;
    }
    .c5-step-desc {
      font-size: 26px;
      color: #94A3B8;
      line-height: 1.5;
    }
    .c5-step-art {
      border-radius: 24px;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.12);
      height: 480px;
      margin-top: 24px;
    }
    .c5-step-art img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .c5-compat {
      background: rgba(17, 24, 39, 0.9);
      border: 3px solid rgba(255, 255, 255, 0.12);
      border-radius: 36px;
      padding: 44px 60px;
    }
    .c5-compat-title {
      font-size: 34px;
      font-weight: 800;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-align: center;
      margin-bottom: 28px;
    }
    .c5-compat-grid {
      display: flex;
      justify-content: space-around;
      align-items: center;
    }
    .c5-compat-item { text-align: center; }
    .c5-compat-item .ci-icon { font-size: 56px; margin-bottom: 8px; }
    .c5-compat-item .ci-name { font-size: 28px; font-weight: 800; color: #F8FAFC; }
    .c5-compat-item .ci-desc { font-size: 20px; font-weight: 600; color: #64748B; margin-top: 2px; }

    .c5-guarantee {
      background: linear-gradient(90deg, #10B981, #0D9488);
      border-radius: 28px;
      padding: 24px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #FFFFFF;
      font-size: 30px;
      font-weight: 800;
    }
    """

    body = f"""
    <div class="canvas c5">
      <div class="c5-head">
        <div class="pill" style="background:#0D9488; color:#FFF;">Instant Digital Access</div>
        <h2>GET STARTED IN <span>3 SIMPLE STEPS</span></h2>
        <p>No waiting for shipping &bull; Ready to use immediately upon Etsy order confirmation</p>
      </div>

      <div class="c5-steps">
        <!-- Step 1 -->
        <div class="c5-step-card">
          <div>
            <div class="c5-step-num">1</div>
            <div class="c5-step-title">Instant Download</div>
            <div class="c5-step-desc">
              Download your complete ZIP bundle directly from your Etsy Purchases page. Everything is pre-packaged and ready.
            </div>
          </div>
          <div class="c5-step-art">
            <img src="{u['pdf_p01']}" />
          </div>
        </div>

        <!-- Step 2 -->
        <div class="c5-step-card">
          <div>
            <div class="c5-step-num" style="background:#0D9488;">2</div>
            <div class="c5-step-title">Choose Your Workflow</div>
            <div class="c5-step-desc">
              Import the 35-page PDF into GoodNotes/Notability on iPad, OR simply double-click the offline Web App on your laptop or Chromebook!
            </div>
          </div>
          <div class="c5-step-art">
            <img src="{u['app_dashboard']}" />
          </div>
        </div>

        <!-- Step 3 -->
        <div class="c5-step-card">
          <div>
            <div class="c5-step-num" style="background:#10B981;">3</div>
            <div class="c5-step-title">Crush Your School Year</div>
            <div class="c5-step-desc">
              Add your classes, start your 6-day cycle, enter grades with automated formulas, and stay 100% on top of all classroom deadlines.
            </div>
          </div>
          <div class="c5-step-art">
            <img src="{u['app_gradebook']}" />
          </div>
        </div>
      </div>

      <div class="c5-compat">
        <div class="c5-compat-title">100% Compatible Across All Your Devices &amp; Apps</div>
        <div class="c5-compat-grid">
          <div class="c5-compat-item">
            <div class="ci-icon">🍏</div>
            <div class="ci-name">Apple iPad</div>
            <div class="ci-desc">GoodNotes 5 &amp; 6, Notability</div>
          </div>
          <div class="c5-compat-item">
            <div class="ci-icon">💻</div>
            <div class="ci-name">Mac &amp; Windows</div>
            <div class="ci-desc">Chrome, Safari, Edge</div>
          </div>
          <div class="c5-compat-item">
            <div class="ci-icon">🖥️</div>
            <div class="ci-name">Chromebook</div>
            <div class="ci-desc">Runs 100% Offline</div>
          </div>
          <div class="c5-compat-item">
            <div class="ci-icon">🖊️</div>
            <div class="ci-name">Stylus &amp; Pencil</div>
            <div class="ci-desc">Apple Pencil, S-Pen</div>
          </div>
        </div>
      </div>

      <div class="c5-guarantee">
        <span>🔒 LIFETIME PERSONAL ACCESS &bull; NO SUBSCRIPTION FEES</span>
        <span>•</span>
        <span>FRIENDLY ETSY SUPPORT 24/7</span>
      </div>
    </div>
    """
    _render_html_to_3000(body, out_png, css)
    return out_png


def main() -> None:
    _ensure_dirs()
    print("📸 Step 1: Capturing authentic teacher product screens...")
    screens = capture_real_screens()
    u = {k: p.as_uri() for k, p in screens.items()}

    print("\n🎨 Step 2: Generating 5 Etsy 3000x3000px Listing Images...")
    build_image_1_hero(u)
    build_image_2_whats_included(u)
    build_image_3_key_features(u)
    build_image_4_lifestyle_mockup(screens)
    build_image_5_how_it_works(u)

    print("\n✅ All 5 Teacher Planner Etsy listing images generated successfully in etsy_media/!")


if __name__ == "__main__":
    main()
