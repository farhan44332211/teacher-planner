/* ==============================================================================
   2026-2027 DIGITAL TEACHER PLANNER & GRADEBOOK
   Default & Demo Seed Data (Realistic K-12 Classroom Setup)
   ============================================================================== */

const DEFAULT_SETTINGS = {
  teacherName: "Sarah Jenkins",
  schoolName: "Oakridge High School",
  schoolYear: "2026–2027",
  termName: "Fall Semester",
  theme: "light",
  scheduleCycleType: "rotating", // "standard" (Mon-Fri) | "rotating" (Day 1 - Day 6) | "ab_week" (Week A / Week B)
  cycleDaysCount: 6,
  currentCycleDay: 1,
  currentWeekType: "A",
  gradingScale: [
    { grade: "A+", min: 97, gpa: 4.0 },
    { grade: "A",  min: 93, gpa: 4.0 },
    { grade: "A-", min: 90, gpa: 3.7 },
    { grade: "B+", min: 87, gpa: 3.3 },
    { grade: "B",  min: 83, gpa: 3.0 },
    { grade: "B-", min: 80, gpa: 2.7 },
    { grade: "C+", min: 77, gpa: 2.3 },
    { grade: "C",  min: 73, gpa: 2.0 },
    { grade: "C-", min: 70, gpa: 1.7 },
    { grade: "D",  min: 60, gpa: 1.0 },
    { grade: "F",  min: 0,  gpa: 0.0 }
  ]
};

const DEMO_CLASSES = [
  {
    id: "cls_bio9",
    name: "Biology - Period 1",
    gradeLevel: "Grade 9",
    room: "Lab 204",
    color: "#4F46E5",
    studentsCount: 8,
    categories: [
      { id: "cat_hw", name: "Homework & Prep", weight: 20 },
      { id: "cat_lab", name: "Lab Reports", weight: 30 },
      { id: "cat_q", name: "Quizzes", weight: 20 },
      { id: "cat_ex", name: "Exams & Midterm", weight: 30 }
    ],
    schedule: {
      standard: ["Mon 08:30", "Tue 08:30", "Thu 08:30", "Fri 08:30"],
      rotatingDays: [1, 2, 4, 5],
      weekA: ["Mon 08:30", "Wed 08:30", "Fri 08:30"],
      weekB: ["Tue 08:30", "Thu 08:30"]
    }
  },
  {
    id: "cls_chem10",
    name: "AP Chemistry - Period 3",
    gradeLevel: "Grade 10",
    room: "Lab 310",
    color: "#0D9488",
    studentsCount: 8,
    categories: [
      { id: "cat_hw", name: "Problem Sets", weight: 15 },
      { id: "cat_lab", name: "Experimental Labs", weight: 35 },
      { id: "cat_q", name: "Weekly Quizzes", weight: 20 },
      { id: "cat_ex", name: "Unit Exams", weight: 30 }
    ],
    schedule: {
      standard: ["Mon 10:15", "Wed 10:15", "Fri 10:15"],
      rotatingDays: [1, 3, 5],
      weekA: ["Tue 10:15", "Thu 10:15"],
      weekB: ["Mon 10:15", "Wed 10:15", "Fri 10:15"]
    }
  },
  {
    id: "cls_sci8",
    name: "General Science - Period 5",
    gradeLevel: "Grade 8",
    room: "Room 108",
    color: "#D97706",
    studentsCount: 8,
    categories: [
      { id: "cat_hw", name: "Daily Worksheets", weight: 25 },
      { id: "cat_lab", name: "Hands-on Projects", weight: 30 },
      { id: "cat_q", name: "Checkpoints", weight: 20 },
      { id: "cat_ex", name: "Quarter Tests", weight: 25 }
    ],
    schedule: {
      standard: ["Tue 13:00", "Wed 13:00", "Thu 13:00"],
      rotatingDays: [2, 3, 6],
      weekA: ["Mon 13:00", "Wed 13:00"],
      weekB: ["Tue 13:00", "Thu 13:00"]
    }
  }
];

