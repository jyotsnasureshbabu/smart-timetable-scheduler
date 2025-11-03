const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/timetable - Get timetable with filters
router.get('/', async (req, res) => {
  try {
    const { batch_id, faculty_id, academic_year } = req.query;
    let query = `
      SELECT 
        t.*,
        b.name as batch_name,
        s.name as subject_name,
        s.code as subject_code,
        f.name as faculty_name,
        c.name as classroom_name,
        ts.day_of_week,
        ts.start_time,
        ts.end_time,
        ts.period_name,
        CASE ts.day_of_week 
          WHEN 1 THEN 'Monday'
          WHEN 2 THEN 'Tuesday'
          WHEN 3 THEN 'Wednesday'
          WHEN 4 THEN 'Thursday'
          WHEN 5 THEN 'Friday'
          WHEN 6 THEN 'Saturday'
          WHEN 7 THEN 'Sunday'
        END as day_name
      FROM timetable t
      JOIN batches b ON t.batch_id = b.id
      JOIN subjects s ON t.subject_id = s.id
      JOIN faculty f ON t.faculty_id = f.id
      JOIN classrooms c ON t.classroom_id = c.id
      JOIN time_slots ts ON t.time_slot_id = ts.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (batch_id) {
      paramCount++;
      query += ` AND t.batch_id = $${paramCount}`;
      params.push(batch_id);
    }

    if (faculty_id) {
      paramCount++;
      query += ` AND t.faculty_id = $${paramCount}`;
      params.push(faculty_id);
    }

    if (academic_year) {
      paramCount++;
      query += ` AND t.academic_year = $${paramCount}`;
      params.push(academic_year);
    }

    query += ' ORDER BY ts.day_of_week, ts.start_time';

    const result = await pool.query(query, params);
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (err) {
    console.error('Error fetching timetable:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch timetable' 
    });
  }
});

// POST /api/timetable - Create timetable entry
router.post('/', async (req, res) => {
  try {
    const { batch_id, subject_id, faculty_id, classroom_id, time_slot_id, academic_year, semester } = req.body;
    
    // Check for conflicts
    const conflicts = await pool.query(`
      SELECT 'batch' as conflict_type FROM timetable WHERE batch_id = $1 AND time_slot_id = $2
      UNION
      SELECT 'faculty' as conflict_type FROM timetable WHERE faculty_id = $3 AND time_slot_id = $2
      UNION
      SELECT 'classroom' as conflict_type FROM timetable WHERE classroom_id = $4 AND time_slot_id = $2
    `, [batch_id, time_slot_id, faculty_id, classroom_id]);

    if (conflicts.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Schedule conflict detected', 
        conflicts: conflicts.rows.map(row => row.conflict_type)
      });
    }

    const result = await pool.query(
      'INSERT INTO timetable (batch_id, subject_id, faculty_id, classroom_id, time_slot_id, academic_year, semester) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [batch_id, subject_id, faculty_id, classroom_id, time_slot_id, academic_year, semester]
    );
    
    res.status(201).json({
      success: true,
      message: 'Timetable entry created successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating timetable entry:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create timetable entry' 
    });
  }
});

module.exports = router;