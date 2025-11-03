// controllers/reportsController.js
const pool = require('../config/database');

const reportsController = {
  // Faculty workload report
  getFacultyWorkload: async (req, res) => {
    try {
      const { academic_year, semester } = req.query;
      
      let query = `
        SELECT 
          f.id,
          f.name,
          f.subject as department,
          COUNT(t.id) as total_periods,
          COUNT(DISTINCT t.batch_id) as batches_taught,
          COUNT(DISTINCT t.subject_id) as subjects_taught,
          json_agg(DISTINCT jsonb_build_object(
            'subject', s.name,
            'periods', (
              SELECT COUNT(*) 
              FROM timetable 
              WHERE faculty_id = f.id AND subject_id = s.id
            )
          )) as subject_breakdown
        FROM faculty f
        LEFT JOIN timetable t ON f.id = t.faculty_id
        LEFT JOIN subjects s ON t.subject_id = s.id
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 0;
      
      if (academic_year) {
        paramCount++;
        query += ` AND t.academic_year = $${paramCount}`;
        params.push(academic_year);
      }
      
      if (semester) {
        paramCount++;
        query += ` AND t.semester = $${paramCount}`;
        params.push(semester);
      }
      
      query += ` GROUP BY f.id, f.name, f.subject ORDER BY total_periods DESC`;
      
      const result = await pool.query(query, params);
      
      res.json({
        success: true,
        message: 'Faculty workload report generated',
        data: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error generating faculty workload report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate faculty workload report',
        message: error.message
      });
    }
  },

  // Classroom utilization report
  getClassroomUtilization: async (req, res) => {
    try {
      const { academic_year, semester } = req.query;
      
      let query = `
        SELECT 
          c.id,
          c.name,
          c.type,
          c.capacity,
          c.building,
          COUNT(t.id) as periods_used,
          ROUND(COUNT(t.id) * 100.0 / 30.0, 2) as utilization_percentage,
          json_agg(DISTINCT jsonb_build_object(
            'day', CASE ts.day_of_week 
              WHEN 1 THEN 'Monday'
              WHEN 2 THEN 'Tuesday'
              WHEN 3 THEN 'Wednesday'
              WHEN 4 THEN 'Thursday'
              WHEN 5 THEN 'Friday'
            END,
            'periods', (
              SELECT COUNT(*) 
              FROM timetable t2
              JOIN time_slots ts2 ON t2.time_slot_id = ts2.id
              WHERE t2.classroom_id = c.id AND ts2.day_of_week = ts.day_of_week
            )
          )) as daily_usage
        FROM classrooms c
        LEFT JOIN timetable t ON c.id = t.classroom_id
        LEFT JOIN time_slots ts ON t.time_slot_id = ts.id
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 0;
      
      if (academic_year) {
        paramCount++;
        query += ` AND t.academic_year = $${paramCount}`;
        params.push(academic_year);
      }
      
      if (semester) {
        paramCount++;
        query += ` AND t.semester = $${paramCount}`;
        params.push(semester);
      }
      
      query += ` GROUP BY c.id, c.name, c.type, c.capacity, c.building ORDER BY utilization_percentage DESC`;
      
      const result = await pool.query(query, params);
      
      res.json({
        success: true,
        message: 'Classroom utilization report generated',
        data: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error generating classroom utilization report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate classroom utilization report',
        message: error.message
      });
    }
  },

  // Timetable completeness report
  getTimetableCompleteness: async (req, res) => {
    try {
      const { academic_year, semester } = req.query;
      
      let query = `
        SELECT 
          b.id as batch_id,
          b.name as batch_name,
          b.department,
          COUNT(DISTINCT t.subject_id) as subjects_scheduled,
          (SELECT COUNT(*) FROM batch_subjects WHERE batch_id = b.id) as total_subjects,
          COUNT(t.id) as periods_scheduled,
          (SELECT SUM(hours_per_week) FROM batch_subjects bs JOIN subjects s ON bs.subject_id = s.id WHERE bs.batch_id = b.id) as total_periods_required,
          ROUND(COUNT(t.id) * 100.0 / NULLIF((SELECT SUM(hours_per_week) FROM batch_subjects bs JOIN subjects s ON bs.subject_id = s.id WHERE bs.batch_id = b.id), 0), 2) as completion_percentage,
          CASE 
            WHEN COUNT(t.id) >= (SELECT SUM(hours_per_week) FROM batch_subjects bs JOIN subjects s ON bs.subject_id = s.id WHERE bs.batch_id = b.id) 
            THEN 'Complete'
            WHEN COUNT(t.id) > 0 
            THEN 'Partial'
            ELSE 'Not Started'
          END as status
        FROM batches b
        LEFT JOIN timetable t ON b.id = t.batch_id
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 0;
      
      if (academic_year) {
        paramCount++;
        query += ` AND t.academic_year = $${paramCount}`;
        params.push(academic_year);
      }
      
      if (semester) {
        paramCount++;
        query += ` AND t.semester = $${paramCount}`;
        params.push(semester);
      }
      
      query += ` GROUP BY b.id, b.name, b.department ORDER BY completion_percentage DESC`;
      
      const result = await pool.query(query, params);
      
      res.json({
        success: true,
        message: 'Timetable completeness report generated',
        data: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error generating completeness report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate completeness report',
        message: error.message
      });
    }
  },

  // Conflict detection report
  getConflicts: async (req, res) => {
    try {
      const { academic_year, semester } = req.query;
      
      let baseCondition = '1=1';
      const params = [];
      let paramCount = 0;
      
      if (academic_year) {
        paramCount++;
        baseCondition += ` AND t1.academic_year = $${paramCount}`;
        params.push(academic_year);
      }
      
      if (semester) {
        paramCount++;
        baseCondition += ` AND t1.semester = $${paramCount}`;
        params.push(semester);
      }

      // Faculty conflicts
      const facultyConflicts = await pool.query(`
        SELECT 
          'Faculty Double Booking' as conflict_type,
          f.name as entity_name,
          ts.day_of_week,
          CASE ts.day_of_week 
            WHEN 1 THEN 'Monday'
            WHEN 2 THEN 'Tuesday'
            WHEN 3 THEN 'Wednesday'
            WHEN 4 THEN 'Thursday'
            WHEN 5 THEN 'Friday'
          END as day_name,
          ts.start_time,
          ts.end_time,
          COUNT(*) as conflict_count,
          json_agg(jsonb_build_object(
            'batch', b.name,
            'subject', s.name
          )) as conflicting_classes
        FROM timetable t1
        JOIN timetable t2 ON t1.faculty_id = t2.faculty_id 
          AND t1.time_slot_id = t2.time_slot_id 
          AND t1.id < t2.id
        JOIN faculty f ON t1.faculty_id = f.id
        JOIN time_slots ts ON t1.time_slot_id = ts.id
        JOIN batches b ON t1.batch_id = b.id
        JOIN subjects s ON t1.subject_id = s.id
        WHERE ${baseCondition}
        GROUP BY f.name, ts.day_of_week, ts.start_time, ts.end_time
      `, params);

      // Classroom conflicts
      const classroomConflicts = await pool.query(`
        SELECT 
          'Classroom Double Booking' as conflict_type,
          c.name as entity_name,
          ts.day_of_week,
          CASE ts.day_of_week 
            WHEN 1 THEN 'Monday'
            WHEN 2 THEN 'Tuesday'
            WHEN 3 THEN 'Wednesday'
            WHEN 4 THEN 'Thursday'
            WHEN 5 THEN 'Friday'
          END as day_name,
          ts.start_time,
          ts.end_time,
          COUNT(*) as conflict_count,
          json_agg(jsonb_build_object(
            'batch', b.name,
            'subject', s.name
          )) as conflicting_classes
        FROM timetable t1
        JOIN timetable t2 ON t1.classroom_id = t2.classroom_id 
          AND t1.time_slot_id = t2.time_slot_id 
          AND t1.id < t2.id
        JOIN classrooms c ON t1.classroom_id = c.id
        JOIN time_slots ts ON t1.time_slot_id = ts.id
        JOIN batches b ON t1.batch_id = b.id
        JOIN subjects s ON t1.subject_id = s.id
        WHERE ${baseCondition}
        GROUP BY c.name, ts.day_of_week, ts.start_time, ts.end_time
      `, params);

      const allConflicts = [
        ...facultyConflicts.rows,
        ...classroomConflicts.rows
      ];

      res.json({
        success: true,
        message: 'Conflict detection report generated',
        totalConflicts: allConflicts.length,
        conflicts: allConflicts,
        summary: {
          facultyConflicts: facultyConflicts.rows.length,
          classroomConflicts: classroomConflicts.rows.length
        }
      });
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to detect conflicts',
        message: error.message
      });
    }
  },

  // Overall dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      const { academic_year = 2024, semester = 1 } = req.query;
      
      const stats = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM faculty) as total_faculty,
          (SELECT COUNT(*) FROM subjects) as total_subjects,
          (SELECT COUNT(*) FROM classrooms) as total_classrooms,
          (SELECT COUNT(*) FROM batches) as total_batches,
          (SELECT COUNT(*) FROM timetable WHERE academic_year = $1 AND semester = $2) as total_periods,
          (SELECT COUNT(DISTINCT faculty_id) FROM timetable WHERE academic_year = $1 AND semester = $2) as active_faculty,
          (SELECT COUNT(DISTINCT classroom_id) FROM timetable WHERE academic_year = $1 AND semester = $2) as utilized_classrooms,
          (SELECT COUNT(*) FROM batch_subjects) as total_subject_assignments
      `, [academic_year, semester]);
      
      res.json({
        success: true,
        message: 'Dashboard statistics generated',
        data: stats.rows[0]
      });
    } catch (error) {
      console.error('Error generating dashboard stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate dashboard statistics',
        message: error.message
      });
    }
  }
};

module.exports = reportsController;