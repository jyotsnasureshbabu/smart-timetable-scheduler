const Timetable = require('../models/Timetable');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');
const Classroom = require('../models/Classroom');

// Create a new timetable entry
exports.createTimetable = async (req, res) => {
  try {
    const { day, period, subject, faculty, classroom, batch, semester } = req.body;

    // Validate required fields
    if (!day || !period || !subject || !faculty || !classroom || !batch || !semester) {
      return res.status(400).json({ 
        message: 'All fields are required',
        required: ['day', 'period', 'subject', 'faculty', 'classroom', 'batch', 'semester']
      });
    }

    // Check if subject exists
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Check if faculty exists
    const facultyExists = await Faculty.findById(faculty);
    if (!facultyExists) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Check if classroom exists
    const classroomExists = await Classroom.findById(classroom);
    if (!classroomExists) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Check for conflicts - same classroom at same time
    const classroomConflict = await Timetable.findOne({
      day,
      period,
      classroom,
      _id: { $ne: req.body._id } // Exclude current entry if updating
    });

    if (classroomConflict) {
      return res.status(409).json({ 
        message: 'Classroom is already booked for this time slot',
        conflict: classroomConflict
      });
    }

    // Check for faculty conflicts - same faculty at same time
    const facultyConflict = await Timetable.findOne({
      day,
      period,
      faculty,
      _id: { $ne: req.body._id }
    });

    if (facultyConflict) {
      return res.status(409).json({ 
        message: 'Faculty is already assigned to another class at this time',
        conflict: facultyConflict
      });
    }

    // Check for batch conflicts - same batch at same time
    const batchConflict = await Timetable.findOne({
      day,
      period,
      batch,
      semester,
      _id: { $ne: req.body._id }
    });

    if (batchConflict) {
      return res.status(409).json({ 
        message: 'This batch already has a class scheduled at this time',
        conflict: batchConflict
      });
    }

    const timetable = new Timetable({
      day,
      period,
      subject,
      faculty,
      classroom,
      batch,
      semester
    });

    await timetable.save();

    // Populate the fields before sending response
    await timetable.populate('subject faculty classroom');

    res.status(201).json({
      message: 'Timetable entry created successfully',
      timetable
    });
  } catch (error) {
    console.error('Error creating timetable:', error);
    res.status(500).json({ 
      message: 'Error creating timetable entry',
      error: error.message 
    });
  }
};

// Get all timetable entries with filters
exports.getAllTimetables = async (req, res) => {
  try {
    const { batch, semester, day } = req.query;
    
    let filter = {};
    
    if (batch) filter.batch = batch;
    if (semester) filter.semester = semester;
    if (day) filter.day = day;

    const timetables = await Timetable.find(filter)
      .populate('subject', 'name code')
      .populate('faculty', 'name employeeId')
      .populate('classroom', 'name building capacity')
      .sort({ day: 1, period: 1 });

    res.status(200).json({
      count: timetables.length,
      timetables
    });
  } catch (error) {
    console.error('Error fetching timetables:', error);
    res.status(500).json({ 
      message: 'Error fetching timetables',
      error: error.message 
    });
  }
};

// Get timetable by batch and semester
exports.getTimetableByBatch = async (req, res) => {
  try {
    const { batch, semester } = req.params;

    if (!batch || !semester) {
      return res.status(400).json({ 
        message: 'Batch and semester are required' 
      });
    }

    const timetables = await Timetable.find({ batch, semester })
      .populate('subject', 'name code')
      .populate('faculty', 'name employeeId')
      .populate('classroom', 'name building capacity')
      .sort({ day: 1, period: 1 });

    // Organize by day
    const organizedTimetable = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: []
    };

    timetables.forEach(entry => {
      if (organizedTimetable[entry.day]) {
        organizedTimetable[entry.day].push(entry);
      }
    });

    res.status(200).json({
      batch,
      semester,
      timetable: organizedTimetable
    });
  } catch (error) {
    console.error('Error fetching batch timetable:', error);
    res.status(500).json({ 
      message: 'Error fetching batch timetable',
      error: error.message 
    });
  }
};

// Get timetable by faculty
exports.getTimetableByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const timetables = await Timetable.find({ faculty: facultyId })
      .populate('subject', 'name code')
      .populate('faculty', 'name employeeId')
      .populate('classroom', 'name building capacity')
      .sort({ day: 1, period: 1 });

    // Organize by day
    const organizedTimetable = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: []
    };

    timetables.forEach(entry => {
      if (organizedTimetable[entry.day]) {
        organizedTimetable[entry.day].push(entry);
      }
    });

    res.status(200).json({
      facultyId,
      timetable: organizedTimetable
    });
  } catch (error) {
    console.error('Error fetching faculty timetable:', error);
    res.status(500).json({ 
      message: 'Error fetching faculty timetable',
      error: error.message 
    });
  }
};

// Get a single timetable entry by ID
exports.getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('subject', 'name code')
      .populate('faculty', 'name employeeId')
      .populate('classroom', 'name building capacity');

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    res.status(200).json(timetable);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ 
      message: 'Error fetching timetable entry',
      error: error.message 
    });
  }
};

