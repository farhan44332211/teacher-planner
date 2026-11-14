"""
Generate 1080x1080px 30fps 13-14s Etsy Showcase Video
for the 2026–2027 All-in-One Digital Teacher Planner & Gradebook.
"""

from __future__ import annotations

import math
import subprocess
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
OUT_DIR = BASE_DIR / "etsy_media"
WORK_DIR = OUT_DIR / "_work"
SCREENS_DIR = WORK_DIR / "screens"
VIDEO_PATH = OUT_DIR / "2026-2027-Teacher-Planner-Etsy-Video.mp4"

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
LIFESTYLE_IMAGE = OUT_DIR / "04_realistic_lifestyle_mockup.png"


def _run_chrome_screenshot(url: str, out_path: Path, width: int, height: int) -> None:
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--no-first-run",
        "--disable-extensions",
        "--disable-background-networking",
        "--hide-scrollbars",
        f"--window-size={width},{height}",
        f"--screenshot={out_path}",
        url,
    ]
    subprocess.run(cmd, check=True, timeout=60, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def _ease_in_out(t: float) -> float:
    return t * t * (3.0 - 2.0 * t)


def render_1080_slides(u: dict[str, str], life_uri: str) -> list[np.ndarray]:
    vcss = """
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090D16;
      color: #F8FAFC;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Montserrat', Roboto, Arial, sans-serif;
    }
    .vslide {
      width: 1080px;
      height: 1080px;
      position: relative;
      overflow: hidden;
      padding: 50px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: linear-gradient(160deg, #090D16 0%, #0F172A 60%, #090D16 100%);
    }
    .vpill {
      display: inline-block;
      background: #4F46E5;
      color: #FFFFFF;
      padding: 10px 24px;
      border-radius: 999px;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      align-self: center;
    }
    .vh1 {
      text-align: center;
      font-size: 64px;
      font-weight: 900;
      line-height: 1.05;
      color: #F8FAFC;
    }
    .vh1 span {
      background: linear-gradient(135deg, #818CF8, #38BDF8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .vsub {
      text-align: center;
      font-size: 24px;
      font-weight: 600;
      color: #94A3B8;
      margin-top: 8px;
    }
    .vframe {
      background: #111827;
      border-radius: 28px;
      padding: 16px;
      border: 3px solid #1E293B;
      box-shadow: 0 30px 65px rgba(0, 0, 0, 0.6);
      overflow: hidden;
    }
    .vframe img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top left;
      border-radius: 18px;
      display: block;
    }
    .paper-sheet {
      background: #FFFFFF;
      border-radius: 20px;
      border: 2px solid #CBD5E1;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
      overflow: hidden;
    }
    .paper-sheet img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .vfoot {
      background: rgba(30, 41, 59, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #F8FAFC;
      border-radius: 20px;
      padding: 18px 28px;
      text-align: center;
      font-size: 22px;
      font-weight: 800;
    }
    """

    slides_data = [
        # Slide 1: Hero reveal
        (
            "s1",
            f"""
            <div class="vslide">
              <div class="vpill">🍎 2026&ndash;2027 Pro Educator Edition</div>
              <div>
                <div class="vh1">TEACHER PLANNER &amp; <span>GRADEBOOK</span></div>
                <div class="vsub">Interactive Offline Web App + 35-Page GoodNotes iPad PDF</div>
              </div>
              <div class="vframe" style="height:590px;"><img src="{u['app_dashboard']}"/></div>
              <div class="vfoot">⚡ 11 Educator Hubs &bull; Works on Mac, PC, Chromebook &amp; iPad</div>
            </div>""",
        ),
        # Slide 2: Weighted Gradebook & 6-Day Rotating Timetable
        (
            "s2",
            f"""
            <div class="vslide">
              <div class="vpill" style="background:#0D9488; color:#FFFFFF;">Automated Formulas &amp; Cycles</div>
              <div>
                <div class="vh1">Gradebook &amp; <span>6-Day Cycles</span></div>
                <div class="vsub">Weighted category averages + Day 1&ndash;Day 6 rotating schedules</div>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; height:580px; align-items:center;">
                <div class="vframe" style="height:550px;"><img src="{u['app_gradebook']}"/></div>
                <div class="vframe" style="height:550px;"><img src="{u['app_timetable']}"/></div>
              </div>
              <div class="vfoot">📊 Transparent formula breakdowns &bull; 1-click lesson bumping</div>
            </div>""",
        ),
        # Slide 3: Light vs Dark Theme Wipe
        (
            "s3_light",
            f"""
            <div class="vslide">
              <div class="vpill" style="background:#38BDF8; color:#082F49;">Classroom Seating &amp; Toolkit</div>
              <div>
                <div class="vh1">Seating Shuffle &amp; <span>Live Tools</span></div>
                <div class="vsub">Interactive student desk randomizer + countdown focus timers</div>
              </div>
              <div class="vframe" style="height:590px;"><img src="{u['app_seating']}"/></div>
              <div class="vfoot">🎲 1-Click Desk Shuffle &bull; Random Student Picker Wheel</div>
            </div>""",
        ),
        (
            "s3_dark",
            f"""
            <div class="vslide" style="background:#090D16;">
              <div class="vpill" style="background:#6366F1;">OLED-Friendly Dark Theme</div>
              <div>
                <div class="vh1">Late-Night <span>Dark Grading Mode</span></div>
                <div class="vsub">Save your eyes during evening lesson planning &amp; grading sessions</div>
              </div>
              <div class="vframe" style="height:590px; border-color:#3730A3;"><img src="{u['app_dark_dashboard']}"/></div>
              <div class="vfoot" style="background:#1E1B4B; color:#A5B4FC;">🌙 Single-Click Instant Theme Toggle</div>
            </div>""",
        ),
        # Slide 4: 35-Page Hyperlinked GoodNotes PDF
        (
            "s4",
            f"""
            <div class="vslide">
              <div class="vpill" style="background:#D97706; color:#FFFFFF;">GoodNotes &amp; Notability Ready</div>
              <div>
                <div class="vh1">35-Page <span>Clickable PDF</span></div>
                <div class="vsub">Seamless hyperlinked tabs &bull; Write naturally with Apple Pencil</div>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; height:580px; align-items:center;">
                <div class="paper-sheet" style="height:550px;"><img src="{u['pdf_p17']}"/></div>
                <div class="paper-sheet" style="height:550px;"><img src="{u['pdf_p22']}"/></div>
              </div>
              <div class="vfoot">✍️ Dated Monthly Spreads, Weekly Resets &amp; Sub Teacher Folders</div>
            </div>""",
        ),
        # Slide 5: Realistic lifestyle call to action
        (
            "s5",
            f"""
            <div class="vslide" style="padding:0;">
              <img src="{life_uri}" style="width:1080px; height:1080px; object-fit:cover; display:block;"/>
              <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(9,13,22,0.94) 0%, rgba(9,13,22,0.3) 50%, transparent 100%);"></div>
              <div style="position:absolute; left:50px; right:50px; bottom:50px; color:#FFFFFF; text-align:center;">
                <div style="display:inline-block; background:#4F46E5; padding:10px 28px; border-radius:999px; font-size:20px; font-weight:800; letter-spacing:1.5px; margin-bottom:14px;">INSTANT DIGITAL DOWNLOAD &bull; ETSY EXCLUSIVE</div>
                <div style="font-size:56px; font-weight:900; line-height:1.06;">Offline Web App + 35-Page PDF</div>
                <div style="font-size:24px; font-weight:600; color:#CBD5E1; margin-top:8px;">Quick-Start Guide &bull; Zero Subscription Fees Ever</div>
              </div>
            </div>""",
        ),
    ]

    imgs: list[np.ndarray] = []
    for tag, html_inner in slides_data:
        doc = f"<!DOCTYPE html><html><head><meta charset='utf-8'><style>{vcss}</style></head><body>{html_inner}</body></html>"
        hfile = WORK_DIR / f"_vslide_{tag}.html"
        pfile = WORK_DIR / f"_vslide_{tag}.png"
        hfile.write_text(doc, encoding="utf-8")
        _run_chrome_screenshot(hfile.as_uri(), pfile, 1080, 1080)
        im = cv2.imread(str(pfile))
        assert im is not None, f"Failed to load rendered video slide {tag}"
        imgs.append(im)
        pfile.unlink(missing_ok=True)
        hfile.unlink(missing_ok=True)

    return imgs


def build_etsy_video() -> Path:
    print("🎬 Generating 1080x1080 30fps Etsy Showcase Video for Teacher Planner...", flush=True)

    screens = {p.stem: p for p in SCREENS_DIR.glob("*.png")}
    u = {k: p.as_uri() for k, p in screens.items()}

    # Downscale lifestyle mockup for super-crisp 1080x1080 video slide
    life_1080 = WORK_DIR / "_vid_lifestyle_1080.jpg"
    with Image.open(LIFESTYLE_IMAGE) as lim:
        lim.convert("RGB").resize((1080, 1080), Image.Resampling.LANCZOS).save(life_1080, "JPEG", quality=92)
    life_uri = life_1080.as_uri()

    rendered_slides = render_1080_slides(u, life_uri)
    s1, s2, s3_light, s3_dark, s4, s5 = rendered_slides

    fps = 30
    w, h = 1080, 1080
    writer = cv2.VideoWriter(str(VIDEO_PATH), cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))
    assert writer.isOpened(), "Failed to open OpenCV MP4 VideoWriter"

    def ken_burns(img: np.ndarray, t: float, z0: float = 1.0, z1: float = 1.035) -> np.ndarray:
        z = z0 + (z1 - z0) * _ease_in_out(t)
        cw, ch = int(w / z), int(h / z)
        x0 = (w - cw) // 2
        y0 = (h - ch) // 2
        crop = img[y0 : y0 + ch, x0 : x0 + cw]
        return cv2.resize(crop, (w, h), interpolation=cv2.INTER_LINEAR)

    fade = 14

    def write_hold_with_kb(img: np.ndarray, frames: int, z0: float = 1.0, z1: float = 1.035) -> list[np.ndarray]:
        return [ken_burns(img, i / max(1, frames - 1), z0, z1) for i in range(frames)]

    b1 = write_hold_with_kb(s1, 90, 1.0, 1.035)
    b2 = write_hold_with_kb(s2, 90, 1.03, 1.0)

    # Block 3: smooth wipe from Light -> Dark Mode
    b3: list[np.ndarray] = []
    for i in range(90):
        t = _ease_in_out(min(1.0, max(0.0, (i - 18) / 52.0)))
        split_x = int(t * w)
        frame = s3_light.copy()
        if split_x > 0:
            frame[:, :split_x] = s3_dark[:, :split_x]
            if 4 < split_x < w - 4:
                cv2.line(frame, (split_x, 0), (split_x, h), (79, 70, 229), 4)
        b3.append(frame)

    b4 = write_hold_with_kb(s4, 90, 1.0, 1.035)
    b5 = write_hold_with_kb(s5, 90, 1.035, 1.0)

    blocks = [b1, b2, b3, b4, b5]
    timeline: list[np.ndarray] = list(blocks[0])
    for blk in blocks[1:]:
        for k in range(fade):
            a = _ease_in_out((k + 1) / (fade + 1))
            idx_prev = len(timeline) - fade + k
            timeline[idx_prev] = cv2.addWeighted(timeline[idx_prev], 1.0 - a, blk[k], a, 0.0)
        timeline.extend(blk[fade:])

    for frm in timeline:
        writer.write(frm)
    writer.release()

    mb = VIDEO_PATH.stat().st_size / (1024 * 1024)
    print(f"Generated {VIDEO_PATH.name} ({len(timeline)} frames / {len(timeline)/fps:.1f}s / {mb:.2f} MB)", flush=True)
    return VIDEO_PATH


if __name__ == "__main__":
    build_etsy_video()
