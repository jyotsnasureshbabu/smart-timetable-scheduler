// services/SchedulerService.js
const pool = require('../config/database');

class TimetableScheduler {
  constructor() {
    this.pool = pool;
  }

  // Main function to generate complete timetable
  async generateTimetable(batchId, academicYear = 2024, semester = 1) {
    try {
      console.log(`📅 Starting automatic timetable generation for batch ${batchId}`);

      // Step 1: Clear existing timetable for this batch
      await this.clearExistingTimetable(batchId, academicYear, semester);

      // Step 2: Get all required data
      const data = await this.gatherSchedulingData(batchId);

      // Step 3: Generate schedule using intelligent algorithm
      const schedule = await this.intelligentScheduling(data, academicYear, semester);

      // Step 4: Save the generated schedule
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

  // Clear existing timetable for batch
  async clearExistingTimetable(batchId, academicYear, semester) {
    const result = await this.pool.query(
      'DELETE FROM timetable WHERE batch_id = $1 AND academic_year = $2 AND semester = $3',
      [batchId, academicYear, semester]
    );
    console.log(`🗑️ Cleared ${result.rowCount} existing timetable entries`);
  }

  // Gather all data needed for scheduling
  async gatherSchedulingData(batchId) {
    console.log('📊 Gathering scheduling data...');

    // Get batch info
    const batchResult = await this.pool.query('SELECT * FROM batches WHERE id = $1', [batchId]);
    if (batchResult.rows.length === 0) {
      throw new Error(`Batch with ID ${batchId} not found`);
    }
    const batch = batchResult.rows[0];

    // Get subjects for this batch
    const subjectsResult = await this.pool.query(`
      SELECT s.*, bs.hours_per_week
      FROM subjects s
      JOIN batch_subjects bs ON s.id = bs.subject_id
      WHERE bs.batch_id = $1
      ORDER BY bs.hours_per_week DESC
    `, [batchId]);

    // Get all faculty with their subjects and preferences
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

    // Get all available classrooms
    const classroomsResult = await this.pool.query(`
      SELECT * FROM classrooms 
      WHERE capacity >= $1
      ORDER BY type, capacity
    `, [batch.student_count]);

    // Get available time slots (non-break periods)
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

    return {
      batch,
      subjects: subjectsResult.rows,
      faculty: facultyResult.rows,
      classrooms: classroomsResult.rows,
      timeSlots: timeSlotsResult.rows
    };
  }

  // Intelligent scheduling algorithm
  async intelligentScheduling(data, academicYear, semester) {
    console.log('🧠 Running intelligent scheduling algorithm...');
    
    const schedule = [];
    const usedSlots = new Set(); // Track used time slots
    const facultySchedule = new Map(); // Track faculty assignments
    const classroomSchedule = new Map(); // Track classroom assignments

    // Create subject requirements list
    const subjectRequirements = [];
    data.subjects.forEach(subject => {
      for (let i = 0; i < subject.hours_per_week; i++) {
        subjectRequirements.push({
          ...subject,
          scheduleIndex: i + 1
        });
      }
    });

    console.log(`📝 Need to schedule ${subjectRequirements.length} total periods`);

    // Sort subjects by priority
    subjectRequirements.sort((a, b) => b.hours_per_week - a.hours_per_week);

    // Try to schedule each subject period
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

        // Mark slot as used
        usedSlots.add(assignment.timeSlot.id);

        // Track faculty and classroom usage
        if (!facultySchedule.has(assignment.faculty.id)) {
          facultySchedule.set(assignment.faculty.id, []);
        }
        facultySchedule.get(assignment.faculty.id).push(assignment.timeSlot.id);

        if (!classroomSchedule.has(assignment.classroom.id)) {
          classroomSchedule.set(assignment.classroom.id, []);
        }
        classroomSchedule.get(assignment.classroom.id).push(assignment.timeSlot.id);

        console.log(`✓ Scheduled: ${subjectReq.name} with ${assignment.faculty.name} in ${assignment.classroom.name} on ${assignment.timeSlot.day_name} ${assignment.timeSlot.period_name}`);
      } else {
        console.warn(`⚠️ Could not schedule: ${subjectReq.name} (attempt ${subjectReq.scheduleIndex})`);
      }
    }

    return schedule;
  }