// Update a timetable entry
exports.updateTimetable = async (req, res) => {
  try {
    const { day, period, subject, faculty, classroom, batch, semester } = req.body;

    // Check for conflicts if day, period, or resources are being changed
    if (day || period || classroom || faculty || batch) {
      const updateData = await Timetable.findById(req.params.id);
      
      if (!updateData) {
        return res.status(404).json({ message: 'Timetable entry not found' });
      }

      const checkDay = day || updateData.day;
      const checkPeriod = period || updateData.period;
      const checkClassroom = classroom || updateData.classroom;
      const checkFaculty = faculty || updateData.faculty;
      const checkBatch = batch || updateData.batch;
      const checkSemester = semester || updateData.semester;

      // Check for classroom conflicts
      const classroomConflict = await Timetable.findOne({
        day: checkDay,
        period: checkPeriod,
        classroom: checkClassroom,
        _id: { $ne: req.params.id }
      });

      if (classroomConflict) {
        return res.status(409).json({ 
          message: 'Classroom is already booked for this time slot',
          conflict: classroomConflict
        });
      }

      // Check for faculty conflicts
      const facultyConflict = await Timetable.findOne({
        day: checkDay,
        period: checkPeriod,
        faculty: checkFaculty,
        _id: { $ne: req.params.id }
      });

      if (facultyConflict) {
        return res.status(409).json({ 
          message: 'Faculty is already assigned to another class at this time',
          conflict: facultyConflict
        });
      }

      // Check for batch conflicts
      const batchConflict = await Timetable.findOne({
        day: checkDay,
        period: checkPeriod,
        batch: checkBatch,
        semester: checkSemester,
        _id: { $ne: req.params.id }
      });

      if (batchConflict) {
        return res.status(409).json({ 
          message: 'This batch already has a class scheduled at this time',
          conflict: batchConflict
        });
      }
    }

    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('subject faculty classroom');

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    res.status(200).json({
      message: 'Timetable entry updated successfully',
      timetable
    });
  } catch (error) {
    console.error('Error updating timetable:', error);
    res.status(500).json({ 
      message: 'Error updating timetable entry',
      error: error.message 
    });
  }
};

// Delete a timetable entry
exports.deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    res.status(200).json({ 
      message: 'Timetable entry deleted successfully',
      deletedEntry: timetable
    });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({ 
      message: 'Error deleting timetable entry',
      error: error.message 
    });
  }
};

// Delete all timetable entries for a specific batch and semester
exports.deleteBatchTimetable = async (req, res) => {
  try {
    const { batch, semester } = req.params;

    const result = await Timetable.deleteMany({ batch, semester });

    res.status(200).json({ 
      message: `Deleted ${result.deletedCount} timetable entries for batch ${batch}, semester ${semester}`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting batch timetable:', error);
    res.status(500).json({ 
      message: 'Error deleting batch timetable',
      error: error.message 
    });
  }
};

// Get classroom availability
exports.getClassroomAvailability = async (req, res) => {
  try {
    const { day, period } = req.query;

    if (!day || !period) {
      return res.status(400).json({ 
        message: 'Day and period are required' 
      });
    }

    // Get all classrooms
    const allClassrooms = await Classroom.find();

    // Get occupied classrooms for the given day and period
    const occupiedTimetables = await Timetable.find({ day, period })
      .populate('classroom');

    const occupiedClassroomIds = occupiedTimetables.map(tt => tt.classroom._id.toString());

    // Filter available classrooms
    const availableClassrooms = allClassrooms.filter(
      classroom => !occupiedClassroomIds.includes(classroom._id.toString())
    );

    res.status(200).json({
      day,
      period,
      totalClassrooms: allClassrooms.length,
      availableClassrooms,
      occupiedClassrooms: occupiedTimetables.map(tt => tt.classroom)
    });
  } catch (error) {
    console.error('Error fetching classroom availability:', error);
    res.status(500).json({ 
      message: 'Error fetching classroom availability',
      error: error.message 
    });
  }
};

// Get faculty availability
exports.getFacultyAvailability = async (req, res) => {
  try {
    const { day, period } = req.query;

    if (!day || !period) {
      return res.status(400).json({ 
        message: 'Day and period are required' 
      });
    }

    // Get all faculty
    const allFaculty = await Faculty.find();

    // Get occupied faculty for the given day and period
    const occupiedTimetables = await Timetable.find({ day, period })
      .populate('faculty');

    const occupiedFacultyIds = occupiedTimetables.map(tt => tt.faculty._id.toString());

    // Filter available faculty
    const availableFaculty = allFaculty.filter(
      faculty => !occupiedFacultyIds.includes(faculty._id.toString())
    );

    res.status(200).json({
      day,
      period,
      totalFaculty: allFaculty.length,
      availableFaculty,
      occupiedFaculty: occupiedTimetables.map(tt => tt.faculty)
    });
  } catch (error) {
    console.error('Error fetching faculty availability:', error);
    res.status(500).json({ 
      message: 'Error fetching faculty availability',
      error: error.message 
    });
  }
};

module.exports = exports;