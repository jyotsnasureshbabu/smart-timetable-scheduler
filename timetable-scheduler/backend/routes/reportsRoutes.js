const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/reports/summary - Dashboard summary
router.get('/summary', async (req, res) => {
  try {
    const summary = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM faculty) AS faculty_count,
        (SELECT COUNT(*) FROM subjects) AS subject_count,
        (SELECT COUNT(*) FROM classrooms) AS classroom_count,
        (SELECT COUNT(*) FROM batches) AS batch_count,
        (SELECT COUNT(*) FROM timetable) AS timetable_entries
    `);
    res.json({
      success: true,
      data: summary.rows[0]
    });
  } catch (err) {
    console.error('Error fetching summary:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch summary' 
    });
  }
});

// GET /api/reports/faculty-workload - Faculty workload report
router.get('/faculty-workload', async (req, res) => {
  try {
    const { academic_year, semester } = req.query;
    
    let query = `
      SELECT 
        f.id,
        f.name,
        f.email,
        COUNT(t.id) as total_classes,
        COUNT(DISTINCT t.subject_id) as subjects_taught,
        COUNT(DISTINCT t.batch_id) as batches_taught,
        json_agg(DISTINCT s.name) as subject_names
      FROM faculty f
      LEFT JOIN timetable t ON f.id = t.faculty_id
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE 1=1
    `;
    
    const params = [];
    if (academic_year) {
      params.push(academic_year);
      query += ` AND t.academic_year = $${params.length}`;
    }
    if (semester) {
      params.push(semester);
      query += ` AND t.semester = $${params.length}`;
    }
    
    query += ` GROUP BY f.id, f.name, f.email ORDER BY total_classes DESC`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (err) {
    console.error('Error fetching faculty workload:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch faculty workload' 
    });
  }
});

// GET /api/reports/classroom-utilization - Classroom utilization report
router.get('/classroom-utilization', async (req, res) => {
  try {
    const { academic_year, semester } = req.query;
    
    let query = `
      SELECT 
        c.id,
        c.name,
        c.type,
        c.capacity,
        c.building,
        COUNT(t.id) as times_used,
        COUNT(DISTINCT t.batch_id) as different_batches,
        ROUND(COUNT(t.id) * 100.0 / NULLIF((SELECT COUNT(*) FROM time_slots WHERE is_break = FALSE), 0), 2) as utilization_percentage
      FROM classrooms c
      LEFT JOIN timetable t ON c.id = t.classroom_id
      WHERE 1=1
    `;
    
    const params = [];
    if (academic_year) {
      params.push(academic_year);
      query += ` AND t.academic_year = $${params.length}`;
    }
    if (semester) {
      params.push(semester);
      query += ` AND t.semester = $${params.length}`;
    }
    
    query += ` GROUP BY c.id, c.name, c.type, c.capacity, c.building ORDER BY utilization_percentage DESC`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (err) {
    console.error('Error fetching classroom utilization:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch classroom utilization' 
    });
  }
});

// GET /api/reports/timetable-completeness - Check timetable completeness
router.get('/timetable-completeness', async (req, res) => {
  try {
    const { batch_id } = req.query;
    
    if (!batch_id) {
      return res.status(400).json({
        success: false,
        error: 'batch_id is required'
      });
    }
    
    // Get required hours
    const requiredQuery = await pool.query(`
      SELECT 
        s.id,
        s.name,
        bs.hours_per_week as required_hours,
        COUNT(t.id) as scheduled_hours,
        bs.hours_per_week - COUNT(t.id) as missing_hours
      FROM batch_subjects bs
      JOIN subjects s ON bs.subject_id = s.id
      LEFT JOIN timetable t ON t.subject_id = s.id AND t.batch_id = $1
      WHERE bs.batch_id = $1
      GROUP BY s.id, s.name, bs.hours_per_week
      ORDER BY missing_hours DESC
    `, [batch_id]);
    
    const totalRequired = requiredQuery.rows.reduce((sum, row) => sum + parseInt(row.required_hours), 0);
    const totalScheduled = requiredQuery.rows.reduce((sum, row) => sum + parseInt(row.scheduled_hours), 0);
    const completionRate = totalRequired > 0 ? Math.round((totalScheduled / totalRequired) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        batch_id,
        total_required_hours: totalRequired,
        total_scheduled_hours: totalScheduled,
        completion_rate: completionRate,
        subject_details: requiredQuery.rows,
        status: completionRate === 100 ? 'Complete' : 'Incomplete'
      }
    });
  } catch (err) {
    console.error('Error checking completeness:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to check timetable completeness' 
    });
  }
});

// GET /api/reports/conflicts - Find all conflicts in timetable
router.get('/conflicts', async (req, res) => {
  try {
    const { academic_year, semester } = req.query;
    
    const conflicts = [];
    
    // Find faculty conflicts
    const facultyConflicts = await pool.query(`
      SELECT 
        f.name as faculty_name,
        ts.day_of_week,
        ts.start_time,
        ts.end_time,
        COUNT(*) as conflict_count,
        json_agg(json_build_object(
          'batch', b.name,
          'subject', s.name,
          'classroom', c.name
        )) as conflicting_classes
      FROM timetable t
      JOIN faculty f ON t.faculty_id = f.id
      JOIN time_slots ts ON t.time_slot_id = ts.id
      JOIN batches b ON t.batch_id = b.id
      JOIN subjects s ON t.subject_id = s.id
      JOIN classrooms c ON t.classroom_id = c.id
      WHERE 1=1 ${academic_year ? 'AND t.academic_year = ' + academic_year : ''} ${semester ? 'AND t.semester = ' + semester : ''}
      GROUP BY f.id, f.name, ts.day_of_week, ts.start_time, ts.end_time
      HAVING COUNT(*) > 1
    `);
    
    conflicts.push(...facultyConflicts.rows.map(row => ({
      type: 'Faculty Conflict',
      ...row
    })));
    
    res.json({
      success: true,
      data: conflicts,
      total: conflicts.length,
      has_conflicts: conflicts.length > 0
    });
  } catch (err) {
    console.error('Error finding conflicts:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to find conflicts' 
    });
  }
});

module.exports = router;