const DEMO_STUDENTS = [
  // Class 1 (Bio 9)
  { id: "stu_101", classId: "cls_bio9", name: "Aiden Martinez", idNum: "STU-901", email: "aiden.m@school.org", parentName: "Maria Martinez", parentPhone: "(555) 234-8891", accommodation: "IEP (Extended Time)", notes: "Excels in diagram labeling and group labs." },
  { id: "stu_102", classId: "cls_bio9", name: "Chloe Henderson", idNum: "STU-902", email: "chloe.h@school.org", parentName: "David Henderson", parentPhone: "(555) 871-3320", accommodation: "None", notes: "Classroom student helper." },
  { id: "stu_103", classId: "cls_bio9", name: "Ethan Walker", idNum: "STU-903", email: "ethan.w@school.org", parentName: "Rachel Walker", parentPhone: "(555) 344-9912", accommodation: "504 (Front Row Seating)", notes: "Audio sensitivity; sits close to board." },
  { id: "stu_104", classId: "cls_bio9", name: "Hannah Patel", idNum: "STU-904", email: "hannah.p@school.org", parentName: "Sunil Patel", parentPhone: "(555) 781-6541", accommodation: "ELL Support", notes: "Bilingual science dictionary permitted." },
  { id: "stu_105", classId: "cls_bio9", name: "Lucas Vance", idNum: "STU-905", email: "lucas.v@school.org", parentName: "Karen Vance", parentPhone: "(555) 912-7744", accommodation: "None", notes: "Very strong scientific reasoning." },
  { id: "stu_106", classId: "cls_bio9", name: "Maya Sterling", idNum: "STU-906", email: "maya.s@school.org", parentName: "James Sterling", parentPhone: "(555) 432-1109", accommodation: "Medical (Asthma)", notes: "Inhaler stored in nurse's office." },
  { id: "stu_107", classId: "cls_bio9", name: "Noah Campbell", idNum: "STU-907", email: "noah.c@school.org", parentName: "Laura Campbell", parentPhone: "(555) 662-8012", accommodation: "None", notes: "Needs encouragement during exams." },
  { id: "stu_108", classId: "cls_bio9", name: "Zoe Robinson", idNum: "STU-908", email: "zoe.r@school.org", parentName: "Mark Robinson", parentPhone: "(555) 301-4458", accommodation: "None", notes: "Consistently submits homework early." },

  // Class 2 (AP Chem 10)
  { id: "stu_201", classId: "cls_chem10", name: "Benjamin Ross", idNum: "STU-1001", email: "ben.r@school.org", parentName: "Susan Ross", parentPhone: "(555) 441-2981", accommodation: "None", notes: "Excellent mathematical balancing skills." },
  { id: "stu_202", classId: "cls_chem10", name: "Daniela Perez", idNum: "STU-1002", email: "daniela.p@school.org", parentName: "Carlos Perez", parentPhone: "(555) 998-1123", accommodation: "504 (Large Print)", notes: "Lab glasses with magnified vision." },
  { id: "stu_203", classId: "cls_chem10", name: "Henry Brooks", idNum: "STU-1003", email: "henry.b@school.org", parentName: "Angela Brooks", parentPhone: "(555) 773-4560", accommodation: "None", notes: "Aspiring chemical engineer." },
  { id: "stu_204", classId: "cls_chem10", name: "Isabella Cruz", idNum: "STU-1004", email: "isabella.c@school.org", parentName: "Fernando Cruz", parentPhone: "(555) 602-8819", accommodation: "None", notes: "Peer tutor in stoichiometry." },
  { id: "stu_205", classId: "cls_chem10", name: "Jacob Taylor", idNum: "STU-1005", email: "jacob.t@school.org", parentName: "Lisa Taylor", parentPhone: "(555) 339-1402", accommodation: "IEP (Frequent Checks)", notes: "Thrives with structured checklist." },
  { id: "stu_206", classId: "cls_chem10", name: "Kaitlyn Morris", idNum: "STU-1006", email: "kaitlyn.m@school.org", parentName: "Robert Morris", parentPhone: "(555) 819-2033", accommodation: "None", notes: "Outstanding lab report formatting." },
  { id: "stu_207", classId: "cls_chem10", name: "Liam Washington", idNum: "STU-1007", email: "liam.w@school.org", parentName: "Evelyn Washington", parentPhone: "(555) 714-3890", accommodation: "None", notes: "Active participant in class discussions." },
  { id: "stu_208", classId: "cls_chem10", name: "Sophia Edwards", idNum: "STU-1008", email: "sophia.e@school.org", parentName: "Thomas Edwards", parentPhone: "(555) 490-8812", accommodation: "Medical (Nut Allergy)", notes: "Severe peanut/tree nut allergy." },

  // Class 3 (Gen Sci 8)
  { id: "stu_301", classId: "cls_sci8", name: "Alexander King", idNum: "STU-801", email: "alex.k@school.org", parentName: "Diane King", parentPhone: "(555) 312-7809", accommodation: "None", notes: "Loves solar system models." },
  { id: "stu_302", classId: "cls_sci8", name: "Brianna Diaz", idNum: "STU-802", email: "brianna.d@school.org", parentName: "Hector Diaz", parentPhone: "(555) 498-2231", accommodation: "None", notes: "Great team leader in science fair." },
  { id: "stu_303", classId: "cls_sci8", name: "Caleb Scott", idNum: "STU-803", email: "caleb.s@school.org", parentName: "Jennifer Scott", parentPhone: "(555) 782-9011", accommodation: "IEP (Modified Format)", notes: "Prefers multiple choice & sketches." },
  { id: "stu_304", classId: "cls_sci8", name: "Emily Wright", idNum: "STU-804", email: "emily.w@school.org", parentName: "Brian Wright", parentPhone: "(555) 601-3489", accommodation: "None", notes: "Always prepared with supplies." },
  { id: "stu_305", classId: "cls_sci8", name: "Mason Clark", idNum: "STU-805", email: "mason.c@school.org", parentName: "Sarah Clark", parentPhone: "(555) 980-4567", accommodation: "504 (Movement Breaks)", notes: "Allowed 1 min stretch break." },
  { id: "stu_306", classId: "cls_sci8", name: "Olivia Lewis", idNum: "STU-806", email: "olivia.l@school.org", parentName: "Gregory Lewis", parentPhone: "(555) 234-9812", accommodation: "None", notes: "Top score in ecosystem project." },
  { id: "stu_307", classId: "cls_sci8", name: "Samuel Hill", idNum: "STU-807", email: "sam.h@school.org", parentName: "Patricia Hill", parentPhone: "(555) 438-1190", accommodation: "None", notes: "Enthusiastic experimentalist." },
  { id: "stu_308", classId: "cls_sci8", name: "Victoria Green", idNum: "STU-808", email: "victoria.g@school.org", parentName: "Anthony Green", parentPhone: "(555) 872-4019", accommodation: "None", notes: "Very organized science binder." }
];

