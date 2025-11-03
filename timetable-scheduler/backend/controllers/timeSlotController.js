// controllers/timeSlotController.js
const pool = require('../config/database');

const timeSlotController = {
  // GET ALL TIME SLOTS
  getAllTimeSlots: async (req, res) => {
    try {
      const query = `
        SELECT *, 
          CASE day_of_week 
            WHEN 1 THEN 'Monday'
            WHEN 2 THEN 'Tuesday'
            WHEN 3 THEN 'Wednesday'
            WHEN 4 THEN 'Thursday'
            WHEN 5 THEN 'Friday'
            WHEN 6 THEN 'Saturday'
            WHEN 7 THEN 'Sunday'
          END as day_name
        FROM time_slots 
        ORDER BY day_of_week, start_time
      `;
      const result = await pool.query(query);

      res.status(200).json({
        success: true,
        message: 'Time slots retrieved successfully',
        data: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error getting time slots:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve time slots',
        error: error.message
      });
    }
  },

  // GET AVAILABLE TIME SLOTS (NON-BREAK)
  getAvailableTimeSlots: async (req, res) => {
    try {
      const query = `
        SELECT *, 
          CASE day_of_week 
            WHEN 1 THEN 'Monday'
            WHEN 2 THEN 'Tuesday'
            WHEN 3 THEN 'Wednesday'
            WHEN 4 THEN 'Thursday'
            WHEN 5 THEN 'Friday'
            WHEN 6 THEN 'Saturday'
            WHEN 7 THEN 'Sunday'
          END as day_name
        FROM time_slots 
        WHERE is_break = FALSE
        ORDER BY day_of_week, start_time
      `;
      const result = await pool.query(query);

      res.status(200).json({
        success: true,
        message: 'Available time slots retrieved successfully',
        data: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error getting available time slots:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve available time slots',
        error: error.message
      });
    }
  },

  // GET SINGLE TIME SLOT BY ID
  getTimeSlotById: async (req, res) => {
    try {
      const { id } = req.params;
      const query = `
        SELECT *, 
          CASE day_of_week 
            WHEN 1 THEN 'Monday'
            WHEN 2 THEN 'Tuesday'
            WHEN 3 THEN 'Wednesday'
            WHEN 4 THEN 'Thursday'
            WHEN 5 THEN 'Friday'
            WHEN 6 THEN 'Saturday'
            WHEN 7 THEN 'Sunday'
          END as day_name
        FROM time_slots 
        WHERE id = $1
      `;
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Time slot not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Time slot retrieved successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error getting time slot by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve time slot',
        error: error.message
      });
    }
  },

  // CREATE TIME SLOT
  createTimeSlot: async (req, res) => {
    try {
      const { day_of_week, start_time, end_time, period_name, is_break } = req.body;

      // Validate required fields
      if (!day_of_week || !start_time || !end_time) {
        return res.status(400).json({
          success: false,
          message: 'Day of week, start time, and end time are required'
        });
      }

      const query = `
        INSERT INTO time_slots (day_of_week, start_time, end_time, period_name, is_break)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const values = [day_of_week, start_time, end_time, period_name, is_break || false];
      const result = await pool.query(query, values);

      res.status(201).json({
        success: true,
        message: 'Time slot created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating time slot:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Time slot already exists for this day and time'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create time slot',
        error: error.message
      });
    }
  },

  // UPDATE TIME SLOT
  updateTimeSlot: async (req, res) => {
    try {
      const { id } = req.params;
      const { day_of_week, start_time, end_time, period_name, is_break } = req.body;

      // Check if time slot exists
      const checkQuery = 'SELECT * FROM time_slots WHERE id = $1';
      const checkResult = await pool.query(checkQuery, [id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Time slot not found'
        });
      }

      const updateQuery = `
        UPDATE time_slots 
        SET day_of_week = $1, start_time = $2, end_time = $3, period_name = $4, is_break = $5
        WHERE id = $6
        RETURNING *
      `;
      const values = [day_of_week, start_time, end_time, period_name, is_break, id];
      const result = await pool.query(updateQuery, values);

      res.status(200).json({
        success: true,
        message: 'Time slot updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating time slot:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update time slot',
        error: error.message
      });
    }
  },

  // DELETE TIME SLOT
  deleteTimeSlot: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if time slot exists
      const checkQuery = 'SELECT * FROM time_slots WHERE id = $1';
      const checkResult = await pool.query(checkQuery, [id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Time slot not found'
        });
      }

      const deleteQuery = 'DELETE FROM time_slots WHERE id = $1 RETURNING *';
      const result = await pool.query(deleteQuery, [id]);

      res.status(200).json({
        success: true,
        message: 'Time slot deleted successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error deleting time slot:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete time slot',
        error: error.message
      });
    }
  }
};

module.exports = timeSlotController;