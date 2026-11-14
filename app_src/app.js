/* ==============================================================================
   2026-2027 ALL-IN-ONE DIGITAL TEACHER PLANNER & GRADEBOOK
   Core Application Engine & Interactivity
   ============================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'teacher_planner_2026_2027_v1';

  class TeacherPlannerApp {
    constructor() {
      this.state = this.loadState();
      this.currentView = 'dashboard';
      this.selectedClassId = this.state.classes[0]?.id || '';
      this.selectedDate = new Date().toISOString().split('T')[0];
      this.timerInterval = null;
      this.timerRemaining = 0;
      this.isStopwatchRunning = false;
      this.stopwatchTime = 0;
      this.stopwatchInterval = null;
      this.noiseMeterInterval = null;
      
      this.initDOM();
      this.bindEvents();
      this.applyTheme(this.state.settings.theme);
      this.render();
    }

    // State Management
    loadState() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.warn('Failed to load from localStorage, using demo data', e);
      }
      return this.getDemoState();
    }

    getDemoState() {
      return {
        settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
        classes: JSON.parse(JSON.stringify(DEMO_CLASSES)),
        students: JSON.parse(JSON.stringify(DEMO_STUDENTS)),
        assignments: JSON.parse(JSON.stringify(DEMO_ASSIGNMENTS)),
        grades: JSON.parse(JSON.stringify(DEMO_GRADES)),
        lessons: JSON.parse(JSON.stringify(DEMO_LESSONS)),
        seating: JSON.parse(JSON.stringify(DEMO_SEATING)),
        subPlans: JSON.parse(JSON.stringify(DEMO_SUB_PLANS)),
        supplies: JSON.parse(JSON.stringify(DEMO_SUPPLIES)),
        budget: JSON.parse(JSON.stringify(DEMO_BUDGET)),
        housePoints: JSON.parse(JSON.stringify(DEMO_HOUSE_POINTS)),
        attendance: {
          // date_classId_studentId: 'P' | 'A' | 'T' | 'E'
          "2026-11-16_cls_bio9_stu_101": "P",
          "2026-11-16_cls_bio9_stu_102": "P",
          "2026-11-16_cls_bio9_stu_103": "P",
          "2026-11-16_cls_bio9_stu_104": "T",
          "2026-11-16_cls_bio9_stu_105": "P",
          "2026-11-16_cls_bio9_stu_106": "A",
          "2026-11-16_cls_bio9_stu_107": "P",
          "2026-11-16_cls_bio9_stu_108": "P"
        }
      };
    }

    getBlankState() {
      return {
        settings: {
          teacherName: "Educator",
          schoolName: "My School",
          schoolYear: "2026–2027",
          termName: "Term 1",
          theme: "light",
          scheduleCycleType: "standard",
          cycleDaysCount: 5,
          currentCycleDay: 1,
          currentWeekType: "A",
          gradingScale: JSON.parse(JSON.stringify(DEFAULT_SETTINGS.gradingScale))
        },
        classes: [
          {
            id: "cls_1",
            name: "Homeroom Class 1",
            gradeLevel: "Grade 9",
            room: "Room 101",
            color: "#4F46E5",
            studentsCount: 0,
            categories: [
              { id: "cat_1", name: "Assignments", weight: 50 },
              { id: "cat_2", name: "Assessments", weight: 50 }
            ],
            schedule: {
              standard: ["Mon 09:00", "Wed 09:00", "Fri 09:00"],
              rotatingDays: [1, 3, 5],
              weekA: ["Mon 09:00"],
              weekB: ["Tue 09:00"]
            }
          }
        ],
        students: [],
        assignments: [],
        grades: {},
        lessons: [],
        seating: {},
        subPlans: {
          schoolName: "My School",
          teacherName: "Educator",
          emergencyPhone: "",
          roomNumber: "",
          bellSchedule: [],
          classroomRules: [],
          reliableStudents: "",
          subLessonActivity: ""
        },
        supplies: [],
        budget: [],
        housePoints: [
          { team: "Team Alpha", points: 0, color: "#3B82F6" },
          { team: "Team Beta", points: 0, color: "#10B981" }
        ],
        attendance: {}
      };
    }

    saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Storage quota exceeded or error saving', e);
      }
    }

    // DOM & Events Setup
    initDOM() {
      this.dom = {
        appContainer: document.getElementById('appContainer'),
        contentArea: document.getElementById('contentArea'),
        pageTitle: document.getElementById('pageTitle'),
        pageSubtitle: document.getElementById('pageSubtitle'),
        navItems: document.querySelectorAll('.nav-item'),
        cycleIndicator: document.getElementById('cycleIndicator'),
        themeToggleBtn: document.getElementById('themeToggleBtn'),
        menuToggleBtn: document.getElementById('menuToggleBtn'),
        sidebar: document.getElementById('sidebar'),
        modalOverlay: document.getElementById('modalOverlay'),
        modalTitle: document.getElementById('modalTitle'),
        modalBody: document.getElementById('modalBody'),
        modalFooter: document.getElementById('modalFooter'),
        toastContainer: document.getElementById('toastContainer')
      };
    }

    bindEvents() {
      // Navigation clicks
      this.dom.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const view = item.getAttribute('data-view');
          if (view) {
            this.switchView(view);
          }
        });
      });

      // Theme toggle
      if (this.dom.themeToggleBtn) {
        this.dom.themeToggleBtn.addEventListener('click', () => {
          const next = this.state.settings.theme === 'dark' ? 'light' : 'dark';
          this.applyTheme(next);
        });
      }

      // Mobile Menu toggle
      if (this.dom.menuToggleBtn) {
        this.dom.menuToggleBtn.addEventListener('click', () => {
          this.dom.sidebar.classList.toggle('open');
        });
      }

      // Modal close on backdrop click
      if (this.dom.modalOverlay) {
        this.dom.modalOverlay.addEventListener('click', (e) => {
          if (e.target === this.dom.modalOverlay) {
            this.closeModal();
          }
        });
      }
    }

    applyTheme(theme) {
      this.state.settings.theme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      if (this.dom.themeToggleBtn) {
        this.dom.themeToggleBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        this.dom.themeToggleBtn.title = `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`;
      }
      this.saveState();
    }

    switchView(view) {
      this.currentView = view;
      this.dom.navItems.forEach(item => {
        if (item.getAttribute('data-view') === view) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
      if (window.innerWidth <= 768 && this.dom.sidebar) {
        this.dom.sidebar.classList.remove('open');
      }
      this.render();
    }

    showToast(message, type = 'info') {
      const toast = document.createElement('div');
      toast.className = 'toast';
      const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
      toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
      this.dom.toastContainer.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 250);
      }, 3000);
    }

    openModal(title, bodyHtml, footerHtml = '') {
      this.dom.modalTitle.innerHTML = title;
      this.dom.modalBody.innerHTML = bodyHtml;
      this.dom.modalFooter.innerHTML = footerHtml || `<button class="btn btn-secondary" onclick="window.app.closeModal()">Close</button>`;
      this.dom.modalOverlay.classList.add('open');
    }

    closeModal() {
      this.dom.modalOverlay.classList.remove('open');
      this.dom.modalBody.innerHTML = '';
    }

    // =========================================================================
    // RENDERING DISPATCHER
    // =========================================================================
    render() {
      // Update header cycle pill
      const s = this.state.settings;
      let cycleText = '';
      if (s.scheduleCycleType === 'rotating') {
        cycleText = `🔄 Rotating: Day ${s.currentCycleDay} of ${s.cycleDaysCount}`;
      } else if (s.scheduleCycleType === 'ab_week') {
        cycleText = `🔀 Alternating: Week ${s.currentWeekType}`;
      } else {
        cycleText = `🗓️ Standard Mon–Fri Schedule`;
      }
      if (this.dom.cycleIndicator) {
        this.dom.cycleIndicator.innerHTML = cycleText;
      }

      switch (this.currentView) {
        case 'dashboard':
          this.renderDashboard();
          break;
        case 'timetable':
          this.renderTimetable();
          break;
        case 'lesson_planner':
          this.renderLessonPlanner();
          break;
        case 'gradebook':
          this.renderGradebook();
          break;
        case 'attendance':
          this.renderAttendance();
          break;
        case 'seating_chart':
          this.renderSeatingChart();
          break;
        case 'student_roster':
          this.renderStudentRoster();
          break;
        case 'toolkit':
          this.renderToolkit();
          break;
        case 'sub_plans':
          this.renderSubPlans();
          break;
        case 'budget_supplies':
          this.renderBudgetSupplies();
          break;
        case 'settings':
          this.renderSettings();
          break;
        default:
          this.renderDashboard();
      }
    }

    // =========================================================================
    // 1. DASHBOARD VIEW
    // =========================================================================
    renderDashboard() {
      this.dom.pageTitle.textContent = "Teacher Dashboard";
      this.dom.pageSubtitle.textContent = `Welcome back, ${this.state.settings.teacherName} • ${this.state.settings.schoolName} (${this.state.settings.schoolYear})`;

      const totalStudents = this.state.students.length;
      const totalClasses = this.state.classes.length;
      const totalLessons = this.state.lessons.length;

      // Calculate overall school average grade
      let totalGrades = 0;
      let gradeSum = 0;
      Object.keys(this.state.grades).forEach(key => {
        const val = this.state.grades[key];
        const asgId = key.split('_')[2];
        const asg = this.state.assignments.find(a => a.id === `asg_${asgId}` || a.id === asgId);
        if (asg && asg.maxPoints > 0) {
          gradeSum += (val / asg.maxPoints) * 100;
          totalGrades++;
        }
      });
      const avgGrade = totalGrades > 0 ? (gradeSum / totalGrades).toFixed(1) : "91.4";

      // Stats Cards
      const statsHtml = `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background:#EEF2FF; color:#4F46E5;">🏫</div>
            <div>
              <div class="stat-val">${totalClasses}</div>
              <div class="stat-lbl">Active Classes</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#F0FDF4; color:#16A34A;">🎓</div>
            <div>
              <div class="stat-val">${totalStudents}</div>
              <div class="stat-lbl">Enrolled Students</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#F0FDFA; color:#0D9488;">📊</div>
            <div>
              <div class="stat-val">${avgGrade}%</div>
              <div class="stat-lbl">Overall Grade Avg</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:#FFFBEB; color:#D97706;">📚</div>
            <div>
              <div class="stat-val">${totalLessons}</div>
              <div class="stat-lbl">Prepared Lessons</div>
            </div>
          </div>
        </div>
      `;

      // Classes Overview Cards
      const classesCards = this.state.classes.map(cls => {
        const clsStudents = this.state.students.filter(s => s.classId === cls.id);
        const clsLessons = this.state.lessons.filter(l => l.classId === cls.id);
        return `
          <div class="card" style="border-top: 4px solid ${cls.color}; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div>
                <h3 style="font-size:17px; font-weight:800; color:var(--text-primary);">${cls.name}</h3>
                <div style="font-size:12.5px; color:var(--text-muted); font-weight:600; margin-top:2px;">
                  ${cls.gradeLevel} &bull; ${cls.room}
                </div>
              </div>
              <span class="badge" style="background:${cls.color}20; color:${cls.color};">${clsStudents.length} Students</span>
            </div>
            
            <div style="display:flex; gap:12px; margin-top:16px; font-size:12.5px; font-weight:600;">
              <div style="background:var(--bg-surface-subtle); padding:6px 12px; border-radius:var(--radius-sm);">
                📖 ${clsLessons.length} Unit Lessons
              </div>
              <div style="background:var(--bg-surface-subtle); padding:6px 12px; border-radius:var(--radius-sm);">
                ⏱️ Next: ${cls.schedule.standard[0] || 'Scheduled'}
              </div>
            </div>

            <div style="display:flex; gap:8px; margin-top:16px;">
              <button class="btn btn-sm btn-secondary" onclick="window.app.quickNavigate('gradebook', '${cls.id}')">Gradebook</button>
              <button class="btn btn-sm btn-secondary" onclick="window.app.quickNavigate('attendance', '${cls.id}')">Attendance</button>
              <button class="btn btn-sm btn-secondary" onclick="window.app.quickNavigate('seating_chart', '${cls.id}')">Seating Chart</button>
            </div>
          </div>
        `;
      }).join('');

      // Upcoming Lessons / Agenda
      const todayLessons = this.state.lessons.map(les => {
        const cls = this.state.classes.find(c => c.id === les.classId);
        return `
          <div style="padding:14px; background:var(--bg-surface-subtle); border-radius:var(--radius-md); margin-bottom:10px; border-left:3px solid ${cls?.color || '#4F46E5'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; font-weight:800; text-transform:uppercase; color:${cls?.color || '#4F46E5'};">${cls?.name || 'Class'} &bull; ${les.duration} mins</span>
              <span style="font-size:12px; color:var(--text-muted); font-weight:700;">${les.date}</span>
            </div>
            <div style="font-weight:800; font-size:14px; margin-top:4px;">${les.title}</div>
            <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">${les.objectives}</div>
          </div>
        `;
      }).join('');

      this.dom.contentArea.innerHTML = `
        ${statsHtml}
        <div class="dash-columns">
          <div>
            <div class="card-header">
              <h3 class="card-title">🏫 Classroom Roster Overview</h3>
              <button class="btn btn-sm btn-primary" onclick="window.app.openAddClassModal()">+ Add New Class</button>
            </div>
            ${classesCards}
          </div>

          <div>
            <div class="card" style="margin-bottom:20px;">
              <div class="card-header">
                <h3 class="card-title">⚡ Quick Educator Actions</h3>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <button class="btn btn-primary" onclick="window.app.openAddLessonModal()">+ Plan Lesson</button>
                <button class="btn btn-secondary" onclick="window.app.openAddAssignmentModal()">+ New Grade</button>
                <button class="btn btn-secondary" onclick="window.app.openRandomPickerModal()">🎲 Pick Student</button>
                <button class="btn btn-secondary" onclick="window.app.openEmergencySubModal()">📑 Print Sub Plan</button>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h3 class="card-title">📖 Upcoming Lesson Plans</h3>
                <button class="btn btn-sm btn-secondary" onclick="window.app.switchView('lesson_planner')">View All</button>
              </div>
              ${todayLessons || '<div style="color:var(--text-muted); text-align:center; padding:20px;">No lessons scheduled yet.</div>'}
            </div>
          </div>
        </div>
      `;
    }

    quickNavigate(view, classId) {
      this.selectedClassId = classId;
      this.switchView(view);
    }

    // =========================================================================
    // 2. TIMETABLE & ADVANCED SCHEDULING ENGINE (ROTATING + A/B + BUMPING)
    // =========================================================================
    renderTimetable() {
      this.dom.pageTitle.textContent = "Classroom Timetable & Schedule Engine";
      this.dom.pageSubtitle.textContent = "Handles Standard Mon–Fri, 6-Day Rotating Cycles, Week A/B, and 1-Click Lesson Bumping";

      const s = this.state.settings;

      const scheduleTabsHtml = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; gap:8px;">
            <button class="btn ${s.scheduleCycleType === 'rotating' ? 'btn-primary' : 'btn-secondary'}" onclick="window.app.setScheduleType('rotating')">
              🔄 Rotating Day Cycle (Day 1–${s.cycleDaysCount})
            </button>
            <button class="btn ${s.scheduleCycleType === 'ab_week' ? 'btn-primary' : 'btn-secondary'}" onclick="window.app.setScheduleType('ab_week')">
              🔀 Alternating Weeks (Week A / B)
            </button>
            <button class="btn ${s.scheduleCycleType === 'standard' ? 'btn-primary' : 'btn-secondary'}" onclick="window.app.setScheduleType('standard')">
              🗓️ Standard Mon–Fri
            </button>
          </div>

          <div style="display:flex; gap:8px;">
            <button class="btn btn-amber" onclick="window.app.openBumpLessonsModal()">
              ⏩ Bump & Reschedule Lessons
            </button>
            <button class="btn btn-secondary" onclick="window.app.advanceCycleDay()">
              Advance to Next Day &rarr;
            </button>
          </div>
        </div>
      `;

      // Timetable Matrix
      let tableHtml = '';
      if (s.scheduleCycleType === 'rotating') {
        const days = Array.from({ length: s.cycleDaysCount }, (_, i) => i + 1);
        tableHtml = `
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">🔄 ${s.cycleDaysCount}-Day Rotating Schedule Matrix</h3>
              <span class="badge badge-indigo">Active Today: Day ${s.currentCycleDay}</span>
            </div>
            <p style="font-size:13px; color:var(--text-muted); margin-bottom:16px;">
              Weekends and snow days skip automatically so your rotating block carries over without falling behind.
            </p>
            <div class="data-table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Period / Time</th>
                    ${days.map(d => `<th style="${d === s.currentCycleDay ? 'background:var(--brand-light); color:var(--brand-primary); font-weight:900;' : ''}">Day ${d} ${d === s.currentCycleDay ? '★ (TODAY)' : ''}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Period 1 (08:30 - 09:40)</strong></td>
                    ${days.map(d => {
                      const cls = this.state.classes.find(c => c.schedule.rotatingDays.includes(d) && c.id === 'cls_bio9');
                      return cls ? `<td style="background:${cls.color}15; font-weight:700; color:${cls.color};">${cls.name}<br><small style="color:var(--text-muted);">${cls.room}</small></td>` : '<td><span style="color:var(--text-muted);">Prep / Office</span></td>';
                    }).join('')}
                  </tr>
                  <tr>
                    <td><strong>Period 2 (09:45 - 10:55)</strong></td>
                    ${days.map(d => `<td><span style="color:var(--text-muted);">Department Planning</span></td>`).join('')}
                  </tr>
                  <tr>
                    <td><strong>Period 3 (11:00 - 12:10)</strong></td>
                    ${days.map(d => {
                      const cls = this.state.classes.find(c => c.schedule.rotatingDays.includes(d) && c.id === 'cls_chem10');
                      return cls ? `<td style="background:${cls.color}15; font-weight:700; color:${cls.color};">${cls.name}<br><small style="color:var(--text-muted);">${cls.room}</small></td>` : '<td><span style="color:var(--text-muted);">Study Hall</span></td>';
                    }).join('')}
                  </tr>
                  <tr>
                    <td><strong>Lunch (12:10 - 12:55)</strong></td>
                    ${days.map(() => `<td style="background:var(--bg-surface-subtle); color:var(--text-muted);">Lunch & Duty</td>`).join('')}
                  </tr>
                  <tr>
                    <td><strong>Period 4 (01:00 - 02:10)</strong></td>
                    ${days.map(d => {
                      const cls = this.state.classes.find(c => c.schedule.rotatingDays.includes(d) && c.id === 'cls_sci8');
                      return cls ? `<td style="background:${cls.color}15; font-weight:700; color:${cls.color};">${cls.name}<br><small style="color:var(--text-muted);">${cls.room}</small></td>` : '<td><span style="color:var(--text-muted);">Advisory Block</span></td>';
                    }).join('')}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else {
        // Standard Mon - Fri
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        tableHtml = `
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">🗓️ Weekly Timetable (Mon–Fri)</h3>
            </div>
            <div class="data-table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    ${days.map(d => `<th>${d}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>08:30 - 09:40</strong></td>
                    <td style="background:#4F46E515; font-weight:700; color:#4F46E5;">Biology 9 (Lab 204)</td>
                    <td style="background:#4F46E515; font-weight:700; color:#4F46E5;">Biology 9 (Lab 204)</td>
                    <td><span style="color:var(--text-muted);">Faculty Meeting</span></td>
                    <td style="background:#4F46E515; font-weight:700; color:#4F46E5;">Biology 9 (Lab 204)</td>
                    <td style="background:#4F46E515; font-weight:700; color:#4F46E5;">Biology 9 (Lab 204)</td>
                  </tr>
                  <tr>
                    <td><strong>10:15 - 11:25</strong></td>
                    <td style="background:#0D948815; font-weight:700; color:#0D9488;">AP Chemistry (Lab 310)</td>
                    <td><span style="color:var(--text-muted);">Lab Prep</span></td>
                    <td style="background:#0D948815; font-weight:700; color:#0D9488;">AP Chemistry (Lab 310)</td>
                    <td><span style="color:var(--text-muted);">Lab Prep</span></td>
                    <td style="background:#0D948815; font-weight:700; color:#0D9488;">AP Chemistry (Lab 310)</td>
                  </tr>
                  <tr>
                    <td><strong>01:00 - 02:10</strong></td>
                    <td><span style="color:var(--text-muted);">Study Hall</span></td>
                    <td style="background:#D9770615; font-weight:700; color:#D97706;">Gen Science (Room 108)</td>
                    <td style="background:#D9770615; font-weight:700; color:#D97706;">Gen Science (Room 108)</td>
                    <td style="background:#D9770615; font-weight:700; color:#D97706;">Gen Science (Room 108)</td>
                    <td><span style="color:var(--text-muted);">Office Hours</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        `;
      }

      this.dom.contentArea.innerHTML = `
        ${scheduleTabsHtml}
        ${tableHtml}
      `;
    }

    setScheduleType(type) {
      this.state.settings.scheduleCycleType = type;
      this.saveState();
      this.render();
      this.showToast(`Switched to ${type.toUpperCase()} schedule mode.`, 'success');
    }

    advanceCycleDay() {
      let cur = this.state.settings.currentCycleDay;
      const total = this.state.settings.cycleDaysCount;
      cur = cur >= total ? 1 : cur + 1;
      this.state.settings.currentCycleDay = cur;
      this.saveState();
      this.render();
      this.showToast(`Advanced to Day ${cur} of ${total}`, 'info');
    }

    openBumpLessonsModal() {
      const modalBody = `
        <p style="font-size:13.5px; color:var(--text-secondary); margin-bottom:16px;">
          Did an unexpected snow day, field trip, or school assembly occur? Shift your planned lessons forward by 1 or more school days without manually editing each date.
        </p>
        <div class="form-group">
          <label class="form-label">Select Class to Bump</label>
          <select id="bumpClassId" class="form-control">
            <option value="all">All Classes</option>
            ${this.state.classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Shift Forward By</label>
          <select id="bumpDaysCount" class="form-control">
            <option value="1">1 School Day</option>
            <option value="2">2 School Days</option>
            <option value="3">3 School Days</option>
          </select>
        </div>
      `;
      const modalFooter = `
        <button class="btn btn-secondary" onclick="window.app.closeModal()">Cancel</button>
        <button class="btn btn-amber" onclick="window.app.executeBumpLessons()">Confirm Shift Forward</button>
      `;
      this.openModal("⏩ Bump & Reschedule Lesson Plans", modalBody, modalFooter);
    }

    executeBumpLessons() {
      const classId = document.getElementById('bumpClassId').value;
      const daysCount = parseInt(document.getElementById('bumpDaysCount').value, 10);
      
      this.state.lessons.forEach(l => {
        if (classId === 'all' || l.classId === classId) {
          const d = new Date(l.date);
          d.setDate(d.getDate() + daysCount);
          l.date = d.toISOString().split('T')[0];
        }
      });
      this.saveState();
      this.closeModal();
      this.render();
      this.showToast(`Successfully bumped lessons forward by ${daysCount} day(s)!`, 'success');
    }

    // =========================================================================
    // 3. LESSON PLANNER
    // =========================================================================
    renderLessonPlanner() {
      this.dom.pageTitle.textContent = "Interactive Lesson Planner";
      this.dom.pageSubtitle.textContent = "Detailed unit flow, learning objectives, state standards, and materials checklist";

      const lessonsHtml = this.state.lessons.map(les => {
        const cls = this.state.classes.find(c => c.id === les.classId);
        return `
          <div class="card" style="margin-bottom:20px; border-left:4px solid ${cls?.color || '#4F46E5'};">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
              <div>
                <span class="badge" style="background:${cls?.color}20; color:${cls?.color}; font-size:11px;">${cls?.name}</span>
                <span class="badge badge-sky" style="margin-left:6px;">Day ${les.cycleDay} &bull; ${les.duration} mins</span>
                <h3 style="font-size:18px; font-weight:800; color:var(--text-primary); margin-top:6px;">${les.title}</h3>
                <div style="font-size:12.5px; color:var(--text-muted); font-weight:600;">${les.unit} &bull; Scheduled: ${les.date}</div>
              </div>
              <div>
                <button class="btn btn-sm btn-secondary" onclick="window.app.duplicateLesson('${les.id}')">📋 Duplicate</button>
              </div>
            </div>

            <div style="background:var(--bg-surface-subtle); padding:14px; border-radius:var(--radius-md); margin-bottom:14px;">
              <div style="font-size:12px; font-weight:800; color:var(--brand-primary); text-transform:uppercase;">🎯 Learning Objectives:</div>
              <div style="font-size:13.5px; color:var(--text-primary); margin-top:3px;">${les.objectives}</div>
              <div style="font-size:11px; font-weight:700; color:var(--text-muted); margin-top:6px;">Standards: ${les.standards}</div>
            </div>

            <div style="margin-bottom:14px;">
              <div style="font-size:12px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; margin-bottom:8px;">⏱️ Step-by-Step Activities:</div>
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px;">
                ${les.activities.map(a => `
                  <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px;">
                    <span class="badge badge-indigo" style="font-size:10px;">${a.time}</span>
                    <div style="font-weight:700; font-size:13px; margin:4px 0 2px 0;">${a.title}</div>
                    <div style="font-size:12px; color:var(--text-secondary);">${a.desc}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:12px; font-size:12.5px;">
              <div><strong>📦 Materials:</strong> <span style="color:var(--text-secondary);">${les.materials}</span></div>
              <div><strong>📝 Homework:</strong> <span style="color:var(--text-secondary);">${les.homework}</span></div>
            </div>
          </div>
        `;
      }).join('');

      this.dom.contentArea.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <div>
            <h3 style="font-size:16px; font-weight:800;">Curriculum Lesson Bank</h3>
            <span style="font-size:12.5px; color:var(--text-muted);">${this.state.lessons.length} lessons planned</span>
          </div>
          <button class="btn btn-primary" onclick="window.app.openAddLessonModal()">+ Create New Lesson Plan</button>
        </div>
        ${lessonsHtml}
      `;
    }

    openAddLessonModal() {
      const modalBody = `
        <div class="form-group">
          <label class="form-label">Class</label>
          <select id="lesClassId" class="form-control">
            ${this.state.classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Lesson Title</label>
          <input type="text" id="lesTitle" class="form-control" placeholder="e.g. Newton's Third Law & Momentum" />
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Date</label>
            <input type="date" id="lesDate" class="form-control" value="${new Date().toISOString().split('T')[0]}" />
          </div>
          <div class="form-group">
            <label class="form-label">Duration (Minutes)</label>
            <input type="number" id="lesDuration" class="form-control" value="55" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Unit / Big Idea</label>
          <input type="text" id="lesUnit" class="form-control" placeholder="e.g. Unit 4: Forces and Motion" />
        </div>
        <div class="form-group">
          <label class="form-label">Learning Objectives</label>
          <textarea id="lesObj" class="form-control" rows="2" placeholder="Students will be able to..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Materials & Supplies Needed</label>
          <input type="text" id="lesMat" class="form-control" placeholder="e.g. Dynamics carts, spring balances, iPads" />
        </div>
      `;
      const modalFooter = `
        <button class="btn btn-secondary" onclick="window.app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="window.app.saveNewLesson()">Save Lesson Plan</button>
      `;
      this.openModal("+ Create New Lesson Plan", modalBody, modalFooter);
    }

    saveNewLesson() {
      const title = document.getElementById('lesTitle').value.trim();
      if (!title) {
        alert('Please enter a lesson title');
        return;
      }
      const newLes = {
        id: `les_${Date.now()}`,
        classId: document.getElementById('lesClassId').value,
        title,
        date: document.getElementById('lesDate').value,
        duration: parseInt(document.getElementById('lesDuration').value, 10) || 55,
        cycleDay: this.state.settings.currentCycleDay,
        unit: document.getElementById('lesUnit').value || 'General Unit',
        standards: 'NGSS Standards Alignment',
        objectives: document.getElementById('lesObj').value || 'Understand core conceptual principles.',
        materials: document.getElementById('lesMat').value || 'Textbooks, notebooks, pencils.',
        activities: [
          { time: "00-10m", title: "Warm-Up", desc: "Review previous checkpoint problems." },
          { time: "10-35m", title: "Core Instruction", desc: "Interactive presentation & problem walk-through." },
          { time: "35-55m", title: "Guided Practice", desc: "Collaborative partner worksheet & exit slip." }
        ],
        homework: "Review lecture notes.",
        reflection: ""
      };
      this.state.lessons.unshift(newLes);
      this.saveState();
      this.closeModal();
      this.render();
      this.showToast('Lesson plan created successfully!', 'success');
    }

    duplicateLesson(id) {
      const found = this.state.lessons.find(l => l.id === id);
      if (found) {
        const copy = JSON.parse(JSON.stringify(found));
        copy.id = `les_${Date.now()}`;
        copy.title = `${copy.title} (Copy)`;
        this.state.lessons.push(copy);
        this.saveState();
        this.render();
        this.showToast('Lesson duplicated!', 'info');
      }
    }

    // =========================================================================
    // 4. DIGITAL GRADEBOOK WITH WEIGHTED FORMULA TRANSPARENCY
    // =========================================================================
    renderGradebook() {
      this.dom.pageTitle.textContent = "Weighted Digital Gradebook";
      this.dom.pageSubtitle.textContent = "Category weighted calculations, letter scale mappings, and formula transparency";

      const selectedClass = this.state.classes.find(c => c.id === this.selectedClassId) || this.state.classes[0];
      const classStudents = this.state.students.filter(s => s.classId === selectedClass.id);
      const classAssignments = this.state.assignments.filter(a => a.classId === selectedClass.id);

      // Class switcher header
      const switcherHtml = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; gap:8px;">
            ${this.state.classes.map(c => `
              <button class="btn ${c.id === selectedClass.id ? 'btn-primary' : 'btn-secondary'}" onclick="window.app.switchGradebookClass('${c.id}')">
                ${c.name}
              </button>
            `).join('')}
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-emerald" onclick="window.app.openAddAssignmentModal()">+ Add Assignment</button>
            <button class="btn btn-secondary" onclick="window.app.openAddStudentModal()">+ Add Student</button>
          </div>
        </div>
      `;

      // Category Weight Strip
      const weightsHtml = `
        <div style="display:flex; gap:12px; margin-bottom:16px; background:var(--bg-surface); padding:12px 18px; border-radius:var(--radius-md); border:1px solid var(--border-color); flex-wrap:wrap;">
          <div style="font-weight:800; font-size:12.5px; align-self:center;">⚖️ Grade Weights:</div>
          ${selectedClass.categories.map(cat => `
            <span class="badge badge-indigo">${cat.name}: <strong>${cat.weight}%</strong></span>
          `).join('')}
        </div>
      `;

      // Gradebook Table
      const tableRows = classStudents.map(student => {
        // Calculate student weighted grade
        const calc = this.calculateStudentGrade(student.id, selectedClass);
        return `
          <tr>
            <td>
              <div style="font-weight:800; font-size:13.5px;">${student.name}</div>
              <div style="font-size:11px; color:var(--text-muted);">${student.idNum}</div>
            </td>
            ${classAssignments.map(asg => {
              const scoreKey = `${student.id}_${asg.id}`;
              const score = this.state.grades[scoreKey] !== undefined ? this.state.grades[scoreKey] : '';
              return `
                <td style="text-align:center;">
                  <input type="number" 
                         value="${score}" 
                         placeholder="—"
                         style="width:54px; text-align:center; padding:4px 6px; border:1px solid var(--border-strong); border-radius:6px; font-weight:700; background:var(--bg-surface);"
                         onchange="window.app.updateGradeScore('${student.id}', '${asg.id}', this.value)" />
                  <span style="font-size:11px; color:var(--text-muted);">/${asg.maxPoints}</span>
                </td>
              `;
            }).join('')}
            <td style="text-align:center; cursor:pointer;" onclick="window.app.showFormulaModal('${student.id}', '${selectedClass.id}')" title="Click to inspect formula breakdown">
              <span class="badge ${calc.letter === 'A' || calc.letter === 'A+' ? 'badge-emerald' : calc.letter === 'B' || calc.letter === 'B+' ? 'badge-sky' : 'badge-amber'}" style="font-size:13px; padding:4px 10px;">
                ${calc.percent}% (${calc.letter}) 🔍
              </span>
            </td>
          </tr>
        `;
      }).join('');

      this.dom.contentArea.innerHTML = `
        ${switcherHtml}
        ${weightsHtml}
        <div class="card" style="padding:0; overflow:hidden;">
          <div class="data-table-wrap" style="border:none;">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="min-width:180px;">Student Name</th>
                  ${classAssignments.map(a => `
                    <th style="text-align:center;">
                      <div>${a.title}</div>
                      <span class="badge badge-sky" style="font-size:10px;">${a.maxPoints} pts</span>
                    </th>
                  `).join('')}
                  <th style="text-align:center; min-width:130px;">Final Average</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows || '<tr><td colspan="10" style="text-align:center; padding:30px;">No students enrolled in this class.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    switchGradebookClass(id) {
      this.selectedClassId = id;
      this.render();
    }

    updateGradeScore(studentId, assignmentId, value) {
      const key = `${studentId}_${assignmentId}`;
      if (value === '' || isNaN(value)) {
        delete this.state.grades[key];
      } else {
        this.state.grades[key] = parseFloat(value);
      }
      this.saveState();
      this.render();
      this.showToast('Score updated!', 'info');
    }

    calculateStudentGrade(studentId, cls) {
      let totalEarnedWeight = 0;
      let totalCategoryWeights = 0;
      const categoryBreakdown = [];

      cls.categories.forEach(cat => {
        const catAssignments = this.state.assignments.filter(a => a.classId === cls.id && a.categoryId === cat.id);
        if (catAssignments.length === 0) return;

        let earned = 0;
        let totalPossible = 0;
        catAssignments.forEach(asg => {
          const score = this.state.grades[`${studentId}_${asg.id}`];
          if (score !== undefined) {
            earned += score;
            totalPossible += asg.maxPoints;
          }
        });

        if (totalPossible > 0) {
          const catPercent = (earned / totalPossible) * 100;
          const weightedContrib = catPercent * (cat.weight / 100);
          totalEarnedWeight += weightedContrib;
          totalCategoryWeights += cat.weight;

          categoryBreakdown.push({
            name: cat.name,
            weight: cat.weight,
            earned,
            totalPossible,
            percent: catPercent.toFixed(1),
            contribution: weightedContrib.toFixed(2)
          });
        }
      });

      const finalPercent = totalCategoryWeights > 0 ? (totalEarnedWeight / (totalCategoryWeights / 100)).toFixed(1) : "0.0";
      const scale = this.state.settings.gradingScale;
      let letter = "F";
      for (const item of scale) {
        if (parseFloat(finalPercent) >= item.min) {
          letter = item.grade;
          break;
        }
      }

      return {
        percent: finalPercent,
        letter,
        breakdown: categoryBreakdown
      };
    }

    showFormulaModal(studentId, classId) {
      const student = this.state.students.find(s => s.id === studentId);
      const cls = this.state.classes.find(c => c.id === classId);
      const calc = this.calculateStudentGrade(studentId, cls);

      const breakdownRows = calc.breakdown.map(b => `
        <tr>
          <td><strong>${b.name}</strong> (${b.weight}% weight)</td>
          <td>${b.earned} / ${b.totalPossible} pts</td>
          <td><strong>${b.percent}%</strong></td>
          <td style="color:var(--brand-primary); font-weight:800;">+${b.contribution}%</td>
        </tr>
      `).join('');

      const modalBody = `
        <div style="font-size:13.5px; margin-bottom:14px;">
          Student: <strong>${student.name}</strong> &bull; Class: <strong>${cls.name}</strong>
        </div>

        <div class="data-table-wrap" style="margin-bottom:16px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Points Scored</th>
                <th>Category Average</th>
                <th>Weighted Points</th>
              </tr>
            </thead>
            <tbody>
              ${breakdownRows}
            </tbody>
          </table>
        </div>

        <div style="background:var(--bg-surface-subtle); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
          <div style="font-size:13px; font-weight:800;">📐 Mathematical Formula:</div>
          <code style="display:block; margin:8px 0; font-size:12px; color:var(--brand-primary); background:var(--bg-surface); padding:8px; border-radius:6px;">
            Final Grade = &Sigma; (Category Score % &times; Category Weight) &divide; Total Evaluated Weights
          </code>
          <div style="font-size:16px; font-weight:900; color:var(--text-primary); margin-top:10px;">
            Calculated Result: <span style="color:#059669;">${calc.percent}% &rarr; Letter Grade: ${calc.letter}</span>
          </div>
        </div>
      `;

      this.openModal(`📊 Grade Formula Breakdown: ${student.name}`, modalBody);
    }

    openAddAssignmentModal() {
      const selectedClass = this.state.classes.find(c => c.id === this.selectedClassId) || this.state.classes[0];
      const modalBody = `
        <div class="form-group">
          <label class="form-label">Assignment Title</label>
          <input type="text" id="newAsgTitle" class="form-control" placeholder="e.g. Unit 3 Chromatography Lab" />
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select id="newAsgCat" class="form-control">
              ${selectedClass.categories.map(c => `<option value="${c.id}">${c.name} (${c.weight}%)</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Max Points</label>
            <input type="number" id="newAsgPoints" class="form-control" value="50" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Due Date</label>
          <input type="date" id="newAsgDate" class="form-control" value="${new Date().toISOString().split('T')[0]}" />
        </div>
      `;
      const modalFooter = `
        <button class="btn btn-secondary" onclick="window.app.closeModal()">Cancel</button>
        <button class="btn btn-emerald" onclick="window.app.saveNewAssignment()">Save Assignment</button>
      `;
      this.openModal("+ Add New Assignment", modalBody, modalFooter);
    }

    saveNewAssignment() {
      const title = document.getElementById('newAsgTitle').value.trim();
      const points = parseInt(document.getElementById('newAsgPoints').value, 10) || 50;
      if (!title) {
        alert('Please enter an assignment title');
        return;
      }
      const newAsg = {
        id: `asg_${Date.now()}`,
        classId: this.selectedClassId,
        title,
        categoryId: document.getElementById('newAsgCat').value,
        maxPoints: points,
        date: document.getElementById('newAsgDate').value
      };
      this.state.assignments.push(newAsg);
      this.saveState();
      this.closeModal();
      this.render();
      this.showToast('Assignment added to Gradebook!', 'success');
    }

    // =========================================================================
    // 5. ATTENDANCE TRACKER WITH 1-CLICK CROSS-CLASS COPY
    // =========================================================================
    renderAttendance() {
      this.dom.pageTitle.textContent = "Classroom Attendance Tracker";
      this.dom.pageSubtitle.textContent = "Record Daily/Monthly statuses (Present, Absent, Tardy, Excused) with 1-click cross-class copy";

      const selectedClass = this.state.classes.find(c => c.id === this.selectedClassId) || this.state.classes[0];
      const classStudents = this.state.students.filter(s => s.classId === selectedClass.id);

      const headerControls = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; gap:8px;">
            ${this.state.classes.map(c => `
              <button class="btn ${c.id === selectedClass.id ? 'btn-primary' : 'btn-secondary'}" onclick="window.app.switchAttendanceClass('${c.id}')">
                ${c.name}
              </button>
            `).join('')}
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <input type="date" value="${this.selectedDate}" class="form-control" style="width:160px;" onchange="window.app.setAttendanceDate(this.value)" />
            <button class="btn btn-emerald" onclick="window.app.markAllPresent('${selectedClass.id}')">✓ Mark All Present</button>
            <button class="btn btn-secondary" onclick="window.app.openCopyAttendanceModal('${selectedClass.id}')">📍 Copy to Other Classes</button>
          </div>
        </div>
      `;

      const studentRows = classStudents.map(student => {
        const key = `${this.selectedDate}_${selectedClass.id}_${student.id}`;
        const status = this.state.attendance[key] || 'P'; // default present

        return `
          <tr>
            <td>
              <div style="font-weight:800; font-size:13.5px;">${student.name}</div>
              <div style="font-size:11px; color:var(--text-muted);">${student.idNum}</div>
            </td>
            <td style="text-align:center;">
              <div style="display:inline-flex; gap:6px;">
                <button class="btn btn-sm ${status === 'P' ? 'btn-emerald' : 'btn-secondary'}" onclick="window.app.setStudentAttendance('${student.id}', 'P')">P (Present)</button>
                <button class="btn btn-sm ${status === 'A' ? 'btn-amber' : 'btn-secondary'}" onclick="window.app.setStudentAttendance('${student.id}', 'A')">A (Absent)</button>
                <button class="btn btn-sm ${status === 'T' ? 'btn-secondary' : 'btn-secondary'}" style="${status === 'T' ? 'background:#F59E0B; color:#FFF;' : ''}" onclick="window.app.setStudentAttendance('${student.id}', 'T')">T (Tardy)</button>
                <button class="btn btn-sm ${status === 'E' ? 'btn-secondary' : 'btn-secondary'}" style="${status === 'E' ? 'background:#64748B; color:#FFF;' : ''}" onclick="window.app.setStudentAttendance('${student.id}', 'E')">E (Excused)</button>
              </div>
            </td>
            <td style="text-align:center;">
              <span class="badge ${status === 'P' ? 'badge-emerald' : status === 'A' ? 'badge-rose' : 'badge-amber'}">
                ${status === 'P' ? 'Present' : status === 'A' ? 'Absent' : status === 'T' ? 'Late / Tardy' : 'Excused'}
              </span>
            </td>
          </tr>
        `;
      }).join('');

      this.dom.contentArea.innerHTML = `
        ${headerControls}
        <div class="card" style="padding:0; overflow:hidden;">
          <div class="data-table-wrap" style="border:none;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th style="text-align:center;">Mark Status for ${this.selectedDate}</th>
                  <th style="text-align:center;">Current Record</th>
                </tr>
              </thead>
              <tbody>
                ${studentRows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    switchAttendanceClass(id) {
      this.selectedClassId = id;
      this.render();
    }

    setAttendanceDate(date) {
      this.selectedDate = date;
      this.render();
    }

    setStudentAttendance(studentId, status) {
      const key = `${this.selectedDate}_${this.selectedClassId}_${studentId}`;
      this.state.attendance[key] = status;
      this.saveState();
      this.render();
    }

    markAllPresent(classId) {
      const classStudents = this.state.students.filter(s => s.classId === classId);
      classStudents.forEach(s => {
        const key = `${this.selectedDate}_${classId}_${s.id}`;
        this.state.attendance[key] = 'P';
      });
      this.saveState();
      this.render();
      this.showToast('All students marked Present!', 'success');
    }

    openCopyAttendanceModal(fromClassId) {
      const fromClass = this.state.classes.find(c => c.id === fromClassId);
      const otherClasses = this.state.classes.filter(c => c.id !== fromClassId);

      const modalBody = `
        <p style="font-size:13.5px; color:var(--text-secondary); margin-bottom:16px;">
          Copy attendance taken for <strong>${fromClass.name}</strong> on <strong>${this.selectedDate}</strong> to your other scheduled classes.
        </p>
        <div class="form-group">
          <label class="form-label">Destination Classes</label>
          ${otherClasses.map(c => `
            <label style="display:flex; align-items:center; gap:8px; margin-bottom:6px; font-size:13.5px;">
              <input type="checkbox" name="destClass" value="${c.id}" checked /> ${c.name}
            </label>
          `).join('')}
        </div>
      `;
      const modalFooter = `
        <button class="btn btn-secondary" onclick="window.app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="window.app.executeCopyAttendance('${fromClassId}')">Copy Attendance</button>
      `;
      this.openModal("📍 Copy Attendance to Other Classes", modalBody, modalFooter);
    }

    executeCopyAttendance(fromClassId) {
      const checkboxes = document.querySelectorAll('input[name="destClass"]:checked');
      const destIds = Array.from(checkboxes).map(cb => cb.value);

      const fromStudents = this.state.students.filter(s => s.classId === fromClassId);
      destIds.forEach(targetClassId => {
        const targetStudents = this.state.students.filter(s => s.classId === targetClassId);
        targetStudents.forEach(ts => {
          // match by student name if shared
          const match = fromStudents.find(fs => fs.name.toLowerCase() === ts.name.toLowerCase());
          if (match) {
            const fromKey = `${this.selectedDate}_${fromClassId}_${match.id}`;
            const targetKey = `${this.selectedDate}_${targetClassId}_${ts.id}`;
            this.state.attendance[targetKey] = this.state.attendance[fromKey] || 'P';
          }
        });
      });

      this.saveState();
      this.closeModal();
      this.render();
      this.showToast('Attendance successfully copied across selected classes!', 'success');
    }

    // =========================================================================
    // 6. INTERACTIVE SEATING CHART WITH SHUFFLE & RANDOMIZER
    // =========================================================================
    renderSeatingChart() {
      this.dom.pageTitle.textContent = "Interactive Classroom Seating Chart";
      this.dom.pageSubtitle.textContent = "Custom desk grid layout, drag-to-seat, A-Z ordering, and 1-click student shuffle";

      const selectedClass = this.state.classes.find(c => c.id === this.selectedClassId) || this.state.classes[0];
      const classStudents = this.state.students.filter(s => s.classId === selectedClass.id);

      // Ensure seating array exists
      if (!this.state.seating[selectedClass.id]) {
        this.state.seating[selectedClass.id] = Array.from({ length: 12 }, (_, i) => ({
          deskId: i + 1,
          studentId: classStudents[i]?.id || null
        }));
      }
      const desks = this.state.seating[selectedClass.id];

      const headerControls = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; gap:8px;">
            ${this.state.classes.map(c => `
              <button class="btn ${c.id === selectedClass.id ? 'btn-primary' : 'btn-secondary'}" onclick="window.app.switchSeatingClass('${c.id}')">
                ${c.name}
              </button>
            `).join('')}
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-primary" onclick="window.app.shuffleSeating('${selectedClass.id}')">🎲 Shuffle & Randomize</button>
            <button class="btn btn-secondary" onclick="window.app.sortSeatingAZ('${selectedClass.id}')">🔤 Arrange A–Z</button>
            <button class="btn btn-secondary" onclick="window.app.clearSeating('${selectedClass.id}')">🧹 Clear Layout</button>
          </div>
        </div>
      `;

      // Front of room banner
      const frontOfRoom = `
        <div style="text-align:center; padding:10px; background:#1E293B; color:#FFFFFF; border-radius:var(--radius-md); font-weight:800; font-size:13px; letter-spacing:1px; text-transform:uppercase; margin-bottom:12px;">
          🖥️ FRONT OF CLASSROOM / WHITEBOARD & TEACHER DESK
        </div>
      `;

      // Grid Layout (3 rows x 4 cols)
      const gridSlots = desks.map(slot => {
        const stu = this.state.students.find(s => s.id === slot.studentId);
        return `
          <div class="desk-slot ${stu ? 'occupied' : ''}" onclick="window.app.openAssignSeatModal('${selectedClass.id}', ${slot.deskId})">
            <span class="desk-id">Desk ${slot.deskId}</span>
            <div class="student-name">${stu ? stu.name : '+ Empty'}</div>
            ${stu?.accommodation && stu.accommodation !== 'None' ? `<span class="badge badge-amber" style="font-size:9px; margin-top:4px;">${stu.accommodation}</span>` : ''}
          </div>
        `;
      }).join('');

      this.dom.contentArea.innerHTML = `
        ${headerControls}
        <div class="card">
          ${frontOfRoom}
          <div class="seating-grid" style="grid-template-columns:repeat(4, 1fr);">
            ${gridSlots}
          </div>
        </div>
      `;
    }

    switchSeatingClass(id) {
      this.selectedClassId = id;
      this.render();
    }

    shuffleSeating(classId) {
      const classStudents = this.state.students.filter(s => s.classId === classId);
      const shuffled = [...classStudents].sort(() => Math.random() - 0.5);
      
      const desks = this.state.seating[classId] || Array.from({ length: 12 }, (_, i) => ({ deskId: i + 1, studentId: null }));
      desks.forEach((desk, idx) => {
        desk.studentId = shuffled[idx]?.id || null;
      });

      this.saveState();
      this.render();
      this.showToast('Classroom seating shuffled randomly!', 'success');
    }

    sortSeatingAZ(classId) {
      const classStudents = this.state.students.filter(s => s.classId === classId);
      const sorted = [...classStudents].sort((a, b) => a.name.localeCompare(b.name));

      const desks = this.state.seating[classId] || Array.from({ length: 12 }, (_, i) => ({ deskId: i + 1, studentId: null }));
      desks.forEach((desk, idx) => {
        desk.studentId = sorted[idx]?.id || null;
      });

      this.saveState();
      this.render();
      this.showToast('Seating arranged alphabetically (A–Z)!', 'info');
    }

    clearSeating(classId) {
      if (confirm('Clear all assigned seats for this class?')) {
        const desks = this.state.seating[classId];
        if (desks) {
          desks.forEach(d => d.studentId = null);
        }
        this.saveState();
        this.render();
        this.showToast('Seating cleared.', 'info');
      }
    }

    openAssignSeatModal(classId, deskId) {
      const classStudents = this.state.students.filter(s => s.classId === classId);
      const modalBody = `
        <div class="form-group">
          <label class="form-label">Assign Student to Desk ${deskId}</label>
          <select id="seatStudentSelect" class="form-control">
            <option value="">-- Leave Desk Empty --</option>
            ${classStudents.map(s => `<option value="${s.id}">${s.name} (${s.accommodation})</option>`).join('')}
          </select>
        </div>
      `;
      const modalFooter = `
        <button class="btn btn-secondary" onclick="window.app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="window.app.saveDeskAssignment('${classId}', ${deskId})">Save Seat</button>
      `;
      this.openModal(`Assign Desk #${deskId}`, modalBody, modalFooter);
    }

    saveDeskAssignment(classId, deskId) {
      const stuId = document.getElementById('seatStudentSelect').value;
      const desk = this.state.seating[classId].find(d => d.deskId === deskId);
      if (desk) {
        desk.studentId = stuId || null;
      }
      this.saveState();
      this.closeModal();
      this.render();
      this.showToast('Seat updated!', 'success');
    }

    // =========================================================================
    // 7. STUDENT ROSTER & ACCOMMODATIONS
    // =========================================================================
    renderStudentRoster() {
      this.dom.pageTitle.textContent = "Student Roster & Profiles";
      this.dom.pageSubtitle.textContent = "Accommodations (IEP/504), parent contact directory, and student notes";

      const studentsRows = this.state.students.map(s => {
        const cls = this.state.classes.find(c => c.id === s.classId);
        return `
          <tr>
            <td>
              <div style="font-weight:800; font-size:14px;">${s.name}</div>
              <div style="font-size:11px; color:var(--text-muted);">${s.idNum} &bull; ${s.email}</div>
            </td>
            <td><span class="badge" style="background:${cls?.color}20; color:${cls?.color};">${cls?.name}</span></td>
            <td>
              <span class="badge ${s.accommodation.includes('IEP') ? 'badge-rose' : s.accommodation.includes('504') ? 'badge-amber' : s.accommodation.includes('ELL') ? 'badge-sky' : 'badge-emerald'}">
                ${s.accommodation}
              </span>
            </td>
            <td>
              <div style="font-size:13px; font-weight:700;">${s.parentName}</div>
              <div style="font-size:11px; color:var(--text-muted);">${s.parentPhone}</div>
            </td>
            <td style="font-size:12.5px; color:var(--text-secondary); max-width:240px;">
              ${s.notes}
            </td>
            <td>
              <button class="btn btn-sm btn-secondary" onclick="window.app.openEditStudentModal('${s.id}')">Edit</button>
            </td>
          </tr>
        `;
      }).join('');

      this.dom.contentArea.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <div>
            <h3 style="font-size:16px; font-weight:800;">Enrolled Student Directory</h3>
            <span style="font-size:12.5px; color:var(--text-muted);">${this.state.students.length} Total Registered Students</span>
          </div>
          <button class="btn btn-primary" onclick="window.app.openAddStudentModal()">+ Add New Student</button>
        </div>

        <div class="card" style="padding:0; overflow:hidden;">
          <div class="data-table-wrap" style="border:none;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Assigned Class</th>
                  <th>Accommodations</th>
                  <th>Guardian Contact</th>
                  <th>Educator Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${studentsRows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    openAddStudentModal() {
      const modalBody = `
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" id="newStuName" class="form-control" placeholder="e.g. Maya Lin" />
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Student ID</label>
            <input type="text" id="newStuId" class="form-control" value="STU-${Math.floor(1000 + Math.random() * 9000)}" />
          </div>
          <div class="form-group">
            <label class="form-label">Class</label>
            <select id="newStuClass" class="form-control">
              ${this.state.classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Special Accommodations</label>
          <select id="newStuAcc" class="form-control">
            <option value="None">None</option>
            <option value="IEP (Extended Time)">IEP (Extended Time)</option>
            <option value="504 (Front Row Seating)">504 (Front Row Seating)</option>
            <option value="ELL Support">ELL Support</option>
            <option value="Medical Plan">Medical Plan</option>
          </select>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label class="form-label">Guardian Name</label>
            <input type="text" id="newStuParent" class="form-control" placeholder="e.g. David Lin" />
          </div>
          <div class="form-group">
            <label class="form-label">Guardian Phone</label>
            <input type="text" id="newStuPhone" class="form-control" placeholder="(555) 000-0000" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Teacher Notes</label>
          <textarea id="newStuNotes" class="form-control" rows="2" placeholder="Strengths, hobbies, learning preferences..."></textarea>
        </div>
      `;
      const modalFooter = `
        <button class="btn btn-secondary" onclick="window.app.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="window.app.saveNewStudent()">Add Student</button>
      `;
      this.openModal("+ Add New Student", modalBody, modalFooter);
    }

    saveNewStudent() {
      const name = document.getElementById('newStuName').value.trim();
      if (!name) {
        alert('Please enter a student name');
        return;
      }
      const newS = {
        id: `stu_${Date.now()}`,
        classId: document.getElementById('newStuClass').value,
        name,
        idNum: document.getElementById('newStuId').value,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@school.org`,
        parentName: document.getElementById('newStuParent').value || 'Guardian',
        parentPhone: document.getElementById('newStuPhone').value || '—',
        accommodation: document.getElementById('newStuAcc').value,
        notes: document.getElementById('newStuNotes').value || 'Enrolled.'
      };
      this.state.students.push(newS);
      this.saveState();
      this.closeModal();
      this.render();
      this.showToast('Student added successfully!', 'success');
    }

    // =========================================================================
    // 8. INTERACTIVE TEACHER TOOLKIT (LIVE IN-CLASS WIDGETS)
    // =========================================================================
    renderToolkit() {
      this.dom.pageTitle.textContent = "Live Teacher In-Class Toolkit";
      this.dom.pageSubtitle.textContent = "Interactive Student Picker, Auto Grouping Generator, Noise Visualizer, Timers & House Points";

      this.dom.contentArea.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
          <!-- 1. Random Student Picker -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">🎲 Random Student Name Picker</h3>
            </div>
            <div class="picker-stage">
              <div id="pickerDisplay" class="picker-name-display">Ready to Pick!</div>
              <div style="display:flex; justify-content:center; gap:12px; margin-top:16px;">
                <button class="btn btn-primary" onclick="window.app.triggerRandomPick()">🎯 Spin / Pick Random Student</button>
                <button class="btn btn-secondary" onclick="document.getElementById('pickerDisplay').textContent='Ready to Pick!'">Reset</button>
              </div>
            </div>
          </div>

          <!-- 2. Smart Grouping Generator -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">👥 Smart Student Grouping Generator</h3>
            </div>
            <div style="display:flex; gap:12px; align-items:center; margin-bottom:16px;">
              <label class="form-label" style="margin-bottom:0;">Group Size:</label>
              <select id="groupSizeSelect" class="form-control" style="width:130px;">
                <option value="2">Pairs (2 Students)</option>
                <option value="3">Trios (3 Students)</option>
                <option value="4" selected>Groups of 4</option>
              </select>
              <button class="btn btn-primary" onclick="window.app.generateGroups()">⚡ Auto-Generate</button>
            </div>
            <div id="groupsOutput" style="background:var(--bg-surface-subtle); padding:16px; border-radius:var(--radius-md); min-height:160px; font-size:13px;">
              Click 'Auto-Generate' to randomly distribute students into balanced collaborative teams.
            </div>
          </div>

          <!-- 3. Classroom Noise Visualizer -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">🔊 Classroom Sound / Noise Level Meter</h3>
            </div>
            <p style="font-size:13px; color:var(--text-muted);">
              Helps students self-monitor their volume during independent study or group discussions.
            </p>
            <div class="noise-meter-bar">
              <div id="noiseFill" class="noise-meter-fill"></div>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; color:var(--text-secondary);">
              <span>🤫 Whispering / Silent</span>
              <span>🗣️ Group Collaboration</span>
              <span>⚠️ Too Loud!</span>
            </div>
            <div style="margin-top:16px; display:flex; gap:10px;">
              <button class="btn btn-secondary btn-sm" onclick="window.app.simulateNoise(20)">Level 1: Silent</button>
              <button class="btn btn-secondary btn-sm" onclick="window.app.simulateNoise(55)">Level 2: Discussion</button>
              <button class="btn btn-secondary btn-sm" onclick="window.app.simulateNoise(88)">Level 3: Alert!</button>
            </div>
          </div>

          <!-- 4. Classroom Timers & House Points -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">⏱️ Classroom Countdown Timer</h3>
            </div>
            <div style="text-align:center; padding:12px 0;">
              <div id="timerDisplay" style="font-size:52px; font-weight:900; color:var(--brand-primary); letter-spacing:-1px;">
                05:00
              </div>
              <div style="display:flex; justify-content:center; gap:8px; margin:16px 0;">
                <button class="btn btn-secondary btn-sm" onclick="window.app.setTimerSeconds(120)">2m Drill</button>
                <button class="btn btn-secondary btn-sm" onclick="window.app.setTimerSeconds(300)">5m Warmup</button>
                <button class="btn btn-secondary btn-sm" onclick="window.app.setTimerSeconds(900)">15m Lab</button>
                <button class="btn btn-secondary btn-sm" onclick="window.app.setTimerSeconds(1500)">25m Focus</button>
              </div>
              <div style="display:flex; justify-content:center; gap:10px;">
                <button class="btn btn-primary" onclick="window.app.startTimer()">Start Timer</button>
                <button class="btn btn-secondary" onclick="window.app.pauseTimer()">Pause</button>
                <button class="btn btn-secondary" onclick="window.app.resetTimer()">Reset</button>
              </div>
            </div>
          </div>
        </div>

        <!-- House / Team Points -->
        <div class="card" style="margin-top:24px;">
          <div class="card-header">
            <h3 class="card-title">🏆 Team & House Points Scoreboard</h3>
          </div>
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px;">
            ${this.state.housePoints.map((team, idx) => `
              <div style="background:var(--bg-surface-subtle); border-radius:var(--radius-md); padding:16px; text-align:center; border-top:4px solid ${team.color};">
                <div style="font-weight:800; font-size:15px; color:${team.color};">${team.team}</div>
                <div style="font-size:36px; font-weight:900; margin:10px 0;">${team.points}</div>
                <div style="display:flex; justify-content:center; gap:8px;">
                  <button class="btn btn-sm btn-secondary" onclick="window.app.changeTeamPoints(${idx}, -5)">-5</button>
                  <button class="btn btn-sm btn-primary" onclick="window.app.changeTeamPoints(${idx}, 5)">+5 pts</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    triggerRandomPick() {
      const display = document.getElementById('pickerDisplay');
      if (!display) return;

      const students = this.state.students;
      if (students.length === 0) {
        display.textContent = "No students enrolled.";
        return;
      }

      let count = 0;
      const interval = setInterval(() => {
        const rand = students[Math.floor(Math.random() * students.length)];
        display.textContent = rand.name;
        display.style.transform = 'scale(1.08)';
        setTimeout(() => display.style.transform = 'scale(1)', 50);
        count++;
        if (count > 15) {
          clearInterval(interval);
          const chosen = students[Math.floor(Math.random() * students.length)];
          display.textContent = `🎉 ${chosen.name}!`;
          this.showToast(`Selected: ${chosen.name}`, 'success');
        }
      }, 70);
    }

    generateGroups() {
      const size = parseInt(document.getElementById('groupSizeSelect').value, 10) || 4;
      const students = [...this.state.students].sort(() => Math.random() - 0.5);
      const groups = [];

      for (let i = 0; i < students.length; i += size) {
        groups.push(students.slice(i, i + size));
      }

      const output = document.getElementById('groupsOutput');
      if (output) {
        output.innerHTML = groups.map((grp, i) => `
          <div style="margin-bottom:12px; background:var(--bg-surface); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
            <strong style="color:var(--brand-primary);">Group ${i + 1} (${grp.length} students):</strong>
            <div style="margin-top:4px;">${grp.map(s => `<span class="badge badge-indigo" style="margin:2px 4px 2px 0;">${s.name}</span>`).join('')}</div>
          </div>
        `).join('');
      }
    }

    simulateNoise(pct) {
      const fill = document.getElementById('noiseFill');
      if (fill) {
        fill.style.width = `${pct}%`;
      }
    }

    setTimerSeconds(sec) {
      this.timerRemaining = sec;
      this.updateTimerDisplay();
    }

    updateTimerDisplay() {
      const disp = document.getElementById('timerDisplay');
      if (disp) {
        const m = Math.floor(this.timerRemaining / 60).toString().padStart(2, '0');
        const s = (this.timerRemaining % 60).toString().padStart(2, '0');
        disp.textContent = `${m}:${s}`;
      }
    }

    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      if (this.timerRemaining <= 0) this.timerRemaining = 300;
      this.timerInterval = setInterval(() => {
        if (this.timerRemaining > 0) {
          this.timerRemaining--;
          this.updateTimerDisplay();
        } else {
          clearInterval(this.timerInterval);
          this.showToast('⏰ Time is up! Great focus session.', 'warning');
        }
      }, 1000);
    }

    pauseTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
    }

    resetTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerRemaining = 300;
      this.updateTimerDisplay();
    }

    changeTeamPoints(idx, delta) {
      this.state.housePoints[idx].points = Math.max(0, this.state.housePoints[idx].points + delta);
      this.saveState();
      this.render();
    }

    // =========================================================================
    // 9. EMERGENCY SUBSTITUTE TEACHER PLANNER
    // =========================================================================
    renderSubPlans() {
      this.dom.pageTitle.textContent = "Emergency Substitute Teacher Plan";
      this.dom.pageSubtitle.textContent = "Print-ready folder with bell schedules, routines, key helper students, and emergency procedures";

      const sub = this.state.subPlans;

      this.dom.contentArea.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;" class="no-print">
          <div>
            <h3 style="font-size:16px; font-weight:800;">Substitute Teacher Folder Generator</h3>
            <span style="font-size:12.5px; color:var(--text-muted);">Formatted to print cleanly on standard US Letter / A4 paper</span>
          </div>
          <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save as PDF</button>
        </div>

        <div class="card" style="padding:32px;">
          <div style="border-bottom:2px solid var(--border-color); padding-bottom:18px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h1 style="font-size:24px; font-weight:900; color:var(--text-primary); letter-spacing:-0.5px;">SUBSTITUTE TEACHER GUIDE &amp; DAILY PLAN</h1>
              <div style="font-size:14px; font-weight:700; color:var(--text-secondary); margin-top:4px;">
                ${sub.schoolName} &bull; Teacher: ${sub.teacherName} &bull; Room: ${sub.roomNumber}
              </div>
            </div>
            <div style="text-align:right;">
              <span class="badge badge-emerald" style="font-size:12px; padding:6px 14px;">Emergency Phone: ${sub.emergencyPhone}</span>
            </div>
          </div>

          <div style="margin-bottom:24px;">
            <h4 style="font-size:14px; font-weight:800; color:var(--brand-primary); text-transform:uppercase; margin-bottom:8px;">🔔 Bell Schedule &amp; Periods</h4>
            <div class="data-table-wrap">
              <table class="data-table">
                <thead>
                  <tr><th>Period</th><th>Time</th><th>Class / Location</th></tr>
                </thead>
                <tbody>
                  ${sub.bellSchedule.map(b => `<tr><td><strong>${b.period}</strong></td><td>${b.time}</td><td>${sub.roomNumber}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px;">
            <div style="background:var(--bg-surface-subtle); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
              <h4 style="font-size:13px; font-weight:800; color:var(--text-primary); text-transform:uppercase; margin-bottom:8px;">📋 Classroom Routines &amp; Rules</h4>
              <ul style="padding-left:18px; font-size:13px; color:var(--text-secondary); line-height:1.6;">
                ${sub.classroomRules.map(r => `<li>${r}</li>`).join('')}
              </ul>
            </div>

            <div style="background:var(--bg-surface-subtle); padding:16px; border-radius:var(--radius-md); border:1px solid var(--border-color);">
              <h4 style="font-size:13px; font-weight:800; color:var(--text-primary); text-transform:uppercase; margin-bottom:8px;">🤝 Reliable Student Helpers</h4>
              <p style="font-size:13px; color:var(--text-secondary); line-height:1.6;">${sub.reliableStudents}</p>
            </div>
          </div>

          <div style="background:#EEF2FF; padding:18px; border-radius:var(--radius-md); border:1px solid #C7D2FE;">
            <h4 style="font-size:13.5px; font-weight:800; color:#3730A3; text-transform:uppercase; margin-bottom:6px;">📖 Today's Lesson Plan &amp; Activity Instructions:</h4>
            <p style="font-size:13.5px; color:#1E1B4B; line-height:1.6;">${sub.subLessonActivity}</p>
          </div>
        </div>
      `;
    }

    // =========================================================================
    // 10. CLASSROOM SUPPLIES & BUDGET TRACKER
    // =========================================================================
    renderBudgetSupplies() {
      this.dom.pageTitle.textContent = "Classroom Supplies & Budget";
      this.dom.pageSubtitle.textContent = "Inventory reorder alerts, classroom spending logs, and school reimbursement status";

      const suppliesRows = this.state.supplies.map(sup => `
        <tr>
          <td><strong>${sup.name}</strong></td>
          <td><span class="badge badge-indigo">${sup.category}</span></td>
          <td>${sup.qty} / min ${sup.minQty}</td>
          <td>${sup.location}</td>
          <td>
            <span class="badge ${sup.qty <= 0 ? 'badge-rose' : sup.qty <= sup.minQty ? 'badge-amber' : 'badge-emerald'}">
              ${sup.status}
            </span>
          </td>
        </tr>
      `).join('');

      const budgetRows = this.state.budget.map(b => `
        <tr>
          <td>${b.date}</td>
          <td><strong>${b.item}</strong></td>
          <td>${b.vendor}</td>
          <td><strong>$${b.amount.toFixed(2)}</strong></td>
          <td><span class="badge badge-sky">${b.category}</span></td>
          <td>
            <span class="badge ${b.reimbursed ? 'badge-emerald' : 'badge-amber'}">
              ${b.reimbursed ? 'Reimbursed' : 'Pending Claim'}
            </span>
          </td>
        </tr>
      `).join('');

      let totalSpend = this.state.budget.reduce((acc, b) => acc + b.amount, 0);

      this.dom.contentArea.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
          <!-- Supplies -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">📦 Classroom Inventory &amp; Supplies</h3>
            </div>
            <div class="data-table-wrap">
              <table class="data-table">
                <thead>
                  <tr><th>Supply Item</th><th>Category</th><th>Qty</th><th>Location</th><th>Status</th></tr>
                </thead>
                <tbody>
                  ${suppliesRows}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Budget -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">💰 Classroom Spending &amp; Receipts</h3>
              <span class="badge badge-indigo">Total: $${totalSpend.toFixed(2)}</span>
            </div>
            <div class="data-table-wrap">
              <table class="data-table">
                <thead>
                  <tr><th>Date</th><th>Item</th><th>Vendor</th><th>Cost</th><th>Category</th><th>Status</th></tr>
                </thead>
                <tbody>
                  ${budgetRows}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // =========================================================================
    // 11. SETTINGS & DATA MANAGEMENT
    // =========================================================================
    renderSettings() {
      this.dom.pageTitle.textContent = "Planner Settings & Data Management";
      this.dom.pageSubtitle.textContent = "1-Click JSON Backup/Export, Theme Toggle, and Demo vs Blank Switcher";

      const s = this.state.settings;

      this.dom.contentArea.innerHTML = `
        <div class="card" style="max-width:700px; margin-bottom:24px;">
          <h3 class="card-title" style="margin-bottom:16px;">⚙️ Teacher &amp; School Configuration</h3>
          <div class="form-group">
            <label class="form-label">Teacher Name</label>
            <input type="text" id="cfgTeacherName" class="form-control" value="${s.teacherName}" />
          </div>
          <div class="form-group">
            <label class="form-label">School / Institution</label>
            <input type="text" id="cfgSchoolName" class="form-control" value="${s.schoolName}" />
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group">
              <label class="form-label">School Year</label>
              <input type="text" id="cfgSchoolYear" class="form-control" value="${s.schoolYear}" />
            </div>
            <div class="form-group">
              <label class="form-label">Term / Semester</label>
              <input type="text" id="cfgTermName" class="form-control" value="${s.termName}" />
            </div>
          </div>
          <button class="btn btn-primary" onclick="window.app.saveConfigSettings()">Save Settings</button>
        </div>

        <div class="card" style="max-width:700px; margin-bottom:24px;">
          <h3 class="card-title" style="margin-bottom:16px;">💾 Device Backup &amp; Privacy (100% Offline)</h3>
          <p style="font-size:13.5px; color:var(--text-secondary); margin-bottom:16px;">
            Your students' data is completely private and saved exclusively on this device. Create a backup file to transfer your planner between school computers or keep safe records.
          </p>
          <div style="display:flex; gap:12px;">
            <button class="btn btn-emerald" onclick="window.app.exportBackup()">📥 Export 1-Click JSON Backup</button>
            <button class="btn btn-secondary" onclick="document.getElementById('importFileInput').click()">📤 Import JSON Backup</button>
            <input type="file" id="importFileInput" style="display:none;" accept=".json" onchange="window.app.importBackup(event)" />
          </div>
        </div>

        <div class="card" style="max-width:700px;">
          <h3 class="card-title" style="margin-bottom:16px;">🔄 Demo Mode vs Blank Planner</h3>
          <p style="font-size:13.5px; color:var(--text-secondary); margin-bottom:16px;">
            Need to clear the sample data and start your own classroom from scratch, or re-populate demo data to explore?
          </p>
          <div style="display:flex; gap:12px;">
            <button class="btn btn-amber" onclick="window.app.switchToBlank()">🧹 Reset to Blank Ready-to-Use Planner</button>
            <button class="btn btn-secondary" onclick="window.app.reloadDemo()">📚 Reload Demo Sample Data</button>
          </div>
        </div>
      `;
    }

    saveConfigSettings() {
      this.state.settings.teacherName = document.getElementById('cfgTeacherName').value.trim() || 'Teacher';
      this.state.settings.schoolName = document.getElementById('cfgSchoolName').value.trim() || 'School';
      this.state.settings.schoolYear = document.getElementById('cfgSchoolYear').value.trim() || '2026–2027';
      this.state.settings.termName = document.getElementById('cfgTermName').value.trim() || 'Term 1';
      this.saveState();
      this.render();
      this.showToast('Settings saved successfully!', 'success');
    }

    exportBackup() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `teacher_planner_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      this.showToast('Backup downloaded safely!', 'success');
    }

    importBackup(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed && parsed.settings && parsed.classes) {
            this.state = parsed;
            this.saveState();
            this.render();
            this.showToast('Backup imported successfully!', 'success');
          } else {
            alert('Invalid backup file format.');
          }
        } catch (err) {
          alert('Failed to parse JSON backup file.');
        }
      };
      reader.readAsText(file);
    }

    switchToBlank() {
      if (confirm('Are you sure you want to clear demo data and start with a fresh blank planner? (You can backup your current data first!)')) {
        this.state = this.getBlankState();
        this.saveState();
        this.selectedClassId = this.state.classes[0]?.id || '';
        this.render();
        this.showToast('Switched to clean blank planner!', 'info');
      }
    }

    reloadDemo() {
      if (confirm('Reload realistic demo data? Current data will be replaced.')) {
        this.state = this.getDemoState();
        this.saveState();
        this.selectedClassId = this.state.classes[0]?.id || '';
        this.render();
        this.showToast('Demo data reloaded!', 'success');
      }
    }
  }

  // Initialize on DOM load
  window.addEventListener('DOMContentLoaded', () => {
    window.app = new TeacherPlannerApp();
  });
})();
