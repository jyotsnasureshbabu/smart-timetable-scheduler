-- ========================================
-- COMPLETE DATABASE SETUP SCRIPT WITH PHASE 1 FEATURES
-- Run this in pgAdmin Query Tool
-- ========================================

-- Drop all tables in correct order (respects foreign key constraints)
DROP TABLE IF EXISTS faculty_leaves CASCADE;
DROP TABLE IF EXISTS timetable CASCADE;
DROP TABLE IF EXISTS scheduling_constraints CASCADE;
DROP TABLE IF EXISTS batch_subjects CASCADE;
DROP TABLE IF EXISTS faculty_subjects CASCADE;
DROP TABLE IF EXISTS time_slots CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS classrooms CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;

-- ========================================
-- CREATE TABLES
-- ========================================

-- 1. FACULTY TABLE (Enhanced with workload constraints)
CREATE TABLE faculty (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(20),
    max_classes_per_day INTEGER DEFAULT 5,
    max_classes_per_week INTEGER DEFAULT 24,
    preferred_shift VARCHAR(20) DEFAULT 'morning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS TABLE (for authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'faculty',
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. SUBJECTS TABLE
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    hours_per_week INTEGER NOT NULL DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. CLASSROOMS TABLE
CREATE TABLE classrooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    capacity INTEGER NOT NULL DEFAULT 60,
    type VARCHAR(30) DEFAULT 'regular',
    building VARCHAR(50),
    floor INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. BATCHES TABLE (Enhanced with shift and max classes)
CREATE TABLE batches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    student_count INTEGER NOT NULL DEFAULT 60,
    department VARCHAR(100),
    shift VARCHAR(20) DEFAULT 'morning',
    max_classes_per_day INTEGER DEFAULT 6,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TIME_SLOTS TABLE (Enhanced with shift)
CREATE TABLE time_slots (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    period_name VARCHAR(20),
    is_break BOOLEAN DEFAULT FALSE,
    shift VARCHAR(20) DEFAULT 'morning',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(day_of_week, start_time)
);

-- 7. FACULTY_SUBJECTS TABLE (Many-to-Many)
CREATE TABLE faculty_subjects (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    preference_level INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(faculty_id, subject_id)
);

-- 8. BATCH_SUBJECTS TABLE (Many-to-Many)
CREATE TABLE batch_subjects (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    hours_per_week INTEGER NOT NULL DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(batch_id, subject_id)
);

-- 9. TIMETABLE TABLE (Enhanced with approval workflow)
CREATE TABLE timetable (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id INTEGER NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    classroom_id INTEGER NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    time_slot_id INTEGER NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
    week_number INTEGER DEFAULT 1,
    academic_year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(batch_id, time_slot_id, week_number),
    UNIQUE(faculty_id, time_slot_id, week_number),
    UNIQUE(classroom_id, time_slot_id, week_number)
);

-- 10. CONSTRAINTS TABLE (For advanced scheduling rules)
CREATE TABLE scheduling_constraints (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    time_slot_id INTEGER REFERENCES time_slots(id),
    day_of_week INTEGER,
    start_date DATE,
    end_date DATE,
    reason VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. FACULTY LEAVES TABLE (NEW)
CREATE TABLE faculty_leaves (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    leave_date DATE NOT NULL,
    leave_type VARCHAR(30) DEFAULT 'casual',
    reason VARCHAR(255),
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX idx_timetable_status ON timetable(status);
CREATE INDEX idx_timetable_batch_week ON timetable(batch_id, week_number, academic_year);
CREATE INDEX idx_faculty_subjects_faculty ON faculty_subjects(faculty_id);
CREATE INDEX idx_batch_subjects_batch ON batch_subjects(batch_id);
CREATE INDEX idx_faculty_leaves_date ON faculty_leaves(faculty_id, leave_date);

-- ========================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE faculty IS 'Faculty members with workload constraints';
COMMENT ON TABLE faculty_leaves IS 'Tracks faculty leave/absence for scheduling';
COMMENT ON TABLE scheduling_constraints IS 'Handles: fixed_slots, faculty_unavailable, classroom_unavailable, batch_unavailable';
COMMENT ON COLUMN batches.shift IS 'morning, afternoon, or evening shift';
COMMENT ON COLUMN batches.max_classes_per_day IS 'Maximum classes allowed per day for this batch';
COMMENT ON COLUMN time_slots.shift IS 'Which shift this time slot belongs to';
COMMENT ON COLUMN timetable.status IS 'draft, pending, approved, or rejected';
COMMENT ON COLUMN faculty.max_classes_per_day IS 'Maximum classes faculty can teach per day';
COMMENT ON COLUMN faculty.max_classes_per_week IS 'Maximum classes faculty can teach per week';

-- ========================================
-- INSERT SAMPLE DATA
-- ========================================

-- Sample Faculty (with workload constraints)
INSERT INTO faculty (name, subject, email, phone, max_classes_per_day, max_classes_per_week, preferred_shift) VALUES
('Dr. John Smith', 'Mathematics', 'john.smith@college.edu', '+1234567890', 5, 24, 'morning'),
('Dr. Sarah Johnson', 'Physics', 'sarah.johnson@college.edu', '+1234567891', 5, 24, 'morning'),
('Prof. Mike Brown', 'Chemistry', 'mike.brown@college.edu', '+1234567892', 4, 20, 'afternoon');

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

-- Sample Batches (with shift and max classes)
INSERT INTO batches (name, year, semester, student_count, department, shift, max_classes_per_day) VALUES
('CSE-A-2024', 1, 1, 58, 'Computer Science', 'morning', 6),
('CSE-B-2024', 1, 1, 55, 'Computer Science', 'morning', 6),
('ECE-A-2024', 1, 1, 62, 'Electronics', 'afternoon', 6),
('MECH-A-2024', 1, 1, 60, 'Mechanical', 'afternoon', 6);

-- Sample Time Slots (Monday to Friday, 6 periods per day with shift info)
INSERT INTO time_slots (day_of_week, start_time, end_time, period_name, is_break, shift) VALUES
-- Monday (Morning shift)
(1, '09:00', '09:50', 'Period 1', FALSE, 'morning'),
(1, '09:50', '10:40', 'Period 2', FALSE, 'morning'),
(1, '10:40', '11:00', 'Break 1', TRUE, 'morning'),
(1, '11:00', '11:50', 'Period 3', FALSE, 'morning'),
(1, '11:50', '12:40', 'Period 4', FALSE, 'morning'),
(1, '12:40', '13:30', 'Lunch Break', TRUE, 'afternoon'),
(1, '13:30', '14:20', 'Period 5', FALSE, 'afternoon'),
(1, '14:20', '15:10', 'Period 6', FALSE, 'afternoon'),

-- Tuesday
(2, '09:00', '09:50', 'Period 1', FALSE, 'morning'),
(2, '09:50', '10:40', 'Period 2', FALSE, 'morning'),
(2, '10:40', '11:00', 'Break 1', TRUE, 'morning'),
(2, '11:00', '11:50', 'Period 3', FALSE, 'morning'),
(2, '11:50', '12:40', 'Period 4', FALSE, 'morning'),
(2, '12:40', '13:30', 'Lunch Break', TRUE, 'afternoon'),
(2, '13:30', '14:20', 'Period 5', FALSE, 'afternoon'),
(2, '14:20', '15:10', 'Period 6', FALSE, 'afternoon'),

-- Wednesday
(3, '09:00', '09:50', 'Period 1', FALSE, 'morning'),
(3, '09:50', '10:40', 'Period 2', FALSE, 'morning'),
(3, '10:40', '11:00', 'Break 1', TRUE, 'morning'),
(3, '11:00', '11:50', 'Period 3', FALSE, 'morning'),
(3, '11:50', '12:40', 'Period 4', FALSE, 'morning'),
(3, '12:40', '13:30', 'Lunch Break', TRUE, 'afternoon'),
(3, '13:30', '14:20', 'Period 5', FALSE, 'afternoon'),
(3, '14:20', '15:10', 'Period 6', FALSE, 'afternoon'),

-- Thursday
(4, '09:00', '09:50', 'Period 1', FALSE, 'morning'),
(4, '09:50', '10:40', 'Period 2', FALSE, 'morning'),
(4, '10:40', '11:00', 'Break 1', TRUE, 'morning'),
(4, '11:00', '11:50', 'Period 3', FALSE, 'morning'),
(4, '11:50', '12:40', 'Period 4', FALSE, 'morning'),
(4, '12:40', '13:30', 'Lunch Break', TRUE, 'afternoon'),
(4, '13:30', '14:20', 'Period 5', FALSE, 'afternoon'),
(4, '14:20', '15:10', 'Period 6', FALSE, 'afternoon'),

-- Friday
(5, '09:00', '09:50', 'Period 1', FALSE, 'morning'),
(5, '09:50', '10:40', 'Period 2', FALSE, 'morning'),
(5, '10:40', '11:00', 'Break 1', TRUE, 'morning'),
(5, '11:00', '11:50', 'Period 3', FALSE, 'morning'),
(5, '11:50', '12:40', 'Period 4', FALSE, 'morning'),
(5, '12:40', '13:30', 'Lunch Break', TRUE, 'afternoon'),
(5, '13:30', '14:20', 'Period 5', FALSE, 'afternoon'),
(5, '14:20', '15:10', 'Period 6', FALSE, 'afternoon');

-- Sample Faculty-Subject Relationships
INSERT INTO faculty_subjects (faculty_id, subject_id, preference_level) VALUES
(1, 1, 1), -- Dr. John Smith teaches Mathematics (High preference)
(1, 4, 2), -- Dr. John Smith can teach Computer Science (Medium preference)
(2, 2, 1), -- Dr. Sarah Johnson teaches Physics (High preference)
(2, 3, 2); -- Dr. Sarah Johnson can teach Chemistry (Medium preference)

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

-- Sample Faculty Leaves
INSERT INTO faculty_leaves (faculty_id, leave_date, leave_type, reason, is_approved) VALUES
(1, '2025-10-15', 'planned', 'Conference attendance', TRUE),
(2, '2025-10-20', 'sick', 'Medical appointment', TRUE),
(1, '2025-10-25', 'casual', 'Personal work', FALSE);

-- Sample Scheduling Constraints
-- Fixed slot: Library period every Monday at 2pm
INSERT INTO scheduling_constraints (type, entity_id, time_slot_id, reason, is_active) VALUES
('fixed_slot', 1, 7, 'Library period - Fixed every Monday 2pm-3pm', TRUE);

-- Faculty unavailable on specific day
INSERT INTO scheduling_constraints (type, entity_id, day_of_week, reason, is_active) VALUES
('faculty_unavailable', 1, 5, 'Research day - No teaching on Fridays', TRUE);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- View all tables with counts
SELECT 'faculty' as table_name, COUNT(*) as count FROM faculty
UNION SELECT 'users', COUNT(*) FROM users
UNION SELECT 'subjects', COUNT(*) FROM subjects
UNION SELECT 'classrooms', COUNT(*) FROM classrooms
UNION SELECT 'batches', COUNT(*) FROM batches
UNION SELECT 'time_slots', COUNT(*) FROM time_slots
UNION SELECT 'faculty_subjects', COUNT(*) FROM faculty_subjects
UNION SELECT 'batch_subjects', COUNT(*) FROM batch_subjects
UNION SELECT 'timetable', COUNT(*) FROM timetable
UNION SELECT 'scheduling_constraints', COUNT(*) FROM scheduling_constraints
UNION SELECT 'faculty_leaves', COUNT(*) FROM faculty_leaves
ORDER BY table_name;

-- View batches with new fields
SELECT id, name, department, shift, max_classes_per_day FROM batches;

-- View faculty with workload constraints
SELECT id, name, subject, max_classes_per_day, max_classes_per_week, preferred_shift FROM faculty;

-- View faculty leaves
SELECT fl.id, f.name, fl.leave_date, fl.leave_type, fl.reason, fl.is_approved
FROM faculty_leaves fl
JOIN faculty f ON fl.faculty_id = f.id;

-- View scheduling constraints
SELECT id, type, entity_id, time_slot_id, day_of_week, reason, is_active
FROM scheduling_constraints
WHERE is_active = TRUE;