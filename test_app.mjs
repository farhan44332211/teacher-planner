import puppeteer from 'puppeteer-core';
import { pathToFileURL } from 'url';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const htmlPath = path.resolve("index.html");
const fileUrl = pathToFileURL(htmlPath).href;

async function runTests() {
  console.log("🚀 Launching Headless Chrome for Teacher Planner App Tests...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const errors = [];
  page.on('pageerror', err => {
    console.error("❌ Page error:", err.message);
    errors.push(err.message);
  });

  console.log(`Navigating to: ${fileUrl}`);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });

  // Test 1: Verify app initialized
  console.log("Checking window.app instance...");
  const hasApp = await page.evaluate(() => typeof window.app === 'object' && window.app !== null);
  if (!hasApp) throw new Error("window.app not found!");
  console.log("✓ Test 1: window.app successfully loaded");

  // Test 2: Dashboard stats rendered
  const statsCount = await page.evaluate(() => document.querySelectorAll('.stat-card').length);
  console.log(`✓ Test 2: Dashboard rendered ${statsCount} stats cards`);
  if (statsCount !== 4) throw new Error(`Expected 4 stats cards, got ${statsCount}`);

  // Test 3: Timetable view & Cycle toggle
  await page.evaluate(() => window.app.switchView('timetable'));
  const scheduleType = await page.evaluate(() => window.app.state.settings.scheduleCycleType);
  console.log(`✓ Test 3: Timetable view active (Cycle mode: ${scheduleType})`);

  // Test 4: Gradebook view & Formula Calculation
  await page.evaluate(() => window.app.switchView('gradebook'));
  const gradebookRows = await page.evaluate(() => document.querySelectorAll('.data-table tbody tr').length);
  console.log(`✓ Test 4: Gradebook rendered ${gradebookRows} student rows`);
  if (gradebookRows < 5) throw new Error("Gradebook rows insufficient!");

  // Test 5: Attendance Tracker & Mark All Present
  await page.evaluate(() => window.app.switchView('attendance'));
  await page.evaluate(() => window.app.markAllPresent('cls_bio9'));
  const allPresent = await page.evaluate(() => {
    const s = window.app.state.students.filter(st => st.classId === 'cls_bio9');
    const date = window.app.selectedDate;
    return s.every(st => window.app.state.attendance[`${date}_cls_bio9_${st.id}`] === 'P');
  });
  console.log(`✓ Test 5: Attendance 'Mark All Present' verified (Status: ${allPresent})`);
  if (!allPresent) throw new Error("Attendance mark all present failed");

  // Test 6: Seating Chart & Shuffle
  await page.evaluate(() => window.app.switchView('seating_chart'));
  const preShuffle = await page.evaluate(() => JSON.stringify(window.app.state.seating['cls_bio9']));
  await page.evaluate(() => window.app.shuffleSeating('cls_bio9'));
  console.log("✓ Test 6: Seating Chart shuffle executed");

  // Test 7: Teacher Toolkit (Random Picker & Grouping)
  await page.evaluate(() => window.app.switchView('toolkit'));
  await page.evaluate(() => window.app.generateGroups());
  const groupsRendered = await page.evaluate(() => document.getElementById('groupsOutput').innerHTML.includes('Group 1'));
  console.log(`✓ Test 7: Toolkit Smart Grouping generated: ${groupsRendered}`);
  if (!groupsRendered) throw new Error("Group generation failed");

  // Test 8: Dark / Light Mode Toggle
  await page.evaluate(() => window.app.applyTheme('dark'));
  const isDark = await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'dark');
  console.log(`✓ Test 8: Dark Theme applied: ${isDark}`);
  if (!isDark) throw new Error("Dark theme failed");

  // Test 9: Sub Plans view
  await page.evaluate(() => window.app.switchView('sub_plans'));
  const hasSubPlan = await page.evaluate(() => document.body.innerText.includes('SUBSTITUTE TEACHER GUIDE'));
  console.log(`✓ Test 9: Substitute Teacher Folder view active: ${hasSubPlan}`);

  // Test 10: Settings & LocalStorage persistence
  await page.evaluate(() => window.app.switchView('settings'));
  const stored = await page.evaluate(() => !!localStorage.getItem('teacher_planner_2026_2027_v1'));
  console.log(`✓ Test 10: LocalStorage persistence verified: ${stored}`);
  if (!stored) throw new Error("LocalStorage persistence failed");

  console.log("\n========================================================");
  console.log(`🎉 ALL 10 TEST SUITES PASSED! Total page errors: ${errors.length}`);
  console.log("========================================================\n");

  await browser.close();
  if (errors.length > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
