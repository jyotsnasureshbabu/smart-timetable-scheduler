 🕒 Timetable Scheduler

A **web-based intelligent timetable generation system** designed to automate and optimize class scheduling for higher education institutions. It ensures efficient utilization of classrooms, balanced faculty workload, and flexibility under multidisciplinary and NEP 2020 frameworks.

---

📚 Background

Higher Education institutions often face challenges in efficient class scheduling due to limited infrastructure, faculty constraints, elective courses, and overlapping departmental requirements.
Manual timetable preparation leads to frequent clashes, underutilized resources, and uneven workload distribution.

With the adoption of **multidisciplinary curricula and flexible learning (NEP 2020)**, the scheduling process has become more dynamic — requiring an **intelligent, adaptive, and automated solution**.

🧠 Description

Most colleges rely on manual input via spreadsheets or basic tools that fail to account for:

* Real-time faculty availability
* Room capacity
* Teaching load norms
* Student preferences
* Elective combinations

This project aims to **automate and optimize** timetable generation while satisfying institutional constraints and maximizing resource efficiency.

The system ensures:

* ✅ Maximized utilization of classrooms and labs
* ✅ Minimized faculty and student workload
* ✅ Compliance with institutional norms and learning outcomes

⚙️ Key Parameters

The timetable generation algorithm considers:

* Number of classrooms available
* Number of student batches
* Subjects offered in a semester
* Faculty available for each subject
* Teaching hours per subject per week/day
* Maximum classes per day
* Average faculty leave frequency
* Fixed slots for special classes

Additional custom variables can be incorporated to improve optimization results.

---

 🧩 Features

* 🔐 **Login system** for authorized personnel
* 🧾 **Input forms** for faculty, subjects, classrooms, and batches
* ⚙️ **Automated timetable generation** using defined constraints
* 🧠 **Multiple optimized timetable options** to choose from
* 🧍‍♂️ **Approval workflow** for review by academic authorities
* 🔄 **Smart rearrangement suggestions** when conflicts occur
* 🏫 **Support for multiple departments and shifts**



💻 Tech Stack

Frontend:

* React.js
* Axios (for API communication)

Backend:

* Node.js
* Express.js (REST API framework)

Database:

* PostgreSQL

**API Testing:**

* Postman

🧱 Folder Structure

```
timetable-scheduler/
│
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── faculty.js
│   │   ├── subjects.js
│   │   ├── batches.js
│   │   ├── classrooms.js
│   │   └── autoSchedule.js
│   └── db/
│       └── connection.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   └── package.json
│
└── README.md
```
 🚀 Installation and Setup

1️⃣ Clone the repository

```bash
git clone https://github.com/yourusername/timetable-scheduler.git
cd timetable-scheduler
```

2️⃣ Setup Backend

```bash
cd backend
npm install
npm start
```

3️⃣ Setup Frontend

```bash
cd frontend
npm install
npm start
```

4️⃣ Database Setup

* Create a PostgreSQL database named `timetable_db`.
* Update connection credentials in `backend/db/connection.js`.
* Run the provided SQL script (if any) to create required tables.

