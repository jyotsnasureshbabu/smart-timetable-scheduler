// Fixed server.js with better error handling
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const pool = require('./config/database');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
const testDatabaseConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('🎉 Database connected successfully at:', result.rows[0].now);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Make sure PostgreSQL is running and .env file is configured correctly');
  }
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Welcome to Timetable Scheduler API',
    version: '1.0.0',
    endpoints: {
      'Get All Faculty': 'GET /api/faculty',
      'Get Faculty by ID': 'GET /api/faculty/:id',
      'Create Faculty': 'POST /api/faculty',
      'Update Faculty': 'PUT /api/faculty/:id',
      'Delete Faculty': 'DELETE /api/faculty/:id'
    },
    status: 'Server is running successfully!'
  });
});

// Add a test endpoint to verify server is working
app.get('/test', (req, res) => {
  res.json({
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
});

// ============= IMPORT ALL ROUTES =============

// Import and use faculty routes
try {
  const facultyRoutes = require('./routes/facultyRoutes');
  app.use('/api/faculty', facultyRoutes);
  console.log('✅ Faculty routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading faculty routes:', error.message);
}

// Import constraint routes
try {
  const constraintRoutes = require('./routes/constraintRoutes');
  app.use('/api/constraints', constraintRoutes);
  console.log('✅ Constraint routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading constraint routes:', error.message);
}

// Import timetable approval routes
try {
  const approvalRoutes = require('./routes/timetableApprovalRoutes');
  app.use('/api/timetable-approval', approvalRoutes);
  console.log('✅ Timetable approval routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading timetable approval routes:', error.message);
}

// Import faculty leave routes
try {
  const facultyLeaveRoutes = require('./routes/facultyLeaveRoutes');
  app.use('/api/faculty-leaves', facultyLeaveRoutes);
  console.log('✅ Faculty leave routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading faculty leave routes:', error.message);
}

// Import authentication routes
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
}

// Import subject routes
try {
  const subjectRoutes = require('./routes/subjectRoutes');
  app.use('/api/subjects', subjectRoutes);
  console.log('✅ Subject routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading subject routes:', error.message);
}

// Import classroom routes
try {
  const classroomRoutes = require('./routes/classroomRoutes');
  app.use('/api/classrooms', classroomRoutes);
  console.log('✅ Classroom routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading classroom routes:', error.message);
}

// Import batch routes
try {
  const batchRoutes = require('./routes/batchRoutes');
  app.use('/api/batches', batchRoutes);
  console.log('✅ Batch routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading batch routes:', error.message);
}

// Import time slot routes
try {
  const timeSlotRoutes = require('./routes/timeSlotRoutes');
  app.use('/api/time-slots', timeSlotRoutes);
  console.log('✅ Time slot routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading time slot routes:', error.message);
}

// Import timetable routes
try {
  const timetableRoutes = require('./routes/timetableRoutes');
  app.use('/api/timetable', timetableRoutes);
  console.log('✅ Timetable routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading timetable routes:', error.message);
}

// Import reports routes
try {
  const reportsRoutes = require('./routes/reportsRoutes');
  app.use('/api/reports', reportsRoutes);
  console.log('✅ Reports routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading reports routes:', error.message);
}

// ============= RELATIONSHIPS ROUTES =============

// Faculty-Subject relationships
app.get('/api/faculty/:id/subjects', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT s.*, fs.preference_level
      FROM subjects s
      JOIN faculty_subjects fs ON s.id = fs.subject_id
      WHERE fs.faculty_id = $1
      ORDER BY fs.preference_level, s.name
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching faculty subjects:', err);
    res.status(500).json({ error: 'Failed to fetch faculty subjects' });
  }
});