const DEMO_ASSIGNMENTS = [
  // Bio 9 Assignments
  { id: "asg_1", classId: "cls_bio9", title: "Microscope Cell Lab", categoryId: "cat_lab", maxPoints: 50, date: "2026-10-12" },
  { id: "asg_2", classId: "cls_bio9", title: "Photosynthesis Problem Set", categoryId: "cat_hw", maxPoints: 20, date: "2026-10-18" },
  { id: "asg_3", classId: "cls_bio9", title: "Cellular Respiration Quiz", categoryId: "cat_q", maxPoints: 25, date: "2026-10-25" },
  { id: "asg_4", classId: "cls_bio9", title: "Mitosis & Meiosis Midterm", categoryId: "cat_ex", maxPoints: 100, date: "2026-11-04" },

  // AP Chem 10 Assignments
  { id: "asg_5", classId: "cls_chem10", title: "Acid-Base Titration Lab", categoryId: "cat_lab", maxPoints: 60, date: "2026-10-14" },
  { id: "asg_6", classId: "cls_chem10", title: "Stoichiometry Drill #3", categoryId: "cat_hw", maxPoints: 25, date: "2026-10-21" },
  { id: "asg_7", classId: "cls_chem10", title: "Thermodynamics Quiz", categoryId: "cat_q", maxPoints: 30, date: "2026-10-28" },
  { id: "asg_8", classId: "cls_chem10", title: "Equilibrium Unit Exam", categoryId: "cat_ex", maxPoints: 100, date: "2026-11-06" }
];

