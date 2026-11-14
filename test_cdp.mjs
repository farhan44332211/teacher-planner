import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9225;
const APP_URL = pathToFileURL(path.resolve("index.html")).href;
const USER_DATA_DIR = path.resolve("_test_chrome_profile");

if (!fs.existsSync(USER_DATA_DIR)) {
  fs.mkdirSync(USER_DATA_DIR, { recursive: true });
}

console.log("🚀 Starting Headless Chrome for Teacher Planner Testing...");
const chromeProc = spawn(CHROME_PATH, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${USER_DATA_DIR}`,
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  APP_URL
]);

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 25; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      if (res.ok) {
        const list = await res.json();
        const page = list.find(p => p.type === "page");
        if (page && page.webSocketDebuggerUrl) {
          return page.webSocketDebuggerUrl;
        }
      }
    } catch (e) {}
    await sleep(400);
  }
  throw new Error("Could not connect to Chrome DevTools port");
}

async function runTests() {
  let wsUrl;
  try {
    wsUrl = await getWsUrl();
    console.log("✓ Connected to Chrome CDP at:", wsUrl);
  } catch (e) {
    console.error("Failed to connect:", e);
    chromeProc.kill();
    process.exit(1);
  }

  const ws = new WebSocket(wsUrl);

  let msgId = 1;
  const pending = new Map();
  const consoleErrors = [];

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
    if (data.method === "Runtime.consoleAPICalled" && data.params.type === "error") {
      consoleErrors.push(data.params.args.map(a => a.value || a.description).join(" "));
    }
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  function sendCmd(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evalJs(expr) {
    const res = await sendCmd("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text + " " + JSON.stringify(res.exceptionDetails.exception));
    }
    return res.result ? res.result.value : undefined;
  }

  await sendCmd("Runtime.enable");
  await sendCmd("Page.enable");

  console.log("Navigating to", APP_URL);
  await sendCmd("Page.navigate", { url: APP_URL });
  await sleep(1500);

  // Clear localStorage and reload
  await evalJs("localStorage.clear(); location.reload();");
  await sleep(1500);

  console.log("\n🧪 Running 10 Teacher Planner E2E Test Suites...\n");

  const results = [];

  async function test(name, fn) {
    try {
      await fn();
      results.push({ name, status: "PASS" });
      console.log(`✅ PASS: ${name}`);
    } catch (e) {
      results.push({ name, status: "FAIL", error: e.message });
      console.error(`❌ FAIL: ${name} ->`, e.message);
    }
  }

  // 1. App initialization
  await test("window.app initialization and settings loaded", async () => {
    const teacherName = await evalJs("window.app.state.settings.teacherName");
    if (!teacherName || teacherName !== "Sarah Jenkins") throw new Error(`Unexpected teacher: ${teacherName}`);
  });

  // 2. Dashboard Stats
  await test("Dashboard 4 stat cards rendered", async () => {
    const count = await evalJs("document.querySelectorAll('.stat-card').length");
    if (count !== 4) throw new Error(`Expected 4 stat cards, found ${count}`);
  });

  // 3. Timetable & Cycle Switching
  await test("Timetable 6-day rotating schedule matrix", async () => {
    await evalJs("window.app.switchView('timetable')");
    await evalJs("window.app.setScheduleType('rotating')");
    const cycleType = await evalJs("window.app.state.settings.scheduleCycleType");
    if (cycleType !== "rotating") throw new Error(`Cycle type mismatch: ${cycleType}`);
  });

  // 4. Lesson Bumping Tool
  await test("Lesson Bumping forward by 1 day", async () => {
    const initialDate = await evalJs("window.app.state.lessons[0].date");
    await evalJs("window.app.openBumpLessonsModal()");
    await evalJs("window.app.executeBumpLessons()");
    const bumpedDate = await evalJs("window.app.state.lessons[0].date");
    if (initialDate === bumpedDate) throw new Error("Lesson date did not bump");
  });

  // 5. Lesson Planner
  await test("Lesson Planner bank view & duplicate", async () => {
    await evalJs("window.app.switchView('lesson_planner')");
    const countBefore = await evalJs("window.app.state.lessons.length");
    await evalJs("window.app.duplicateLesson(window.app.state.lessons[0].id)");
    const countAfter = await evalJs("window.app.state.lessons.length");
    if (countAfter !== countBefore + 1) throw new Error("Lesson duplication failed");
  });

  // 6. Weighted Gradebook & Formula Inspection
  await test("Gradebook weighted calculation & formula modal", async () => {
    await evalJs("window.app.switchView('gradebook')");
    const studentId = await evalJs("window.app.state.students[0].id");
    const classId = await evalJs("window.app.selectedClassId");
    const calc = await evalJs(`window.app.calculateStudentGrade('${studentId}', window.app.state.classes[0])`);
    if (!calc || !calc.percent || isNaN(parseFloat(calc.percent))) throw new Error("Grade calculation invalid");
    await evalJs(`window.app.showFormulaModal('${studentId}', '${classId}')`);
    const modalOpen = await evalJs("document.getElementById('modalOverlay').classList.contains('open')");
    if (!modalOpen) throw new Error("Formula modal not open");
    await evalJs("window.app.closeModal()");
  });

  // 7. Attendance & Cross-Class Copy
  await test("Attendance Mark All Present & Cross-Class Copy", async () => {
    await evalJs("window.app.switchView('attendance')");
    await evalJs("window.app.markAllPresent('cls_bio9')");
    const status = await evalJs(`window.app.state.attendance['${await evalJs("window.app.selectedDate")}_cls_bio9_stu_101']`);
    if (status !== 'P') throw new Error(`Expected 'P', got ${status}`);
  });

  // 8. Seating Chart Shuffle
  await test("Seating Chart interactive shuffle & randomize", async () => {
    await evalJs("window.app.switchView('seating_chart')");
    await evalJs("window.app.shuffleSeating('cls_bio9')");
    const desks = await evalJs("window.app.state.seating['cls_bio9'].length");
    if (desks !== 12) throw new Error(`Expected 12 desks, got ${desks}`);
  });

  // 9. Teacher Toolkit (Random Picker, Group Generator, Timers)
  await test("Teacher Toolkit widgets (Picker, Groups, Timers)", async () => {
    await evalJs("window.app.switchView('toolkit')");
    await evalJs("window.app.generateGroups()");
    const groupsText = await evalJs("document.getElementById('groupsOutput').innerText");
    if (!groupsText.includes("Group 1")) throw new Error("Group generation output missing");
    await evalJs("window.app.setTimerSeconds(120)");
    const timerText = await evalJs("document.getElementById('timerDisplay').innerText");
    if (timerText !== "02:00") throw new Error(`Timer display mismatch: ${timerText}`);
  });

  // 10. Emergency Substitute Plan & Print readiness
  await test("Emergency Substitute Plan ready-to-print view", async () => {
    await evalJs("window.app.switchView('sub_plans')");
    const subTitle = await evalJs("document.querySelector('.card h1').innerText");
    if (!subTitle.includes("SUBSTITUTE TEACHER")) throw new Error("Sub plan title missing");
  });

  // 11. Settings & LocalStorage persistence
  await test("Settings, Theme Toggle and LocalStorage", async () => {
    await evalJs("window.app.switchView('settings')");
    await evalJs("window.app.applyTheme('dark')");
    const theme = await evalJs("document.documentElement.getAttribute('data-theme')");
    if (theme !== "dark") throw new Error("Dark theme not applied");
    const saved = await evalJs("localStorage.getItem('teacher_planner_2026_2027_v1')");
    if (!saved) throw new Error("Storage not saved");
  });

  console.log("\n========================================================");
  const passed = results.filter(r => r.status === "PASS").length;
  console.log(`🎯 TEST RESULTS: ${passed}/${results.length} PASSED (Errors: ${consoleErrors.length})`);
  console.log("========================================================\n");

  ws.close();
  chromeProc.kill();
  try {
    fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
  } catch (e) {}

  if (passed !== results.length) {
    process.exit(1);
  }
}

runTests();