app.post('/api/faculty/:facultyId/subjects/:subjectId', async (req, res) => {
  try {
    const { facultyId, subjectId } = req.params;
    const { preference_level } = req.body;
    const result = await pool.query(
      'INSERT INTO faculty_subjects (faculty_id, subject_id, preference_level) VALUES ($1, $2, $3) RETURNING *',
      [facultyId, subjectId, preference_level || 3]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error assigning subject to faculty:', err);
    res.status(500).json({ error: 'Failed to assign subject to faculty' });
  }
});

// Batch-Subject relationships
app.get('/api/batches/:id/subjects', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT s.*, bs.hours_per_week
      FROM subjects s
      JOIN batch_subjects bs ON s.id = bs.subject_id
      WHERE bs.batch_id = $1
      ORDER BY s.name
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching batch subjects:', err);
    res.status(500).json({ error: 'Failed to fetch batch subjects' });
  }
});

app.post('/api/batches/:batchId/subjects/:subjectId', async (req, res) => {
  try {
    const { batchId, subjectId } = req.params;
    const { hours_per_week } = req.body;
    const result = await pool.query(
      'INSERT INTO batch_subjects (batch_id, subject_id, hours_per_week) VALUES ($1, $2, $3) RETURNING *',
      [batchId, subjectId, hours_per_week || 4]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error assigning subject to batch:', err);
    res.status(500).json({ error: 'Failed to assign subject to batch' });
  }
});

// ============= SUMMARY ROUTE =============
app.get('/api/summary', async (req, res) => {
  try {
    const summary = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM faculty) AS faculty_count,
        (SELECT COUNT(*) FROM subjects) AS subject_count,
        (SELECT COUNT(*) FROM classrooms) AS classroom_count,
        (SELECT COUNT(*) FROM batches) AS batch_count,
        (SELECT COUNT(*) FROM timetable) AS timetable_entries
    `);
    res.json(summary.rows[0]);
  } catch (err) {
    console.error('Error fetching summary:', err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// ============= AUTOMATIC SCHEDULING ALGORITHM =============

class TimetableScheduler {
  constructor(pool) {
    this.pool = pool;
  }

  async generateTimetable(batchId, academicYear = 2024, semester = 1) {
    try {
      console.log(`🚀 Starting automatic timetable generation for batch ${batchId}`);
      
      await this.clearExistingTimetable(batchId, academicYear, semester);
      const data = await this.gatherSchedulingData(batchId);
      const schedule = await this.intelligentScheduling(data, academicYear, semester);
      const savedSchedule = await this.saveSchedule(schedule);
      
      console.log(`✅ Timetable generated successfully! Created ${savedSchedule.length} schedule entries`);
      
      return {
        success: true,
        message: `Timetable generated successfully for batch ${data.batch.name}`,
        entries: savedSchedule.length,
        schedule: savedSchedule,
        statistics: this.calculateScheduleStats(savedSchedule, data)
      };
      
    } catch (error) {
      console.error('❌ Error generating timetable:', error);
      throw new Error(`Timetable generation failed: ${error.message}`);
    }
  }

  async clearExistingTimetable(batchId, academicYear, semester) {
    const result = await this.pool.query(
      'DELETE FROM timetable WHERE batch_id = $1 AND academic_year = $2 AND semester = $3',
      [batchId, academicYear, semester]
    );
    console.log(`🗑️ Cleared ${result.rowCount} existing timetable entries`);
  }

  async gatherSchedulingData(batchId) {
    console.log('📊 Gathering scheduling data...');

    const batchResult = await this.pool.query('SELECT * FROM batches WHERE id = $1', [batchId]);
    if (batchResult.rows.length === 0) {
      throw new Error(`Batch with ID ${batchId} not found`);
    }
    const batch = batchResult.rows[0];

    const subjectsResult = await this.pool.query(`
      SELECT s.*, bs.hours_per_week
      FROM subjects s
      JOIN batch_subjects bs ON s.id = bs.subject_id
      WHERE bs.batch_id = $1
      ORDER BY bs.hours_per_week DESC
    `, [batchId]);

    const facultyResult = await this.pool.query(`
      SELECT 
        f.*,
        json_agg(
          json_build_object(
            'subject_id', fs.subject_id,
            'subject_name', s.name,
            'preference_level', fs.preference_level
          )
        ) as subjects
      FROM faculty f
      JOIN faculty_subjects fs ON f.id = fs.faculty_id
      JOIN subjects s ON fs.subject_id = s.id
      GROUP BY f.id, f.name, f.subject, f.email, f.phone, f.created_at
    `);

    const classroomsResult = await this.pool.query(`
      SELECT * FROM classrooms 
      WHERE capacity >= $1 
      ORDER BY type, capacity
    `, [batch.student_count]);

    const timeSlotsResult = await this.pool.query(`
      SELECT *, 
        CASE day_of_week 
          WHEN 1 THEN 'Monday'
          WHEN 2 THEN 'Tuesday' 
          WHEN 3 THEN 'Wednesday'
          WHEN 4 THEN 'Thursday'
          WHEN 5 THEN 'Friday'
        END as day_name
      FROM time_slots 
      WHERE is_break = FALSE 
        AND day_of_week BETWEEN 1 AND 5
      ORDER BY day_of_week, start_time
    `);

    // Fetch active constraints
    const constraintsResult = await this.pool.query(`
      SELECT * FROM scheduling_constraints
      WHERE is_active = TRUE
    `);

    // Fetch faculty leaves for current/upcoming dates
    const leavesResult = await this.pool.query(`
      SELECT faculty_id, leave_date
      FROM faculty_leaves
      WHERE is_approved = TRUE
      AND leave_date >= CURRENT_DATE
    `);

    // Fetch fixed slots
    const fixedSlotsResult = await this.pool.query(`
      SELECT * FROM scheduling_constraints
      WHERE type = 'fixed_slot' AND is_active = TRUE
    `);

    return {
      batch,
      subjects: subjectsResult.rows,
      faculty: facultyResult.rows,
      classrooms: classroomsResult.rows,
      timeSlots: timeSlotsResult.rows,
      constraints: constraintsResult.rows,
      facultyLeaves: leavesResult.rows,
      fixedSlots: fixedSlotsResult.rows,
      maxClassesPerDay: 8
    };
  }

  async intelligentScheduling(data, academicYear, semester) {
    console.log('🧠 Running intelligent scheduling algorithm...');
    
    const schedule = [];
    const usedSlots = new Set();
    const facultySchedule = new Map();
    const classroomSchedule = new Map();
    
    const subjectRequirements = [];
    data.subjects.forEach(subject => {
      for (let i = 0; i < subject.hours_per_week; i++) {
        subjectRequirements.push({
          ...subject,
          scheduleIndex: i + 1
        });
      }
    });

    console.log(`📋 Need to schedule ${subjectRequirements.length} total periods`);

    subjectRequirements.sort((a, b) => b.hours_per_week - a.hours_per_week);

    for (const subjectReq of subjectRequirements) {
      const assignment = await this.findBestAssignment(
        subjectReq, 
        data, 
        usedSlots, 
        facultySchedule, 
        classroomSchedule
      );

      if (assignment) {
        schedule.push({
          batch_id: data.batch.id,
          subject_id: subjectReq.id,
          faculty_id: assignment.faculty.id,
          classroom_id: assignment.classroom.id,
          time_slot_id: assignment.timeSlot.id,
          academic_year: academicYear,
          semester: semester,
          metadata: {
            subject_name: subjectReq.name,
            faculty_name: assignment.faculty.name,
            classroom_name: assignment.classroom.name,
            day_name: assignment.timeSlot.day_name,
            time: `${assignment.timeSlot.start_time}-${assignment.timeSlot.end_time}`,
            preference_level: assignment.preferenceLevel
          }
        });

        usedSlots.add(assignment.timeSlot.id);
        
        if (!facultySchedule.has(assignment.faculty.id)) {
          facultySchedule.set(assignment.faculty.id, []);
        }
        facultySchedule.get(assignment.faculty.id).push(assignment.timeSlot.id);
        
        if (!classroomSchedule.has(assignment.classroom.id)) {
          classroomSchedule.set(assignment.classroom.id, []);
        }
        classroomSchedule.get(assignment.classroom.id).push(assignment.timeSlot.id);
        
        console.log(`✅ Scheduled: ${subjectReq.name} with ${assignment.faculty.name} in ${assignment.classroom.name} on ${assignment.timeSlot.day_name} ${assignment.timeSlot.period_name}`);
      } else {
        console.warn(`⚠️ Could not schedule: ${subjectReq.name} (attempt ${subjectReq.scheduleIndex})`);
      }
    }

    return schedule;
  }

  async findBestAssignment(subjectReq, data, usedSlots, facultySchedule, classroomSchedule) {
    const availableFaculty = data.faculty.filter(faculty =>
      faculty.subjects.some(s => s.subject_id === subjectReq.id)
    );

    if (availableFaculty.length === 0) {
      console.warn(`⚠️ No faculty available for subject: ${subjectReq.name}`);
      return null;
    }

    // Check for fixed slots for this subject
    const fixedSlot = data.fixedSlots.find(fs => fs.entity_id === subjectReq.id);
    if (fixedSlot) {
      const timeSlot = data.timeSlots.find(ts => ts.id === fixedSlot.time_slot_id);
      if (timeSlot && !usedSlots.has(timeSlot.id)) {
        for (const faculty of availableFaculty) {
          if (this.isFacultyAvailable(faculty, timeSlot, data, facultySchedule)) {
            for (const classroom of data.classrooms) {
              if (!classroomSchedule.has(classroom.id) || 
                  !classroomSchedule.get(classroom.id).includes(timeSlot.id)) {
                if (this.isClassroomSuitable(classroom, subjectReq)) {
                  const subjectInfo = faculty.subjects.find(s => s.subject_id === subjectReq.id);
                  return {
                    faculty,
                    classroom,
                    timeSlot,
                    preferenceLevel: subjectInfo.preference_level,
                    isFixedSlot: true
                  };
                }
              }
            }
          }
        }
      }
      console.warn(`⚠️ Could not schedule fixed slot for: ${subjectReq.name}`);
      return null;
    }

    // Normal scheduling (not a fixed slot)
    for (const timeSlot of data.timeSlots) {
      if (usedSlots.has(timeSlot.id)) continue;

      // Check if batch has reached max classes for this day
      const dayScheduleCount = Array.from(usedSlots).filter(slotId => {
        const slot = data.timeSlots.find(ts => ts.id === slotId);
        return slot && slot.day_of_week === timeSlot.day_of_week;
      }).length;

      if (dayScheduleCount >= data.maxClassesPerDay) {
        continue;
      }

      for (const faculty of availableFaculty) {
        if (!this.isFacultyAvailable(faculty, timeSlot, data, facultySchedule)) {
          continue;
        }

        const subjectInfo = faculty.subjects.find(s => s.subject_id === subjectReq.id);

        for (const classroom of data.classrooms) {
          if (classroomSchedule.has(classroom.id) &&
              classroomSchedule.get(classroom.id).includes(timeSlot.id)) continue;

          if (this.isClassroomSuitable(classroom, subjectReq)) {
            return {
              faculty,
              classroom,
              timeSlot,
              preferenceLevel: subjectInfo.preference_level,
              isFixedSlot: false
            };
          }
        }
      }
    }

    return null;
  }

  isClassroomSuitable(classroom, subject) {
    if (subject.name.toLowerCase().includes('lab') || 
        subject.name.toLowerCase().includes('computer')) {
      return classroom.type === 'lab';
    }
    
    if (subject.name.toLowerCase().includes('presentation') ||
        subject.name.toLowerCase().includes('seminar')) {
      return classroom.type === 'auditorium' || classroom.capacity >= 100;
    }

    return classroom.type === 'regular' || classroom.type === 'lab';
  }

  isFacultyAvailable(faculty, timeSlot, data, facultySchedule) {
    // Check if faculty already has a class at this time
    if (facultySchedule.has(faculty.id) &&
        facultySchedule.get(faculty.id).includes(timeSlot.id)) {
      return false;
    }

    // Check faculty unavailability constraints
    const facultyConstraints = data.constraints.filter(c => 
      c.type === 'faculty_unavailable' && 
      c.entity_id === faculty.id
    );

    for (const constraint of facultyConstraints) {
      if (constraint.day_of_week && constraint.day_of_week === timeSlot.day_of_week) {
        return false;
      }
      if (constraint.time_slot_id && constraint.time_slot_id === timeSlot.id) {
        return false;
      }
    }

    // Check approved leaves
    const hasLeave = data.facultyLeaves.some(leave => 
      leave.faculty_id === faculty.id
    );

    if (hasLeave) {
      return false;
    }

    return true;
  }

  async saveSchedule(schedule) {
    console.log('💾 Saving generated schedule to database...');
    const savedEntries = [];

    for (const entry of schedule) {
      try {
        const result = await this.pool.query(`
          INSERT INTO timetable 
          (batch_id, subject_id, faculty_id, classroom_id, time_slot_id, academic_year, semester)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `, [
          entry.batch_id,
          entry.subject_id, 
          entry.faculty_id,
          entry.classroom_id,
          entry.time_slot_id,
          entry.academic_year,
          entry.semester
        ]);
        
        savedEntries.push({
          ...result.rows[0],
          metadata: entry.metadata
        });
      } catch (error) {
        console.error(`❌ Failed to save schedule entry:`, error.message);
      }
    }

    return savedEntries;
  }

  calculateScheduleStats(schedule, data) {
    const stats = {
      totalPeriods: schedule.length,
      subjectsScheduled: new Set(schedule.map(s => s.subject_id)).size,
      facultyUtilized: new Set(schedule.map(s => s.faculty_id)).size,
      classroomsUsed: new Set(schedule.map(s => s.classroom_id)).size,
      dailyDistribution: {},
      facultyWorkload: {},
      completionRate: 0
    };

    schedule.forEach(entry => {
      const day = entry.metadata.day_name;
      stats.dailyDistribution[day] = (stats.dailyDistribution[day] || 0) + 1;
    });

    schedule.forEach(entry => {
      const facultyName = entry.metadata.faculty_name;
      stats.facultyWorkload[facultyName] = (stats.facultyWorkload[facultyName] || 0) + 1;
    });

    const totalRequired = data.subjects.reduce((sum, subject) => sum + subject.hours_per_week, 0);
    stats.completionRate = Math.round((schedule.length / totalRequired) * 100);

    return stats;
  }
}

// Initialize scheduler
const scheduler = new TimetableScheduler(pool);

// ============= AUTO-SCHEDULER ENDPOINTS =============

app.post('/api/auto-schedule/generate/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const { academic_year = 2024, semester = 1 } = req.body;
    
    console.log(`🚀 Auto-scheduling request for batch ${batchId}`);
    
    const result = await scheduler.generateTimetable(
      parseInt(batchId), 
      academic_year, 
      semester
    );
    
    res.json(result);
  } catch (error) {
    console.error('Auto-scheduling error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate automatic timetable',
      message: error.message
    });
  }
});

app.get('/api/auto-schedule/preview/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const data = await scheduler.gatherSchedulingData(batchId);
    
    res.json({
      batch: data.batch,
      subjects: data.subjects,
      faculty: data.faculty,
      classrooms: data.classrooms,
      timeSlots: data.timeSlots
    });
  } catch (err) {
    console.error('❌ Error in preview endpoint:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auto-schedule/analyze/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const currentSchedule = await pool.query(`
      SELECT 
        t.*,
        s.name as subject_name,
        s.hours_per_week as required_hours,
        f.name as faculty_name,
        c.name as classroom_name,
        ts.day_of_week,
        ts.period_name,
        CASE ts.day_of_week 
          WHEN 1 THEN 'Monday'
          WHEN 2 THEN 'Tuesday'
          WHEN 3 THEN 'Wednesday' 
          WHEN 4 THEN 'Thursday'
          WHEN 5 THEN 'Friday'
        END as day_name
      FROM timetable t
      JOIN subjects s ON t.subject_id = s.id
      JOIN faculty f ON t.faculty_id = f.id
      JOIN classrooms c ON t.classroom_id = c.id
      JOIN time_slots ts ON t.time_slot_id = ts.id
      WHERE t.batch_id = $1
      ORDER BY ts.day_of_week, ts.start_time
    `, [batchId]);

    const requirements = await pool.query(`
      SELECT s.*, bs.hours_per_week
      FROM subjects s
      JOIN batch_subjects bs ON s.id = bs.subject_id
      WHERE bs.batch_id = $1
    `, [batchId]);

    const analysis = {
      currentSchedule: currentSchedule.rows,
      requirements: requirements.rows,
      analysis: {
        totalScheduled: currentSchedule.rows.length,
        totalRequired: requirements.rows.reduce((sum, req) => sum + req.hours_per_week, 0),
        completionRate: 0,
        missingSubjects: [],
        overScheduled: [],
        recommendations: []
      }
    };

    const totalRequired = analysis.analysis.totalRequired;
    const totalScheduled = analysis.analysis.totalScheduled;
    analysis.analysis.completionRate = totalRequired > 0 
      ? Math.round((totalScheduled / totalRequired) * 100) 
      : 0;

    const scheduledSubjects = {};
    currentSchedule.rows.forEach(entry => {
      scheduledSubjects[entry.subject_id] = (scheduledSubjects[entry.subject_id] || 0) + 1;
    });

    requirements.rows.forEach(req => {
      const scheduled = scheduledSubjects[req.id] || 0;
      if (scheduled < req.hours_per_week) {
        analysis.analysis.missingSubjects.push({
          subject: req.name,
          required: req.hours_per_week,
          scheduled: scheduled,
          missing: req.hours_per_week - scheduled
        });
      } else if (scheduled > req.hours_per_week) {
        analysis.analysis.overScheduled.push({
          subject: req.name,
          required: req.hours_per_week,
          scheduled: scheduled,
          excess: scheduled - req.hours_per_week
        });
      }
    });

    if (analysis.analysis.missingSubjects.length > 0) {
      analysis.analysis.recommendations.push(
        `${analysis.analysis.missingSubjects.length} subjects need more periods scheduled`
      );
    }
    
    if (analysis.analysis.completionRate < 100) {
      analysis.analysis.recommendations.push(
        'Use automatic generator to complete the schedule'
      );
    }
    
    if (analysis.analysis.completionRate === 100) {
      analysis.analysis.recommendations.push(
        'Schedule is complete! All subject requirements are met.'
      );
    }

    res.json(analysis);
  } catch (error) {
    console.error('Schedule analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze schedule',
      message: error.message
    });
  }
});

app.post('/api/auto-schedule/optimize/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const { criteria = 'balance' } = req.body;
    
    const currentSchedule = await pool.query(`
      SELECT t.*, ts.day_of_week, ts.start_time
      FROM timetable t
      JOIN time_slots ts ON t.time_slot_id = ts.id
      WHERE t.batch_id = $1
      ORDER BY ts.day_of_week, ts.start_time
    `, [batchId]);

    const suggestions = [
      {
        type: 'balance',
        description: 'Distribute subjects evenly across days',
        priority: 'medium'
      },
      {
        type: 'gaps',
        description: 'Minimize gaps between classes',
        priority: 'low'  
      },
      {
        type: 'faculty_preference',
        description: 'Assign subjects to faculty with higher preferences',
        priority: 'high'
      }
    ];

    res.json({
      message: 'Schedule optimization analysis complete',
      currentEntries: currentSchedule.rows.length,
      suggestions: suggestions,
      note: 'Use auto-schedule generator for comprehensive optimization'
    });
    
  } catch (error) {
    console.error('Schedule optimization error:', error);
    res.status(500).json({
      error: 'Failed to optimize schedule',
      message: error.message
    });
  }
});

console.log('🤖 Intelligent Auto-Scheduler loaded successfully!');
// Generate multiple timetable options
app.post('/api/auto-schedule/generate-multiple/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const { academic_year = 2024, semester = 1, count = 3 } = req.body;
    
    console.log(`🚀 Generating ${count} timetable options for batch ${batchId}`);
    
    const options = [];
    
    for (let i = 0; i < count; i++) {
      // Clear previous attempt
      await pool.query(
        'DELETE FROM timetable WHERE batch_id = $1 AND academic_year = $2 AND semester = $3',
        [batchId, academic_year, semester]
      );
      
      // Generate new timetable
      const result = await scheduler.generateTimetable(
        parseInt(batchId), 
        academic_year, 
        semester
      );
      
      options.push({
        option_number: i + 1,
        ...result,
        score: calculateTimetableScore(result)
      });
      
      console.log(`✅ Generated option ${i + 1}`);
    }
    
    // Sort by score (best first)
    options.sort((a, b) => b.score - a.score);
    
    res.json({
      success: true,
      message: `Generated ${count} timetable options`,
      options: options
    });
    
  } catch (error) {
    console.error('Multiple generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate multiple timetables',
      message: error.message
    });
  }
});

// Helper function to score timetables
function calculateTimetableScore(timetableResult) {
  const stats = timetableResult.statistics;
  
  // Calculate score based on multiple factors
  let score = 0;
  
  // Completion rate (40 points max)
  score += (stats.completionRate / 100) * 40;
  
  // Even distribution across days (30 points max)
  const days = Object.values(stats.dailyDistribution);
  const avgPerDay = days.reduce((a, b) => a + b, 0) / days.length;
  const variance = days.reduce((sum, val) => sum + Math.pow(val - avgPerDay, 2), 0) / days.length;
  score += Math.max(0, 30 - variance);
  
  // Faculty workload balance (30 points max)
  const workloads = Object.values(stats.facultyWorkload);
  const avgWorkload = workloads.reduce((a, b) => a + b, 0) / workloads.length;
  const workloadVariance = workloads.reduce((sum, val) => sum + Math.pow(val - avgWorkload, 2), 0) / workloads.length;
  score += Math.max(0, 30 - workloadVariance);
  
  return Math.round(score);
}
// Get suggestions for timetable improvement
app.get('/api/auto-schedule/suggestions/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    
    const suggestions = [];
    
    // Check for gaps in schedule
    const gapsQuery = await pool.query(`
      SELECT 
        ts.day_of_week,
        CASE ts.day_of_week 
          WHEN 1 THEN 'Monday'
          WHEN 2 THEN 'Tuesday'
          WHEN 3 THEN 'Wednesday'
          WHEN 4 THEN 'Thursday'
          WHEN 5 THEN 'Friday'
        END as day_name,
        COUNT(*) as classes_count
      FROM timetable t
      JOIN time_slots ts ON t.time_slot_id = ts.id
      WHERE t.batch_id = $1
      GROUP BY ts.day_of_week
      ORDER BY classes_count
    `, [batchId]);
    
    const days = gapsQuery.rows;
    if (days.length > 0) {
      const minDay = days[0];
      const maxDay = days[days.length - 1];
      
      if (maxDay.classes_count - minDay.classes_count > 2) {
        suggestions.push({
          type: 'Load Balancing',
          priority: 'High',
          message: `Uneven distribution: ${maxDay.day_name} has ${maxDay.classes_count} classes while ${minDay.day_name} has only ${minDay.classes_count}. Consider redistributing.`
        });
      }
    }
    
    // Check for overworked faculty
    const workloadQuery = await pool.query(`
      SELECT 
        f.name,
        COUNT(*) as class_count
      FROM timetable t
      JOIN faculty f ON t.faculty_id = f.id
      WHERE t.batch_id = $1
      GROUP BY f.id, f.name
      HAVING COUNT(*) > 15
    `, [batchId]);
    
    workloadQuery.rows.forEach(row => {
      suggestions.push({
        type: 'Faculty Workload',
        priority: 'Medium',
        message: `${row.name} has ${row.class_count} classes. Consider reducing workload or adding more faculty.`
      });
    });
    
    res.json({
      success: true,
      suggestions: suggestions,
      total: suggestions.length
    });
    
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate suggestions'
    });
  }
});
// ============= ERROR HANDLERS =============

// Handle all other 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Page not found',
    requestedUrl: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      root: 'GET /',
      test: 'GET /test',
      faculty: 'GET /api/faculty'
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Global Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// ============= START SERVER =============

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Root endpoint: http://localhost:${PORT}/`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`👥 Faculty API: http://localhost:${PORT}/api/faculty`);
  console.log('---');
  
  await testDatabaseConnection();
});

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server terminated');
  process.exit(0);
});