const DEMO_GRADES = {
  // studentId_assignmentId: score
  "stu_101_asg_1": 46, "stu_101_asg_2": 19, "stu_101_asg_3": 23, "stu_101_asg_4": 91,
  "stu_102_asg_1": 49, "stu_102_asg_2": 20, "stu_102_asg_3": 25, "stu_102_asg_4": 97,
  "stu_103_asg_1": 42, "stu_103_asg_2": 17, "stu_103_asg_3": 21, "stu_103_asg_4": 84,
  "stu_104_asg_1": 45, "stu_104_asg_2": 18, "stu_104_asg_3": 22, "stu_104_asg_4": 89,
  "stu_105_asg_1": 50, "stu_105_asg_2": 20, "stu_105_asg_3": 25, "stu_105_asg_4": 99,
  "stu_106_asg_1": 47, "stu_106_asg_2": 19, "stu_106_asg_3": 24, "stu_106_asg_4": 93,
  "stu_107_asg_1": 40, "stu_107_asg_2": 16, "stu_107_asg_3": 19, "stu_107_asg_4": 79,
  "stu_108_asg_1": 48, "stu_108_asg_2": 20, "stu_108_asg_3": 24, "stu_108_asg_4": 95,

  // Chem grades
  "stu_201_asg_5": 58, "stu_201_asg_6": 24, "stu_201_asg_7": 28, "stu_201_asg_8": 94,
  "stu_202_asg_5": 54, "stu_202_asg_6": 22, "stu_202_asg_7": 26, "stu_202_asg_8": 88,
  "stu_203_asg_5": 60, "stu_203_asg_6": 25, "stu_203_asg_7": 30, "stu_203_asg_8": 98,
  "stu_204_asg_5": 57, "stu_204_asg_6": 25, "stu_204_asg_7": 29, "stu_204_asg_8": 96,
  "stu_205_asg_5": 49, "stu_205_asg_6": 20, "stu_205_asg_7": 23, "stu_205_asg_8": 81,
  "stu_206_asg_5": 59, "stu_206_asg_6": 25, "stu_206_asg_7": 29, "stu_206_asg_8": 95,
  "stu_207_asg_5": 53, "stu_207_asg_6": 22, "stu_207_asg_7": 27, "stu_207_asg_8": 87,
  "stu_208_asg_5": 56, "stu_208_asg_6": 23, "stu_208_asg_7": 28, "stu_208_asg_8": 92
};

const DEMO_LESSONS = [
  {
    id: "les_1",
    classId: "cls_bio9",
    date: "2026-11-16",
    cycleDay: 1,
    unit: "Unit 3: Molecular Genetics",
    title: "DNA Double Helix & Base Pairing Structure",
    duration: 55,
    standards: "NGSS.HS-LS1-1, HS-LS3-1",
    objectives: "Students will construct and label a 3D nucleotide pair model and explain complementary A-T and G-C hydrogen bonding rules.",
    materials: "DNA pipe-cleaner molecular kits, colored marker pens, student guide worksheet p.14",
    activities: [
      { time: "00-10m", title: "Warm-Up & Bellringer", desc: "Project 3 mystery micrographs: guess the biological macro-molecule." },
      { time: "10-25m", title: "Direct Instruction", desc: "Interactive slides on Watson, Crick, and Rosalind Franklin's Photo 51. Deoxyribose vs phosphate backbone." },
      { time: "25-45m", title: "Hands-on Modeling", desc: "Students work in pairs to assemble an 8-rung double helix model." },
      { time: "45-55m", title: "Exit Ticket & Check", desc: "Given sequence 5'-ATGCTA-3', write the complementary 3'-5' strand." }
    ],
    homework: "Complete Textbook Reading Chapter 12.1 (p. 280-286); Section Review questions #1-6.",
    reflection: "Students loved the hands-on kit. Aiden Martinez completed his model with zero errors."
  },
  {
    id: "les_2",
    classId: "cls_chem10",
    date: "2026-11-16",
    cycleDay: 1,
    unit: "Unit 4: Chemical Kinetics",
    title: "Collision Theory & Reaction Activation Energy",
    duration: 60,
    standards: "AP Chem LO 5.1, NGSS.HS-PS1-5",
    objectives: "Predict how molecular orientation and kinetic energy threshold affect Maxwell-Boltzmann reaction rates.",
    materials: "PhET Molecular Simulation on iPads, glow sticks, ice water & hot water beakers",
    activities: [
      { time: "00-10m", title: "Live Phenomenon Demo", desc: "Snap two glow sticks simultaneously: one in hot water (bright), one in iced water (dim)." },
      { time: "10-30m", title: "Maxwell-Boltzmann Curves", desc: "Plotting kinetic distribution curves; shaded area represents particles with E >= Ea." },
      { time: "30-50m", title: "PhET Simulation Lab", desc: "Run 50-particle simulation varying temperature from 200K to 800K; record reaction half-life." },
      { time: "50-60m", title: "Summary Reflection", desc: "Formative quiz on effect of catalysts lowering activation energy barrier." }
    ],
    homework: "AP Classroom Practice FRQ #2 (Reaction Mechanisms).",
    reflection: "Pacing was crisp. Beaker glow-stick demo instantly grabbed attention."
  }
];

