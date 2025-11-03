-- Create the database (run this manually in pgAdmin or psql first)
-- CREATE DATABASE timetable_db;

-- Use this database
-- \c timetable_db;

-- Create faculty table
CREATE TABLE IF NOT EXISTS faculty (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data (optional)
INSERT INTO faculty (name, subject, email, phone) VALUES
('Dr. John Smith', 'Mathematics', 'john.smith@college.edu', '+1234567890'),
('Dr. Sarah Johnson', 'Physics', 'sarah.johnson@college.edu', '+1234567891'),
('Prof. Mike Brown', 'Chemistry', 'mike.brown@college.edu', '+1234567892');
-- 📚 COMPLETE TIMETABLE DATABASE SCHEMA
-- Step 2: Creating all tables with relationships

-- 1. SUBJECTS TABLE 📖
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    hours_per_week INTEGER NOT NULL DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CLASSROOMS TABLE 🏫
CREATE TABLE IF NOT EXISTS classrooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    capacity INTEGER NOT NULL DEFAULT 60,
    type VARCHAR(30) DEFAULT 'regular', -- regular, lab, auditorium
    building VARCHAR(50),
    floor INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. BATCHES TABLE 👥
CREATE TABLE IF NOT EXISTS batches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    student_count INTEGER NOT NULL DEFAULT 60,
    department VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TIME_SLOTS TABLE ⏰
CREATE TABLE IF NOT EXISTS time_slots (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL, -- 1=Monday, 2=Tuesday, ..., 7=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    period_name VARCHAR(20), -- Period 1, Period 2, etc.
    is_break BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(day_of_week, start_time)
);

-- 5. FACULTY_SUBJECTS TABLE (Many-to-Many) 👨‍🏫📚
CREATE TABLE IF NOT EXISTS faculty_subjects (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    preference_level INTEGER DEFAULT 3, -- 1=High, 2=Medium, 3=Low
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(faculty_id, subject_id)
);

-- 6. BATCH_SUBJECTS TABLE (Many-to-Many) 👥📚
CREATE TABLE IF NOT EXISTS batch_subjects (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    hours_per_week INTEGER NOT NULL DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(batch_id, subject_id)
);

-- 7. TIMETABLE TABLE (Main scheduling table) 📅
CREATE TABLE IF NOT EXISTS timetable (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id INTEGER NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    classroom_id INTEGER NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    time_slot_id INTEGER NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
    week_number INTEGER DEFAULT 1, -- For different weeks if needed
    academic_year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(batch_id, time_slot_id, week_number), -- No batch can have 2 subjects at same time
    UNIQUE(faculty_id, time_slot_id, week_number), -- No faculty can teach 2 classes at same time
    UNIQUE(classroom_id, time_slot_id, week_number) -- No classroom can have 2 classes at same time
);

-- 8. CONSTRAINTS TABLE (For advanced scheduling rules) ⚙️
CREATE TABLE IF NOT EXISTS scheduling_constraints (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'faculty_unavailable', 'classroom_unavailable', 'batch_unavailable'
    entity_id INTEGER NOT NULL, -- faculty_id, classroom_id, or batch_id
    time_slot_id INTEGER REFERENCES time_slots(id),
    day_of_week INTEGER, -- If constraint is for entire day
    start_date DATE,
    end_date DATE,
    reason VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'faculty', -- Possible roles: admin, hod, faculty
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INSERT SAMPLE DATA FOR TESTING 🧪

-- Sample Subjects
INSERT INTO subjects (name, code, hours_per_week) VALUES
('Mathematics', 'MATH101', 6),
('Physics', 'PHY101', 4),
('Chemistry', 'CHEM101', 4),
('Computer Science', 'CS101', 6),
('English', 'ENG101', 3),
('History', 'HIST101', 3);

-- Sample Classrooms
INSERT INTO classrooms (name, capacity, type, building, floor) VALUES
('Room A101', 60, 'regular', 'Main Building', 1),
('Room A102', 60, 'regular', 'Main Building', 1),
('Lab B201', 30, 'lab', 'Science Building', 2),
('Lab B202', 30, 'lab', 'Science Building', 2),
('Auditorium C301', 200, 'auditorium', 'Central Building', 3),
('Room A201', 60, 'regular', 'Main Building', 2);

-- Sample Batches
INSERT INTO batches (name, year, semester, student_count, department) VALUES
('CSE-A-2024', 1, 1, 58, 'Computer Science'),
('CSE-B-2024', 1, 1, 55, 'Computer Science'),
('ECE-A-2024', 1, 1, 62, 'Electronics'),
('MECH-A-2024', 1, 1, 60, 'Mechanical');

-- Sample Time Slots (Monday to Friday, 6 periods per day)
INSERT INTO time_slots (day_of_week, start_time, end_time, period_name, is_break) VALUES
-- Monday
(1, '09:00', '09:50', 'Period 1', FALSE),
(1, '09:50', '10:40', 'Period 2', FALSE),
(1, '10:40', '11:00', 'Break 1', TRUE),
(1, '11:00', '11:50', 'Period 3', FALSE),
(1, '11:50', '12:40', 'Period 4', FALSE),
(1, '12:40', '13:30', 'Lunch Break', TRUE),
(1, '13:30', '14:20', 'Period 5', FALSE),
(1, '14:20', '15:10', 'Period 6', FALSE),

-- Tuesday (same pattern)
(2, '09:00', '09:50', 'Period 1', FALSE),
(2, '09:50', '10:40', 'Period 2', FALSE),
(2, '10:40', '11:00', 'Break 1', TRUE),
(2, '11:00', '11:50', 'Period 3', FALSE),
(2, '11:50', '12:40', 'Period 4', FALSE),
(2, '12:40', '13:30', 'Lunch Break', TRUE),
(2, '13:30', '14:20', 'Period 5', FALSE),
(2, '14:20', '15:10', 'Period 6', FALSE),

-- Wednesday
(3, '09:00', '09:50', 'Period 1', FALSE),
(3, '09:50', '10:40', 'Period 2', FALSE),
(3, '10:40', '11:00', 'Break 1', TRUE),
(3, '11:00', '11:50', 'Period 3', FALSE),
(3, '11:50', '12:40', 'Period 4', FALSE),
(3, '12:40', '13:30', 'Lunch Break', TRUE),
(3, '13:30', '14:20', 'Period 5', FALSE),
(3, '14:20', '15:10', 'Period 6', FALSE),

-- Thursday
(4, '09:00', '09:50', 'Period 1', FALSE),
(4, '09:50', '10:40', 'Period 2', FALSE),
(4, '10:40', '11:00', 'Break 1', TRUE),
(4, '11:00', '11:50', 'Period 3', FALSE),
(4, '11:50', '12:40', 'Period 4', FALSE),
(4, '12:40', '13:30', 'Lunch Break', TRUE),
(4, '13:30', '14:20', 'Period 5', FALSE),
(4, '14:20', '15:10', 'Period 6', FALSE),

-- Friday
(5, '09:00', '09:50', 'Period 1', FALSE),
(5, '09:50', '10:40', 'Period 2', FALSE),
(5, '10:40', '11:00', 'Break 1', TRUE),
(5, '11:00', '11:50', 'Period 3', FALSE),
(5, '11:50', '12:40', 'Period 4', FALSE),
(5, '12:40', '13:30', 'Lunch Break', TRUE),
(5, '13:30', '14:20', 'Period 5', FALSE),
(5, '14:20', '15:10', 'Period 6', FALSE);

-- Sample Faculty-Subject Relationships
INSERT INTO faculty_subjects (faculty_id, subject_id, preference_level) VALUES
(1, 1, 1), -- Dr. John Smith teaches Mathematics (High preference)
(1, 4, 2), -- Dr. John Smith can teach Computer Science (Medium preference)
(2, 2, 1), -- Dr. Jane Doe teaches Physics (High preference)
(2, 3, 2); -- Dr. Jane Doe can teach Chemistry (Medium preference)

-- Sample Batch-Subject Relationships
INSERT INTO batch_subjects (batch_id, subject_id, hours_per_week) VALUES
-- CSE-A-2024 subjects
(1, 1, 6), -- Mathematics
(1, 4, 6), -- Computer Science
(1, 2, 4), -- Physics
(1, 5, 3), -- English

-- CSE-B-2024 subjects
(2, 1, 6), -- Mathematics
(2, 4, 6), -- Computer Science
(2, 2, 4), -- Physics
(2, 5, 3); -- English

-- 📋 USEFUL QUERIES FOR TESTING

-- View all tables with counts
-- SELECT 'faculty' as table_name, COUNT(*) as count FROM faculty
-- UNION SELECT 'subjects', COUNT(*) FROM subjects
-- UNION SELECT 'classrooms', COUNT(*) FROM classrooms
-- UNION SELECT 'batches', COUNT(*) FROM batches
-- UNION SELECT 'time_slots', COUNT(*) FROM time_slots
-- UNION SELECT 'faculty_subjects', COUNT(*) FROM faculty_subjects
-- UNION SELECT 'batch_subjects', COUNT(*) FROM batch_subjects;

-- View faculty with their subjects
-- SELECT f.name as faculty_name, s.name as subject_name, fs.preference_level
-- FROM faculty f
-- JOIN faculty_subjects fs ON f.id = fs.faculty_id
-- JOIN subjects s ON fs.subject_id = s.id
-- ORDER BY f.name, fs.preference_level;

-- View batches with their subjects
-- SELECT b.name as batch_name, s.name as subject_name, bs.hours_per_week
-- FROM batches b
-- JOIN batch_subjects bs ON b.id = bs.batch_id
-- JOIN subjects s ON bs.subject_id = s.id
-- ORDER BY b.name;