  // Find best assignment for a subject period
  async findBestAssignment(subjectReq, data, usedSlots, facultySchedule, classroomSchedule) {
    // Find faculty who can teach this subject
    const availableFaculty = data.faculty.filter(faculty =>
      faculty.subjects.some(s => s.subject_id === subjectReq.id)
    );

    if (availableFaculty.length === 0) {
      console.warn(`⚠️ No faculty available for subject: ${subjectReq.name}`);
      return null;
    }

    // Try each time slot
    for (const timeSlot of data.timeSlots) {
      // Skip if slot already used
      if (usedSlots.has(timeSlot.id)) continue;

      // Find best faculty for this slot
      for (const faculty of availableFaculty) {
        // Skip if faculty is already assigned to this time slot
        if (facultySchedule.has(faculty.id) && 
            facultySchedule.get(faculty.id).includes(timeSlot.id)) continue;

        // Get faculty preference for this subject
        const subjectInfo = faculty.subjects.find(s => s.subject_id === subjectReq.id);

        // Find available classroom
        for (const classroom of data.classrooms) {
          // Skip if classroom is already assigned to this time slot
          if (classroomSchedule.has(classroom.id) && 
              classroomSchedule.get(classroom.id).includes(timeSlot.id)) continue;

          // Check if classroom is suitable for subject
          if (this.isClassroomSuitable(classroom, subjectReq)) {
            return {
              faculty,
              classroom,
              timeSlot,
              preferenceLevel: subjectInfo.preference_level
            };
          }
        }
      }
    }

    return null; // No suitable assignment found
  }

  // Check if classroom is suitable for subject
  isClassroomSuitable(classroom, subject) {
    // Simple rules - can be expanded
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

  // Save generated schedule to database
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

  // Calculate schedule statistics
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

    // Calculate daily distribution
    schedule.forEach(entry => {
      const day = entry.metadata.day_name;
      stats.dailyDistribution[day] = (stats.dailyDistribution[day] || 0) + 1;
    });

    // Calculate faculty workload
    schedule.forEach(entry => {
      const facultyName = entry.metadata.faculty_name;
      stats.facultyWorkload[facultyName] = (stats.facultyWorkload[facultyName] || 0) + 1;
    });

    // Calculate completion rate
    const totalRequired = data.subjects.reduce((sum, subject) => sum + subject.hours_per_week, 0);
    stats.completionRate = Math.round((schedule.length / totalRequired) * 100);

    return stats;
  }

  // Analyze existing schedule
  async analyzeSchedule(batchId, academicYear = 2024, semester = 1) {
    try {
      // Get current schedule
      const currentSchedule = await this.pool.query(`
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
          AND t.academic_year = $2 
          AND t.semester = $3
        ORDER BY ts.day_of_week, ts.start_time
      `, [batchId, academicYear, semester]);

      // Get subject requirements
      const requirements = await this.pool.query(`
        SELECT s.*, bs.hours_per_week
        FROM subjects s
        JOIN batch_subjects bs ON s.id = bs.subject_id
        WHERE bs.batch_id = $1
      `, [batchId]);

      // Analyze completion
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

      // Calculate completion rate
      const totalRequired = analysis.analysis.totalRequired;
      const totalScheduled = analysis.analysis.totalScheduled;
      analysis.analysis.completionRate = totalRequired > 0
        ? Math.round((totalScheduled / totalRequired) * 100)
        : 0;

      // Find missing subjects
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

      // Generate recommendations
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

      return analysis;
    } catch (error) {
      throw new Error(`Schedule analysis failed: ${error.message}`);
    }
  }
}

const TimetableScheduler = require('../services/SchedulerService');