const DEMO_SEATING = {
  // classId: array of 12 desk slots (rows: 3, cols: 4)
  "cls_bio9": [
    { deskId: 1, studentId: "stu_103" }, // Ethan Walker (front row)
    { deskId: 2, studentId: "stu_101" }, // Aiden Martinez
    { deskId: 3, studentId: "stu_104" }, // Hannah Patel
    { deskId: 4, studentId: "stu_102" }, // Chloe Henderson
    { deskId: 5, studentId: "stu_105" }, // Lucas Vance
    { deskId: 6, studentId: "stu_106" }, // Maya Sterling
    { deskId: 7, studentId: "stu_107" }, // Noah Campbell
    { deskId: 8, studentId: "stu_108" }, // Zoe Robinson
    { deskId: 9, studentId: null },
    { deskId: 10, studentId: null },
    { deskId: 11, studentId: null },
    { deskId: 12, studentId: null }
  ]
};

const DEMO_SUB_PLANS = {
  schoolName: "Oakridge High School",
  teacherName: "Sarah Jenkins",
  emergencyPhone: "(555) 443-8910",
  roomNumber: "Science Wing - Lab 204",
  bellSchedule: [
    { period: "Period 1 (Bio 9)", time: "08:30 – 09:40 AM" },
    { period: "Period 2 (Prep & Office Hours)", time: "09:45 – 10:55 AM" },
    { period: "Period 3 (AP Chem 10)", time: "11:00 – 12:10 PM" },
    { period: "Lunch Break", time: "12:10 – 12:55 PM" },
    { period: "Period 4 (General Science 8)", time: "01:00 – 02:10 PM" },
    { period: "Dismissal & Hall Duty", time: "02:15 – 02:45 PM" }
  ],
  classroomRules: [
    "No food or open beverages near lab stations and sink basins.",
    "Students may use their science notebooks and school iPads for research.",
    "Two student hall passes permitted at any given time (hall pass lanyard by the front door).",
    "Emergency eye-wash station and first aid kit are located next to Door 2."
  ],
  reliableStudents: "Chloe Henderson (Bio 9) & Isabella Cruz (AP Chem 10) are trained lab assistants and know where all worksheets and extra calculators are stored.",
  subLessonActivity: "For Period 1 and Period 4: Hand out the printed Article Packet ('CRISPR Innovations 2026'). Students are to read silently for 20 minutes, then answer the 5 text-dependent analysis questions on page 3. Collect all papers at the bell."
};

const DEMO_SUPPLIES = [
  { id: "sup_1", name: "Nitrile Lab Gloves (Medium)", category: "Lab Consumables", qty: 4, minQty: 2, location: "Cabinet B-2", status: "In Stock" },
  { id: "sup_2", name: "Glass Petri Dishes (Pack of 20)", category: "Glassware", qty: 1, minQty: 2, location: "Shelf 4A", status: "Low Stock" },
  { id: "sup_3", name: "Colored Dry-Erase Markers", category: "Stationery", qty: 12, minQty: 4, location: "Teacher Desk", status: "In Stock" },
  { id: "sup_4", name: "Lens Cleaning Paper Packs", category: "Microscopes", qty: 0, minQty: 2, location: "Cabinet C-1", status: "Out of Stock" }
];

const DEMO_BUDGET = [
  { id: "bg_1", date: "2026-09-12", item: "Molecular Modeling Kits (8 sets)", vendor: "Carolina Biological", amount: 148.50, category: "Curriculum Materials", reimbursed: true },
  { id: "bg_2", date: "2026-10-04", item: "Glow Sticks & Food Dye Demo Pack", vendor: "Amazon Education", amount: 24.95, category: "Classroom Demonstrations", reimbursed: true },
  { id: "bg_3", date: "2026-10-28", item: "Stickers & Honor Roll Badges", vendor: "Target", amount: 18.20, category: "Student Rewards", reimbursed: false }
];

const DEMO_HOUSE_POINTS = [
  { team: "Red Phoenix", points: 145, color: "#EF4444" },
  { team: "Blue Pegasus", points: 160, color: "#3B82F6" },
  { team: "Green Hydra", points: 135, color: "#10B981" },
  { team: "Gold Griffin", points: 175, color: "#F59E0B" }
];
